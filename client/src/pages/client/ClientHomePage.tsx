import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { useAsync } from '@/lib/useAsync'
import {
  ensureClientCustomer,
  listInvoices,
  listJobs,
  listQuotes,
  payInvoice,
  respondToQuote,
} from '@/features/db'
import { PageHeader } from '@/components/AppShell'
import { Alert, Button, Card, CardBody, EmptyState, Spinner } from '@/components/ui'
import { InvoiceStatusBadge, JobStatusBadge, QuoteStatusBadge } from '@/components/StatusBadge'
import { formatDate, formatMoney } from '@/lib/format'

export default function ClientHomePage() {
  const { profile } = useAuth()
  const { data, loading, error, reload } = useAsync(async () => {
    await ensureClientCustomer(profile!)
    const [jobs, quotes, invoices] = await Promise.all([listJobs(), listQuotes(), listInvoices()])
    return { jobs, quotes, invoices }
  }, [profile?.id])

  const [busyId, setBusyId] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  async function act(id: string, fn: () => Promise<void>) {
    setActionError(null)
    setBusyId(id)
    try {
      await fn()
      reload()
    } catch (err) {
      setActionError((err as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <Spinner />
      </div>
    )
  }
  if (error) return <Alert>{error}</Alert>

  const { jobs, quotes, invoices } = data!

  return (
    <>
      <PageHeader
        title="My Jobs"
        subtitle="Track your service requests, quotes, and invoices."
        actions={
          <Link to="/portal/request">
            <Button>+ Request service</Button>
          </Link>
        }
      />

      {actionError && (
        <div className="mb-4">
          <Alert>{actionError}</Alert>
        </div>
      )}

      {/* Quotes awaiting a decision first — they need action */}
      {quotes.some((q) => q.status === 'sent') && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Quotes to review</h2>
          <div className="space-y-3">
            {quotes
              .filter((q) => q.status === 'sent')
              .map((q) => (
                <Card key={q.id}>
                  <CardBody className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-800">{formatMoney(q.total)}</p>
                      <p className="text-sm text-slate-500">Quote · {formatDate(q.created_at)}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        disabled={busyId === q.id}
                        onClick={() => act(q.id, () => respondToQuote(q.id, false))}
                      >
                        Decline
                      </Button>
                      <Button size="sm" disabled={busyId === q.id} onClick={() => act(q.id, () => respondToQuote(q.id, true))}>
                        Approve
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              ))}
          </div>
        </section>
      )}

      {/* Invoices to pay */}
      {invoices.some((i) => i.status !== 'paid' && i.total > 0) && (
        <section className="mb-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Invoices due</h2>
          <div className="space-y-3">
            {invoices
              .filter((i) => i.status !== 'paid' && i.total > 0)
              .map((i) => (
                <Card key={i.id}>
                  <CardBody className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <p className="font-medium text-slate-800">{formatMoney(i.total - i.amount_paid)}</p>
                      <p className="text-sm text-slate-500">Invoice · due {formatDate(i.due_date)}</p>
                    </div>
                    <Button disabled={busyId === i.id} onClick={() => act(i.id, () => payInvoice(i.id))}>
                      {busyId === i.id ? 'Processing…' : `Pay ${formatMoney(i.total - i.amount_paid)}`}
                    </Button>
                  </CardBody>
                </Card>
              ))}
          </div>
        </section>
      )}

      {/* Jobs */}
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">Service requests</h2>
      {jobs.length === 0 ? (
        <EmptyState
          title="No jobs yet"
          subtitle="Request your first service and we'll get on it."
          action={
            <Link to="/portal/request">
              <Button>+ Request service</Button>
            </Link>
          }
        />
      ) : (
        <Card>
          <ul className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <li key={job.id} className="flex items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800">{job.title}</p>
                  <p className="truncate text-sm text-slate-500">{formatDate(job.created_at)}</p>
                </div>
                <JobStatusBadge status={job.status} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      {/* History of resolved quotes/invoices */}
      {(quotes.some((q) => q.status !== 'sent') || invoices.some((i) => i.status === 'paid')) && (
        <section className="mt-6">
          <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">History</h2>
          <Card>
            <ul className="divide-y divide-slate-100">
              {quotes
                .filter((q) => q.status !== 'sent')
                .map((q) => (
                  <li key={q.id} className="flex items-center justify-between px-5 py-3">
                    <span className="text-sm text-slate-600">Quote · {formatMoney(q.total)}</span>
                    <QuoteStatusBadge status={q.status} />
                  </li>
                ))}
              {invoices
                .filter((i) => i.status === 'paid')
                .map((i) => (
                  <li key={i.id} className="flex items-center justify-between px-5 py-3">
                    <span className="text-sm text-slate-600">Invoice · {formatMoney(i.total)}</span>
                    <InvoiceStatusBadge status={i.status} />
                  </li>
                ))}
            </ul>
          </Card>
        </section>
      )}
    </>
  )
}
