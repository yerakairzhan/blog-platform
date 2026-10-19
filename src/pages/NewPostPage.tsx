import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router'
import { createPost, getErrorMessage } from '../api'
import { FormField } from '../components/FormField'
import { saveLocalPost } from '../localPosts'

interface FormErrors {
  title?: string
  body?: string
  tags?: string
}

export function NewPostPage() {
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [tags, setTags] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // "Love, history ," -> ["love", "history"]
  const tagList = tags
    .split(',')
    .map((tag) => tag.trim().toLowerCase())
    .filter((tag) => tag !== '')

  function validate(): FormErrors {
    const newErrors: FormErrors = {}
    if (title.trim().length < 3) newErrors.title = 'Title must be at least 3 characters.'
    if (body.trim().length < 10) newErrors.body = 'Text must be at least 10 characters.'
    if (tagList.length === 0) newErrors.tags = 'Add at least one tag.'
    return newErrors
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault() // stop the browser from reloading the page

    const newErrors = validate()
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    setIsSubmitting(true)
    setSubmitError('')
    try {
      const saved = await createPost({ title: title.trim(), body: body.trim(), tags: tagList })
      const newPost = {
        id: Date.now(), // unique id that never clashes with DummyJSON ids
        title: saved.title,
        body: saved.body,
        tags: saved.tags,
        reactions: { likes: 0, dislikes: 0 },
        views: 0,
        userId: 0,
        isLocal: true,
      }
      saveLocalPost(newPost)
      navigate(`/posts/${newPost.id}`)
    } catch (err) {
      setSubmitError(getErrorMessage(err))
      setIsSubmitting(false)
    }
  }

  function handleClear() {
    setTitle('')
    setBody('')
    setTags('')
    setErrors({})
    setSubmitError('')
  }

  return (
    <div>
      <h1>New post</h1>

      <form className="form" onSubmit={handleSubmit}>
        <FormField label="Title" error={errors.title}>
          <input value={title} onChange={(event) => setTitle(event.target.value)} />
        </FormField>

        <FormField label="Text" error={errors.body}>
          <textarea rows={8} value={body} onChange={(event) => setBody(event.target.value)} />
        </FormField>

        <FormField label="Tags (separated by commas)" error={errors.tags}>
          <input
            placeholder="e.g. love, history"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
          />
        </FormField>

        {submitError && <p className="error">Could not publish the post. {submitError}</p>}

        <div className="form-buttons">
          <button type="button" onClick={handleClear} disabled={isSubmitting}>
            Clear
          </button>
          <button type="submit" className="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Publishing...' : 'Publish'}
          </button>
        </div>
      </form>
    </div>
  )
}
