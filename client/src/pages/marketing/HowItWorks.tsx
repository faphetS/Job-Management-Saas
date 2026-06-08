import { Reveal } from './useReveal'

const STEPS = [
  {
    n: '1',
    title: 'Create your business',
    body: 'Sign up as the owner and invite your team with a shareable link — no per-seat setup.',
  },
  {
    n: '2',
    title: 'Send work down the line',
    body: 'Quote it, schedule it, dispatch it. Owner, tech and client all see the same live status.',
  },
  {
    n: '3',
    title: 'Get paid & repeat',
    body: 'Invoice on completion, collect payment, and the client portal stays current automatically.',
  },
]

export function HowItWorks() {
  return (
    <section id="how" className="scroll-mt-20 bg-white py-20">
      <div className="mx-auto max-w-6xl px-5">
        <div className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-brand-600">How it works</span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-ink-900 sm:text-4xl">
            Up and running in three steps.
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.n} delay={i * 90}>
              <div className="relative h-full rounded-2xl border border-slate-200 bg-white p-7 shadow-card">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-600 text-base font-bold text-white">
                  {s.n}
                </span>
                <h3 className="mt-5 text-lg font-semibold text-ink-900">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-slate-500">{s.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
