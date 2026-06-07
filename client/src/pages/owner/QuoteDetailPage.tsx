import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAsync } from '@/lib/useAsync'
import { createInvoice, getQuote, sendQuote } from '@/features/db'
import { PageHeader } from '@/components/AppShell'
import { Alert, Button, Card, CardBody, Spinner } from '@/components/ui'
import { QuoteStatusBadge } from '@/components/StatusBadge'
import { LineItemsTable } from '@/components/LineItemsTable'
import { formatDate } from '@/lib/format'

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data: quote, loading, reload } = useAsync(() => getQuote(id!), [id])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (loading || !quote) {
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

  async function convertToInvoice() {
    setError(null)
    setBusy(true)
    try {
      const invoice = await createInvoice({
        org_id: quote!.org_id,
        customer_id: quote!.customer_id,
        job_id: quote!.job_id,
        quote_id: quote!.id,
        items: quote!.line_items.map((l) => ({
          description: l.description,
          quantity: l.quantity,
          unit_price: l.unit_price,
        })),
      })
      navigate(`/app/invoices/${invoice.id}`)
    } catch (err) {
      setError((err as Error).message)
      setBusy(false)
    }
  }

  return (
    <>
      <Link to="/app/quotes" className="text-sm text-brand-600 hover:underline">
        ← Quotes
      </Link>
      <PageHeader
        title={`Quote · ${quote.customer?.full_name ?? ''}`}
        subtitle={formatDate(quote.created_at)}
        actions={<QuoteStatusBadge status={quote.status} />}
      />

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <Card className="max-w-2xl">
        <CardBody className="space-y-5">
          <LineItemsTable items={quote.line_items} subtotal={quote.subtotal} total={quote.total} />
          {quote.notes && (
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">Notes</p>
              <p className="mt-0.5 whitespace-pre-wrap text-sm text-slate-700">{quote.notes}</p>
            </div>
          )}

          <div className="flex flex-wrap gap-2 border-t border-slate-100 pt-4">
            {quote.status === 'draft' && (
              <Button disabled={busy} onClick={() => run(() => sendQuote(quote.id))}>
                Send to customer
              </Button>
            )}
            {quote.status === 'sent' && <Alert kind="info">Waiting for the customer to approve or decline.</Alert>}
            {quote.status === 'approved' && (
              <Button disabled={busy} onClick={convertToInvoice}>
                {busy ? 'Creating…' : 'Create invoice from quote'}
              </Button>
            )}
          </div>
        </CardBody>
      </Card>
    </>
  )
}
