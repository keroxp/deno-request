# deno-request
An experimental implementation of http request client based on `dial` for deno

# Description

Http requester based on [dial](https://deno.land/typedoc/index.html#dial). Currently support only http request (not https).
# Usage

```main.ts
import {request} from "https://denopkg.com/keroxp/deno-request/request.ts"

// GET
const {status, headers, body} = await request({
    url: "http://httpbin.org/get?deno=land",
    method: "GET",
    headers: new Headers({
        "Content-Type": "application/json"
    })
});
// POST
const {status, headers, body} = await request({
    url: "http://httpbin.org/post",
    method: "POST",
    data: "wayway",
    headers: new Headers({
        "Host": "httpbin.org",
        "Content-Type": "application/json"
    })
});
```
