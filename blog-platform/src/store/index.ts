import { configureStore } from '@reduxjs/toolkit'
import { newPostReducer } from '../features/newPost/newPostSlice'
import { postDetailsReducer } from '../features/postDetails/postDetailsSlice'
import { postsReducer } from '../features/posts/postsSlice'

export const store = configureStore({
  reducer: {
    posts: postsReducer, // the list of all posts (Posts page and Dashboard)
    postDetails: postDetailsReducer, // one post with author and comments, saved by id
    newPost: newPostReducer, // status of publishing a new post
  },
})

export type RootState = ReturnType<typeof store.getState>
export type AppDispatch = typeof store.dispatch
