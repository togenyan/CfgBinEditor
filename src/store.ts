import { configureStore, createSlice } from '@reduxjs/toolkit'
import type { TypedUseSelectorHook } from 'react-redux'
import { useSelector } from 'react-redux'

import cloneDeep from 'lodash.clonedeep'

import { loadFile, updateCodeGroup, saveFile, closeFile } from './actions'
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
    builder.addCase(updateCodeGroup, (state, { payload }) => {
      if (state.data === undefined) {
        return
      }
      const codes = state.data.codes[payload.codeGroupIdx].codes[payload.rowIdx]
      // thanks to immer library, mutating original state works without problem
      codes.values = codes.values.map((value, idx) =>
      ({
        ...value,
        value: payload.data[idx]
      }))
    })
    builder.addCase(saveFile, (state) => ({
      ...state,
    }))
    builder.addCase(closeFile, (state) => ({
      ...state,
      isLoaded: false,
      isError: false,
      isLoading: false,
      data: undefined,
    }))
  },
})

export const store = configureStore({
  reducer: slice.reducer,
})

export const useTypedSelector: TypedUseSelectorHook<
  ReturnType<typeof store.getState>
> = useSelector
