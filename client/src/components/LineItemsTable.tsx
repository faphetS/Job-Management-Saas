import { formatMoney } from '@/lib/format'
import type { LineItem } from '@/lib/types'

export function LineItemsTable({
  items,
  subtotal,
  total,
  amountPaid,
}: {
  items: LineItem[]
  subtotal: number
  total: number
  amountPaid?: number
}) {
  return (
    <div>
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wide text-slate-400">
            <th className="py-2 font-medium">Description</th>
            <th className="py-2 text-right font-medium">Qty</th>
            <th className="py-2 text-right font-medium">Unit</th>
            <th className="py-2 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((it) => (
            <tr key={it.id}>
              <td className="py-2 text-slate-700">{it.description}</td>
              <td className="py-2 text-right tabular-nums text-slate-600">{it.quantity}</td>
              <td className="py-2 text-right tabular-nums text-slate-600">{formatMoney(it.unit_price)}</td>
              <td className="py-2 text-right tabular-nums text-slate-800">{formatMoney(it.line_total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-3 space-y-1 border-t border-slate-200 pt-3 text-sm">
        <Row label="Subtotal" value={formatMoney(subtotal)} />
        <Row label="Total" value={formatMoney(total)} strong />
        {amountPaid != null && amountPaid > 0 && <Row label="Paid" value={`- ${formatMoney(amountPaid)}`} />}
        {amountPaid != null && (
          <Row label="Balance" value={formatMoney(total - amountPaid)} strong />
        )}
      </div>
    </div>
  )
}

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={strong ? 'font-semibold tabular-nums text-slate-900' : 'tabular-nums text-slate-700'}>
        {value}
      </span>
    </div>
  )
}
