import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { useAsync } from '@/lib/useAsync'
import { getCustomer, listJobsForCustomer } from '@/features/db'
import { PageHeader } from '@/components/AppShell'
import { Button, Card, CardBody, EmptyState, Spinner } from '@/components/ui'
import { JobStatusBadge } from '@/components/StatusBadge'
import { NewJobModal } from '@/components/NewJobModal'
import { formatDate } from '@/lib/format'

export default function CustomerDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { profile, user } = useAuth()
  const { data, loading, reload } = useAsync(
    () => Promise.all([getCustomer(id!), listJobsForCustomer(id!)]),
    [id],
  )
  const [open, setOpen] = useState(false)

  if (loading || !data) {
    return (
      <div className="grid place-items-center py-20">
        <Spinner />
      </div>
    )
  }

  const [customer, jobs] = data

  return (
    <>
      <Link to="/app/customers" className="text-sm text-brand-600 hover:underline">
        ← Customers
      </Link>
      <PageHeader
        title={customer.full_name}
        actions={<Button onClick={() => setOpen(true)}>+ New job</Button>}
      />

      <Card className="mb-6">
        <CardBody className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          <Detail label="Phone" value={customer.phone} />
          <Detail label="Email" value={customer.email} />
          <Detail label="Address" value={customer.address} />
          <Detail label="Added" value={formatDate(customer.created_at)} />
          {customer.notes && (
            <div className="col-span-2 sm:col-span-4">
              <Detail label="Notes" value={customer.notes} />
            </div>
          )}
        </CardBody>
      </Card>

      <h2 className="mb-3 text-lg font-semibold text-slate-800">Jobs</h2>
      {jobs.length === 0 ? (
        <EmptyState title="No jobs for this customer yet" />
      ) : (
        <Card>
          <ul className="divide-y divide-slate-100">
            {jobs.map((job) => (
              <li key={job.id}>
                <Link to={`/app/jobs/${job.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-800">{job.title}</p>
                    <p className="text-sm text-slate-500">{formatDate(job.created_at)}</p>
                  </div>
                  <JobStatusBadge status={job.status} />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
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
          fixedCustomerId={customer.id}
        />
      )}
    </>
  )
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 text-slate-700">{value || '—'}</p>
    </div>
  )
}
