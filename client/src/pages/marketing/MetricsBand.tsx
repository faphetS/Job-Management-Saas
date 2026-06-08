import type { ReactNode } from 'react'
import { Reveal } from './useReveal'

function Ic({ children }: { children: ReactNode }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

const METRICS = [
  {
    icon: (
      <Ic>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </Ic>
    ),
    number: '3 roles',
    text: 'Owner, technician and client — one login each, one shared source of truth.',
  },
  {
    icon: (
      <Ic>
        <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z" />
      </Ic>
    ),
    number: '5 min',
    text: 'From signing up to scheduling your first job. No setup project required.',
  },
  {
    icon: (
      <Ic>
        <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
        <path d="M4 6v12a2 2 0 0 0 2 2h14v-4" />
        <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
      </Ic>
    ),
    number: '$0',
    text: 'Start free. No credit card and no setup fees — bring your team and your customers.',
  },
]

export function MetricsBand() {
  return (
    <section className="bg-white py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="mx-auto max-w-2xl text-center">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-brand-600">Why JobFlow</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            You've found your job supersuit.
          </h2>
          <p className="mt-3 text-slate-600">
            The busywork — scheduling, quoting, invoicing, chasing payments — handled in one calm place.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {METRICS.map((m, i) => (
            <Reveal key={m.number} delay={i * 90}>
              <div className="flex h-full flex-col items-center rounded-2xl bg-slate-50 p-8 text-center">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-white text-brand-600 shadow-card">
                  {m.icon}
                </span>
                <p className="mt-5 text-3xl font-bold tracking-tight text-ink-900">{m.number}</p>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{m.text}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
