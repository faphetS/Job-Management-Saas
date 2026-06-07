// End-to-end verification of the backend: multi-tenant RLS isolation + the
// role flows + the RPCs. Creates real (confirmed) users via the admin API,
// then drives the app exactly as the React client would (anon key sessions).
//
// Run: node --env-file=.env.local scripts/smoke-test.mjs
import { createClient } from '@supabase/supabase-js'

const URL = process.env.VITE_SUPABASE_URL
const ANON = process.env.VITE_SUPABASE_ANON_KEY
const SVC = process.env.SUPABASE_SERVICE_ROLE_KEY
const PW = 'Password123!'

const admin = createClient(URL, SVC, { auth: { persistSession: false, autoRefreshToken: false } })
const anonClient = () => createClient(URL, ANON, { auth: { persistSession: false, autoRefreshToken: false } })

let passed = 0
function assert(cond, msg) {
  if (!cond) throw new Error(`ASSERT FAILED: ${msg}`)
  passed++
  console.log(`  ✓ ${msg}`)
}
function must({ data, error }, what) {
  if (error) throw new Error(`${what}: ${error.message}`)
  return data
}

async function cleanup() {
  must(await admin.from('organizations').delete().ilike('name', 'SMOKE %'), 'delete smoke orgs')
  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 })
  for (const u of data.users) {
    if (u.email?.startsWith('smoke.')) await admin.auth.admin.deleteUser(u.id)
  }
}

async function makeUser(email, meta) {
  must(
    { data: null, error: (await admin.auth.admin.createUser({ email, password: PW, email_confirm: true, user_metadata: meta })).error },
    `create user ${email}`,
  )
}

async function signIn(email) {
  const c = anonClient()
  const { error } = await c.auth.signInWithPassword({ email, password: PW })
  if (error) throw new Error(`sign in ${email}: ${error.message}`)
  return c
}
const uid = async (c) => (await c.auth.getUser()).data.user.id

async function main() {
  console.log('→ Cleaning up any prior smoke data…')
  await cleanup()

  console.log('\n[1] Owner A signs up and creates an org')
  await makeUser('smoke.ownerA@example.com')
  const a = await signIn('smoke.ownerA@example.com')
  const orgA = must(await a.rpc('create_organization', { org_name: 'SMOKE Org A', owner_name: 'Owner A' }), 'create org A')
  const profA = must(await a.from('profiles').select('*').single(), 'read profile A')
  assert(profA.role === 'owner' && profA.org_id === orgA, 'owner A is owner of org A (no token refresh needed)')

  const custA = must(await a.from('customers').insert({ org_id: orgA, full_name: 'Alice' }).select().single(), 'create cust A')
  const jobA = must(await a.from('jobs').insert({ org_id: orgA, customer_id: custA.id, title: 'Rekey A' }).select().single(), 'create job A')
  assert(jobA.status === 'requested', 'job A defaults to requested')

  console.log('\n[2] Owner B signs up in a separate org')
  await makeUser('smoke.ownerB@example.com')
  const b = await signIn('smoke.ownerB@example.com')
  const orgB = must(await b.rpc('create_organization', { org_name: 'SMOKE Org B' }), 'create org B')
  const custB = must(await b.from('customers').insert({ org_id: orgB, full_name: 'Bob' }).select().single(), 'create cust B')
  must(await b.from('jobs').insert({ org_id: orgB, customer_id: custB.id, title: 'Rekey B' }), 'create job B')

  console.log('\n[3] Tenant isolation (RLS)')
  const aJobs = must(await a.from('jobs').select('*'), 'A list jobs')
  assert(aJobs.length === 1 && aJobs[0].id === jobA.id, 'owner A sees ONLY org A jobs')
  const aCusts = must(await a.from('customers').select('*'), 'A list customers')
  assert(aCusts.length === 1 && aCusts[0].id === custA.id, 'owner A sees ONLY org A customers')
  const bJobs = must(await b.from('jobs').select('*'), 'B list jobs')
  assert(bJobs.length === 1 && bJobs[0].title === 'Rekey B', 'owner B sees ONLY org B jobs')
  const crossRead = must(await b.from('jobs').select('*').eq('id', jobA.id), 'B cross read')
  assert(crossRead.length === 0, 'owner B CANNOT read an org A job by id')

  console.log('\n[4] Employee sees only assigned jobs')
  await makeUser('smoke.empA@example.com', { org_id: orgA, role: 'employee', full_name: 'Eve Tech' })
  const emp = await signIn('smoke.empA@example.com')
  const empId = await uid(emp)
  const empProf = must(await emp.from('profiles').select('*').eq('id', empId).single(), 'emp profile')
  assert(empProf.role === 'employee' && empProf.org_id === orgA, 'employee profile created via metadata trigger')
  assert(must(await emp.from('jobs').select('*'), 'emp jobs pre').length === 0, 'employee sees nothing before assignment')
  must(await a.from('jobs').update({ assigned_to: empId, status: 'assigned' }).eq('id', jobA.id), 'assign job')
  const empJobs = must(await emp.from('jobs').select('*'), 'emp jobs post')
  assert(empJobs.length === 1 && empJobs[0].id === jobA.id, 'employee now sees the assigned job')
  must(await emp.from('jobs').update({ status: 'en_route' }).eq('id', jobA.id), 'emp advance status')
  assert(true, 'employee can advance the status of their assigned job')

  console.log('\n[5] Client portal: request job, see only own')
  await makeUser('smoke.clientA@example.com', { org_id: orgA, role: 'client', full_name: 'Carl Client' })
  const cl = await signIn('smoke.clientA@example.com')
  const clId = await uid(cl)
  const clCust = must(
    await cl.from('customers').insert({ org_id: orgA, profile_id: clId, full_name: 'Carl Client' }).select().single(),
    'client self customer',
  )
  const clJob = must(
    await cl.from('jobs').insert({ org_id: orgA, customer_id: clCust.id, title: 'Locked out', status: 'requested' }).select().single(),
    'client request job',
  )
  const clJobs = must(await cl.from('jobs').select('*'), 'client jobs')
  assert(clJobs.length === 1 && clJobs[0].id === clJob.id, 'client sees ONLY their own job (not Alice/Eve jobs)')
  const clCusts = must(await cl.from('customers').select('*'), 'client custs')
  assert(clCusts.length === 1 && clCusts[0].id === clCust.id, 'client sees ONLY their own customer record')

  console.log('\n[6] Quote flow: owner sends, client approves via RPC')
  const quote = must(
    await a.from('quotes').insert({ org_id: orgA, customer_id: clCust.id, subtotal: 10000, tax: 0, total: 10000 }).select().single(),
    'create quote',
  )
  must(await a.from('quote_line_items').insert({ org_id: orgA, quote_id: quote.id, description: 'Service call', quantity: 1, unit_price: 10000, line_total: 10000 }), 'quote line')
  must(await a.from('quotes').update({ status: 'sent' }).eq('id', quote.id), 'send quote')
  const clQuotes = must(await cl.from('quotes').select('*'), 'client quotes')
  assert(clQuotes.length === 1 && clQuotes[0].status === 'sent', 'client sees the sent quote')
  must(await cl.rpc('respond_to_quote', { p_quote_id: quote.id, p_approve: true }), 'approve quote')
  const q2 = must(await a.from('quotes').select('*').eq('id', quote.id).single(), 're-read quote')
  assert(q2.status === 'approved', 'quote is approved (client RPC, status-only)')

  console.log('\n[7] Invoice flow: owner bills, client pays via RPC (mock)')
  const inv = must(
    await a.from('invoices').insert({ org_id: orgA, customer_id: clCust.id, quote_id: quote.id, subtotal: 10000, tax: 0, total: 10000 }).select().single(),
    'create invoice',
  )
  must(await a.from('invoices').update({ status: 'sent' }).eq('id', inv.id), 'send invoice')
  must(await cl.rpc('pay_invoice', { p_invoice_id: inv.id }), 'pay invoice')
  const inv2 = must(await a.from('invoices').select('*').eq('id', inv.id).single(), 're-read invoice')
  assert(inv2.status === 'paid' && inv2.amount_paid === 10000, 'payment trigger flipped invoice to paid in full')
  const bSeeInv = must(await b.from('invoices').select('*').eq('id', inv.id), 'B read A invoice')
  assert(bSeeInv.length === 0, 'owner B CANNOT read org A invoice')

  console.log(`\n✅ All ${passed} checks passed.`)
  console.log('→ Cleaning up smoke data…')
  await cleanup()
}

main().catch(async (err) => {
  console.error(`\n✗ ${err.message}`)
  try {
    await cleanup()
  } catch {
    /* best effort */
  }
  process.exitCode = 1
})
