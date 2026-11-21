import { useEffect, useRef, useState } from 'react'
import { useDebounce } from '../hooks/useDebounce'

const SEARCH_DELAY = 300 // ms after the last key press

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
}

// The text in the box is local state. It is sent to the parent (the URL) only after the user
// stops typing, so the URL and the list do not change on every key press.
export function SearchInput({ value, onChange }: SearchInputProps) {
  const [text, setText] = useState(value)
  const debouncedText = useDebounce(text, SEARCH_DELAY)
  const lastSent = useRef(value)
  const onChangeRef = useRef(onChange)

  useEffect(() => {
    onChangeRef.current = onChange
  })

  // The user stopped typing: send the text.
  useEffect(() => {
    if (debouncedText === lastSent.current) return
    lastSent.current = debouncedText
    onChangeRef.current(debouncedText)
  }, [debouncedText])

  // The value changed from outside (Reset button, Back/Forward): show it in the box.
  useEffect(() => {
    if (value === lastSent.current) return
    lastSent.current = value
    setText(value)
  }, [value])

  return (
    <label className="field">
      Search
      <input
        type="search"
        placeholder="Search by title or text..."
        value={text}
        onChange={(event) => setText(event.target.value)}
      />
    </label>
  )
}
