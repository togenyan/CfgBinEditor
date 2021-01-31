export interface CfgBinFile {
  header: Header
  codes: Code[]
  stringTable: StringTable
  keyTable: KeyTable
  footer: Footer
}

export interface Header {
  codeCount: number
  stringTableOffset: number
  stringTableSize: number
  unk: number
}

export interface Code {
  crc32: number
  values: Value[]
}

export type Value = FloatValue | IntValue | StringPointerValue | UnknownValue

export interface IntValue {
  tag: 0
  value: number
}

export interface FloatValue {
  tag: 1
  value: number
}

export interface StringPointerValue {
  tag: 2
  value: number
}

export interface UnknownValue {
  tag: 3
  value: number
}

export type StringTable = Record<number, string>

export type KeyTable = Record<number, string>

export interface Footer {
  unk: number[]
}
