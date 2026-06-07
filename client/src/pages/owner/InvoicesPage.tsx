import { Link } from 'react-router-dom'
import { useAsync } from '@/lib/useAsync'
import { listInvoices } from '@/features/db'
import { PageHeader } from '@/components/AppShell'
import { Button, Card, EmptyState, Spinner } from '@/components/ui'
import { InvoiceStatusBadge } from '@/components/StatusBadge'
import { formatDate, formatMoney } from '@/lib/format'

export default function InvoicesPage() {
  const { data: invoices, loading } = useAsync(listInvoices, [])

  return (
    <>
      <PageHeader
        title="Invoices"
        subtitle="Bills sent to customers."
        actions={
          <Link to="/app/invoices/new">
            <Button>+ New invoice</Button>
          </Link>
        }
      />

      {loading ? (
        <div className="grid place-items-center py-20">
          <Spinner />
        </div>
      ) : !invoices || invoices.length === 0 ? (
        <EmptyState
          title="No invoices yet"
          subtitle="Create an invoice to bill a customer."
          action={
            <Link to="/app/invoices/new">
              <Button>+ New invoice</Button>
            </Link>
          }
        />
      ) : (
        <Card>
          <ul className="divide-y divide-slate-100">
            {invoices.map((i) => (
              <li key={i.id}>
                <Link to={`/app/invoices/${i.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-800">{formatMoney(i.total)}</p>
                    <p className="text-sm text-slate-500">
                      {i.customer?.full_name ?? 'Customer'} · {formatDate(i.created_at)}
                    </p>
                  </div>
                  <InvoiceStatusBadge status={i.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  )
}
