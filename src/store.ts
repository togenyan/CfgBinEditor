import { configureStore, createSlice } from '@reduxjs/toolkit'
import type { TypedUseSelectorHook } from 'react-redux'
import { useSelector } from 'react-redux'

import { loadFile } from './actions'
import type { CfgBinFile } from './types'

export interface AppState {
  data?: CfgBinFile
  isError: boolean
  isLoaded: boolean
  isLoading: boolean
  msg: string
}

const initialState: AppState = {
  isError: false,
  isLoaded: false,
  isLoading: false,
  msg: '',
}

const slice = createSlice({
  name: 'cfgEditorApp',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadFile.pending, (state) => ({
      ...state,
      isLoading: true,
    }))
    builder.addCase(loadFile.fulfilled, (state, { payload }) => ({
      ...state,
      data: payload,
      isLoaded: true,
      isError: false,
      isLoading: false,
    }))
    builder.addCase(loadFile.rejected, (state, action) => ({
      ...state,
      isLoaded: false,
      isError: true,
      isLoading: false,
      msg: action.error.message ?? 'Unknown Error',
    }))
  },
})

export const store = configureStore({
  reducer: slice.reducer,
})

export const useTypedSelector: TypedUseSelectorHook<
  ReturnType<typeof store.getState>
> = useSelector
