import { Link } from 'react-router-dom'
import { useAsync } from '@/lib/useAsync'
import { listJobs } from '@/features/db'
import { PageHeader } from '@/components/AppShell'
import { Card, EmptyState, Spinner } from '@/components/ui'
import { JobStatusBadge } from '@/components/StatusBadge'
import { formatDateTime } from '@/lib/format'
import type { JobWithCustomer } from '@/lib/types'

const DONE = new Set(['completed', 'cancelled'])

export default function MyJobsPage() {
  // RLS limits this to jobs assigned to the current employee.
  const { data: jobs, loading } = useAsync(listJobs, [])

  if (loading || !jobs) {
    return (
      <div className="grid place-items-center py-20">
        <Spinner />
      </div>
    )
  }

  const active = jobs.filter((j) => !DONE.has(j.status))
  const done = jobs.filter((j) => DONE.has(j.status))

  return (
    <>
      <PageHeader title="My Jobs" subtitle="Jobs assigned to you." />
      {jobs.length === 0 ? (
        <EmptyState title="Nothing assigned yet" subtitle="Your dispatcher will assign jobs to you here." />
      ) : (
        <div className="space-y-6">
          <Section title="Active" jobs={active} />
          {done.length > 0 && <Section title="Completed" jobs={done} />}
        </div>
      )}
    </>
  )
}

function Section({ title, jobs }: { title: string; jobs: JobWithCustomer[] }) {
  if (jobs.length === 0) return null
  return (
    <div>
      <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-400">{title}</h2>
      <Card>
        <ul className="divide-y divide-slate-100">
          {jobs.map((job) => (
            <li key={job.id}>
              <Link to={`/tech/${job.id}`} className="flex items-center justify-between gap-3 px-5 py-4 hover:bg-slate-50">
                <div className="min-w-0">
                  <p className="truncate font-medium text-slate-800">{job.title}</p>
                  <p className="truncate text-sm text-slate-500">
                    {job.customer?.full_name ?? 'Customer'}
                    {job.scheduled_at ? ` · ${formatDateTime(job.scheduled_at)}` : ''}
                  </p>
                </div>
                <JobStatusBadge status={job.status} />
              </Link>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  )
}
