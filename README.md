# Inkwell

A community reading room for short stories: browse 250+ stories, search and filter them by tag,
open a story with its author and comments, like what you enjoy, and publish your own.

**Live demo:** https://yerakairzhan.github.io/blog-platform/

Built with React 19, TypeScript, React Router and Vite. Data comes from the public
[DummyJSON](https://dummyjson.com) API.

## Features

| Feature | Where |
|---|---|
| **List view**: story feed in a responsive card grid | `pages/FeedPage.tsx` |
| **Detail view**: full story, author, views/likes, comments, previous/next story | `pages/PostPage.tsx`, `components/PostDetail.tsx` |
| **Search**: titles, story text and tags, debounced while typing | `components/SearchBar.tsx` |
| **Filtering**: by tag (select or popular-tag chips) and by "All / Written by you / Liked by you" | `lib/feed.ts` → `filterPosts` |
| **Sorting**: latest, most liked, most viewed, title A–Z | `lib/feed.ts` → `sortPosts` |
| **Pagination**: 6 / 12 / 24 per page, numbered pages with gaps | `components/Pagination.tsx`, `lib/feed.ts` → `paginate` |
| **Controlled form to add an item**: validated title, story and tags, with tag suggestions | `components/PostForm.tsx` |
| **Comments**: loaded per story, plus a controlled comment form | `components/CommentSection.tsx` |
| **Likes**: toggle on any story; counts and the "Liked by you" filter update instantly | `context/PostsContext.tsx` |
| **Loading / error / empty / success states**: skeletons, retry buttons, tailored empty messages | everywhere data is shown |

All search, filter, sort and page settings live in the URL (e.g. `#/?q=love&tag=mystery&sort=popular&page=2`).
Opening a story and pressing *Back to feed* returns to the same view, and filtered views can be shared as links.

## Data source

* `GET /posts?limit=0`: all 251 stories in one request
* `GET /users?limit=0&select=…`: authors (208)
* `GET /posts/:id/comments`: comments for one story
* `POST /posts/add`: validates a new story

DummyJSON doesn't save new stories. It validates them and echoes them back. The app keeps your stories,
likes and comments in `localStorage` and merges them with the API data, so a new story shows up
immediately in the feed, search, filters and sort, and is still there after a reload.

All stories are loaded once and filtered on the client because DummyJSON can't combine search and
tag filtering in a single request. This way every combination of search, filter, sort and page works.

## Architecture

```
<App>
└── <PostsProvider>                 posts, authors, likes, load status (shared by every page)
    └── <RouterProvider>            hash router
        └── <Layout>                header, footer, <Outlet />, <ScrollRestoration />
            ├── <FeedPage>          reads filters from the URL, derives the visible list
            │   ├── <FeedToolbar>   <SearchBar>, 4× <SelectField>, Reset
            │   ├── <PostGrid>      <PostCard> × n → <AuthorLine>, <TagList>, <LikeButton>
            │   ├── <Pagination>
            │   └── <Panel>         <TopTags>, stats
            ├── <PostPage>          finds the post, handles loading / error / not-found
            │   └── <PostDetail key={post.id}>
            │       └── <CommentSection>  fetches comments, <CommentForm>
            ├── <NewPostPage>       <PostForm> → <FormField> × 3
            └── <NotFoundPage>
```

### Where state lives, and why

| State | Location | Reason |
|---|---|---|
| Posts, authors, load status, likes, your posts | `PostsProvider` (context above the router) | Needed by the feed, the story page and the editor; fetched once, not on every navigation |
| Search / tag / show / sort / page / page size | URL query string (`useFeedQuery`) | Survives navigation and Back, and can be shared as a link |
| Text being typed in the search box | `SearchBar` (`useState`) | Updates on every keystroke; only committed to the URL after a 300 ms pause |
| Form values, touched fields, submit status | `PostForm` (`useState`) | Belongs only to the form |
| Comments of the open story, comment draft | `CommentSection` / `CommentForm` | Belongs to one story; reset by `key` when the story changes |
| Delete confirmation | `PostDetail` | UI state for one story |

The filtered, sorted and paginated list, tag counts and form errors are **derived during render**,
not stored in state, so they can't fall out of sync with their inputs.

### Effects, cleanup and race conditions

* **Loading posts and authors** (`PostsContext`): one effect with an `AbortController`. Its cleanup aborts the
  request on unmount, and in development StrictMode's double-run aborts the first request.
  *Try again* re-runs the effect by changing its `attempt` dependency.
* **Loading comments** (`CommentSection`): the effect depends on `post.id`. When you click *Next* several
  times quickly, each cleanup aborts the previous request, and an aborted request never sets state, so a slow
  response for an old story can't replace the comments of the current one.
* **Debounced search** (`SearchBar`): every keystroke re-runs the effect, and its cleanup clears the
  previous timer, so only the last value is committed.
* **Persistence**: effects write your posts and likes to `localStorage` whenever they change.
  State is read from `localStorage` with lazy `useState` initialisers, so it is only read on mount.

### Keys and component identity

* Lists use stable ids (`post.id`, `tag`, page number), never array indexes, except for the fixed
  loading skeleton which never reorders.
* React Router keeps the same `<PostPage>` mounted when going from `/posts/1` to `/posts/2`. Rendering
  `<PostDetail key={post.id}>` makes React treat each story as a new component. The delete confirmation,
  comments and half-typed comment are reset instead of leaking into the next story.
* `SearchBar` copies an outside change to its value (Reset, browser Back) into its local text during render,
  instead of in an effect.

## Project structure

```
src/
├── api/          fetch wrapper + DummyJSON calls (maps API data to app types)
├── components/   reusable UI components, each with its own CSS module
├── context/      PostsContext: shared data and actions
├── hooks/        useFeedQuery: feed state stored in the URL
├── lib/          pure helpers: filter/sort/paginate, localStorage, authors
├── pages/        one component per route
├── types.ts
├── App.tsx       routes
└── main.tsx
```

## Run locally

Requires Node 20.19+ and pnpm.

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # type-check + production build into dist/
pnpm preview    # serve the production build
```

## Deployment

Every push to `main` runs `.github/workflows/deploy.yml`, which builds the app and publishes `dist/` to
GitHub Pages. The app uses hash URLs (`/#/posts/5`) because GitHub Pages can't serve `index.html` for
unknown paths, so refreshing or opening a deep link always works.
