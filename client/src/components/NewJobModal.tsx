import { useState, type FormEvent } from 'react'
import { createJob } from '@/features/db'
import { Alert, Button, Field, Input, Modal, Select, Textarea } from './ui'
import type { Customer, Job } from '@/lib/types'

export function NewJobModal({
  open,
  onClose,
  onCreated,
  orgId,
  createdBy,
  customers,
  fixedCustomerId,
}: {
  open: boolean
  onClose: () => void
  onCreated: (job: Job) => void
  orgId: string
  createdBy: string
  customers?: Pick<Customer, 'id' | 'full_name'>[]
  fixedCustomerId?: string
}) {
  const [customerId, setCustomerId] = useState(fixedCustomerId ?? '')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [address, setAddress] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    const chosen = fixedCustomerId ?? customerId
    if (!chosen) {
      setError('Please choose a customer.')
      return
    }
    setError(null)
    setBusy(true)
    try {
      const job = await createJob({
        org_id: orgId,
        customer_id: chosen,
        title,
        description,
        service_address: address,
        created_by: createdBy,
      })
      setTitle('')
      setDescription('')
      setAddress('')
      onCreated(job)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="New job">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        {!fixedCustomerId && (
          <Field label="Customer">
            <Select required value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
              <option value="">Select a customer…</option>
              {customers?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}
                </option>
              ))}
            </Select>
          </Field>
        )}
        <Field label="Job title">
          <Input required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Repair front door" />
        </Field>
        <Field label="Service address">
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </Field>
        <Field label="Description">
          <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
        </Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={busy}>
            {busy ? 'Creating…' : 'Create job'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
