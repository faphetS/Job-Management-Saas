import { Link } from 'react-router-dom'
import { useAuth, homePathFor } from '@/auth/AuthContext'
import { Logo } from '@/components/Logo'
import { Button } from '@/components/ui'

export function MarketingNav() {
  const { session, profile } = useAuth()
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
        <Link to="/" aria-label="JobFlow home">
          <Logo iconSize={26} wordmarkClassName="text-lg" />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-slate-600 md:flex">
          <a href="#features" className="transition hover:text-ink-900">Features</a>
          <a href="#how" className="transition hover:text-ink-900">How it works</a>
          <a href="#roles" className="transition hover:text-ink-900">Roles</a>
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <Link to={homePathFor(profile)}>
              <Button size="sm">Go to dashboard</Button>
            </Link>
          ) : (
            <>
              <Link to="/login" className="hidden sm:block">
                <Button variant="ghost" size="sm">Sign in</Button>
              </Link>
              <Link to="/signup">
                <Button size="sm">Start free</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
