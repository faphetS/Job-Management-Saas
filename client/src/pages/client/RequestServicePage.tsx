import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { createJob, ensureClientCustomer } from '@/features/db'
import { PageHeader } from '@/components/AppShell'
import { Alert, Button, Card, CardBody, Field, Input, Textarea } from '@/components/ui'

export default function RequestServicePage() {
  const navigate = useNavigate()
  const { profile, user } = useAuth()
  const [title, setTitle] = useState('')
  const [address, setAddress] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const customer = await ensureClientCustomer(profile!)
      await createJob({
        org_id: profile!.org_id!,
        customer_id: customer.id,
        title,
        description,
        service_address: address,
        status: 'requested',
        created_by: user!.id,
      })
      navigate('/portal', { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader title="Request service" subtitle="Tell us what you need and we'll get back to you." />
      <Card className="max-w-xl">
        <CardBody>
          <form onSubmit={onSubmit} className="space-y-4">
            {error && <Alert>{error}</Alert>}
            <Field label="What do you need?">
              <Input
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Leaking pipe under the sink"
              />
            </Field>
            <Field label="Service address">
              <Input value={address} onChange={(e) => setAddress(e.target.value)} />
            </Field>
            <Field label="Details">
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Anything that helps us prepare…"
              />
            </Field>
            <Button type="submit" disabled={busy}>
              {busy ? 'Sending…' : 'Submit request'}
            </Button>
          </form>
        </CardBody>
      </Card>
    </>
  )
}
