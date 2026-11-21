import { useState } from 'react'
import type { FormEvent } from 'react'
import { Link, Navigate, useNavigate } from 'react-router'
import { FormField } from '../components/FormField'
import { useAuth } from '../context/AuthContext'

export default function LoginPage() {
  const { user, error, login, loginWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Already logged in: no need to see the login form.
  if (user) {
    return <Navigate to="/profile" replace />
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsSubmitting(true)
    const success = await login(email.trim(), password)
    setIsSubmitting(false)
    if (success) navigate('/profile')
  }

  async function handleGoogle() {
    setIsSubmitting(true)
    const success = await loginWithGoogle()
    setIsSubmitting(false)
    if (success) navigate('/profile')
  }

  return (
    <div className="login">
      <h1>Login</h1>

      <form className="form" onSubmit={handleSubmit}>
        <FormField label="Email">
          <input
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
          />
        </FormField>

        <FormField label="Password">
          <input
            type="password"
            required
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </FormField>

        {error && <p className="error">{error}</p>}

        <button type="submit" className="primary" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Log in'}
        </button>
        <button type="button" onClick={handleGoogle} disabled={isSubmitting}>
          Sign in with Google
        </button>
      </form>

      <p>
        No account yet? <Link to="/signup">Sign up</Link>
      </p>
    </div>
  )
}
