import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { FormField } from '../components/FormField'
import { useAuth } from '../context/AuthContext'

export default function SignupPage() {
  const { user, error, signup } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (user) {
    return <Navigate to="/profile" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!email.includes('@')) {
      setFormError('Enter a valid email.')
      return
    }
    if (password.length < 6) {
      setFormError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.')
      return
    }

    setFormError('')
    setIsSubmitting(true)
    const success = await signup(email.trim(), password)
    setIsSubmitting(false)
    if (success) navigate('/profile')
  }

  return (
    <div className="login">
      <h1>Sign up</h1>

      <form className="form" onSubmit={handleSubmit}>
        <FormField label="Email">
          <input value={email} onChange={(event) => setEmail(event.target.value)} />
        </FormField>

        <FormField label="Password">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </FormField>

        <FormField label="Confirm password">
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </FormField>

        {formError && <p className="error">{formError}</p>}
        {!formError && error && <p className="error">{error}</p>}

        <button type="submit" className="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      <p>
        Already have an account? <Link to="/login">Log in</Link>
      </p>
    </div>
  )
}
