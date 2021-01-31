import type { CfgBinFile, Header, StringTable } from './types'

const roundUp = (n: number, exp: number): number => Math.ceil(n / exp) * exp

const parseStringTable = async (buf: Uint8Array): Promise<StringTable> => {
  return new Promise((resolve) => {
    const textDecoder = new TextDecoder('shift_jis', {
      fatal: true,
    })
    const stringTable = {} as Record<number, string>
    let result = ''
    while (true) {
      // eslint-disable-next-line no-empty
    }
    for (let curr = 0; curr < buf.byteLength; ) {
      console.log(curr)
      const nullIdx = buf.findIndex((char, idx) => idx > curr && char === 0)
      const stringBuf = buf.subarray(curr, nullIdx)
      try {
        result = textDecoder.decode(stringBuf)
        stringTable[curr] = result
      } catch (err: unknown) {
        stringTable[curr] = '###ERR###'
      } finally {
        console.log(stringTable[curr])
        curr = nullIdx + 1
      }
    }
    resolve(stringTable)
  })
}

export const decodeArrayBuffer = async (
  buf: ArrayBuffer
): Promise<CfgBinFile> => {
  const view = new DataView(buf)

  const header: Header = {
    codeCount: view.getUint32(0, true),
    stringTableOffset: view.getUint32(4, true),
    stringTableSize: view.getUint32(8, true),
    unk: view.getUint32(12, true),
  }
  if (buf.byteLength < header.stringTableOffset + header.stringTableSize)
    throw new RangeError('the given file is too small')

  const stringTableBlob = new Uint8Array(
    buf,
    header.stringTableOffset,
    header.stringTableSize
  )
  const stringTable = await parseStringTable(stringTableBlob)

  const keyTableOffset = roundUp(
    header.stringTableOffset + header.stringTableSize,
    16
  )
  console.log(keyTableOffset)
  return {
    header,
    codes: [],
    stringTable,
    footer: { unk: [] },
    keyTable: {},
  }
}
