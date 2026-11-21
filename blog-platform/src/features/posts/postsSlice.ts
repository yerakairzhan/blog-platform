import { createSlice } from '@reduxjs/toolkit'
import { loadPosts } from '../../services/service'
import { createAppAsyncThunk } from '../../store/hooks'
import { dataInvalidated, isFresh } from '../../store/actions'
import type { Post } from '../../types'

interface PostsState {
  items: Post[]
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string
  fetchedAt: number | null // when the list was last loaded
  invalidatedAt: number // when the list was marked as out of date
  currentRequestId: string | null // only this request may change the state
}

const initialState: PostsState = {
  items: [],
  status: 'idle',
  error: '',
  fetchedAt: null,
  invalidatedAt: 0,
  currentRequestId: null,
}

// Thunk 1 (list): loads all posts. `force: true` is used by "Try again" and after publishing.
export const fetchPosts = createAppAsyncThunk(
  'posts/fetchAll',
  (_args: { force?: boolean } | undefined, { signal }) => loadPosts(signal),
  {
    // No request if the list is already loaded and still fresh (no unnecessary API calls).
    condition: (args, { getState }) => {
      if (args?.force) return true
      const { fetchedAt, invalidatedAt } = getState().posts
      return !isFresh(fetchedAt, invalidatedAt)
    },
  },
)

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPosts.pending, (state, action) => {
        state.status = 'loading'
        state.error = ''
        state.currentRequestId = action.meta.requestId
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        // A newer request was started: this answer is outdated, ignore it.
        if (action.meta.requestId !== state.currentRequestId) return
        state.items = action.payload
        state.status = 'succeeded'
        state.fetchedAt = Date.now()
        state.currentRequestId = null
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        if (action.meta.requestId !== state.currentRequestId) return
        state.currentRequestId = null
        if (action.meta.aborted) {
          // Cancelled because the page was closed: not an error.
          state.status = state.fetchedAt === null ? 'idle' : 'succeeded'
          return
        }
        state.status = 'failed'
        state.error = action.error.message ?? 'Something went wrong.'
      })
      .addCase(dataInvalidated, (state) => {
        state.invalidatedAt = Date.now()
      })
  },
})

export const postsReducer = postsSlice.reducer
