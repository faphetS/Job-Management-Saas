import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/auth/AuthContext'
import { AuthLayout } from '@/components/AuthLayout'
import { Alert, Button, Field, Input } from '@/components/ui'

export default function SignupOwnerPage() {
  const navigate = useNavigate()
  const { refreshProfile } = useAuth()
  const [fullName, setFullName] = useState('')
  const [business, setBusiness] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setNotice(null)
    setBusy(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      })
      if (error) throw error

      // Email confirmation disabled -> we get a session immediately and can finish setup.
      if (data.session) {
        const { error: rpcError } = await supabase.rpc('create_organization', {
          org_name: business,
          owner_name: fullName,
        })
        if (rpcError) throw rpcError
        await refreshProfile()
        navigate('/app', { replace: true })
        return
      }

      // Email confirmation enabled -> finish org setup after they confirm + sign in.
      setNotice('Account created! Check your email to confirm, then sign in to finish setting up your business.')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout
      title="Create your business"
      subtitle="Start managing jobs, your team, and customers."
      footer={
        <>
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:underline">
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        {notice && <Alert kind="success">{notice}</Alert>}
        <Field label="Business name">
          <Input required value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Acme Services" />
        </Field>
        <Field label="Your name">
          <Input required value={fullName} onChange={(e) => setFullName(e.target.value)} />
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
          {busy ? 'Creating…' : 'Create business account'}
        </Button>
      </form>
    </AuthLayout>
  )
}
