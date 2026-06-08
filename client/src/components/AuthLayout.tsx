import { type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Logo } from './Logo'

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string
  subtitle?: string
  children: ReactNode
  footer?: ReactNode
}) {
  return (
    <div className="grid min-h-screen place-items-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex justify-center">
          <Link to="/" aria-label="JobFlow home">
            <Logo iconSize={30} wordmarkClassName="text-xl" />
          </Link>
        </div>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
          <div className="h-1 bg-gradient-to-r from-brand-600 to-sky-400" />
          <div className="p-6">
            <h1 className="text-lg font-semibold text-ink-900">{title}</h1>
            {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
            <div className="mt-5">{children}</div>
          </div>
        </div>
        {footer && <div className="mt-4 text-center text-sm text-slate-500">{footer}</div>}
      </div>
    </div>
  )
}
