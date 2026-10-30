import { useState } from 'react'
import type { FormEvent } from 'react'
import { FormField } from '../components/FormField'

// Placeholder: real authentication will be added later.
export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="login">
      <h1>Login</h1>

      <form className="form" onSubmit={handleSubmit}>
        <FormField label="Email">
          <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
        </FormField>

        <FormField label="Password">
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
          />
        </FormField>

        {submitted && <p className="muted">Login is not available yet. Coming soon.</p>}

        <button type="submit" className="primary">
          Log in
        </button>
      </form>
    </div>
  )
}
