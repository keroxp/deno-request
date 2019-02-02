import { copy, Reader, ReadResult, Writer } from "deno";

const decoder = new TextDecoder();
const encoder = new TextEncoder();

export class StringWriter implements Writer {
  constructor(private buf: string = "") {}

  async write(p: Uint8Array): Promise<number> {
    this.buf += decoder.decode(p);
    return p.byteLength;
  }

  toString(): string {
    return this.buf;
  }
}

export async function readString(reader: Reader): Promise<string> {
  const w = new StringWriter();
  await copy(w, reader);
  return w.toString();
}

export class StringReader implements Reader {
  private buf: Uint8Array;
  private offs: number = 0;

  constructor(str: string) {
    this.buf = encoder.encode(str);
  }

  async read(p: Uint8Array): Promise<ReadResult> {
    let bytesToRead = Math.min(p.byteLength, this.buf.byteLength - this.offs);
    p.set(this.buf.slice(this.offs, this.offs + bytesToRead));
    this.offs += bytesToRead;
    return { nread: bytesToRead, eof: this.offs === this.buf.byteLength };
  }
}
