import { type ReactNode } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '@/auth/AuthContext'
import { cn } from './ui'

export interface NavItem {
  to: string
  label: string
  end?: boolean
}

function Brand() {
  return (
    <div className="flex items-center gap-2 px-2">
      <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 text-sm font-bold text-white">
        J
      </span>
      <span className="text-lg font-semibold tracking-tight text-slate-800">JobFlow</span>
    </div>
  )
}

function navClass({ isActive }: { isActive: boolean }) {
  return cn(
    'block rounded-lg px-3 py-2 text-sm font-medium transition',
    isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900',
  )
}

export function AppShell({ navItems, children }: { navItems: NavItem[]; children: ReactNode }) {
  const { profile, signOut } = useAuth()
  const roleLabel = profile?.role ? profile.role[0].toUpperCase() + profile.role.slice(1) : ''

  return (
    <div className="min-h-screen md:flex">
      {/* Desktop sidebar */}
      <aside className="hidden border-r border-slate-200 bg-white md:flex md:w-60 md:flex-col">
        <div className="py-5">
          <Brand />
        </div>
        <nav className="flex-1 space-y-1 px-3">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={navClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-slate-200 p-3">
          <p className="truncate px-2 text-sm font-medium text-slate-700">{profile?.full_name || 'Account'}</p>
          <p className="px-2 text-xs text-slate-500">{roleLabel}</p>
          <button
            onClick={signOut}
            className="mt-2 w-full rounded-lg px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main column */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 md:hidden">
          <Brand />
          <button onClick={signOut} className="text-sm font-medium text-slate-600">
            Sign out
          </button>
        </header>
        {/* Mobile nav */}
        <nav className="flex gap-1 overflow-x-auto border-b border-slate-200 bg-white px-3 py-2 md:hidden">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                cn(
                  'whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium',
                  isActive ? 'bg-brand-50 text-brand-700' : 'text-slate-600',
                )
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <main className="flex-1 px-4 py-6 md:px-8 md:py-8">
          <div className="mx-auto max-w-5xl">{children}</div>
        </main>
      </div>
    </div>
  )
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string
  subtitle?: string
  actions?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">{title}</h1>
        {subtitle && <p className="mt-0.5 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  )
}
