import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { useAsync } from '@/lib/useAsync'
import { listCustomers, listInvoices, listJobs } from '@/features/db'
import { PageHeader } from '@/components/AppShell'
import { Card, CardBody, EmptyState, Spinner } from '@/components/ui'
import { JobStatusBadge } from '@/components/StatusBadge'
import { formatDate, formatMoney } from '@/lib/format'

const ACTIVE = new Set(['requested', 'scheduled', 'assigned', 'en_route', 'on_site'])

export default function DashboardPage() {
  const { profile } = useAuth()
  const { data, loading } = useAsync(
    () => Promise.all([listJobs(), listCustomers(), listInvoices()]),
    [],
  )

  if (loading || !data) {
    return (
      <div className="grid place-items-center py-20">
        <Spinner />
      </div>
    )
  }

  const [jobs, customers, invoices] = data
  const active = jobs.filter((j) => ACTIVE.has(j.status)).length
  const completed = jobs.filter((j) => j.status === 'completed').length
  const unpaid = invoices
    .filter((i) => i.status !== 'paid')
    .reduce((s, i) => s + (i.total - i.amount_paid), 0)

  const stats = [
    { label: 'Active jobs', value: String(active) },
    { label: 'Completed jobs', value: String(completed) },
    { label: 'Customers', value: String(customers.length) },
    { label: 'Outstanding', value: formatMoney(unpaid) },
  ]

  return (
    <>
      <PageHeader title={`Welcome${profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}`} subtitle="Here's how your business is doing." />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardBody>
              <p className="text-sm text-slate-500">{s.label}</p>
              <p className="mt-1 text-2xl font-semibold text-slate-900">{s.value}</p>
            </CardBody>
          </Card>
        ))}
      </div>

      <h2 className="mb-3 mt-8 text-lg font-semibold text-slate-800">Recent jobs</h2>
      {jobs.length === 0 ? (
        <EmptyState title="No jobs yet" subtitle="Create your first job from the Jobs tab." />
      ) : (
        <Card>
          <ul className="divide-y divide-slate-100">
            {jobs.slice(0, 6).map((job) => (
              <li key={job.id}>
                <Link to={`/app/jobs/${job.id}`} className="flex items-center justify-between gap-3 px-5 py-3 hover:bg-slate-50">
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800">{job.title}</p>
                    <p className="truncate text-sm text-slate-500">
                      {job.customer?.full_name ?? 'Unknown'} · {formatDate(job.created_at)}
                    </p>
                  </div>
                  <JobStatusBadge status={job.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  )
}
