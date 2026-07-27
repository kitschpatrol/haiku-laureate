<!-- title -->

# haiku-laureate

<!-- /title -->

<!-- badges -->

[![License: CC-BY-NC-SA-4.0](https://img.shields.io/badge/License-CC--BY--NC--SA--4.0-yellow.svg)](https://creativecommons.org/licenses/by-nc-sa/4.0/legalcode)
[![CI](https://github.com/kitschpatrol/haiku-laureate/actions/workflows/ci.yml/badge.svg)](https://github.com/kitschpatrol/haiku-laureate/actions/workflows/ci.yml)

<!-- /badges -->

<!-- description -->

**A geolocated haiku generator.**

<!-- /description -->

## Overview

This is a service which generates geographically-aware haiku for any location. It was created in 2010.

It's implemented in TypeScript, and is exposed through a simple API service deployed to a Cloudflare Worker. The service was ported from its original Python implementation (saved in `/archive`) in March 2022.

An interactive version is available on [frontiernerds.com](https://frontiernerds.com/haiku-laureate).

## Usage

### Via web API

Request

```sh
curl -s "https://frontiernerds.com/api/haiku-laureate?address=123%20william%20street%20new%20york%20new%20york" | jq
```

Response:

```json
{
  "address": "123 william street new york new york",
  "status": "success",
  "haiku": "newyork manhattan\nnewyorkcity usa street\nlowermanhattan\n\n"
}
```

### As a module

_This package is not published to NPM, so module resolution is up to the user._

```ts
import { generateHaikuForAddress } from 'haiku-laureate'

const haiku = await generateHaikuForAddress('123 William Street, New York NY', 'flickr-api-key')

console.log(haiku)
```

<!-- license -->

## License

[CC-BY-NC-SA-4.0](license.txt) © [Eric Mika](https://ericmika.com)

<!-- /license -->
