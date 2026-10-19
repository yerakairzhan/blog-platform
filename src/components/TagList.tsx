interface TagListProps {
  tags: string[]
}

export function TagList({ tags }: TagListProps) {
  return (
    <ul className="tags">
      {tags.map((tag) => (
        <li key={tag} className="tag">
          #{tag}
        </li>
      ))}
    </ul>
  )
}
