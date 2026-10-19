import { createHashRouter } from 'react-router'
// The DOM build wires in ReactDOM.flushSync, which useFeedQuery relies on.
import { RouterProvider } from 'react-router/dom'
import { Layout } from './components/Layout'
import { PostsProvider } from './context/PostsContext'
import { FeedPage } from './pages/FeedPage'
import { NewPostPage } from './pages/NewPostPage'
import { NotFoundPage } from './pages/NotFoundPage'
import { PostPage } from './pages/PostPage'

// Hash URLs (/#/posts/5) keep deep links and refreshes working on GitHub Pages,
// which has no server-side fallback to index.html.
const router = createHashRouter([
  {
    element: <Layout />,
    children: [
      { index: true, element: <FeedPage /> },
      { path: 'posts/new', element: <NewPostPage /> },
      { path: 'posts/:postId', element: <PostPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
])

export function App() {
  return (
    <PostsProvider>
      <RouterProvider router={router} />
    </PostsProvider>
  )
}
