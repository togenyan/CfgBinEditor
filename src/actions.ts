import { createAsyncThunk } from '@reduxjs/toolkit'

import { decodeWorker } from './worker'

export const loadFile = createAsyncThunk(
  'cfgEditorApp/loadFile',
  async (file: File) => {
    return decodeWorker(await file.arrayBuffer())
  }
)
