import { useState } from 'react'
import { HashRouter, Route, Routes } from 'react-router'
import { Header } from './components/Header'
import { Message } from './components/Message'
import { ScrollToTop } from './components/ScrollToTop'
import { DEFAULT_FILTERS } from './filters'
import { FeedPage } from './pages/FeedPage'
import { NewPostPage } from './pages/NewPostPage'
import { PostPage } from './pages/PostPage'

export function App() {
  // The filters live here and not in FeedPage: FeedPage is removed when you open a post,
  // which would reset its state. App is never removed, so the filters are kept.
  const [filters, setFilters] = useState(DEFAULT_FILTERS)

  return (
    <HashRouter>
      <ScrollToTop />
      <Header />
      <main className="container">
        <Routes>
          <Route path="/" element={<FeedPage filters={filters} onFiltersChange={setFilters} />} />
          <Route path="/posts/new" element={<NewPostPage />} />
          <Route path="/posts/:id" element={<PostPage />} />
          <Route path="*" element={<Message text="Page not found." />} />
        </Routes>
      </main>
    </HashRouter>
  )
}
