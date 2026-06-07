import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAsync } from '@/lib/useAsync'
import { getJob, updateJob } from '@/features/db'
import { PageHeader } from '@/components/AppShell'
import { Alert, Button, Card, CardBody, Spinner } from '@/components/ui'
import { JobStatusBadge } from '@/components/StatusBadge'
import { formatDateTime, JOB_NEXT_STATUS, JOB_STATUS_LABELS } from '@/lib/format'

export default function EmployeeJobDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data: job, loading, reload } = useAsync(() => getJob(id!), [id])
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  if (loading || !job) {
    return (
      <div className="grid place-items-center py-20">
        <Spinner />
      </div>
    )
  }

  const next = JOB_NEXT_STATUS[job.status]

  async function advance() {
    if (!next) return
    setError(null)
    setSaving(true)
    try {
      await updateJob(job!.id, { status: next })
      reload()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <Link to="/tech" className="text-sm text-brand-600 hover:underline">
        ← My Jobs
      </Link>
      <PageHeader title={job.title} actions={<JobStatusBadge status={job.status} />} />

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <Card className="mb-6">
        <CardBody className="space-y-4">
          <Detail label="Customer" value={job.customer?.full_name ?? null} />
          <Detail label="Phone" value={job.customer?.phone ?? null} />
          <Detail label="Service address" value={job.service_address} />
          <Detail label="Scheduled" value={job.scheduled_at ? formatDateTime(job.scheduled_at) : null} />
          <Detail label="Details" value={job.description} />
        </CardBody>
      </Card>

      {next ? (
        <Button className="w-full py-3 text-base" disabled={saving} onClick={advance}>
          {saving ? 'Updating…' : `Mark as ${JOB_STATUS_LABELS[next]}`}
        </Button>
      ) : job.status === 'completed' ? (
        <Alert kind="success">This job is complete. Nice work! 🎉</Alert>
      ) : job.status === 'requested' || job.status === 'scheduled' ? (
        <Alert kind="info">Waiting to be assigned/dispatched by the office.</Alert>
      ) : null}
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
