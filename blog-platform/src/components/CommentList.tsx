import type { Comment } from '../types'

interface CommentListProps {
  comments: Comment[]
}

export function CommentList({ comments }: CommentListProps) {
  if (comments.length === 0) {
    return <p className="muted">No comments yet.</p>
  }

  return (
    <ul className="comments">
      {comments.map((comment) => (
        <li key={comment.id} className="comment">
          <strong>{comment.user.fullName}</strong>
          <p>{comment.body}</p>
        </li>
      ))}
    </ul>
  )
}
