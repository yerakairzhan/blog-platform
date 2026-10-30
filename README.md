# Blog Platform

A simple blog where you can read posts, search and filter them, open a post with its comments,
and write your own post.

**Live demo:** https://yerakairzhan.github.io/blog-platform/

Built with React, TypeScript, React Router and Vite. Data comes from the public
[DummyJSON](https://dummyjson.com) API (251 posts).

## Features

- **Routes:** `/` Home, `/about`, `/posts` (list), `/posts/:id` (details), `/posts/new`, `/dashboard`, `/login`, and a 404 page for everything else
- **Posts list** with search, tag filter, minimum-likes filter, sorting and pagination (10 per page). All of them are saved in the URL (`#/posts?tag=love&page=2`), so links, refresh and Back/Forward work
- **Post details** with 8 details (id, author, likes, dislikes, views, comments, reading time, tags), comments, Back / All posts links and previous/next post links. A wrong id shows "does not exist" or the 404 page
- **Dashboard** with 4 statistics, 2 breakdowns (top tags, posts by likes) and a tag filter that changes all numbers
- **Login** is a styled placeholder for future authentication
- **Loading, error, empty and success states** on every page that loads data

## How it works

### Routing

`App.tsx` only contains the routes. `RootLayout` shows `NavBar` and an `<Outlet />`, and wraps it in `<Suspense>`.
Six pages are lazy-loaded with `React.lazy` (About, Posts, Post details, New post, Dashboard, Login).

### Data

All requests are in `src/services/service.ts` (DummyJSON API):

- `GET /posts?limit=0`: all posts
- `GET /posts/:id`, `GET /users/:id`, `GET /posts/:id/comments`: one post, its author and its comments
- `POST /posts/add`: creates a post

DummyJSON does not really save new posts, so after the API accepts a post we also save it in
`localStorage` (`src/localPosts.ts`). Saved posts are shown at the top of the list.

The `usePosts` hook (`src/hooks/usePosts.ts`) loads all posts for the list and the dashboard. It aborts the
request when you leave the page. `PostPage` aborts the old request when the id changes, so a slow old
response can never replace the current post.

## Project structure

```
src/
├── App.tsx         routes only
├── services/       service.ts: requests to DummyJSON
├── hooks/          usePosts
├── pages/          Home, About, Posts, Post, NewPost, Dashboard, Login, NotFound
├── components/     RootLayout, NavBar, PostCard, Pagination, SelectField, ...
├── styles/         index.css
├── filters.ts      search, filters, sorting, reading filters from the URL
├── localPosts.ts   saving new posts in localStorage
└── types.ts        TypeScript types
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
