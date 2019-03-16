import {assert, assertEquals} from "https://deno.land/std@v0.3.1/testing/asserts.ts";
import {runIfMain, test} from "https://deno.land/std@v0.3.1/testing/mod.ts";
import {StringReader} from "https://deno.land/std@v0.3.1/io/readers.ts";
import {request} from "./request.ts";
import {encode} from "https://deno.land/std@v0.3.1/strings/strings.ts";
import Buffer = Deno.Buffer;
import Reader = Deno.Reader;

async function readString(r: Reader) {
  const buf = new Buffer();
  await Deno.copy(buf, r);
  return buf.toString();
}
test(async function testRequestGet() {
  const { status, headers, body } = await request({
    url: "http://httpbin.org/get?deno=land",
    method: "GET",
    headers: new Headers({
      "Content-Type": "application/json"
    })
  });
  assertEquals(status, 200);
  assertEquals(headers.has("content-type"), true);
  assert(headers.get("content-type").match(/application\/json/) !== null);
  const str = await readString(body);
  const json = JSON.parse(str);
  assertEquals(json["args"]["deno"], "land");
});

test(async function testRequestPost() {
  const { status, headers, body } = await request({
    url: "http://httpbin.org/post",
    method: "POST",
    body: encode("wayway"),
  });
  assertEquals(status, 200);
  assertEquals(headers.has("content-type"), true);
  assert(headers.get("content-type").match(/application\/json/) !== null);
  const str = await readString(body);
  const json = JSON.parse(str);
  assertEquals(json["data"], "wayway");
});

test(async function testRequestPostChunked() {
  const { status, headers, body } = await request({
    url: "http://httpbin.org/post",
    method: "POST",
    body: new StringReader("waywaywayway")
  });
  assertEquals(status, 200);
  assertEquals(headers.has("content-type"), true);
  assert(headers.get("content-type").match(/application\/json/) !== null);
  const str = await readString(body);
  const json = JSON.parse(str);
  assertEquals(json["data"], "waywaywayway");
});

test(async function testBasicAuth() {
  const { status } = await request({
    url: "http://httpbin.org/basic-auth/username/password",
    method: "GET",
    basicAuth: {
      username: "username",
      password: "password"
    }
  });
  assertEquals(status, 200);
});
runIfMain(import.meta);
