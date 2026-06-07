import { supabase } from '@/lib/supabase'
import { dollarsToCents } from '@/lib/format'
import type {
  Customer,
  DraftLineItem,
  Invoice,
  Job,
  JobStatus,
  JobWithCustomer,
  LineItem,
  Organization,
  Profile,
  Quote,
} from '@/lib/types'

function unwrap<T>(res: { data: unknown; error: { message: string } | null }): T {
  if (res.error) throw new Error(res.error.message)
  return res.data as T
}

// ----------------------------- organization / team -----------------------------
export async function getOrganization(orgId: string): Promise<Organization> {
  return unwrap(await supabase.from('organizations').select('*').eq('id', orgId).single())
}

export async function listEmployees(): Promise<Profile[]> {
  return unwrap(
    await supabase
      .from('profiles')
      .select('*')
      .in('role', ['employee', 'owner'])
      .order('full_name', { ascending: true }),
  )
}

// ----------------------------- customers -----------------------------
export async function listCustomers(): Promise<Customer[]> {
  return unwrap(await supabase.from('customers').select('*').order('created_at', { ascending: false }))
}

export async function getCustomer(id: string): Promise<Customer> {
  return unwrap(await supabase.from('customers').select('*').eq('id', id).single())
}

export async function createCustomer(input: {
  org_id: string
  full_name: string
  email?: string
  phone?: string
  address?: string
  notes?: string
  profile_id?: string
}): Promise<Customer> {
  return unwrap(await supabase.from('customers').insert(input).select().single())
}

/** Returns the customer record linked to a client login, creating it if absent. */
export async function ensureClientCustomer(profile: {
  id: string
  org_id: string | null
  full_name: string | null
  phone: string | null
}): Promise<Customer> {
  const existing = await supabase.from('customers').select('*').eq('profile_id', profile.id).maybeSingle()
  if (existing.error) throw new Error(existing.error.message)
  if (existing.data) return existing.data as Customer
  return createCustomer({
    org_id: profile.org_id!,
    profile_id: profile.id,
    full_name: profile.full_name || 'Me',
    phone: profile.phone || undefined,
  })
}

// ----------------------------- jobs -----------------------------
const JOB_SELECT = '*, customer:customers(id, full_name, phone)'

export async function listJobs(): Promise<JobWithCustomer[]> {
  return unwrap(await supabase.from('jobs').select(JOB_SELECT).order('created_at', { ascending: false }))
}

export async function listJobsForCustomer(customerId: string): Promise<JobWithCustomer[]> {
  return unwrap(
    await supabase
      .from('jobs')
      .select(JOB_SELECT)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false }),
  )
}

export async function getJob(id: string): Promise<JobWithCustomer> {
  return unwrap(await supabase.from('jobs').select(JOB_SELECT).eq('id', id).single())
}

export async function createJob(input: {
  org_id: string
  customer_id: string
  title: string
  description?: string
  service_address?: string
  status?: JobStatus
  created_by?: string
}): Promise<Job> {
  return unwrap(await supabase.from('jobs').insert(input).select().single())
}

export async function updateJob(id: string, patch: Partial<Job>): Promise<Job> {
  return unwrap(await supabase.from('jobs').update(patch).eq('id', id).select().single())
}

export async function assignJob(id: string, employeeId: string | null): Promise<Job> {
  // assigning moves a fresh job into the 'assigned' lane
  return updateJob(id, {
    assigned_to: employeeId,
    status: employeeId ? 'assigned' : 'requested',
  })
}

// ----------------------------- quotes -----------------------------
function computeTotals(items: DraftLineItem[]) {
  const lines = items.map((it) => ({
    description: it.description,
    quantity: it.quantity,
    unit_price: it.unit_price,
    line_total: Math.round(it.quantity * it.unit_price),
  }))
  const subtotal = lines.reduce((s, l) => s + l.line_total, 0)
  return { lines, subtotal, tax: 0, total: subtotal }
}

export interface QuoteWithDetails extends Quote {
  customer: Pick<Customer, 'id' | 'full_name' | 'email' | 'phone'> | null
  line_items: LineItem[]
}

export async function listQuotes(): Promise<(Quote & { customer: { full_name: string } | null })[]> {
  return unwrap(
    await supabase
      .from('quotes')
      .select('*, customer:customers(full_name)')
      .order('created_at', { ascending: false }),
  )
}

export async function getQuote(id: string): Promise<QuoteWithDetails> {
  return unwrap(
    await supabase
      .from('quotes')
      .select('*, customer:customers(id, full_name, email, phone), line_items:quote_line_items(*)')
      .eq('id', id)
      .single(),
  )
}

export async function createQuote(input: {
  org_id: string
  customer_id: string
  job_id?: string | null
  notes?: string
  items: DraftLineItem[]
}): Promise<Quote> {
  const { lines, subtotal, tax, total } = computeTotals(input.items)
  const quote = unwrap<Quote>(
    await supabase
      .from('quotes')
      .insert({
        org_id: input.org_id,
        customer_id: input.customer_id,
        job_id: input.job_id ?? null,
        notes: input.notes ?? null,
        subtotal,
        tax,
        total,
        status: 'draft',
      })
      .select()
      .single(),
  )
  if (lines.length) {
    unwrap(
      await supabase
        .from('quote_line_items')
        .insert(lines.map((l) => ({ ...l, org_id: input.org_id, quote_id: quote.id }))),
    )
  }
  return quote
}

export async function sendQuote(id: string): Promise<void> {
  unwrap(await supabase.from('quotes').update({ status: 'sent' }).eq('id', id).select().single())
}

export async function respondToQuote(quoteId: string, approve: boolean): Promise<void> {
  const { error } = await supabase.rpc('respond_to_quote', { p_quote_id: quoteId, p_approve: approve })
  if (error) throw new Error(error.message)
}

// ----------------------------- invoices -----------------------------
export interface InvoiceWithDetails extends Invoice {
  customer: Pick<Customer, 'id' | 'full_name' | 'email' | 'phone'> | null
  line_items: LineItem[]
}

export async function listInvoices(): Promise<(Invoice & { customer: { full_name: string } | null })[]> {
  return unwrap(
    await supabase
      .from('invoices')
      .select('*, customer:customers(full_name)')
      .order('created_at', { ascending: false }),
  )
}

export async function getInvoice(id: string): Promise<InvoiceWithDetails> {
  return unwrap(
    await supabase
      .from('invoices')
      .select('*, customer:customers(id, full_name, email, phone), line_items:invoice_line_items(*)')
      .eq('id', id)
      .single(),
  )
}

export async function createInvoice(input: {
  org_id: string
  customer_id: string
  job_id?: string | null
  quote_id?: string | null
  notes?: string
  due_date?: string | null
  items: DraftLineItem[]
}): Promise<Invoice> {
  const { lines, subtotal, tax, total } = computeTotals(input.items)
  const invoice = unwrap<Invoice>(
    await supabase
      .from('invoices')
      .insert({
        org_id: input.org_id,
        customer_id: input.customer_id,
        job_id: input.job_id ?? null,
        quote_id: input.quote_id ?? null,
        notes: input.notes ?? null,
        due_date: input.due_date ?? null,
        subtotal,
        tax,
        total,
        status: 'draft',
      })
      .select()
      .single(),
  )
  if (lines.length) {
    unwrap(
      await supabase
        .from('invoice_line_items')
        .insert(lines.map((l) => ({ ...l, org_id: input.org_id, invoice_id: invoice.id }))),
    )
  }
  return invoice
}

export async function sendInvoice(id: string): Promise<void> {
  unwrap(await supabase.from('invoices').update({ status: 'sent' }).eq('id', id).select().single())
}

export async function payInvoice(id: string): Promise<void> {
  const { error } = await supabase.rpc('pay_invoice', { p_invoice_id: id })
  if (error) throw new Error(error.message)
}

export { dollarsToCents }
