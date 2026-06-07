import { useState, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { useAsync } from '@/lib/useAsync'
import { createQuote, listCustomers } from '@/features/db'
import { PageHeader } from '@/components/AppShell'
import { Alert, Button, Card, CardBody, Field, Select, Spinner, Textarea } from '@/components/ui'
import { LineItemsEditor } from '@/components/LineItemsEditor'
import type { DraftLineItem } from '@/lib/types'

export default function NewQuotePage() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const [params] = useSearchParams()
  const jobId = params.get('job')
  const presetCustomer = params.get('customer') ?? ''

  const { data: customers, loading } = useAsync(listCustomers, [])
  const [customerId, setCustomerId] = useState(presetCustomer)
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
      const quote = await createQuote({
        org_id: profile!.org_id!,
        customer_id: customerId,
        job_id: jobId,
        notes,
        items,
      })
      navigate(`/app/quotes/${quote.id}`, { replace: true })
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
      <PageHeader title="New quote" subtitle="Build an estimate to send to your customer." />
      <Card className="max-w-2xl">
        <CardBody>
          <form onSubmit={onSubmit} className="space-y-5">
            {error && <Alert>{error}</Alert>}
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
                {busy ? 'Saving…' : 'Save quote'}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </>
  )
}
