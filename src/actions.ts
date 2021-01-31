import { createAsyncThunk } from '@reduxjs/toolkit'

import { decodeArrayBuffer } from './decoder'

export const loadFile = createAsyncThunk(
  'cfgEditorApp/loadFile',
  async (file: File) => {
    return decodeArrayBuffer(await file.arrayBuffer())
  }
)
