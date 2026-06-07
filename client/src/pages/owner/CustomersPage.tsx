import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { useAsync } from '@/lib/useAsync'
import { createCustomer, listCustomers } from '@/features/db'
import { PageHeader } from '@/components/AppShell'
import { Alert, Button, Card, EmptyState, Field, Input, Modal, Spinner, Textarea } from '@/components/ui'
import { formatDate } from '@/lib/format'

export default function CustomersPage() {
  const { profile } = useAuth()
  const { data: customers, loading, reload } = useAsync(listCustomers, [])
  const [open, setOpen] = useState(false)

  return (
    <>
      <PageHeader
        title="Customers"
        subtitle="Your client list."
        actions={<Button onClick={() => setOpen(true)}>+ New customer</Button>}
      />

      {loading ? (
        <div className="grid place-items-center py-20">
          <Spinner />
        </div>
      ) : !customers || customers.length === 0 ? (
        <EmptyState
          title="No customers yet"
          subtitle="Add a customer to start booking jobs."
          action={<Button onClick={() => setOpen(true)}>+ New customer</Button>}
        />
      ) : (
        <Card>
          <ul className="divide-y divide-slate-100">
            {customers.map((c) => (
              <li key={c.id}>
                <Link to={`/app/customers/${c.id}`} className="flex items-center justify-between px-5 py-3 hover:bg-slate-50">
                  <div>
                    <p className="font-medium text-slate-800">{c.full_name}</p>
                    <p className="text-sm text-slate-500">{c.phone || c.email || '—'}</p>
                  </div>
                  <span className="text-xs text-slate-400">{formatDate(c.created_at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <NewCustomerModal
        open={open}
        orgId={profile?.org_id ?? ''}
        onClose={() => setOpen(false)}
        onCreated={() => {
          setOpen(false)
          reload()
        }}
      />
    </>
  )
}

function NewCustomerModal({
  open,
  orgId,
  onClose,
  onCreated,
}: {
  open: boolean
  orgId: string
  onClose: () => void
  onCreated: () => void
}) {
  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      await createCustomer({ org_id: orgId, full_name: fullName, phone, email, address, notes })
      setFullName('')
      setPhone('')
      setEmail('')
      setAddress('')
      setNotes('')
      onCreated()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New customer">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <Field label="Full name">
          <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Phone">
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
          </Field>
          <Field label="Email">
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </Field>
        </div>
        <Field label="Address">
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </Field>
        <Field label="Notes">
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'Saving…' : 'Save customer'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
