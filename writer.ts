import Reader = Deno.Reader;
import Writer = Deno.Writer;
import { BufReader, BufWriter } from "https://deno.land/std@v0.3.1/io/bufio.ts";

const encoder = new TextEncoder();

export type HttpRequest = {
  method: string;
  url: string;
  headers?: Headers;
  body?: Reader;
  bodySize?: number;
  basicAuth?: {
    username: string;
    password: string;
  };
};

export async function writeHttpRequest(w: Writer, opts: HttpRequest) {
  const writer = new BufWriter(w);
  const { method, basicAuth, body } = opts;
  const url = new URL(opts.url);
  let { headers, bodySize } = opts;
  if (!headers) {
    headers = new Headers();
  }
  // start line
  const lines = [`${method} ${url.pathname}${url.search || ""} HTTP/1.1`];
  // header
  if (!headers.has("Host")) {
    headers.set("Host", url.host);
  }
  if (basicAuth && !headers.has("Authorization")) {
    const { username, password } = basicAuth;
    const base64 = btoa(`${username}:${password}`);
    headers.set("Authorization", `Basic ${base64}`);
  }
  let hasContentLength = Number.isInteger(bodySize);
  if (body) {
    if (hasContentLength) {
      if (!headers.has("Content-Length")) {
        headers.set("Content-Length", `${bodySize}`);
      } else if (headers.get("Content-Length") !== `${bodySize}`) {
        throw new RangeError("");
      }
    } else {
      headers.set("Transfer-Encoding", "chunked");
    }
  }
  for (const [key, value] of headers) {
    lines.push(`${key}: ${value}`);
  }
  lines.push("\r\n");
  const headerText = lines.join("\r\n");
  await writer.write(encoder.encode(headerText));
  await writer.flush();
  if (body) {
    const reader = new BufReader(body);
    const buf = new Uint8Array(1024);
    while (true) {
      const { nread, eof } = await reader.read(buf);
      if (nread > 0) {
        const chunk = buf.slice(0, nread);
        if (hasContentLength) {
          await writer.write(chunk);
        } else {
          const size = chunk.byteLength.toString(16);
          await writer.write(encoder.encode(`${size}\r\n`));
          await writer.write(chunk);
          await writer.write(encoder.encode("\r\n"));
        }
        await writer.flush();
      }
      if (eof) {
        if (!hasContentLength) {
          await writer.write(encoder.encode("0\r\n\r\n"));
          await writer.flush();
        }
        break;
      }
    }
  }
}
