import { Outlet } from 'react-router-dom'
import { AppShell, type NavItem } from '@/components/AppShell'

const NAV: NavItem[] = [
  { to: '/app', label: 'Dashboard', end: true },
  { to: '/app/jobs', label: 'Jobs' },
  { to: '/app/customers', label: 'Customers' },
  { to: '/app/quotes', label: 'Quotes' },
  { to: '/app/invoices', label: 'Invoices' },
  { to: '/app/team', label: 'Team' },
]

export default function OwnerLayout() {
  return (
    <AppShell navItems={NAV}>
      <Outlet />
    </AppShell>
  )
}
