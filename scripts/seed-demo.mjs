// Seeds a demo business with one account per role (owner / employee / client),
// all pre-confirmed so they can log in immediately, plus a little linked data
// so every role sees something on first login. Idempotent — safe to re-run.
//
// Run: node --env-file=.env.local scripts/seed-demo.mjs
import { createClient } from '@supabase/supabase-js'

const URL = process.env.VITE_SUPABASE_URL
const ANON = process.env.VITE_SUPABASE_ANON_KEY
const SVC = process.env.SUPABASE_SERVICE_ROLE_KEY

const PASSWORD = 'demo1234'
const ORG_NAME = 'Demo Services Co'
const OWNER = { email: 'owner@demo.com', name: 'Olivia Owner' }
const EMP = { email: 'tech@demo.com', name: 'Tom Tech' }
const CLIENT = { email: 'client@demo.com', name: 'Cara Client', phone: '555-0100' }

const admin = createClient(URL, SVC, { auth: { persistSession: false, autoRefreshToken: false } })
const anonClient = () => createClient(URL, ANON, { auth: { persistSession: false, autoRefreshToken: false } })

function must({ data, error }, what) {
  if (error) throw new Error(`${what}: ${error.message}`)
  return data
}

async function cleanup() {
  must(await admin.from('organizations').delete().eq('name', ORG_NAME), 'delete demo org')
  const { data } = await admin.auth.admin.listUsers({ perPage: 1000 })
  for (const u of data.users) {
    if ([OWNER.email, EMP.email, CLIENT.email].includes(u.email)) {
      await admin.auth.admin.deleteUser(u.id)
    }
  }
}

async function createUser(email, meta) {
  const { data, error } = await admin.auth.admin.createUser({
    email,
    password: PASSWORD,
    email_confirm: true,
    user_metadata: meta,
  })
  if (error) throw new Error(`create ${email}: ${error.message}`)
  return data.user.id
}

async function signIn(email) {
  const c = anonClient()
  const { error } = await c.auth.signInWithPassword({ email, password: PASSWORD })
  if (error) throw new Error(`sign in ${email}: ${error.message}`)
  return c
}

async function main() {
  console.log('→ Clearing any existing demo accounts…')
  await cleanup()

  console.log('→ Creating owner + business…')
  await createUser(OWNER.email, { full_name: OWNER.name })
  const owner = await signIn(OWNER.email)
  const orgId = must(await owner.rpc('create_organization', { org_name: ORG_NAME, owner_name: OWNER.name }), 'create org')

  console.log('→ Creating employee…')
  const empId = await createUser(EMP.email, { org_id: orgId, role: 'employee', full_name: EMP.name })

  console.log('→ Creating client…')
  await createUser(CLIENT.email, { org_id: orgId, role: 'client', full_name: CLIENT.name, phone: CLIENT.phone })
  const client = await signIn(CLIENT.email)
  const clientUid = (await client.auth.getUser()).data.user.id
  const customer = must(
    await client
      .from('customers')
      .insert({ org_id: orgId, profile_id: clientUid, full_name: CLIENT.name, phone: CLIENT.phone, address: '12 Maple St' })
      .select()
      .single(),
    'client customer',
  )

  console.log('→ Client requests a job…')
  const job = must(
    await client
      .from('jobs')
      .insert({
        org_id: orgId,
        customer_id: customer.id,
        title: 'Leaking kitchen faucet',
        description: 'Water pooling under the sink, needs a look ASAP.',
        service_address: '12 Maple St',
        status: 'requested',
      })
      .select()
      .single(),
    'client job',
  )

  console.log('→ Owner assigns the job to the technician…')
  must(await owner.from('jobs').update({ assigned_to: empId, status: 'assigned' }).eq('id', job.id), 'assign job')

  console.log('→ Owner sends a quote to the client…')
  const quote = must(
    await owner.from('quotes').insert({ org_id: orgId, customer_id: customer.id, job_id: job.id, subtotal: 22900, tax: 0, total: 22900, status: 'sent' }).select().single(),
    'create quote',
  )
  must(
    await owner.from('quote_line_items').insert([
      { org_id: orgId, quote_id: quote.id, description: 'Service call', quantity: 1, unit_price: 8900, line_total: 8900 },
      { org_id: orgId, quote_id: quote.id, description: 'Faucet replacement (parts + labor)', quantity: 1, unit_price: 14000, line_total: 14000 },
    ]),
    'quote lines',
  )

  console.log('→ Owner sends an invoice to the client…')
  const invoice = must(
    await owner.from('invoices').insert({ org_id: orgId, customer_id: customer.id, job_id: job.id, subtotal: 12000, tax: 0, total: 12000, status: 'sent' }).select().single(),
    'create invoice',
  )
  must(
    await owner.from('invoice_line_items').insert({ org_id: orgId, invoice_id: invoice.id, description: 'Emergency service call', quantity: 1, unit_price: 12000, line_total: 12000 }),
    'invoice line',
  )

  console.log('\n✅ Demo data ready. Log in at the live site with:\n')
  console.log('  Owner (office)   →  owner@demo.com   /  demo1234')
  console.log('  Employee (tech)  →  tech@demo.com    /  demo1234')
  console.log('  Client (portal)  →  client@demo.com  /  demo1234')
  console.log('\n  Business: "Demo Services Co"')
  console.log('  Seeded: 1 customer, 1 job (assigned to the tech), 1 quote to approve, 1 invoice to pay.')
}

main().catch((err) => {
  console.error(`\n✗ ${err.message}`)
  process.exitCode = 1
})
