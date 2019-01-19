import {assert, test} from "https://deno.land/x/testing/mod.ts";
import {assertEqual} from "https://deno.land/x/pretty_assert/mod.ts";
import {request} from "./request.ts";

test(async function testRequestGet() {
    const {status, statusText, headers, body} = await request({
        url: "http://httpbin.org/get?deno=land",
        method: "GET",
        headers: new Headers({
            "Content-Type": "application/json"
        })
    });
    assertEqual(status, 200);
    assertEqual(statusText, "OK");
    assertEqual(headers.has("content-type"), true);
    assert(headers.get("content-type").match(/application\/json/) !== null);
    const json = JSON.parse(body.toString());
    assertEqual(json["args"]["deno"], "land");
});


test(async function testRequestPost() {
    const {status, statusText, headers, body} = await request({
        url: "http://httpbin.org/post",
        method: "POST",
        data: "wayway",
        headers: new Headers({
            "Host": "httpbin.org",
            "Content-Type": "application/json"
        })
    });
    assertEqual(status, 200);
    assertEqual(statusText, "OK");
    assertEqual(headers.has("content-type"), true);
    assert(headers.get("content-type").match(/application\/json/) !== null);
    const json = JSON.parse(body.toString());
    assertEqual(json["data"], "wayway");
});
