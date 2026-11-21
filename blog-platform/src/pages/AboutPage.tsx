export default function AboutPage() {
  return (
    <div>
      <h1>About</h1>
      <p>
        Blog Platform is a learning project. You can read posts, search and filter them, open a
        post with its comments, and write your own post.
      </p>
      <p>
        It is built with React, TypeScript, React Router and Vite. The posts come from the public
        DummyJSON API.
      </p>
      <p>
        Because DummyJSON does not really save new posts, the posts you write are saved in this
        browser (localStorage).
      </p>
    </div>
  )
}
