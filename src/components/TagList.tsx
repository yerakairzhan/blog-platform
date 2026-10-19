import { Link } from 'react-router'
import styles from './TagList.module.css'

interface TagListProps {
  tags: string[]
  activeTag?: string
  /** When given, tags are buttons (filter in place); otherwise links to the filtered feed. */
  onTagClick?: (tag: string) => void
}

export function TagList({ tags, activeTag, onTagClick }: TagListProps) {
  if (tags.length === 0) return null

  return (
    <ul className={styles.list} aria-label="Tags">
      {tags.map((tag) => {
        const className = `${styles.tag} ${tag === activeTag ? styles.active : ''}`
        return (
          // Tags are unique within a post, so the tag text is a stable key.
          <li key={tag}>
            {onTagClick ? (
              <button
                type="button"
                className={className}
                aria-pressed={tag === activeTag}
                onClick={() => onTagClick(tag)}
              >
                #{tag}
              </button>
            ) : (
              <Link className={className} to={`/?tag=${encodeURIComponent(tag)}`}>
                #{tag}
              </Link>
            )}
          </li>
        )
      })}
    </ul>
  )
}
