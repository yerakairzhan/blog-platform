import { createAsyncThunk } from '@reduxjs/toolkit'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from './index'

// useDispatch and useSelector that already know the types of our store.
export const useAppDispatch = useDispatch.withTypes<AppDispatch>()
export const useAppSelector = useSelector.withTypes<RootState>()

// createAsyncThunk that knows RootState (for getState) and AppDispatch (for dispatch).
export const createAppAsyncThunk = createAsyncThunk.withTypes<{
  state: RootState
  dispatch: AppDispatch
}>()
