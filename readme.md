# Haiku Laureate

[![Netlify Status](https://api.netlify.com/api/v1/badges/f35e1ada-effe-440d-b130-c54f070476e0/deploy-status)](https://app.netlify.com/sites/haiku-laureate/deploys)

## Overview

This is a service which generates geographically-aware haiku for any location.

It's implemented in TypeScript + Node.js, and is exposed through a simple API service intended for deployment on Netlify. Note that it cannot be deployed to Cloudflare Workers because it depends on Node APIs.

Note the rewrite to provide a cleaner API URL.

## Usage

### As a Node library

```ts
import { generateHaikuForAddress } from "../../src/main";

const haiku = await generateHaikuForAddress(123 William Street, New York NY)

console.log(haiku);
```

### Via web API

Request

```
/api/generate?address=123%20william%20street%20new%20york%20new%20york
```

Response:

```json
{
  "address": "123 William Street, New York NY",
  "status": "success",
  "haiku": "newyork manhattan\nnewyorkcity usa street\npatbo city bridge\n\n"
}
```

## Development

### Setup

```
npm install netlify-cli -g
npm i
```

### Iteration

```
npm run test:watch
```

### Local Netlify Function testing

```
npm run build:watch-netlify
```

## Dev Notes

Command line version?

```
$ npm i yargs
$ npm i @types/yargs -D # for TypeScript
```

Yeesh
https://github.com/microsoft/TypeScript-Node-Starter#typescript--node
Better?
https://github.com/metachris/typescript-boilerplate/blob/master/package.json

Better — no old typescript version
https://github.com/jaredpalmer/tsdx

Using this one...
https://github.com/jsynowiec/node-typescript-boilerplate

Testing internal functions

Giving up on rewire...
https://github.com/kulshekhar/ts-jest/issues/1029
https://weekly.elfitz.com/2018/10/17/using-rewire-with-typescript-jest/

Config... .env file
