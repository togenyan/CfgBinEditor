export interface CfgBinFile {
  header: Header
  codes: CodeGroup[]
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

export interface CodeGroup {
  crc32: number
  columns: ValueTag[]
  codes: Code[]
}

export interface Code {
  crc32: number
  values: Value[]
}

export type Value = FloatValue | IntValue | StringPointerValue | UnknownValue
export type ValueTag = Value['tag']

export interface IntValue {
  tag: "int"
  value: number
}

export interface FloatValue {
  tag: "float"
  value: number
}

export interface StringPointerValue {
  tag: "string"
  value: number
}

export interface UnknownValue {
  tag: "unknown"
  value: number
}

export type StringTable = Record<number, string>

export type KeyTable = Record<number, string>

export interface Footer {
  unk: number[]
}
