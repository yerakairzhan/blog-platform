import styles from './Pagination.module.css'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

type PageItem = number | 'gap-start' | 'gap-end'

/** First, last, and the pages around the current one, e.g. 1 … 4 5 6 … 21. */
function getPageItems(page: number, totalPages: number): PageItem[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }
  const from = Math.max(2, page - 1)
  const to = Math.min(totalPages - 1, page + 1)
  const items: PageItem[] = [1]
  if (from > 2) items.push('gap-start')
  for (let n = from; n <= to; n++) items.push(n)
  if (to < totalPages - 1) items.push('gap-end')
  items.push(totalPages)
  return items
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  return (
    <nav className={styles.nav} aria-label="Pagination">
      <button
        type="button"
        className={`btn ${styles.step}`}
        onClick={() => onPageChange(page - 1)}
        disabled={page === 1}
      >
        ← <span className={styles.stepText}>Previous</span>
      </button>

      <ol className={styles.pages}>
        {getPageItems(page, totalPages).map((item) =>
          typeof item === 'number' ? (
            // Page numbers are unique, so they are stable keys.
            <li key={item}>
              <button
                type="button"
                className={`${styles.page} ${item === page ? styles.current : ''}`}
                onClick={() => onPageChange(item)}
                aria-current={item === page ? 'page' : undefined}
                aria-label={`Page ${item}`}
              >
                {item}
              </button>
            </li>
          ) : (
            <li key={item} className={styles.gap} aria-hidden="true">
              …
            </li>
          ),
        )}
      </ol>

      <button
        type="button"
        className={`btn ${styles.step}`}
        onClick={() => onPageChange(page + 1)}
        disabled={page === totalPages}
      >
        <span className={styles.stepText}>Next</span> →
      </button>
    </nav>
  )
}
