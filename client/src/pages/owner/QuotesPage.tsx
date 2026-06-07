import { Link } from 'react-router-dom'
import { useAsync } from '@/lib/useAsync'
import { listQuotes } from '@/features/db'
import { PageHeader } from '@/components/AppShell'
import { Button, Card, EmptyState, Spinner } from '@/components/ui'
import { QuoteStatusBadge } from '@/components/StatusBadge'
import { formatDate, formatMoney } from '@/lib/format'

export default function QuotesPage() {
  const { data: quotes, loading } = useAsync(listQuotes, [])

  return (
    <>
      <PageHeader
        title="Quotes"
        subtitle="Estimates sent to customers."
        actions={
          <Link to="/app/quotes/new">
            <Button>+ New quote</Button>
          </Link>
        }
      />

      {loading ? (
        <div className="grid place-items-center py-20">
          <Spinner />
        </div>
      ) : !quotes || quotes.length === 0 ? (
        <EmptyState
          title="No quotes yet"
          subtitle="Create a quote to send your customer an estimate."
          action={
            <Link to="/app/quotes/new">
              <Button>+ New quote</Button>
            </Link>
          }
        />
      ) : (
        <Card>
          <ul className="divide-y divide-slate-100">
            {quotes.map((q) => (
              <li key={q.id}>
                <Link to={`/app/quotes/${q.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-800">{formatMoney(q.total)}</p>
                    <p className="text-sm text-slate-500">
                      {q.customer?.full_name ?? 'Customer'} · {formatDate(q.created_at)}
                    </p>
                  </div>
                  <QuoteStatusBadge status={q.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  )
}
