import type { TagCount } from '../lib/feed'
import styles from './TopTags.module.css'

interface TopTagsProps {
  tags: TagCount[]
  activeTag: string
  onSelect: (tag: string) => void
}

export function TopTags({ tags, activeTag, onSelect }: TopTagsProps) {
  return (
    <ul className={styles.list}>
      {tags.map(({ tag, count }) => {
        const active = tag === activeTag
        return (
          <li key={tag}>
            <button
              type="button"
              className={`${styles.tag} ${active ? styles.active : ''}`}
              aria-pressed={active}
              // Clicking the active tag again clears the filter.
              onClick={() => onSelect(active ? '' : tag)}
            >
              #{tag}
              <span className={styles.count}>{count}</span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
