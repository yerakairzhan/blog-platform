import { Link } from 'react-router'
import { Message } from '../components/Message'

export function NotFoundPage() {
  return (
    <Message text="404 - Page not found.">
      <Link to="/">Go to Home</Link>
    </Message>
  )
}
