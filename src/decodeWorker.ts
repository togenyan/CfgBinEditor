import { decodeArrayBuffer } from './utils/decoder'

onmessage = (ev: MessageEvent<ArrayBuffer>): void => {
  const cfgData = decodeArrayBuffer(ev.data)
  postMessage(cfgData)
}
