# Blog Platform

A simple blog where you can read posts, search and filter them, open a post with its comments,
and write your own post.

**Live demo:** https://yerakairzhan.github.io/blog-platform/

Built with React, TypeScript, React Router and Vite. Data comes from the public
[DummyJSON](https://dummyjson.com) API (251 posts).

## Features

- **List of posts** with search (title and text), tag filter, sorting and pagination (10 per page)
- **Post page** with author, likes, views, tags, comments, and previous/next post links
- **New post form** (controlled inputs) with validation
- **Loading, error, empty and success states** on every page that loads data

## How it works

### Pages

| Page | URL | What it does |
|---|---|---|
| `FeedPage` | `#/` | Loads all posts, then filters, sorts and paginates them |
| `PostPage` | `#/posts/:id` | Loads one post, its author and its comments |
| `NewPostPage` | `#/posts/new` | Form for writing a new post |

### Data

- `GET /posts?limit=0`: all posts
- `GET /posts/:id`, `GET /users/:id`, `GET /posts/:id/comments`: one post, its author and its comments
- `POST /posts/add`: creates a post

DummyJSON does not really save new posts, so after the API accepts a post we also save it in
`localStorage` (`src/localPosts.ts`). Saved posts are shown at the top of the list.

### State

| State | Where | Why |
|---|---|---|
| Filters (search, tag, sort, page) | `App` | `FeedPage` is removed when you open a post, so its state would be lost. `App` stays, so the filters are kept when you come back. |
| Posts, loading status, error | `FeedPage` | Only the list page needs them |
| One post, author, comments | `PostDetails` (in `PostPage`) | Only the post page needs them |
| Form fields and errors | `NewPostPage` | Only the form needs them |

The filtered and paginated list is **calculated during render** from posts + filters (`src/filters.ts`),
so it is not stored in state.

### Effects

- `FeedPage` loads posts in `useEffect`. The cleanup aborts the request (`AbortController`)
  if you leave the page before it finishes. "Try again" changes `reloadCount`, which is in the
  dependency array, so the effect runs again.
- `PostDetails` loads a post when `postId` changes. If you click "Next post" quickly several times,
  each cleanup aborts the previous request, so an old, slow response can never replace the current post
  (no race condition).
- `ScrollToTop` scrolls to the top when the URL path changes.

### Keys

- Lists use ids as keys (`post.id`, `comment.id`, the tag name), not array indexes.
- `<PostDetails key={id} />`: when you go to another post, React creates a fresh `PostDetails`,
  so the old post is never shown while the new one is loading.

## Project structure

```
src/
├── api.ts          requests to DummyJSON
├── filters.ts      search, tag filter and sorting
├── localPosts.ts   saving new posts in localStorage
├── types.ts        TypeScript types
├── App.tsx         routes + filter state
├── components/     small reusable components (PostCard, Pagination, SelectField, ...)
└── pages/          FeedPage, PostPage, NewPostPage
```

## Run locally

```bash
pnpm install
pnpm dev
```

Open http://localhost:5173.

## Deployment

Every push to `main` builds the app and deploys it to GitHub Pages
(`.github/workflows/deploy.yml`). The app uses hash URLs (`#/posts/5`) so that refreshing any page
works on GitHub Pages.
