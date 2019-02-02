import { assert, runTests, test } from "https://deno.land/x/testing/mod.ts";
import { assertEqual } from "https://deno.land/x/pretty_assert/mod.ts";
import { request } from "./request.ts";
import { readString, StringReader } from "./strings.ts";

test(async function testRequestGet() {
  const { status, headers, body } = await request({
    url: "http://httpbin.org/get?deno=land",
    method: "GET",
    headers: new Headers({
      "Content-Type": "application/json"
    })
  });
  assertEqual(status, 200);
  assertEqual(headers.has("content-type"), true);
  assert(headers.get("content-type").match(/application\/json/) !== null);
  const str = await readString(body);
  const json = JSON.parse(str);
  assertEqual(json["args"]["deno"], "land");
});

test(async function testRequestPost() {
  const { status, headers, body } = await request({
    url: "http://httpbin.org/post",
    method: "POST",
    body: new StringReader("wayway"),
    bodySize: 6
  });
  assertEqual(status, 200);
  assertEqual(headers.has("content-type"), true);
  assert(headers.get("content-type").match(/application\/json/) !== null);
  const str = await readString(body);
  const json = JSON.parse(str);
  assertEqual(json["data"], "wayway");
});

test(async function testRequestPostChunked() {
  const { status, headers, body } = await request({
    url: "http://httpbin.org/post",
    method: "POST",
    body: new StringReader("waywaywayway")
  });
  assertEqual(status, 200);
  assertEqual(headers.has("content-type"), true);
  assert(headers.get("content-type").match(/application\/json/) !== null);
  const str = await readString(body);
  const json = JSON.parse(str);
  assertEqual(json["data"], "waywaywayway");
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
  assertEqual(status, 200);
});
runTests();
