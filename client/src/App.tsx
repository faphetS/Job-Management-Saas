import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from '@/auth/AuthContext'
import { RequireAuth, RequireRole, RoleHome } from '@/auth/guards'

import LoginPage from '@/pages/auth/LoginPage'
import SignupOwnerPage from '@/pages/auth/SignupOwnerPage'
import OnboardingPage from '@/pages/auth/OnboardingPage'
import RegisterPage from '@/pages/auth/RegisterPage'

import OwnerLayout from '@/pages/owner/OwnerLayout'
import DashboardPage from '@/pages/owner/DashboardPage'
import JobsPage from '@/pages/owner/JobsPage'
import JobDetailPage from '@/pages/owner/JobDetailPage'
import CustomersPage from '@/pages/owner/CustomersPage'
import CustomerDetailPage from '@/pages/owner/CustomerDetailPage'
import QuotesPage from '@/pages/owner/QuotesPage'
import NewQuotePage from '@/pages/owner/NewQuotePage'
import QuoteDetailPage from '@/pages/owner/QuoteDetailPage'
import InvoicesPage from '@/pages/owner/InvoicesPage'
import NewInvoicePage from '@/pages/owner/NewInvoicePage'
import InvoiceDetailPage from '@/pages/owner/InvoiceDetailPage'
import TeamPage from '@/pages/owner/TeamPage'

import EmployeeLayout from '@/pages/employee/EmployeeLayout'
import MyJobsPage from '@/pages/employee/MyJobsPage'
import EmployeeJobDetailPage from '@/pages/employee/EmployeeJobDetailPage'

import ClientLayout from '@/pages/client/ClientLayout'
import ClientHomePage from '@/pages/client/ClientHomePage'
import RequestServicePage from '@/pages/client/RequestServicePage'

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupOwnerPage />} />
          <Route path="/register/:orgId" element={<RegisterPage role="client" />} />
          <Route path="/join/:orgId" element={<RegisterPage role="employee" />} />

          {/* Authenticated */}
          <Route element={<RequireAuth />}>
            <Route path="/" element={<RoleHome />} />
            <Route path="/onboarding" element={<OnboardingPage />} />

            {/* Owner / office */}
            <Route element={<RequireRole roles={['owner']} />}>
              <Route path="/app" element={<OwnerLayout />}>
                <Route index element={<DashboardPage />} />
                <Route path="jobs" element={<JobsPage />} />
                <Route path="jobs/:id" element={<JobDetailPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="customers/:id" element={<CustomerDetailPage />} />
                <Route path="quotes" element={<QuotesPage />} />
                <Route path="quotes/new" element={<NewQuotePage />} />
                <Route path="quotes/:id" element={<QuoteDetailPage />} />
                <Route path="invoices" element={<InvoicesPage />} />
                <Route path="invoices/new" element={<NewInvoicePage />} />
                <Route path="invoices/:id" element={<InvoiceDetailPage />} />
                <Route path="team" element={<TeamPage />} />
              </Route>
            </Route>

            {/* Employee / technician */}
            <Route element={<RequireRole roles={['employee']} />}>
              <Route path="/tech" element={<EmployeeLayout />}>
                <Route index element={<MyJobsPage />} />
                <Route path=":id" element={<EmployeeJobDetailPage />} />
              </Route>
            </Route>

            {/* Client portal */}
            <Route element={<RequireRole roles={['client']} />}>
              <Route path="/portal" element={<ClientLayout />}>
                <Route index element={<ClientHomePage />} />
                <Route path="request" element={<RequestServicePage />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
