import { Link } from 'react-router'
import { StatusMessage } from '../components/StatusMessage'

export function NotFoundPage() {
  return (
    <StatusMessage
      variant="empty"
      title="Page not found"
      action={
        <Link to="/" className="btn btn-primary">
          Back to feed
        </Link>
      }
    >
      The page you're looking for doesn't exist.
    </StatusMessage>
  )
}
