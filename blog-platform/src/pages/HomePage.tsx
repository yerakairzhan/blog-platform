import { Link } from 'react-router'
import heroImage from '../assets/hero.svg'

export function HomePage() {
  return (
    <div>
      <h1>Welcome to Blog Platform</h1>
      <p>
        Read posts from many authors, search and filter them, see how popular they are on the
        dashboard, and write your own post.
      </p>

      <img src={heroImage} alt="A blog post on a page" className="hero" />

      <div className="home-links">
        <Link to="/posts">Browse posts</Link>
        <Link to="/posts/new">Write a post</Link>
        <Link to="/dashboard">See statistics</Link>
        <Link to="/about">About the project</Link>
      </div>
    </div>
  )
}
