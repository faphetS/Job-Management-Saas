import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { AuthLayout } from '@/components/AuthLayout'
import { Alert, Button, Field, Input } from '@/components/ui'
import type { UserRole } from '@/lib/types'

/** Self-serve registration via an org invite link. role is fixed by the route. */
export default function RegisterPage({ role }: { role: Extract<UserRole, 'client' | 'employee'> }) {
  const { orgId } = useParams<{ orgId: string }>()
  const [params] = useSearchParams()
  const orgName = params.get('name')
  const navigate = useNavigate()

  const [fullName, setFullName] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const isClient = role === 'client'

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    if (!orgId) {
      setError('This invite link is missing its business code.')
      return
    }
    setError(null)
    setNotice(null)
    setBusy(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName, phone, role, org_id: orgId } },
      })
      if (error) throw error

      if (data.session) {
        navigate('/', { replace: true })
        return
      }
      setNotice('Account created! Check your email to confirm, then sign in.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title={isClient ? 'Create your account' : 'Join the team'}
      subtitle={
        orgName
          ? `${isClient ? 'Book and track jobs with' : 'You were invited to'} ${orgName}.`
          : isClient
            ? 'Book and track your service jobs.'
            : 'Set up your technician account.'
      }
      footer={
        <>
          Already registered?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        {notice && <Alert kind="success">{notice}</Alert>}
        <Field label="Full name">
          <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
        </Field>
        <Field label="Phone">
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} />
        </Field>
        <Field label="Email">
          <Input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
        </Field>
        <Field label="Password" hint="At least 6 characters.">
          <Input
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? 'Creating…' : 'Create account'}
        </Button>
      </form>
    </AuthLayout>
  )
}
