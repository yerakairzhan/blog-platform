import { createSlice } from '@reduxjs/toolkit'
import { publishPost } from '../../services/service'
import { createAppAsyncThunk } from '../../store/hooks'
import type { RootState } from '../../store'
import { fetchPosts } from '../posts/postsSlice'

interface NewPostState {
  status: 'idle' | 'loading' | 'succeeded' | 'failed'
  error: string
}

const initialState: NewPostState = { status: 'idle', error: '' }

// Thunk 3 (mutation): publishes a post, then reloads the list so the new post appears in it.
export const createPost = createAppAsyncThunk(
  'newPost/create',
  async (input: { title: string; body: string; tags: string[] }, { dispatch }) => {
    const newPost = await publishPost(input)
    dispatch(fetchPosts({ force: true })) // refresh the data affected by the mutation
    return newPost
  },
  {
    // Ignore a second click while the first one is still being sent.
    condition: (_input, { getState }) => getState().newPost.status !== 'loading',
  },
)

const newPostSlice = createSlice({
  name: 'newPost',
  initialState,
  reducers: {
    // Called when the form is opened or cleared, so an old error is not shown.
    newPostReset: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(createPost.pending, (state) => {
        state.status = 'loading'
        state.error = ''
      })
      .addCase(createPost.fulfilled, (state) => {
        state.status = 'succeeded'
      })
      .addCase(createPost.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.error.message ?? 'Something went wrong.'
      })
  },
})

export const { newPostReset } = newPostSlice.actions
export const newPostReducer = newPostSlice.reducer

// Simple selectors
export const selectIsPublishing = (state: RootState) => state.newPost.status === 'loading'
export const selectPublishError = (state: RootState) => state.newPost.error
