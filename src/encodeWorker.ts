import type { CfgBinFile } from './types'
import { encodeToArrayBuffer } from './utils/encoder'

onmessage = (ev: MessageEvent<CfgBinFile>): void => {
  const bufData = encodeToArrayBuffer(ev.data)
  postMessage(bufData)
}
