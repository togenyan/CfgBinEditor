import CRC32 from 'crc-32'
import type {
  CfgBinFile,
  Code,
} from '../types'

const roundUp = (n: number, exp: number): number => Math.ceil(n / exp) * exp

const getCodeHeaderSizeInBytes = (code: Code): number => (
  4  // code.crc32
  + 1  // number of parameters
  + roundUp(Math.ceil(code.values.length / 4), 2)  // parameter types and padding
)

export const encodeToArrayBuffer = (data: CfgBinFile): ArrayBuffer => {
  const codeBufs = data.codes.map((codeGroup) => {
    codeGroup.codes.map((code) => {
      const headerSize = getCodeHeaderSizeInBytes(code)
      const codeBuf = new ArrayBuffer(headerSize + 4 * code.values.length)
      const codeBufView = new DataView(codeBuf)
      codeBufView.setUint32(0, code.crc32, true)
      codeBufView.setUint8(4, code.values.length)
      for (let i = 0; i < roundUp(code.values.length, 2) - code.values.length; i++) {
        codeBufView.setUint8(5 + i, 0xFF)
      }
      for (let i = 0; i < code.values.length; i++) {
        const val = code.values[i]
        if (val.tag === "float") {
          codeBufView.setFloat32(headerSize + 4 * i, val.value, true)
        } else {
          codeBufView.setUint32(headerSize + 4 * i, val.value, true)
        }
      }
      return codeBuf
    })
  }).flat() as unknown as Array<ArrayBuffer>

  // only available for utf-8
  const textEncoder = new TextEncoder()
  const stringTableBlobs = Array.from(Object.keys(data.stringTable).sort()).map(val =>
    textEncoder.encode(data.stringTable[val])
  )

  const header = new ArrayBuffer(16)
  const headerView = new Uint32Array(header)
  headerView[0] = data.codes.length
  headerView[1] = 16 + codeBufs.reduce((acc, cur) => acc + cur.byteLength, 0)
  headerView[2] = stringTableBlobs.reduce((acc, cur) => acc + cur.byteLength, 0) + stringTableBlobs.length
  headerView[3] = data.header.unk

  const keyTableBufs = []
  const keyTableStringBufs = []
  let keyStringBufLength = 0
  {
    for (const k of Object.keys(data.keyTable).sort()) {
      const key = data.keyTable[k]
      const buf = textEncoder.encode(key)
      keyTableStringBufs.push(buf)
      const keyBuf = new ArrayBuffer(8)
      const keyBufView = new DataView(keyBuf)
      keyBufView.setUint32(0, CRC32.str(key), true)
      keyBufView.setUint32(4, keyStringBufLength)
      keyTableBufs.push(
        keyBuf
      )
      keyStringBufLength += buf.byteLength + 1
    }
  }
  const keyTableHeader = new ArrayBuffer(16)
  const keyTableHeaderView = new Uint32Array(keyTableHeader)
  keyTableHeaderView[0] = 16 + 8 * Object.keys(data.keyTable).length + keyStringBufLength
  keyTableHeaderView[1] = Object.keys(data.keyTable).length
  keyTableHeaderView[2] = 16 + 8 * Object.keys(data.keyTable).length
  keyTableHeaderView[3] = keyStringBufLength

  const outBuf = new ArrayBuffer(
    headerView[1]
    + roundUp(headerView[2], 4)
    + keyTableHeaderView[2]
    + roundUp(keyTableHeaderView[3], 4)
  )
  const outArray = new Uint8Array(outBuf)
  {
    let offset = 0
    outArray.set(new Uint8Array(header), 0)
    offset += 16

    codeBufs.forEach(
      (codeBuf) => {
        outArray.set(new Uint8Array(codeBuf), offset)
        offset += codeBuf.byteLength
      }
    )

    stringTableBlobs.forEach(
      (stringBuf) => {
        outArray.set(
          stringBuf,
          offset
        )
        offset += stringBuf.byteLength
        outArray.set(
          [0],
          offset
        )
        offset += 1
      }
    )

    {
      const padding = roundUp(offset, 4) - offset
      outArray.set(
        Array(padding).fill(0xFF),
        offset
      )
      offset += padding
    }

    outArray.set(new Uint8Array(keyTableHeader), offset)
    offset += 16

    keyTableStringBufs.forEach(
      (keyBuf) => {
        outArray.set(
          keyBuf,
          offset
        )
        offset += keyBuf.byteLength
      }
    )

    keyTableStringBufs.forEach(
      (stringBuf) => {
        outArray.set(
          stringBuf,
          offset
        )
        offset += stringBuf.byteLength
        outArray.set(
          [0],
          offset
        )
        offset += 1
      }
    )

    {
      const padding = roundUp(offset, 4) - offset
      outArray.set(
        Array(padding).fill(0xFF),
        offset
      )
      offset += padding
    }

    // unk
  }

  return outArray.buffer
}

