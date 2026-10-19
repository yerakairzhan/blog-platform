import { useNavigate } from 'react-router'
import { PostForm } from '../components/PostForm'
import { usePosts } from '../context/PostsContext'
import { countTags } from '../lib/feed'
import type { PostDraft } from '../types'
import styles from './NewPostPage.module.css'

const SUGGESTED_TAGS_LIMIT = 8

export function NewPostPage() {
  const { posts, addPost } = usePosts()
  const navigate = useNavigate()
  const suggestedTags = countTags(posts)
    .slice(0, SUGGESTED_TAGS_LIMIT)
    .map(({ tag }) => tag)

  async function handleSubmit(draft: PostDraft) {
    // Errors propagate to PostForm, which shows them and keeps the user's text.
    const post = await addPost(draft)
    // replace: Back from the new post goes to the feed, not to an empty form.
    navigate(`/posts/${post.id}`, { replace: true })
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.heading}>Write a story</h1>
        <p className={styles.lead}>
          Your post is checked by the DummyJSON API and saved in this browser, so it appears in the feed,
          search and filters right away.
        </p>
      </header>
      <PostForm suggestedTags={suggestedTags} onSubmit={handleSubmit} />
    </div>
  )
}
