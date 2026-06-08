import { Link } from 'react-router-dom'
import { Logo } from '@/components/Logo'

export function MarketingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-8 px-5 py-12 sm:grid-cols-2 lg:grid-cols-4">
        <div className="lg:col-span-2">
          <Logo iconSize={26} wordmarkClassName="text-lg" />
          <p className="mt-3 max-w-xs text-sm text-slate-500">
            Job management for service businesses — schedule, quote, invoice and get paid in one place.
          </p>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Product</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li><a href="#features" className="transition hover:text-ink-900">Features</a></li>
            <li><a href="#how" className="transition hover:text-ink-900">How it works</a></li>
            <li><a href="#roles" className="transition hover:text-ink-900">Roles</a></li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Account</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            <li><Link to="/login" className="transition hover:text-ink-900">Sign in</Link></li>
            <li><Link to="/signup" className="transition hover:text-ink-900">Start free</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-100">
        <div className="mx-auto max-w-6xl px-5 py-5 text-sm text-slate-400">
          © 2026 JobFlow. Job management for service businesses.
        </div>
      </div>
    </footer>
  )
}
