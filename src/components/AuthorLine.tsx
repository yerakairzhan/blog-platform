import type { Author } from '../types'
import styles from './AuthorLine.module.css'

interface AuthorLineProps {
  author: Author
  size?: 'small' | 'large'
}

function initials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function AuthorLine({ author, size = 'small' }: AuthorLineProps) {
  return (
    <div className={`${styles.author} ${size === 'large' ? styles.large : ''}`}>
      {author.avatarUrl ? (
        <img className={styles.avatar} src={author.avatarUrl} alt="" loading="lazy" />
      ) : (
        <span className={`${styles.avatar} ${styles.initials}`} aria-hidden="true">
          {initials(author.name)}
        </span>
      )}
      <span className={styles.text}>
        <span className={styles.name}>{author.name}</span>
        <span className={styles.username}>@{author.username}</span>
      </span>
    </div>
  )
}
