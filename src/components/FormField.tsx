import type { ReactNode } from 'react'
import styles from './PostForm.module.css'

interface FormFieldProps {
  id: string
  label: string
  error?: string
  hint?: ReactNode
  /** The control itself. It should use `id` and `describedBy(id, error)` for accessibility. */
  children: ReactNode
}

export function describedBy(id: string, error?: string): string {
  return error ? `${id}-error` : `${id}-hint`
}

export function FormField({ id, label, error, hint, children }: FormFieldProps) {
  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className={styles.error}>
          {error}
        </p>
      ) : (
        <p id={`${id}-hint`} className={styles.hint}>
          {hint}
        </p>
      )}
    </div>
  )
}
