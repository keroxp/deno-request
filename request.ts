import Buffer = Deno.Buffer;

const { dial } = Deno;
import { BufReader, BufWriter } from "https://deno.land/std@v0.3.1/io/bufio.ts";
import { TextProtoReader } from "https://deno.land/std@v0.3.1/textproto/mod.ts";
import {
  BodyReader,
  ChunkedBodyReader
} from "https://denopkg.com/keroxp/servest@v0.1.1/readers.ts";
import Reader = Deno.Reader;
import Writer = Deno.Writer;
import Conn = Deno.Conn;

const kPortMap = {
  "http:": "80",
  "https:": "443"
};

const encoder = new TextEncoder();

export type HttpRequest = {
  method: string;
  url: string;
  headers?: Headers;
  body?: Reader | Uint8Array;
  basicAuth?: {
    username: string;
    password: string;
  };
};

export type HttpResponse = {
  status: number;
  statusText: string;
  headers: Headers;
  body: Reader;
  conn: Conn;
};

function normalizeRequest(params: string | HttpRequest) {
  let req: HttpRequest;
  let url: URL;
  if (typeof params === "string") {
    url = new URL(params);
    req = {
      url: params,
      method: "GET"
    };
  } else {
    url = new URL(params.url);
    req = params;
  }
  url.port = url.port || kPortMap[url.protocol];
  return { url, req };
}

export async function request(
  params: string | HttpRequest
): Promise<HttpResponse> {
  const { url, req } = normalizeRequest(params);
  const conn = await dial("tcp", `${url.hostname}:${url.port}`);
  await writeHttpRequest(conn, req);
  const res = await readHttpResponse(conn);
  return Object.assign(res, { conn });
}

async function writeHttpRequest(w: Writer, opts: HttpRequest) {
  const writer = new BufWriter(w);
  const { method, basicAuth, body } = opts;
  const url = new URL(opts.url);
  let { headers } = opts;
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
  let hasContentLength = body instanceof Uint8Array;
  if (body) {
    if (body instanceof Uint8Array) {
      if (!headers.has("Content-Length")) {
        headers.set("Content-Length", `${body.byteLength}`);
      } else if (headers.get("Content-Length") !== `${body.byteLength}`) {
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
    const reader = body instanceof Uint8Array ? new Buffer(body) : body;
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

async function readHttpResponse(
  r: Reader
): Promise<{
  status: number;
  statusText: string;
  headers: Headers;
  body: Reader;
}> {
  const reader = new BufReader(r);
  const tpReader = new TextProtoReader(reader);
  // read status line
  const [resLine, state] = await tpReader.readLine();
  const [m, _, status, statusText] = resLine.match(/^([^ ]+)? (\d{3}) (.+?)$/);
  // read header
  const [headers] = await tpReader.readMIMEHeader();
  // read body
  const resContentLength = headers.get("content-length");
  const contentLength = parseInt(resContentLength);
  let bodyReader: Reader;
  if (headers.get("transfer-encoding") !== "chunked") {
    bodyReader = new BodyReader(reader, contentLength);
  } else {
    bodyReader = new ChunkedBodyReader(reader);
  }
  return {
    status: parseInt(status),
    statusText,
    headers,
    body: bodyReader
  };
}
