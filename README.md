# deno-request
![https://travis-ci.org/keroxp/deno-request.svg?branch=master](https://travis-ci.org/keroxp/deno-request.svg?branch=master)

An experimental implementation of http request client based on `dial` for deno

# Description

Http requester based on [dial](https://deno.land/typedoc/index.html#dial). Currently support only http request (not https).

# Usage

## GET

```main.ts
import {request} from "https://denopkg.com/keroxp/deno-request/request.ts"
import {readString, StringReader} from "https://denopkg.com/keroxp/deno-request/strings.ts"
// GET
const {status, headers, body} = await request("http://httpbin.org/get?deno=land");
const str = await readString(new StringReader(body))
const json = JSON.parse(str)

```

## POST

```main.ts
import {request} from "https://denopkg.com/keroxp/deno-request/request.ts"
import {readString, StringReader} from "https://denopkg.com/keroxp/deno-request/strings.ts"
// POST
const bodyText = "wayway"
const {status, headers, body} = await request({
    url: "http://httpbin.org/post",
    method: "POST",
    body:  new StringReader(bodyText);,
    bodySize: bodyText.length, // optional
    headers: new Headers({
        "Content-Type": "application/json"
    })
});
const str = await readString(new StringReader(body))
const json = JSON.parse(str)
json["data"]; // wayway
```

## Download file

```main.ts
import {request} from "https://denopkg.com/keroxp/deno-request/request.ts"
import {open, copy} from "deno"
const {body} = await request("http://httpbin.org/get?deno=land");
const f = await open("out.json")
await copy(f, body)
f.close()
```
