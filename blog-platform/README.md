# Blog Platform

A simple blog where you can read posts, search and filter them, open a post with its comments,
and write your own post.

**Live demo:** https://yerakairzhan.github.io/blog-platform/

Built with React, TypeScript, Redux Toolkit, React Router and Vite. Data comes from the public
[DummyJSON](https://dummyjson.com) API (251 posts).

## Features

- **Routes:** `/` Home, `/about`, `/posts` (list), `/posts/:id` (details), `/posts/new`, `/dashboard`, `/login`, `/signup`, `/profile` (protected), `/offline`, and a 404 page for everything else
- **Posts list** with search, tag filter, minimum-likes filter, sorting and pagination (10 per page). All of them are saved in the URL (`#/posts?tag=love&page=2`), so links, refresh and Back/Forward work
- **Post details** with 8 details (id, author, likes, dislikes, views, comments, reading time, tags), comments, Back / All posts links and previous/next post links. A wrong id shows "does not exist" or the 404 page
- **Dashboard** with 4 statistics, 2 breakdowns (top tags, posts by likes) and a tag filter that changes all numbers
- **Authentication** with Firebase: login, signup, Google sign-in and a protected profile (see below)
- **Loading, error, empty and success states** on every page that loads data

## How it works

### Routing

`App.tsx` only contains the routes. `RootLayout` shows `NavBar` and an `<Outlet />`, and wraps it in `<Suspense>`.
Eight pages are lazy-loaded with `React.lazy` (About, Posts, Post details, New post, Dashboard, Login, Signup, Profile).

### Data

All requests are in `src/services/service.ts` (DummyJSON API):

- `GET /posts?limit=0`: all posts
- `GET /posts/:id`, `GET /users/:id`, `GET /posts/:id/comments`: one post, its author and its comments
- `POST /posts/add`: creates a post

DummyJSON does not really save new posts, so after the API accepts a post we also save it in
`localStorage` (`src/localPosts.ts`). Saved posts are shown at the top of the list.

The `usePosts` hook loads all posts for the list and the dashboard into the Redux store. It aborts the
request when you leave the page. `usePost` aborts the old request when the id changes, so a slow old
response can never replace the current post (see Redux Toolkit below).

## Project structure

```
src/
├── App.tsx         routes only (public/ holds manifest.json, sw.js, offline.html and the icons)
├── firebase.ts     Firebase setup from VITE_FIREBASE_* variables
├── context/        AuthContext (AuthProvider + useAuth)
├── services/       service.ts (DummyJSON requests), authService.ts (Firebase auth calls),
│                   connectivity.ts (online/offline state), serviceWorker.ts (registration and updates)
├── store/          Redux store, typed hooks, shared actions
├── features/       Redux slices, thunks and selectors: posts, postDetails, newPost
├── hooks/          usePosts, usePost, useCreatePost (Redux), useDebounce, useConnectivity, ...
├── pages/          Home, About, Posts, Post, NewPost, Dashboard, Login, Signup, Profile, NotFound
├── components/     RootLayout, NavBar, ProtectedRoute, PostCard, Pagination, SelectField, ...
├── styles/         index.css
├── filters.ts      search, filters, sorting, reading filters from the URL
├── localPosts.ts   saving new posts in localStorage
└── types.ts        TypeScript types
```

## Authentication (Firebase)

- Email/password and Google sign-in, signup (with confirm password and validation), login and logout.
- `src/firebase.ts` starts Firebase from `VITE_FIREBASE_*` variables. The session is kept in the browser
  (`browserLocalPersistence`), so you stay logged in after a refresh.
- `AuthContext` (`AuthProvider` + `useAuth`) listens with `onAuthStateChanged` and gives the pages
  `user`, `loading`, `error` and the login functions. The Firebase calls are in `src/services/authService.ts`.
- `/profile` is protected (`ProtectedRoute`): logged-out users are sent to `/login`. It shows the email and UID.
- The NavBar shows Login/Signup when logged out and Profile/Logout when logged in.

## State management (Redux Toolkit)

Global data lives in a Redux store (`src/store/index.ts`, `configureStore`), given to the app with
`<Provider store={store}>` in `main.tsx`. Pages use it through typed `useAppSelector` / `useAppDispatch`
(`src/store/hooks.ts`, made from `useSelector` / `useDispatch`).

What is **not** in Redux, on purpose:

- **Authentication** stays in `AuthContext` (Firebase keeps the session, Redux would only copy it).
- **Filters, search, sorting and page** stay in the URL (`?search=love&tag=history&page=2`).
- **Temporary UI state** stays local: form fields and validation errors, the dashboard tag, the mobile menu,
  the text in the search box (debounced 300 ms with `useDebounce` before it goes to the URL).

### Slices (`src/features/`)

| Slice | State | Used by |
|---|---|---|
| `posts` | `items`, `status`, `error`, `fetchedAt`, `invalidatedAt`, `currentRequestId` | Posts page, Dashboard |
| `postDetails` | `byId[id]` = `{ data, status, error, fetchedAt, requestId }`, `invalidatedAt` | Post page |
| `newPost` | `status`, `error` of publishing | New post page |

All slices handle `pending`, `fulfilled` and `rejected` in `extraReducers`. `posts` and `postDetails` also
listen to the shared `dataInvalidated` action (`src/store/actions.ts`), sent when the connection comes back
or the user presses Refresh / Retry connection, so the open page loads its data again.

### Thunks (`createAsyncThunk`)

| Thunk | What it does |
|---|---|
| `fetchPosts` | Loads all posts (list). |
| `fetchPostDetails(id)` | Loads one post, its author and comments (details). |
| `createPost(input)` | Publishes a post (mutation), then dispatches `fetchPosts({ force: true })` so the list shows it. |

- **No unnecessary requests:** the `condition` option skips `fetchPosts` / `fetchPostDetails` when the data is
  already loaded and fresh (5 minutes, `STALE_TIME`). Posts page and Dashboard share one list. `createPost`
  ignores a second click while publishing.
- **Stale requests:** each thunk gets an `AbortSignal`. The hooks call `request.abort()` in the effect cleanup
  (page closed, or another post opened). The reducers also save the `requestId` of the newest request and ignore
  answers from older ones, so a slow old response can never replace newer data.
- **Loading, errors, empty results, retries:** the hooks turn the slice status into `loading` / `error` /
  `success`, pages show messages for each and for empty results, and "Try again" dispatches the thunk again.
  Data already loaded is still shown while it reloads.

### Selectors

| Selector | Type |
|---|---|
| `selectAllPosts`, `selectPostsStatus`, `selectPostsError` | simple (`features/posts/postsSelectors.ts`) |
| `selectPostEntry`, `selectIsPublishing`, `selectPublishError` | simple |
| `selectAllTags` | memoized (`createSelector`): sorted unique tags |
| `selectFilteredPosts(state, filters)` | memoized: search + tag + likes filter + sorting |
| `selectPostStats(state, tag)` | memoized: dashboard numbers and breakdowns |

Filtered lists and statistics are calculated by selectors, not stored, so there is no duplicated state.

### Custom hooks (`src/hooks/`)

`usePosts`, `usePost(id)` and `useCreatePost` connect pages to Redux (dispatch the thunk in an effect, read
with selectors). Pages never call the API directly, and the API calls stay in `src/services/service.ts`.

## PWA and offline mode

The app can be installed (Chrome/Edge: install icon in the address bar; Android: "Add to Home screen") and
works offline.

- **Manifest:** `public/manifest.json` (name, short name, `start_url`, `scope`, `display: standalone`, theme and
  background color) with 192×192 and 512×512 icons in `public/icons/` (plus a maskable one).
- **Service worker:** `public/sw.js`, written by hand, with `install`, `activate` and `fetch` handlers. A small
  Vite plugin (`vite.config.ts`) adds the list of built files and a version hash to it after every build.
  - *install:* saves the app shell (html, all JS/CSS, icons, `offline.html`) in the cache `shell-<version>`.
  - *activate:* deletes every cache that is not from the current version, then takes control of the open tabs.
  - *update:* a new version waits in the background. The app shows "A new version is available" with an
    **Update now** button. Pressing it activates the new worker and reloads the page. Nothing needs to be cleared
    by hand.
- **Runtime caching:**
  - *Cache first* for static files (`static-v1`, at most 60 files).
  - *Network first* for DummyJSON API requests (`api-v1`, at most 80 responses, oldest removed first). If the
    network fails or takes more than 5 seconds, the last saved response is used.
  - Firebase/Google sign-in requests, POST requests and anything with an `Authorization` header are never
    handled or stored, so no tokens or user data end up in a shared cache.
- **Saved data notice:** when the service worker answers from the cache it adds an `X-Served-From: cache` header.
  The app reads it (`services/connectivity.ts`) and shows "Showing saved data" with a Refresh button.
- **Offline page:** `/offline` (also `public/offline.html`, saved in the shell cache as a last fallback) has a
  **Retry connection** button. It makes a real request instead of trusting `navigator.onLine`. When a page cannot
  load its data while offline, this page is shown in its place. The header always shows an Online/Offline label.
  When the connection comes back, all queries reload.
- **Mobile:** works from 320px wide. The nav turns into a Menu button on small screens, forms and filters stack,
  buttons and inputs are at least 44px tall on touch screens, and there is no horizontal scrolling in portrait or
  landscape.

The service worker is only registered in the production build (`pnpm build && pnpm preview`), not in `pnpm dev`.

## Run locally

```bash
pnpm install
cp .env.example .env.local   # then fill in your Firebase values
pnpm dev
```

Open http://localhost:5173.

## Deployment

Every push to `main` builds the app and deploys it to GitHub Pages
(`.github/workflows/deploy.yml`). The app uses hash URLs (`#/posts/5`) so that refreshing any page
works on GitHub Pages.

### Firebase setup and deploy

1. Create a Firebase project, add a Web app, and enable **Email/Password** and **Google** in Authentication.
2. Add your site domain (for example `yerakairzhan.github.io`) in Authentication, Settings, Authorized domains.
3. Put the values in `.env.local` (not committed) using `.env.example` as a template.
4. For GitHub Pages, add the same six `VITE_FIREBASE_*` values as repository secrets, because the build runs on GitHub.
