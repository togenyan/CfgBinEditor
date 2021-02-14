import { createAsyncThunk, createAction } from '@reduxjs/toolkit'

import { decodeWorker } from './worker'

import type { RowType } from './types'

export const loadFile = createAsyncThunk(
  'cfgEditorApp/loadFile',
  async (file: File) => {
    return decodeWorker(await file.arrayBuffer())
  }
)

export const updateCodeGroup = createAction<{ codeGroupIdx: number, rowIdx: number, data: RowType }>(
  'cfgEditorApp/updateCodeGroup'
)

export const saveFile = createAction<void>(
  'cfgEditorApp/saveFile'
)

export const closeFile = createAction<void>(
  'cfgEditorApp/closeFile'
)
