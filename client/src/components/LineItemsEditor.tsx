import { useState } from 'react'
import { Button, Input } from './ui'
import { dollarsToCents, formatMoney } from '@/lib/format'
import type { DraftLineItem } from '@/lib/types'

interface Row {
  description: string
  quantity: string
  price: string // dollars, as typed
}

const EMPTY: Row = { description: '', quantity: '1', price: '' }

function rowCents(r: Row): number {
  return Math.round((parseFloat(r.quantity) || 0) * dollarsToCents(r.price))
}

/** Emits computed DraftLineItem[] (and total in cents) to the parent on every change. */
export function LineItemsEditor({
  onChange,
}: {
  onChange: (items: DraftLineItem[], total: number) => void
}) {
  const [rows, setRows] = useState<Row[]>([{ ...EMPTY }])

  function emit(next: Row[]) {
    const items: DraftLineItem[] = next
      .filter((r) => r.description.trim())
      .map((r) => ({
        description: r.description.trim(),
        quantity: parseFloat(r.quantity) || 0,
        unit_price: dollarsToCents(r.price),
      }))
    const total = items.reduce((s, it) => s + Math.round(it.quantity * it.unit_price), 0)
    onChange(items, total)
  }

  function update(i: number, patch: Partial<Row>) {
    const next = rows.map((r, idx) => (idx === i ? { ...r, ...patch } : r))
    setRows(next)
    emit(next)
  }
  function addRow() {
    setRows([...rows, { ...EMPTY }])
  }
  function removeRow(i: number) {
    const next = rows.length > 1 ? rows.filter((_, idx) => idx !== i) : [{ ...EMPTY }]
    setRows(next)
    emit(next)
  }

  const total = rows.reduce((s, r) => s + rowCents(r), 0)

  return (
    <div className="space-y-2">
      <div className="hidden grid-cols-[1fr_4rem_6rem_5rem_2rem] gap-2 px-1 text-xs font-medium text-slate-500 sm:grid">
        <span>Description</span>
        <span>Qty</span>
        <span>Unit price</span>
        <span className="text-right">Total</span>
        <span />
      </div>
      {rows.map((r, i) => (
        <div key={i} className="grid grid-cols-2 gap-2 sm:grid-cols-[1fr_4rem_6rem_5rem_2rem] sm:items-center">
          <Input
            className="col-span-2 sm:col-span-1"
            placeholder="e.g. Standard service call"
            value={r.description}
            onChange={(e) => update(i, { description: e.target.value })}
          />
          <Input
            type="number"
            min="0"
            step="0.5"
            value={r.quantity}
            onChange={(e) => update(i, { quantity: e.target.value })}
          />
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={r.price}
            onChange={(e) => update(i, { price: e.target.value })}
          />
          <span className="self-center text-right text-sm tabular-nums text-slate-700">{formatMoney(rowCents(r))}</span>
          <button
            type="button"
            onClick={() => removeRow(i)}
            className="justify-self-end rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-rose-600"
            aria-label="Remove line"
          >
            ✕
          </button>
        </div>
      ))}
      <div className="flex items-center justify-between pt-1">
        <Button type="button" variant="secondary" size="sm" onClick={addRow}>
          + Add line
        </Button>
        <div className="text-sm">
          <span className="text-slate-500">Total </span>
          <span className="font-semibold tabular-nums text-slate-900">{formatMoney(total)}</span>
        </div>
      </div>
    </div>
  )
}
