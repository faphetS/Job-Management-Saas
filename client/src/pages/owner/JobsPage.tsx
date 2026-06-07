import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { useAsync } from '@/lib/useAsync'
import { listCustomers, listJobs } from '@/features/db'
import { PageHeader } from '@/components/AppShell'
import { Button, Card, EmptyState, Select, Spinner } from '@/components/ui'
import { JobStatusBadge } from '@/components/StatusBadge'
import { NewJobModal } from '@/components/NewJobModal'
import { formatDate, JOB_STATUS_LABELS } from '@/lib/format'
import type { JobStatus } from '@/lib/types'

export default function JobsPage() {
  const { profile, user } = useAuth()
  const { data, loading, reload } = useAsync(() => Promise.all([listJobs(), listCustomers()]), [])
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState<JobStatus | 'all'>('all')

  const jobs = data?.[0] ?? []
  const customers = data?.[1] ?? []
  const shown = useMemo(() => (filter === 'all' ? jobs : jobs.filter((j) => j.status === filter)), [jobs, filter])

  return (
    <>
      <PageHeader
        title="Jobs"
        subtitle="Every work order across your business."
        actions={
          <Button onClick={() => setOpen(true)} disabled={customers.length === 0}>
            + New job
          </Button>
        }
      />

      {loading ? (
        <div className="grid place-items-center py-20">
          <Spinner />
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState
          title="No jobs yet"
          subtitle={customers.length === 0 ? 'Add a customer first, then create a job.' : 'Create your first job.'}
          action={customers.length > 0 ? <Button onClick={() => setOpen(true)}>+ New job</Button> : undefined}
        />
      ) : (
        <>
          <div className="mb-4 max-w-xs">
            <Select value={filter} onChange={(e) => setFilter(e.target.value as JobStatus | 'all')}>
              <option value="all">All statuses</option>
              {Object.entries(JOB_STATUS_LABELS).map(([k, label]) => (
                <option key={k} value={k}>
                  {label}
                </option>
              ))}
            </Select>
          </div>
          <Card>
            <ul className="divide-y divide-slate-100">
              {shown.map((job) => (
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
        </>
      )}

      {profile?.org_id && user && (
        <NewJobModal
          open={open}
          onClose={() => setOpen(false)}
          onCreated={() => {
            setOpen(false)
            reload()
          }}
          orgId={profile.org_id}
          createdBy={user.id}
          customers={customers}
        />
      )}
    </>
  )
}
