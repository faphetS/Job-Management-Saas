export type UserRole = 'owner' | 'employee' | 'client'

export type JobStatus =
  | 'requested'
  | 'scheduled'
  | 'assigned'
  | 'en_route'
  | 'on_site'
  | 'completed'
  | 'cancelled'

export type QuoteStatus = 'draft' | 'sent' | 'approved' | 'declined'
export type InvoiceStatus = 'draft' | 'sent' | 'paid'

export interface Organization {
  id: string
  name: string
  phone: string | null
  address: string | null
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  org_id: string | null
  role: UserRole
  full_name: string | null
  phone: string | null
  created_at: string
  updated_at: string
}

export interface Customer {
  id: string
  org_id: string
  profile_id: string | null
  full_name: string
  email: string | null
  phone: string | null
  address: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Job {
  id: string
  org_id: string
  customer_id: string
  assigned_to: string | null
  status: JobStatus
  title: string
  description: string | null
  service_address: string | null
  scheduled_at: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface LineItem {
  id: string
  org_id: string
  quote_id?: string
  invoice_id?: string
  description: string
  quantity: number
  unit_price: number
  line_total: number
}

export interface Quote {
  id: string
  org_id: string
  job_id: string | null
  customer_id: string
  status: QuoteStatus
  subtotal: number
  tax: number
  total: number
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Invoice {
  id: string
  org_id: string
  job_id: string | null
  quote_id: string | null
  customer_id: string
  status: InvoiceStatus
  subtotal: number
  tax: number
  total: number
  amount_paid: number
  due_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface Payment {
  id: string
  org_id: string
  invoice_id: string
  amount: number
  method: string
  paid_at: string
  created_by: string | null
}

// ---- joined shapes returned by select() with embedded resources ----
export interface JobWithCustomer extends Job {
  customer: Pick<Customer, 'id' | 'full_name' | 'phone'> | null
  assignee: Pick<Profile, 'id' | 'full_name'> | null
}

// A draft line item used in the editors before it is persisted.
export interface DraftLineItem {
  description: string
  quantity: number
  unit_price: number // cents
}
