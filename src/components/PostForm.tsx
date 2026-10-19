import { useId, useState } from 'react'
import type { ChangeEvent, FocusEvent, FormEvent } from 'react'
import { errorMessage } from '../api/client'
import type { PostDraft } from '../types'
import { FormField, describedBy } from './FormField'
import styles from './PostForm.module.css'

interface FormValues {
  title: string
  body: string
  tags: string
}

type Field = keyof FormValues
type FormErrors = Partial<Record<Field, string>>

const EMPTY_VALUES: FormValues = { title: '', body: '', tags: '' }

const LIMITS = {
  titleMin: 5,
  titleMax: 120,
  bodyMin: 30,
  bodyMax: 5000,
  tagsMax: 5,
}

const TAG_PATTERN = /^[a-z0-9-]+$/

/** "Love, mystery , love" -> ["love", "mystery"] */
function parseTags(input: string): string[] {
  const tags = input
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter(Boolean)
  return [...new Set(tags)]
}

function validate(values: FormValues): FormErrors {
  const errors: FormErrors = {}
  const title = values.title.trim()
  const body = values.body.trim()
  const tags = parseTags(values.tags)

  if (!title) errors.title = 'Give your post a title.'
  else if (title.length < LIMITS.titleMin) errors.title = `Use at least ${LIMITS.titleMin} characters.`
  else if (title.length > LIMITS.titleMax) errors.title = `Keep it under ${LIMITS.titleMax} characters.`

  if (!body) errors.body = 'Write something for your readers.'
  else if (body.length < LIMITS.bodyMin) errors.body = `Write at least ${LIMITS.bodyMin} characters.`

  if (tags.length === 0) errors.tags = 'Add at least one tag so readers can find your post.'
  else if (tags.length > LIMITS.tagsMax) errors.tags = `Use at most ${LIMITS.tagsMax} tags.`
  else if (!tags.every((tag) => TAG_PATTERN.test(tag)))
    errors.tags = 'Tags can only contain letters, numbers and dashes.'

  return errors
}

interface PostFormProps {
  suggestedTags: string[]
  onSubmit: (draft: PostDraft) => Promise<void>
}

export function PostForm({ suggestedTags, onSubmit }: PostFormProps) {
  const id = useId()
  const [values, setValues] = useState<FormValues>(EMPTY_VALUES)
  const [touched, setTouched] = useState<Partial<Record<Field, boolean>>>({})
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const [status, setStatus] = useState<'idle' | 'submitting' | 'error'>('idle')
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Derived on every render instead of kept in state, so it can never go out of sync.
  const errors = validate(values)
  const tags = parseTags(values.tags)
  const isSubmitting = status === 'submitting'

  // Errors appear once a field was left (blur) or after the first submit, not while typing.
  function visibleError(field: Field): string | undefined {
    return touched[field] || submitAttempted ? errors[field] : undefined
  }

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const { name, value } = event.target
    setValues((prev) => ({ ...prev, [name as Field]: value }))
  }

  function handleBlur(event: FocusEvent<HTMLInputElement | HTMLTextAreaElement>) {
    const field = event.target.name as Field
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  function handleAddTag(tag: string) {
    setValues((prev) => ({ ...prev, tags: [...parseTags(prev.tags), tag].join(', ') }))
  }

  function handleReset() {
    setValues(EMPTY_VALUES)
    setTouched({})
    setSubmitAttempted(false)
    setStatus('idle')
    setSubmitError(null)
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitAttempted(true)
    if (Object.keys(errors).length > 0) return

    setStatus('submitting')
    setSubmitError(null)
    try {
      await onSubmit({ title: values.title.trim(), body: values.body.trim(), tags })
      // On success the parent navigates away, so there is nothing to reset here.
    } catch (error) {
      setStatus('error')
      setSubmitError(errorMessage(error))
    }
  }

  const titleId = `${id}-title`
  const bodyId = `${id}-body`
  const tagsId = `${id}-tags`
  const unusedSuggestions = suggestedTags.filter((tag) => !tags.includes(tag))

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <FormField
        id={titleId}
        label="Title"
        error={visibleError('title')}
        hint={`${values.title.trim().length}/${LIMITS.titleMax} characters`}
      >
        <input
          id={titleId}
          name="title"
          className="input"
          value={values.title}
          onChange={handleChange}
          onBlur={handleBlur}
          maxLength={LIMITS.titleMax}
          aria-invalid={Boolean(visibleError('title'))}
          aria-describedby={describedBy(titleId, visibleError('title'))}
          placeholder="What is your story about?"
        />
      </FormField>

      <FormField
        id={bodyId}
        label="Story"
        error={visibleError('body')}
        hint={`${values.body.trim().length}/${LIMITS.bodyMax} characters`}
      >
        <textarea
          id={bodyId}
          name="body"
          className="input"
          value={values.body}
          onChange={handleChange}
          onBlur={handleBlur}
          maxLength={LIMITS.bodyMax}
          aria-invalid={Boolean(visibleError('body'))}
          aria-describedby={describedBy(bodyId, visibleError('body'))}
          placeholder="Tell it in your own words…"
        />
      </FormField>

      <FormField
        id={tagsId}
        label="Tags"
        error={visibleError('tags')}
        hint={`Separate with commas, up to ${LIMITS.tagsMax}.`}
      >
        <input
          id={tagsId}
          name="tags"
          className="input"
          value={values.tags}
          onChange={handleChange}
          onBlur={handleBlur}
          aria-invalid={Boolean(visibleError('tags'))}
          aria-describedby={describedBy(tagsId, visibleError('tags'))}
          placeholder="e.g. love, mystery"
        />
      </FormField>

      {unusedSuggestions.length > 0 && tags.length < LIMITS.tagsMax && (
        <div className={styles.suggestions}>
          <span className={styles.suggestionsLabel}>Popular:</span>
          {unusedSuggestions.map((tag) => (
            <button key={tag} type="button" className={styles.suggestion} onClick={() => handleAddTag(tag)}>
              + {tag}
            </button>
          ))}
        </div>
      )}

      {submitError && (
        <p className={styles.submitError} role="alert">
          Couldn't publish your post. {submitError}
        </p>
      )}

      <div className={styles.actions}>
        <button type="button" className="btn btn-ghost" onClick={handleReset} disabled={isSubmitting}>
          Clear
        </button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? 'Publishing…' : 'Publish post'}
        </button>
      </div>
    </form>
  )
}
