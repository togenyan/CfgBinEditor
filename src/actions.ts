import { createAction, createAsyncThunk } from '@reduxjs/toolkit'

import type { CfgBinFile, RowType } from './types'
import { decodeWorker, encodeWorker } from './worker'

export const loadFile = createAsyncThunk(
  'cfgEditorApp/loadFile',
  async (file: File) => {
    return decodeWorker(await file.arrayBuffer())
  }
)

export const updateCodeGroup = createAction<{
  codeGroupIdx: number
  rowIdx: number
  rowData: RowType
}>('cfgEditorApp/updateCodeGroup')

export const saveFile = createAsyncThunk(
  'cfgEditorApp/saveFile',
  async (data: CfgBinFile) => {
    return encodeWorker(data)
  }
)
export const closeFile = createAction('cfgEditorApp/closeFile')
