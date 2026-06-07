import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAsync } from '@/lib/useAsync'
import { getInvoice, payInvoice, sendInvoice } from '@/features/db'
import { PageHeader } from '@/components/AppShell'
import { Alert, Button, Card, CardBody, Spinner } from '@/components/ui'
import { InvoiceStatusBadge } from '@/components/StatusBadge'
import { LineItemsTable } from '@/components/LineItemsTable'
import { formatDate, formatMoney } from '@/lib/format'

export default function InvoiceDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: invoice, loading, reload } = useAsync(() => getInvoice(id!), [id])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (loading || !invoice) {
    return (
      <div className="grid place-items-center py-20">
        <Spinner />
      </div>
    )
  }

  async function run(action: () => Promise<unknown>) {
    setError(null)
    setBusy(true)
    try {
      await action()
      reload()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const balance = invoice.total - invoice.amount_paid

  return (
    <>
      <Link to="/app/invoices" className="text-sm text-brand-600 hover:underline">
        ← Invoices
      </Link>
      <PageHeader
        title={`Invoice · ${invoice.customer?.full_name ?? ''}`}
        subtitle={`${formatDate(invoice.created_at)}${invoice.due_date ? ` · due ${formatDate(invoice.due_date)}` : ''}`}
        actions={<InvoiceStatusBadge status={invoice.status} />}
      />

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <Card className="max-w-2xl">
        <CardBody className="space-y-5">
          <LineItemsTable
            items={invoice.line_items}
            subtotal={invoice.subtotal}
            total={invoice.total}
            amountPaid={invoice.amount_paid}
          />
          {invoice.notes && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Notes</p>
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700">{invoice.notes}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            {invoice.status === 'draft' && (
              <Button disabled={busy} onClick={() => run(() => sendInvoice(invoice.id))}>
                Send to customer
              </Button>
            )}
            {invoice.status !== 'paid' && balance > 0 && (
              <Button variant="secondary" disabled={busy} onClick={() => run(() => payInvoice(invoice.id))}>
                {busy ? 'Recording…' : `Record payment (${formatMoney(balance)})`}
              </Button>
            )}
            {invoice.status === 'paid' && <Alert kind="success">This invoice is paid in full. ✅</Alert>}
          </div>
        </CardBody>
      </Card>
    </>
  )
}
