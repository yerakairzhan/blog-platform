import { Icon } from './Icon'
import styles from './LikeButton.module.css'

interface LikeButtonProps {
  liked: boolean
  count: number
  onToggle: () => void
}

export function LikeButton({ liked, count, onToggle }: LikeButtonProps) {
  return (
    <button
      type="button"
      className={`${styles.button} ${liked ? styles.liked : ''}`}
      aria-pressed={liked}
      aria-label={liked ? `Unlike (${count} likes)` : `Like (${count} likes)`}
      onClick={onToggle}
    >
      <Icon name="heart" filled={liked} />
      <span>{count.toLocaleString()}</span>
    </button>
  )
}
