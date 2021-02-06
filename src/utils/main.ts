import { decodeArrayBuffer } from './decoder.ts'

const main = async (): Promise<number> => {
  if (Deno.args.length < 1) {
    console.log("Specify a file")
    return 1
  }
  const buf = await Deno.readFile(Deno.args[0])
  decodeArrayBuffer(buf.buffer)
  return 0
}
main()
