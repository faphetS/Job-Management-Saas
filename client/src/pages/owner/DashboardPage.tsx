import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { useAsync } from '@/lib/useAsync'
import { listCustomers, listInvoices, listJobs } from '@/features/db'
import { PageHeader } from '@/components/AppShell'
import { Card, CardBody, EmptyState, Spinner, cn } from '@/components/ui'
import { JobStatusBadge } from '@/components/StatusBadge'
import { formatDate, formatMoney } from '@/lib/format'
import type { ReactNode } from 'react'

const ACTIVE = new Set(['requested', 'scheduled', 'assigned', 'en_route', 'on_site'])

const ICONS: Record<string, ReactNode> = {
  briefcase: (
    <>
      <rect width="20" height="14" x="2" y="7" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </>
  ),
  check: (
    <>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <path d="m9 11 3 3L22 4" />
    </>
  ),
  users: (
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>
  ),
  wallet: (
    <>
      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2" />
      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
    </>
  ),
}

function StatIcon({ name }: { name: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  )
}

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

  const stats: { label: string; value: string; icon: string; danger?: boolean }[] = [
    { label: 'Active jobs', value: String(active), icon: 'briefcase' },
    { label: 'Completed jobs', value: String(completed), icon: 'check' },
    { label: 'Customers', value: String(customers.length), icon: 'users' },
    { label: 'Outstanding', value: formatMoney(unpaid), icon: 'wallet', danger: unpaid > 0 },
  ]

  return (
    <>
      <PageHeader
        title={`Welcome${profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}`}
        subtitle="Here's how your business is doing."
      />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardBody className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-slate-500">{s.label}</p>
                <span className="grid h-9 w-9 place-items-center rounded-lg bg-brand-50 text-brand-600">
                  <StatIcon name={s.icon} />
                </span>
              </div>
              <p
                className={cn(
                  'text-3xl font-bold tracking-tight tabular-nums',
                  s.danger ? 'text-rose-600' : 'text-ink-900',
                )}
              >
                {s.value}
              </p>
            </CardBody>
          </Card>
        ))}
      </div>

      <div className="mb-3 mt-8 flex items-baseline gap-2">
        <h2 className="text-lg font-semibold text-ink-900">Recent jobs</h2>
        {jobs.length > 0 && <span className="text-sm text-slate-400">({jobs.length})</span>}
      </div>
      {jobs.length === 0 ? (
        <EmptyState title="No jobs yet" subtitle="Create your first job from the Jobs tab." />
      ) : (
        <Card>
          <ul className="divide-y divide-slate-100">
            {jobs.slice(0, 6).map((job) => (
              <li key={job.id}>
                <Link
                  to={`/app/jobs/${job.id}`}
                  className="group flex items-center justify-between gap-3 px-5 py-3 transition hover:bg-slate-50"
                >
                  <div className="min-w-0">
                    <p className="truncate font-medium text-slate-800">{job.title}</p>
                    <p className="truncate text-sm text-slate-500">
                      {job.customer?.full_name ?? 'Unknown'} · {formatDate(job.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <JobStatusBadge status={job.status} />
                    <span className="text-slate-300 transition group-hover:translate-x-0.5 group-hover:text-slate-400">›</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </>
  )
}
