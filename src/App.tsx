import { lazy } from 'react'
import { HashRouter, Route, Routes } from 'react-router'
import { ProtectedRoute } from './components/ProtectedRoute'
import { RootLayout } from './components/RootLayout'
import { HomePage } from './pages/HomePage'
import { NotFoundPage } from './pages/NotFoundPage'

const AboutPage = lazy(() => import('./pages/AboutPage'))
const PostsPage = lazy(() => import('./pages/PostsPage'))
const PostPage = lazy(() => import('./pages/PostPage'))
const NewPostPage = lazy(() => import('./pages/NewPostPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const LoginPage = lazy(() => import('./pages/LoginPage'))
const SignupPage = lazy(() => import('./pages/SignupPage'))
const ProfilePage = lazy(() => import('./pages/ProfilePage'))

export function App() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<RootLayout />}>
          <Route index element={<HomePage />} />
          <Route path="about" element={<AboutPage />} />
          <Route path="posts" element={<PostsPage />} />
          <Route path="posts/new" element={<NewPostPage />} />
          <Route path="posts/:id" element={<PostPage />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route element={<ProtectedRoute />}>
            <Route path="profile" element={<ProfilePage />} />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </HashRouter>
  )
}
