import { useState } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { useAsync } from '@/lib/useAsync'
import { getOrganization, listEmployees } from '@/features/db'
import { PageHeader } from '@/components/AppShell'
import { Badge, Button, Card, CardBody, Spinner } from '@/components/ui'

export default function TeamPage() {
  const { profile } = useAuth()
  const orgId = profile?.org_id ?? ''
  const { data, loading } = useAsync(() => Promise.all([listEmployees(), getOrganization(orgId)]), [orgId])

  if (loading || !data) {
    return (
      <div className="grid place-items-center py-20">
        <Spinner />
      </div>
    )
  }

  const [team, org] = data
  const origin = window.location.origin
  const nameParam = `?name=${encodeURIComponent(org.name)}`
  const employeeLink = `${origin}/join/${orgId}${nameParam}`
  const clientLink = `${origin}/register/${orgId}${nameParam}`

  return (
    <>
      <PageHeader title="Team" subtitle={org.name} />

      <div className="mb-6 grid gap-4 sm:grid-cols-2">
        <CopyCard
          title="Invite a technician"
          hint="Share this link with staff to let them create an employee account."
          value={employeeLink}
        />
        <CopyCard
          title="Client sign-up link"
          hint="Share with customers so they can register and track their jobs."
          value={clientLink}
        />
      </div>

      <h2 className="mb-3 text-lg font-semibold text-slate-800">Members</h2>
      <Card>
        <ul className="divide-y divide-slate-100">
          {team.map((m) => (
            <li key={m.id} className="flex items-center justify-between px-5 py-3">
              <div>
                <p className="font-medium text-slate-800">{m.full_name || 'Unnamed'}</p>
                <p className="text-sm text-slate-500">{m.phone || '—'}</p>
              </div>
              <Badge className={m.role === 'owner' ? 'bg-brand-50 text-brand-700' : 'bg-slate-100 text-slate-600'}>
                {m.role}
              </Badge>
            </li>
          ))}
        </ul>
      </Card>
    </>
  )
}

function CopyCard({ title, hint, value }: { title: string; hint: string; value: string }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <Card>
      <CardBody>
        <p className="font-medium text-slate-800">{title}</p>
        <p className="mt-0.5 text-sm text-slate-500">{hint}</p>
        <div className="mt-3 flex gap-2">
          <input
            readOnly
            value={value}
            className="w-full truncate rounded-lg border border-slate-300 bg-slate-50 px-3 py-2 text-xs text-slate-600"
          />
          <Button size="sm" variant="secondary" onClick={copy}>
            {copied ? 'Copied!' : 'Copy'}
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
