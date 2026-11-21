import type { ReactNode } from 'react'

interface MessageProps {
  text: string
  children?: ReactNode // optional button, e.g. "Try again"
}

// Used for loading, error and empty states.
export function Message({ text, children }: MessageProps) {
  return (
    <div className="message">
      <p>{text}</p>
      {children}
    </div>
  )
}
