# hafas-rest-api-client

**A client with Typescript definitions for [`hafas-rest-api`](https://github.com/public-transport/hafas-rest-api) endpoints**, e.g. for [the `*.transport.rest` APIs](https://transport.rest/).

[![npm version](https://img.shields.io/npm/v/hafas-rest-api-client-ts.svg)](https://www.npmjs.com/package/hafas-rest-api-client-ts)
![ISC-licensed](https://img.shields.io/github/license/derhuerst/hafas-rest-api-client-ts.svg)
![minimum Node.js version](https://img.shields.io/node/v/hafas-rest-api-client-ts.svg)

## Installing

```shell
npm install hafas-rest-api-client-ts
```


## Usage

```js
import createClient from 'hafas-rest-api-client-ts'

const vbbClient = createClient('https://v5.vbb.transport.rest', {
	// Please pass in a User-Agent header to let the providers of the API endpoint understand how you're using their API.
	userAgent: 'my awesome project',
})

const res = await vbbClient.journeys('900000003201', '900000024101', {results: 1})
```

`hafas-rest-api-client` is a client for [`hafas-rest-api@3`](https://www.npmjs.com/package/hafas-rest-api/v/3.8.0) APIs. Check their individual API docs for all supported parameters.

The response objects have special [`Symbol`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol) fields for meta information:

```js
const {
	RESPONSE, HEADERS,
	SERVER_TIMING, CACHE,
} = require('hafas-rest-api-client')

console.log('response', res[RESPONSE]) // Fetch API Response object
console.log('response headers', res[HEADERS]) // Fetch API Headers object
console.log('server timing', res[SERVER_TIMING]) // value of the Server-Timing response header
console.log('server cache', res[CACHE]) // value of the X-Cache response header
```


## Contributing

If you have a question or have difficulties using `hafas-rest-api-client`, please double-check your code and setup first. If you think you have found a bug or want to propose a feature, refer to [the issues page](https://github.com/derhuerst/hafas-rest-api-client/issues).
