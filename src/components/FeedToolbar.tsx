import { PAGE_SIZES, SORT_OPTIONS, SOURCE_OPTIONS } from '../hooks/useFeedQuery'
import type { FeedQuery } from '../hooks/useFeedQuery'
import type { TagCount } from '../lib/feed'
import { SearchBar } from './SearchBar'
import { SelectField } from './SelectField'
import styles from './FeedToolbar.module.css'

interface FeedToolbarProps {
  query: FeedQuery
  tags: TagCount[]
  canReset: boolean
  onSearch: (search: string) => void
  onChange: (patch: Partial<FeedQuery>) => void
  onReset: () => void
}

export function FeedToolbar({ query, tags, canReset, onSearch, onChange, onReset }: FeedToolbarProps) {
  const tagOptions = [
    { value: '', label: 'All tags' },
    ...tags.map(({ tag, count }) => ({ value: tag, label: `#${tag} (${count})` })),
  ]
  const pageSizeOptions = PAGE_SIZES.map((size) => ({ value: String(size), label: `${size} posts` }))

  return (
    <div className={styles.toolbar}>
      <SearchBar
        value={query.search}
        onSearch={onSearch}
        placeholder="Search titles, stories and tags…"
      />
      <div className={styles.filters}>
        <SelectField label="Tag" value={query.tag} options={tagOptions} onChange={(tag) => onChange({ tag })} />
        <SelectField
          label="Show"
          value={query.source}
          options={SOURCE_OPTIONS}
          onChange={(source) => onChange({ source })}
        />
        <SelectField
          label="Sort by"
          value={query.sort}
          options={SORT_OPTIONS}
          onChange={(sort) => onChange({ sort })}
        />
        <SelectField
          label="Per page"
          value={String(query.pageSize)}
          options={pageSizeOptions}
          onChange={(size) => onChange({ pageSize: Number(size) })}
        />
        <button type="button" className={`btn btn-ghost ${styles.reset}`} onClick={onReset} disabled={!canReset}>
          Reset
        </button>
      </div>
    </div>
  )
}
