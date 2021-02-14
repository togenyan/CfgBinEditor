import { configureStore, createSlice } from '@reduxjs/toolkit'
import type { TypedUseSelectorHook } from 'react-redux'
import { useSelector } from 'react-redux'

import { closeFile, loadFile, saveFile, updateCodeGroup } from './actions'
import type { CfgBinFile } from './types'

export interface AppState {
  data?: CfgBinFile
  filename: string
  outData?: ArrayBuffer
  isError: boolean
  isLoaded: boolean
  isLoading: boolean
  isSaving: boolean
  msg: string
}

const initialState: AppState = {
  filename: '',
  isError: false,
  isLoaded: false,
  isLoading: false,
  isSaving: false,
  msg: '',
}

const slice = createSlice({
  name: 'cfgEditorApp',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(loadFile.pending, (state, arg) => ({
      ...state,
      filename: arg.meta.arg.name,
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
    builder.addCase(updateCodeGroup, (state, { payload }) => {
      if (typeof state.data === 'undefined') {
        return
      }
      const codes = state.data.codes[payload.codeGroupIdx].codes[payload.rowIdx]
      // Thanks to immer library, mutating original state works without problem
      codes.values = codes.values.map((value, idx) => ({
        ...value,
        value: payload.rowData[idx],
      }))
    })
    builder.addCase(saveFile.pending, (state) => ({
      ...state,
      isSaving: true,
    }))
    builder.addCase(saveFile.fulfilled, (state, { payload }) => ({
      ...state,
      outData: payload,
      isSaving: false,
    }))
    builder.addCase(closeFile, (state) => ({
      ...state,
      isLoaded: false,
      isError: false,
      isLoading: false,
      data: undefined, // eslint-disable-line no-undefined
    }))
  },
})

export const store = configureStore({
  reducer: slice.reducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      immutableCheck: false,
      serializableCheck: false,
    }),
})

export const useTypedSelector: TypedUseSelectorHook<
  ReturnType<typeof store.getState>
> = useSelector
