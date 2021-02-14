import CRC32 from 'crc-32'

import type { CfgBinFile } from '../types'

const roundUp = (n: number, exp: number): number =>
  Math.ceil(n / 2 ** exp) * 2 ** exp

export const encodeToArrayBuffer = (data: CfgBinFile): ArrayBuffer => {
  // Record keys actually used, sorted in order of appearance
  const keyAppeared = [] as number[]
  const codeBufs = (data.codes
    .map((codeGroup) => {
      return codeGroup.codes.map((code) => {
        const paramDescriptionSize = Math.ceil(code.values.length / 4)
        const headerSize = roundUp(4 + 1 + paramDescriptionSize, 2)
        const codeBuf = new ArrayBuffer(headerSize + 4 * code.values.length)
        const codeBufView = new DataView(codeBuf)
        for (let i = 0; i < headerSize; i += 1) {
          codeBufView.setUint8(i, 0xff)
        }
        codeBufView.setUint32(0, code.crc32, true)
        if (!keyAppeared.includes(code.crc32)) {
          keyAppeared.push(code.crc32)
        }
        codeBufView.setUint8(4, code.values.length)
        // Type descriptions
        for (let i = 0; i < Math.ceil(code.values.length / 4); i += 1) {
          let typeDesc = 0
          for (
            let j = 4 * i;
            j < 4 * (i + 1) && j < code.values.length;
            j += 1
          ) {
            const tagValue =
              code.values[j].tag === 'string'
                ? 0
                : code.values[j].tag === 'int'
                ? 1
                : code.values[j].tag === 'float'
                ? 2
                : 3
            typeDesc |= tagValue << ((j % 4) * 2)
          }
          codeBufView.setUint8(5 + i, typeDesc)
        }

        for (let i = 0; i < code.values.length; i += 1) {
          const val = code.values[i]
          if (val.tag === 'float') {
            codeBufView.setFloat32(headerSize + 4 * i, val.value, true)
          } else {
            codeBufView.setUint32(headerSize + 4 * i, val.value, true)
          }
        }
        return codeBuf
      })
    })
    .flat() as unknown) as ArrayBuffer[]

  // Only available for utf-8
  const textEncoder = new TextEncoder()
  const stringTableBlobs = Array.from(
    Object.keys(data.stringTable)
      .map((s: string) => parseInt(s, 10))
      .sort((a: number, b: number) => a - b)
  ).map((val) => textEncoder.encode(data.stringTable[val]))

  const header = new ArrayBuffer(16)
  const headerView = new Uint32Array(header)
  headerView[0] = data.codes.reduce((acc, cur) => acc + cur.codes.length, 0)
  headerView[1] = roundUp(
    16 + codeBufs.reduce((acc, cur) => acc + cur.byteLength, 0),
    4
  )
  headerView[2] =
    stringTableBlobs.reduce((acc, cur) => acc + cur.byteLength, 0) +
    stringTableBlobs.length
  headerView[3] = data.header.unk

  const keyTableBufs = [] as ArrayBuffer[]
  const keyTableStringBufs = [] as Uint8Array[]
  let keyStringBufLength = 0
  keyAppeared.forEach((k) => {
    const key = data.keyTable[k]
    const buf = textEncoder.encode(key)
    keyTableStringBufs.push(buf)
    const keyBuf = new ArrayBuffer(8)
    const keyBufView = new DataView(keyBuf)
    keyBufView.setUint32(0, CRC32.str(key), true)
    keyBufView.setUint32(4, keyStringBufLength, true)
    keyTableBufs.push(keyBuf)
    keyStringBufLength += buf.byteLength + 1
  })
  const keyTableHeader = new ArrayBuffer(16)
  const keyTableHeaderView = new Uint32Array(keyTableHeader)
  keyTableHeaderView[0] = roundUp(
    16 + 8 * Object.keys(data.keyTable).length + keyStringBufLength,
    4
  )
  keyTableHeaderView[1] = Object.keys(data.keyTable).length
  keyTableHeaderView[2] = 16 + 8 * Object.keys(data.keyTable).length
  keyTableHeaderView[3] = keyStringBufLength

  const outBuf = new ArrayBuffer(
    headerView[1] +
      headerView[2] +
      keyTableHeaderView[2] +
      roundUp(keyTableHeaderView[3], 4) +
      data.footer.unk.length
  )
  const outArray = new Uint8Array(outBuf)
  {
    let offset = 0
    outArray.set(new Uint8Array(header), 0)
    offset += 16

    codeBufs.forEach((codeBuf) => {
      outArray.set(new Uint8Array(codeBuf), offset)
      offset += codeBuf.byteLength
    })
    {
      const padding = roundUp(offset, 4) - offset
      outArray.set(Array(padding).fill(0xff), offset)
      offset += padding
    }

    stringTableBlobs.forEach((stringBuf) => {
      outArray.set(stringBuf, offset)
      offset += stringBuf.byteLength
      outArray.set([0], offset)
      offset += 1
    })

    {
      const padding = roundUp(offset, 4) - offset
      outArray.set(Array(padding).fill(0xff), offset)
      offset += padding
    }

    outArray.set(new Uint8Array(keyTableHeader), offset)
    offset += 16

    keyTableBufs.forEach((keyBuf) => {
      outArray.set(new Uint8Array(keyBuf), offset)
      offset += keyBuf.byteLength
    })

    keyTableStringBufs.forEach((stringBuf) => {
      outArray.set(stringBuf, offset)
      offset += stringBuf.byteLength
      outArray.set([0], offset)
      offset += 1
    })

    {
      const padding = roundUp(offset, 4) - offset
      outArray.set(Array(padding).fill(0xff), offset)
      offset += padding
    }

    // Footer
    const footer = new Uint8Array(data.footer.unk)
    outArray.set(footer, offset)
  }
  return outArray.buffer
}
