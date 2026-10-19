import { useState } from 'react'
import type { FormEvent } from 'react'
import styles from './Comments.module.css'

const MAX_LENGTH = 500

interface CommentFormProps {
  onSubmit: (body: string) => void
}

export function CommentForm({ onSubmit }: CommentFormProps) {
  const [body, setBody] = useState('')
  const trimmed = body.trim()

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!trimmed) return
    onSubmit(trimmed)
    setBody('')
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <label htmlFor="comment-body" className="visually-hidden">
        Your comment
      </label>
      <textarea
        id="comment-body"
        className={`input ${styles.textarea}`}
        placeholder="Share your thoughts…"
        value={body}
        maxLength={MAX_LENGTH}
        onChange={(event) => setBody(event.target.value)}
      />
      <div className={styles.formFooter}>
        <span className={styles.counter}>
          {body.length}/{MAX_LENGTH}
        </span>
        <button type="submit" className="btn btn-primary" disabled={!trimmed}>
          Post comment
        </button>
      </div>
    </form>
  )
}
