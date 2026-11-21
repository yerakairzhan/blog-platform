import type { ReactNode } from 'react'

interface FormFieldProps {
  label: string
  error?: string
  children: ReactNode // the input itself
}

export function FormField({ label, error, children }: FormFieldProps) {
  return (
    <label className="field">
      {label}
      {children}
      {error && <span className="error">{error}</span>}
    </label>
  )
}
