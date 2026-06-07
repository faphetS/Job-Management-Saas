import { Outlet } from 'react-router-dom'
import { AppShell, type NavItem } from '@/components/AppShell'

const NAV: NavItem[] = [
  { to: '/portal', label: 'My Jobs', end: true },
  { to: '/portal/request', label: 'Request Service' },
]

export default function ClientLayout() {
  return (
    <AppShell navItems={NAV}>
      <Outlet />
    </AppShell>
  )
}
