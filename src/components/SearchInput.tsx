interface SearchInputProps {
  value: string
  onChange: (value: string) => void
}

export function SearchInput({ value, onChange }: SearchInputProps) {
  return (
    <label className="field">
      Search
      <input
        type="search"
        placeholder="Search by title or text..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
    </label>
  )
}
