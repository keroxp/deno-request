import { dial } from "deno";
import { HttpRequest, writeHttpRequest } from "./writer.ts";
import { HttpResponse, readHttpResponse } from "./reader.ts";

const kPortMap = {
  "http:": "80",
  "https:": "443"
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
  try {
    await writeHttpRequest(conn, req);
    return readHttpResponse(conn, conn);
  } catch (e) {
    conn.close();
    throw e;
  }
}
