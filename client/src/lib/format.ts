import type { JobStatus, QuoteStatus, InvoiceStatus } from './types'

/** cents -> "$1,234.56" */
export function formatMoney(cents: number | null | undefined): string {
  const value = (cents ?? 0) / 100
  return value.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
}

/** "12.50" -> 1250 cents */
export function dollarsToCents(input: string | number): number {
  const n = typeof input === 'number' ? input : parseFloat(input)
  if (!isFinite(n)) return 0
  return Math.round(n * 100)
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

export const JOB_STATUS_LABELS: Record<JobStatus, string> = {
  requested: 'Requested',
  scheduled: 'Scheduled',
  assigned: 'Assigned',
  en_route: 'En route',
  on_site: 'On site',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export const JOB_STATUS_COLORS: Record<JobStatus, string> = {
  requested: 'bg-amber-100 text-amber-800',
  scheduled: 'bg-sky-100 text-sky-800',
  assigned: 'bg-indigo-100 text-indigo-800',
  en_route: 'bg-violet-100 text-violet-800',
  on_site: 'bg-blue-100 text-blue-800',
  completed: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-slate-200 text-slate-600',
}

/** Allowed forward transitions for the technician status stepper. */
export const JOB_NEXT_STATUS: Partial<Record<JobStatus, JobStatus>> = {
  assigned: 'en_route',
  en_route: 'on_site',
  on_site: 'completed',
}

export const QUOTE_STATUS_LABELS: Record<QuoteStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  approved: 'Approved',
  declined: 'Declined',
}

export const QUOTE_STATUS_COLORS: Record<QuoteStatus, string> = {
  draft: 'bg-slate-200 text-slate-600',
  sent: 'bg-sky-100 text-sky-800',
  approved: 'bg-emerald-100 text-emerald-800',
  declined: 'bg-rose-100 text-rose-800',
}

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
}

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: 'bg-slate-200 text-slate-600',
  sent: 'bg-amber-100 text-amber-800',
  paid: 'bg-emerald-100 text-emerald-800',
}
