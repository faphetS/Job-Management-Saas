import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAsync } from '@/lib/useAsync'
import { assignJob, getJob, listEmployees, updateJob } from '@/features/db'
import { PageHeader } from '@/components/AppShell'
import { Alert, Button, Card, CardBody, Field, Input, Select, Spinner } from '@/components/ui'
import { JobStatusBadge } from '@/components/StatusBadge'
import { formatDateTime, JOB_STATUS_LABELS } from '@/lib/format'
import type { JobStatus } from '@/lib/types'

export default function JobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { data, loading, reload } = useAsync(() => Promise.all([getJob(id!), listEmployees()]), [id])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [schedule, setSchedule] = useState('')

  if (loading || !data) {
    return (
      <div className="grid place-items-center py-20">
        <Spinner />
      </div>
    )
  }

  const [job, employees] = data

  async function run(action: () => Promise<unknown>) {
    setError(null)
    setSaving(true)
    try {
      await action()
      reload()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Link to="/app/jobs" className="text-sm text-brand-600 hover:underline">
        ← Jobs
      </Link>
      <PageHeader
        title={job.title}
        subtitle={job.customer?.full_name ?? undefined}
        actions={<JobStatusBadge status={job.status} />}
      />

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardBody className="space-y-4">
            <Detail label="Description" value={job.description} />
            <Detail label="Service address" value={job.service_address} />
            <Detail label="Scheduled" value={job.scheduled_at ? formatDateTime(job.scheduled_at) : null} />
            <div className="border-t border-slate-100 pt-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-400">Create</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/app/quotes/new?job=${job.id}&customer=${job.customer_id}`)}
                >
                  Quote for this job
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/app/invoices/new?job=${job.id}&customer=${job.customer_id}`)}
                >
                  Invoice for this job
                </Button>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-4">
            <Field label="Assigned technician">
              <Select
                disabled={saving}
                value={job.assigned_to ?? ''}
                onChange={(e) => run(() => assignJob(job.id, e.target.value || null))}
              >
                <option value="">Unassigned</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.full_name || 'Unnamed'} {emp.role === 'owner' ? '(owner)' : ''}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Status">
              <Select
                disabled={saving}
                value={job.status}
                onChange={(e) => run(() => updateJob(job.id, { status: e.target.value as JobStatus }))}
              >
                {Object.entries(JOB_STATUS_LABELS).map(([k, label]) => (
                  <option key={k} value={k}>
                    {label}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="Schedule">
              <div className="flex gap-2">
                <Input type="datetime-local" value={schedule} onChange={(e) => setSchedule(e.target.value)} />
                <Button
                  size="sm"
                  disabled={saving || !schedule}
                  onClick={() =>
                    run(() =>
                      updateJob(job.id, {
                        scheduled_at: new Date(schedule).toISOString(),
                        status: job.status === 'requested' ? 'scheduled' : job.status,
                      }),
                    )
                  }
                >
                  Set
                </Button>
              </div>
            </Field>
          </CardBody>
        </Card>
      </div>
    </>
  )
}

function Detail({ label, value }: { label: string; value: string | null }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
      <p className="mt-0.5 whitespace-pre-wrap text-slate-700">{value || '—'}</p>
    </div>
  )
}
