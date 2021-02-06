import type { CfgBinFile } from './types'

export const decodeWorker = async (buf: ArrayBuffer): Promise<CfgBinFile> => {
  const worker = new Worker('./decodeWorker.ts', { type: 'module' })
  const promise = new Promise<CfgBinFile>((resolve, reject) => {
    worker.onmessage = (ev: MessageEvent<CfgBinFile>): void => {
      resolve(ev.data)
    }
    worker.onerror = (ev): void => {
      reject(ev.message)
    }
    worker.postMessage(buf)
  })
  return await promise
}
