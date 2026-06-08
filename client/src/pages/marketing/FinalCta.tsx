import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui'

export function FinalCta() {
  return (
    <section className="bg-white px-5 py-16">
      <div className="relative mx-auto max-w-5xl overflow-hidden rounded-3xl bg-ink-900 px-6 py-16 text-center sm:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)',
            backgroundSize: '34px 34px',
            maskImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, black, transparent 80%)',
            WebkitMaskImage: 'radial-gradient(ellipse 70% 60% at 50% 0%, black, transparent 80%)',
          }}
        />
        <div className="relative">
          <div className="mb-6 flex justify-center">
            <Logo variant="light" iconSize={30} wordmarkClassName="text-xl" />
          </div>
          <h2 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Your next job is one click from organized.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-slate-300">
            Start free today — bring your team and your customers with you.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link to="/signup">
              <Button className="px-6 py-3 text-base">Start free</Button>
            </Link>
            <Link
              to="/login"
              className="rounded-lg border border-white/30 px-6 py-3 text-base font-medium text-white transition hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
