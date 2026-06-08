import { JobStatusBadge } from '@/components/StatusBadge'
import { Logo } from '@/components/Logo'
import { cn } from '@/components/ui'
import { formatMoney } from '@/lib/format'
import type { JobStatus } from '@/lib/types'

const MOCK_STATS = [
  { label: 'Active jobs', value: '7' },
  { label: 'Completed', value: '24' },
  { label: 'Customers', value: '58' },
  { label: 'Outstanding', value: formatMoney(184200) },
]

const MOCK_JOBS: { title: string; customer: string; status: JobStatus }[] = [
  { title: 'Water heater install', customer: 'R. Alvarez', status: 'on_site' },
  { title: 'Lock rekey', customer: 'The Bricks Café', status: 'scheduled' },
  { title: 'HVAC tune-up', customer: 'J. Okafor', status: 'en_route' },
  { title: 'Panel upgrade', customer: 'Northside Dental', status: 'completed' },
  { title: 'Leak inspection', customer: 'M. Tran', status: 'requested' },
]

const NAV = ['Dashboard', 'Jobs', 'Quotes', 'Invoices', 'Team']

export function HeroMock() {
  return (
    <div
      className="relative mx-auto max-w-4xl"
      role="img"
      aria-label="Preview of the JobFlow dashboard showing jobs, statuses and payments"
    >
      <div aria-hidden className="absolute inset-x-12 -top-4 bottom-4 -z-10 rounded-[2rem] bg-brand-200/40 blur-2xl" />

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-pop lg:[transform:perspective(1600px)_rotateX(3deg)]">
        {/* browser chrome */}
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          <span className="h-2.5 w-2.5 rounded-full bg-slate-200" />
          <span className="ml-3 rounded-md bg-slate-100 px-2 py-0.5 text-[11px] text-slate-400">app.jobflow.com/app</span>
        </div>

        <div className="grid sm:grid-cols-[168px_1fr]">
          {/* mini sidebar */}
          <div className="hidden flex-col gap-1 border-r border-slate-100 p-3 sm:flex">
            <div className="px-1 pb-2">
              <Logo iconSize={18} wordmarkClassName="text-sm" />
            </div>
            {NAV.map((n, i) => (
              <span
                key={n}
                className={cn(
                  'rounded-md px-2.5 py-1.5 text-xs font-medium',
                  i === 0 ? 'bg-brand-50 text-brand-700' : 'text-slate-500',
                )}
              >
                {n}
              </span>
            ))}
          </div>

          {/* main */}
          <div className="p-4 sm:p-5">
            <p className="text-sm font-semibold text-ink-900">Welcome, Maya</p>
            <p className="text-xs text-slate-500">Here's how your business is doing.</p>

            <div className="mt-3 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
              {MOCK_STATS.map((s) => (
                <div key={s.label} className="rounded-lg border border-slate-200 bg-white p-3">
                  <p className="text-[11px] text-slate-500">{s.label}</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-ink-900">{s.value}</p>
                </div>
              ))}
            </div>

            <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
              {MOCK_JOBS.map((j, i) => (
                <div
                  key={j.title}
                  className={cn('flex items-center justify-between gap-2 px-3 py-2', i > 0 && 'border-t border-slate-100')}
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-slate-800">{j.title}</p>
                    <p className="truncate text-[11px] text-slate-500">{j.customer}</p>
                  </div>
                  <JobStatusBadge status={j.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* floating accent chips */}
      <div
        className="lp-float absolute -right-3 top-12 hidden rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-pop sm:flex"
        style={{ animationDelay: '600ms' }}
      >
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-600">✓</span>
          <div>
            <p className="text-[11px] font-semibold text-slate-800">Quote #1043 approved</p>
            <p className="text-[10px] text-slate-500">{formatMoney(229000)}</p>
          </div>
        </div>
      </div>

      <div
        className="lp-float absolute -left-3 bottom-10 hidden rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-pop sm:flex"
        style={{ animationDelay: '1200ms' }}
      >
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">$</span>
          <div>
            <p className="text-[11px] font-semibold text-slate-800">{formatMoney(42000)} paid</p>
            <p className="text-[10px] text-slate-500">Visa ···· 42</p>
          </div>
        </div>
      </div>
    </div>
  )
}
