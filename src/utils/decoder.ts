import type {
  CfgBinFile,
  Code,
  CodeGroup,
  Header,
  KeyTable,
  StringTable,
  Value,
  ValueTag,
} from '../types.ts'

const roundUp = (n: number, exp: number): number => Math.ceil(n / exp) * exp

const CHARSET = 'utf8'

const parseCodes = (buf: ArrayBuffer, codeCount: number): CodeGroup[] => {
  const codeGroups = [] as CodeGroup[]
  const view = new DataView(buf)
  {
    let pos = 0
    let codes = [] as Code[]
    let prevParamTypes = [] as ValueTag[]
    let prevCrcValue = 0
    for (let i = 0; i < codeCount; i += 1) {
      const code = {} as Code
      code.crc32 = view.getUint32(pos, true)
      pos += 4
      const paramCount = view.getUint8(pos)
      const paramTypes = [] as ValueTag[]
      for (let j = 0; j < Math.ceil(paramCount / 4); j += 1) {
        pos += 1
        const paramType = view.getUint8(pos)
        for (let k = 0; k < 4; k += 1) {
          const tag = (paramType >> (2 * k)) & 3
          paramTypes.push({
            0: "string" as const,
            1: "int" as const,
            2: "float" as const,
            3: "unknown" as const,
          }[tag as 0 | 1 | 2 | 3])
        }
      }
      paramTypes.splice(paramCount)
      pos += 4 - (pos % 4)
      code.values = [] as Value[]
      for (let j = 0; j < paramCount; j += 1) {
        code.values.push({
          tag: paramTypes[j],
          value: view.getUint32(pos, true),
        })
        pos += 4
      }
      //debugger
      if (i > 0
        && (prevParamTypes.length !== paramTypes.length
          || prevParamTypes.some((val, idx) => val !== paramTypes[idx])
          || prevCrcValue !== code.crc32)) {
        codeGroups.push({
          crc32: prevCrcValue,
          codes,
          columns: prevParamTypes,
        })
        codes = [] as Code[]
      }
      prevParamTypes = paramTypes
      prevCrcValue = code.crc32
      codes.push(code)
    }
    if (codes.length > 0) {
      codeGroups.push({
        crc32: prevCrcValue,
        codes,
        columns: prevParamTypes
      })
    }
  }
  return codeGroups
}

const parseStringTable = (buf: ArrayBuffer): StringTable => {
  const textDecoder = new TextDecoder(CHARSET, {
    fatal: true,
  })
  const arr = new Uint8Array(buf)
  const stringTable = {} as StringTable
  let strBuf = [] as Array<number>
  let lastOffset = 0
  for (const [idx, val] of arr.entries()) {
    if (val === 0) {
      stringTable[lastOffset] = textDecoder.decode(Uint8Array.from(strBuf))
      lastOffset = idx + 1
      strBuf.splice(0)
    } else {
      strBuf.push(val)
    }
  }
  if (strBuf.length) {
    stringTable[lastOffset] = textDecoder.decode(Uint8Array.from(strBuf))
  }
  return stringTable
}

const parseKeyTable = (buf: ArrayBuffer): KeyTable => {
  const textDecoder = new TextDecoder(CHARSET, {
    fatal: true,
  })
  const view = new DataView(buf)
  const keyTable = {} as KeyTable
  const keyCount = view.getUint32(4, true)
  const keyStringOffset = view.getUint32(8, true)
  const keyStringLength = view.getUint32(12, true)
  const keyStringBlob = new Uint8Array(buf, keyStringOffset, keyStringLength)
  for (let i = 0; i < keyCount; i += 1) {
    const crc32 = view.getUint32(0x10 + i * 8, true)
    const stringStart = view.getUint32(0x10 + i * 8 + 4, true)
    const stringEnd = keyStringBlob.findIndex(
      (char, idx) => idx >= stringStart && char === 0
    )
    const stringBuf = keyStringBlob.subarray(stringStart, stringEnd)
    keyTable[crc32] = textDecoder.decode(stringBuf)
  }
  return keyTable
}

export const decodeArrayBuffer = (buf: ArrayBuffer): CfgBinFile => {
  const view = new DataView(buf)

  const header: Header = {
    codeCount: view.getUint32(0, true),
    stringTableOffset: view.getUint32(4, true),
    stringTableSize: view.getUint32(8, true),
    unk: view.getUint32(12, true),
  }
  if (buf.byteLength < header.stringTableOffset + header.stringTableSize)
    throw new RangeError(
      'The given file is too small than declared in the header'
    )

  const codesBlob = buf.slice(0x10, header.stringTableOffset)
  const codes = parseCodes(codesBlob, header.codeCount)

  const stringTableBlob = buf.slice(
    header.stringTableOffset,
    header.stringTableOffset + header.stringTableSize
  )
  const stringTable = parseStringTable(stringTableBlob)

  const keyTableOffset = roundUp(
    header.stringTableOffset + header.stringTableSize,
    16
  )
  const keyTableSize = view.getUint32(keyTableOffset, true)
  const keyTableBlob = buf.slice(keyTableOffset, keyTableOffset + keyTableSize)
  const keyTable = parseKeyTable(keyTableBlob)

  return {
    header,
    codes,
    stringTable,
    footer: { unk: [] },
    keyTable,
  }
}
