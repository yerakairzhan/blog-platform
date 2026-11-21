import { createSlice } from '@reduxjs/toolkit'
import { loadPostDetails } from '../../services/service'
import { createAppAsyncThunk } from '../../store/hooks'
import { dataInvalidated, isFresh } from '../../store/actions'
import type { RootState } from '../../store'
import type { Comment, Post, Status, User } from '../../types'

export interface PostDetailsData {
  post: Post
  author: User | null
  comments: Comment[]
}

interface Entry {
  data: PostDetailsData | null
  status: 'loading' | 'succeeded' | 'failed'
  error: string
  fetchedAt: number | null
  requestId: string | null // only this request may change the entry
}

interface PostDetailsState {
  byId: Record<number, Entry> // every opened post is kept, so going back shows it at once
  invalidatedAt: number
}

const initialState: PostDetailsState = { byId: {}, invalidatedAt: 0 }

// Thunk 2 (details): one post with its author and comments.
export const fetchPostDetails = createAppAsyncThunk(
  'postDetails/fetch',
  (id: number, { signal }) => loadPostDetails(id, signal),
  {
    // No request if this post is already loaded and still fresh.
    condition: (id, { getState }) => {
      const { byId, invalidatedAt } = getState().postDetails
      const entry = byId[id]
      return !(entry && entry.data && isFresh(entry.fetchedAt, invalidatedAt))
    },
  },
)

const postDetailsSlice = createSlice({
  name: 'postDetails',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPostDetails.pending, (state, action) => {
        const id = action.meta.arg
        const old = state.byId[id]
        state.byId[id] = {
          data: old ? old.data : null,
          fetchedAt: old ? old.fetchedAt : null,
          status: 'loading',
          error: '',
          requestId: action.meta.requestId,
        }
      })
      .addCase(fetchPostDetails.fulfilled, (state, action) => {
        const entry = state.byId[action.meta.arg]
        // Outdated answer (a newer request for this post was started): ignore it.
        if (!entry || entry.requestId !== action.meta.requestId) return
        entry.data = action.payload
        entry.status = 'succeeded'
        entry.fetchedAt = Date.now()
        entry.requestId = null
      })
      .addCase(fetchPostDetails.rejected, (state, action) => {
        const entry = state.byId[action.meta.arg]
        if (!entry || entry.requestId !== action.meta.requestId) return
        entry.requestId = null
        if (action.meta.aborted) {
          // Cancelled because the user left the post: not an error.
          if (entry.data) entry.status = 'succeeded'
          else delete state.byId[action.meta.arg]
          return
        }
        entry.status = 'failed'
        entry.error = action.error.message ?? 'Something went wrong.'
      })
      .addCase(dataInvalidated, (state) => {
        state.invalidatedAt = Date.now()
      })
  },
})

export const postDetailsReducer = postDetailsSlice.reducer

// Simple selectors
export const selectPostDetailsInvalidatedAt = (state: RootState) => state.postDetails.invalidatedAt
export const selectPostEntry = (state: RootState, id: number): Entry | undefined =>
  state.postDetails.byId[id]

// Status for the UI. Saved data is shown even while it is being reloaded.
export function getEntryStatus(entry: Entry | undefined): Status {
  if (entry?.data) return 'success'
  if (entry?.status === 'failed') return 'error'
  return 'loading'
}
