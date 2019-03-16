# deno-request

![https://travis-ci.org/keroxp/deno-request.svg?branch=master](https://travis-ci.org/keroxp/deno-request.svg?branch=master)

An experimental implementation of http request client based on `dial` for deno

# Description

Http requester based on [dial](https://deno.land/typedoc/index.html#dial). Currently support only http request (not https).

# Usage

## GET

```main.ts
import {request} from "https://denopkg.com/keroxp/deno-request@v0.2.0/request.ts"
// GET
const {status, headers, body} = await request("http://httpbin.org/get?deno=land");
const buf = new Deno.Buffer();
await Deno.copy(buf, body);
const json = JSON.parse(buf.toString())

```

## POST

```main.ts
import {request} from "https://denopkg.com/keroxp/deno-request@v0.2.0/request.ts"
// POST
const {status, headers, body} = await request({
    url: "http://httpbin.org/post",
    method: "POST",
    body: new TextEncoder().encode("wayway");,
    headers: new Headers({
        "Content-Type": "application/json"
    })
});
const buf = new Deno.Buffer();
await Deno.copy(buf, body);
const json = JSON.parse(buf.toString())
json["data"]; // wayway
```

## Download file

```main.ts
import {request} from "https://denopkg.com/keroxp/deno-request@v0.2.0/request.ts"
const {body} = await request("http://httpbin.org/get?deno=land");
const f = await Deno.open("out.json")
await Deno.copy(f, body)
f.close()
```
