import { Outlet } from 'react-router-dom'
import { AppShell, type NavItem } from '@/components/AppShell'

const NAV: NavItem[] = [{ to: '/tech', label: 'My Jobs', end: true }]

export default function EmployeeLayout() {
  return (
    <AppShell navItems={NAV}>
      <Outlet />
    </AppShell>
  )
}
