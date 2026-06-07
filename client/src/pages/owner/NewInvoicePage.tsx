import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { useAsync } from '@/lib/useAsync'
import { createInvoice, listCustomers } from '@/features/db'
import { PageHeader } from '@/components/AppShell'
import { Alert, Button, Card, CardBody, Field, Input, Select, Spinner, Textarea } from '@/components/ui'
import { LineItemsEditor } from '@/components/LineItemsEditor'
import type { DraftLineItem } from '@/lib/types'

export default function NewInvoicePage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [params] = useSearchParams()
  const jobId = params.get('job')
  const presetCustomer = params.get('customer') ?? ''

  const { data: customers, loading } = useAsync(listCustomers, [])
  const [customerId, setCustomerId] = useState(presetCustomer)
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [items, setItems] = useState<DraftLineItem[]>([])
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!customerId) return setError('Please choose a customer.')
    if (items.length === 0) return setError('Add at least one line item.')
    setError(null)
    setBusy(true)
    try {
      const invoice = await createInvoice({
        org_id: profile!.org_id!,
        customer_id: customerId,
        job_id: jobId,
        due_date: dueDate || null,
        notes,
        items,
      })
      navigate(`/app/invoices/${invoice.id}`, { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  if (loading) {
    return (
      <div className="grid place-items-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <>
      <PageHeader title="New invoice" subtitle="Bill your customer for completed work." />
      <Card className="max-w-2xl">
        <CardBody>
          <form onSubmit={onSubmit} className="space-y-5">
            {error && <Alert>{error}</Alert>}
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Customer">
                <Select
                  required
                  value={customerId}
                  onChange={(e) => setCustomerId(e.target.value)}
                  disabled={Boolean(presetCustomer)}
                >
                  <option value="">Select a customer…</option>
                  {customers?.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name}
                    </option>
                  ))}
                </Select>
              </Field>
              <Field label="Due date (optional)">
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </Field>
            </div>

            <div>
              <p className="mb-2 text-sm font-medium text-slate-700">Line items</p>
              <LineItemsEditor onChange={(its) => setItems(its)} />
            </div>

            <Field label="Notes (optional)">
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} />
            </Field>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? 'Saving…' : 'Save invoice'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </>
  )
}
