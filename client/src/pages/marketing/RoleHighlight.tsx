import { Badge } from '@/components/ui'
import { Reveal } from './useReveal'

const ROLES = [
  {
    tag: 'Owner',
    tagClass: 'bg-brand-100 text-brand-700',
    title: 'The full back office',
    bullets: ['Dashboard, jobs & customers', 'Build and send quotes & invoices', 'Assign work and manage the team'],
  },
  {
    tag: 'Technician',
    tagClass: 'bg-sky-100 text-sky-700',
    title: 'Focused for the field',
    bullets: ['Only the jobs assigned to you', 'One-tap status stepper', 'Job details, address & contact'],
  },
  {
    tag: 'Client',
    tagClass: 'bg-emerald-100 text-emerald-700',
    title: 'A clean self-serve portal',
    bullets: ['Request service in seconds', 'Approve or decline quotes', 'Pay invoices online'],
  },
]

function Check() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0 text-brand-600" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  )
}

export function RoleHighlight() {
  return (
    <section id="roles" className="scroll-mt-20 bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-brand-600">Built for everyone</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            One system, three points of view.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {ROLES.map((r, i) => (
            <Reveal key={r.tag} delay={i * 90}>
              <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-7 shadow-card">
                <Badge className={r.tagClass}>{r.tag}</Badge>
                <h3 className="mt-4 text-lg font-semibold text-ink-900">{r.title}</h3>
                <ul className="mt-4 space-y-2.5">
                  {r.bullets.map((b) => (
                    <li key={b} className="flex gap-2 text-sm text-slate-600">
                      <Check />
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
