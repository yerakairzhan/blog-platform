import type { ReactNode } from 'react'
import styles from './StatusMessage.module.css'

interface StatusMessageProps {
  variant: 'loading' | 'error' | 'empty'
  title: string
  children?: ReactNode
  /** Usually a retry or reset button. */
  action?: ReactNode
}

export function StatusMessage({ variant, title, children, action }: StatusMessageProps) {
  return (
    <div
      className={`${styles.box} ${variant === 'error' ? styles.error : ''}`}
      role={variant === 'error' ? 'alert' : 'status'}
    >
      {variant === 'loading' && <span className={styles.spinner} aria-hidden="true" />}
      <h2 className={styles.title}>{title}</h2>
      {children && <p className={styles.text}>{children}</p>}
      {action && <div className={styles.action}>{action}</div>}
    </div>
  )
}
