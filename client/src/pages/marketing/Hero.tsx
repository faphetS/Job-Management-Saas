import { Link } from 'react-router-dom'
import { Button } from '@/components/ui'
import { HeroMock } from './HeroMock'

export function Hero() {
  return (
    <section aria-labelledby="hero-h1" className="relative overflow-hidden">
      {/* backdrop: soft blue wash + glow + faint blueprint grid */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-brand-50 via-white to-white" />
        <div className="absolute left-1/2 top-0 h-[420px] w-[720px] -translate-x-1/2 rounded-full bg-sky-200/30 blur-3xl" />
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(37,99,235,0.06) 1px, transparent 1px), linear-gradient(to bottom, rgba(37,99,235,0.06) 1px, transparent 1px)',
            backgroundSize: '32px 32px',
            maskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent 75%)',
            WebkitMaskImage: 'radial-gradient(ellipse 60% 50% at 50% 0%, black, transparent 75%)',
          }}
        />
      </div>

      <div className="mx-auto max-w-6xl px-5 pb-10 pt-16 text-center md:pt-24">
        <span className="font-mono text-xs uppercase tracking-[0.2em] text-brand-600">
          Job management for service businesses
        </span>
        <h1
          id="hero-h1"
          className="mx-auto mt-5 max-w-3xl text-4xl font-bold leading-[1.05] tracking-tight text-ink-900 sm:text-5xl md:text-6xl"
        >
          Run the whole job — from first call to final invoice.
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
          JobFlow gives service businesses one place to schedule work, dispatch the crew, send quotes, get paid, and keep
          customers in the loop — for owners, technicians, and the clients they serve.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link to="/signup">
            <Button className="px-6 py-3 text-base">Start free</Button>
          </Link>
          <Link to="/login">
            <Button variant="secondary" className="px-6 py-3 text-base">
              Sign in
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          No credit card · Set up in minutes · Owner, team &amp; client logins included
        </p>
      </div>

      <div className="mx-auto max-w-5xl px-5 pb-16 md:pb-24">
        <HeroMock />
      </div>
    </section>
  )
}
