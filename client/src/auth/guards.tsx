import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth, homePathFor } from './AuthContext'
import { FullPageSpinner } from '@/components/ui'
import type { UserRole } from '@/lib/types'

/** Requires a logged-in session. */
export function RequireAuth() {
  const { session, loading } = useAuth()
  const location = useLocation()
  if (loading) return <FullPageSpinner />
  if (!session) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}

/** Requires the user's profile.role to be in `roles` (and org set). */
export function RequireRole({ roles }: { roles: UserRole[] }) {
  const { profile, loading } = useAuth()
  if (loading || !profile) return <FullPageSpinner />
  if (!profile.org_id) return <Navigate to="/onboarding" replace />
  if (!roles.includes(profile.role)) return <Navigate to={homePathFor(profile)} replace />
  return <Outlet />
}

/** Index route: sends a logged-in user to their role's home. */
export function RoleHome() {
  const { profile, loading } = useAuth()
  if (loading || !profile) return <FullPageSpinner />
  return <Navigate to={homePathFor(profile)} replace />
}
