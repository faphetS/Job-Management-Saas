import { Badge } from './ui'
import {
  JOB_STATUS_COLORS,
  JOB_STATUS_LABELS,
  QUOTE_STATUS_COLORS,
  QUOTE_STATUS_LABELS,
  INVOICE_STATUS_COLORS,
  INVOICE_STATUS_LABELS,
} from '@/lib/format'
import type { JobStatus, QuoteStatus, InvoiceStatus } from '@/lib/types'

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return <Badge className={JOB_STATUS_COLORS[status]}>{JOB_STATUS_LABELS[status]}</Badge>
}

export function QuoteStatusBadge({ status }: { status: QuoteStatus }) {
  return <Badge className={QUOTE_STATUS_COLORS[status]}>{QUOTE_STATUS_LABELS[status]}</Badge>
}

export function InvoiceStatusBadge({ status }: { status: InvoiceStatus }) {
  return <Badge className={INVOICE_STATUS_COLORS[status]}>{INVOICE_STATUS_LABELS[status]}</Badge>
}
