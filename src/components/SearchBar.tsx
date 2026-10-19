import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import styles from './SearchBar.module.css'

interface SearchBarProps {
  /** The committed search term (from the URL). */
  value: string
  /** Called once typing pauses for `delay` ms. */
  onSearch: (value: string) => void
  placeholder?: string
  delay?: number
}

/**
 * Controlled search input with a debounce: the input updates on every keystroke,
 * but the feed only re-filters after the user stops typing.
 */
export function SearchBar({ value, onSearch, placeholder = 'Search…', delay = 300 }: SearchBarProps) {
  const [text, setText] = useState(value)
  const [syncedValue, setSyncedValue] = useState(value)

  // When `value` changes from outside (Reset button, browser Back), adopt it.
  // Adjusting state during render avoids an extra effect and a flash of stale text.
  if (value !== syncedValue) {
    setSyncedValue(value)
    setText(value)
  }

  useEffect(() => {
    if (text === value) return
    const timer = setTimeout(() => onSearch(text), delay)
    // Each keystroke cancels the previous timer, so only the last one fires.
    return () => clearTimeout(timer)
  }, [text, value, delay, onSearch])

  function handleClear() {
    setText('')
    onSearch('')
  }

  return (
    <div className={styles.wrapper} role="search">
      <span className={styles.icon}>
        <Icon name="search" />
      </span>
      <label htmlFor="feed-search" className="visually-hidden">
        Search posts
      </label>
      <input
        id="feed-search"
        type="search"
        className={`input ${styles.input}`}
        placeholder={placeholder}
        value={text}
        onChange={(event) => setText(event.target.value)}
        autoComplete="off"
      />
      {text && (
        <button type="button" className={styles.clear} onClick={handleClear} aria-label="Clear search">
          <Icon name="close" size={16} />
        </button>
      )}
    </div>
  )
}
