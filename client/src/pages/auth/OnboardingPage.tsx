import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase'
import { useAuth, homePathFor } from '@/auth/AuthContext'
import { AuthLayout } from '@/components/AuthLayout'
import { Alert, Button, Field, Input, FullPageSpinner } from '@/components/ui'

/** Shown to a logged-in user who has no org yet (owner finishing setup). */
export default function OnboardingPage() {
  const navigate = useNavigate()
  const { profile, loading, refreshProfile } = useAuth()
  const [business, setBusiness] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (loading) return <FullPageSpinner />
  if (!profile) return <Navigate to="/login" replace />
  if (profile.org_id) return <Navigate to={homePathFor(profile)} replace />

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setBusy(true)
    try {
      const { error } = await supabase.rpc('create_organization', {
        org_name: business,
        owner_name: profile?.full_name ?? null,
      })
      if (error) throw error
      await refreshProfile()
      navigate('/app', { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <AuthLayout title="Set up your business" subtitle="One last step to get started.">
      <form onSubmit={onSubmit} className="space-y-4">
        {error && <Alert>{error}</Alert>}
        <Field label="Business name">
          <Input required value={business} onChange={(e) => setBusiness(e.target.value)} placeholder="Acme Services" />
        </Field>
        <Button type="submit" disabled={busy} className="w-full">
          {busy ? 'Setting up…' : 'Continue'}
        </Button>
      </form>
    </AuthLayout>
  )
}
