import type { ReactNode } from 'react'
import { Card, CardBody } from '@/components/ui'
import { Reveal } from './useReveal'

function Ic({ children }: { children: ReactNode }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  )
}

const PILLARS = [
  {
    title: 'Schedule & dispatch',
    body: 'Book jobs, assign the right tech, and watch status move from requested to on-site to completed in real time.',
    icon: (
      <Ic>
        <path d="M8 2v4" />
        <path d="M16 2v4" />
        <rect width="18" height="18" x="3" y="4" rx="2" />
        <path d="M3 10h18" />
      </Ic>
    ),
  },
  {
    title: 'Quote, then approve',
    body: 'Send itemized quotes; customers approve in a tap. Drafts become sent, then approved — no phone tag.',
    icon: (
      <Ic>
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v5h5" />
        <path d="m9 15 2 2 4-4" />
      </Ic>
    ),
  },
  {
    title: 'Invoice & get paid',
    body: 'Turn approved work into invoices and collect payment. Track what is sent, paid, and still outstanding.',
    icon: (
      <Ic>
        <rect width="20" height="14" x="2" y="5" rx="2" />
        <path d="M2 10h20" />
      </Ic>
    ),
  },
  {
    title: 'Client portal & team',
    body: 'Clients request service and follow progress from their own portal; your crew gets a focused mobile job list.',
    icon: (
      <Ic>
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </Ic>
    ),
  },
]

export function FeaturePillars() {
  return (
    <section id="features" className="scroll-mt-20 bg-slate-50 py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-brand-600">Features</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Everything a service business runs on.
          </h2>
          <p className="mt-3 text-slate-600">
            One connected workflow from the first request to the final payment — nothing to stitch together.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PILLARS.map((p, i) => (
            <Reveal key={p.title} delay={i * 80}>
              <Card className="h-full">
                <CardBody className="flex h-full flex-col gap-3">
                  <span className="grid h-11 w-11 place-items-center rounded-xl bg-brand-50 text-brand-600">{p.icon}</span>
                  <h3 className="text-base font-semibold text-ink-900">{p.title}</h3>
                  <p className="text-sm leading-relaxed text-slate-500">{p.body}</p>
                </CardBody>
              </Card>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
