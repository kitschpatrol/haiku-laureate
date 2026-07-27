import { generateHaikuForAddress } from '../src/index'

// Cloudflare Workers entry point, mounted on the frontiernerds.com zone at
// /api/haiku-laureate*. Requests to any other path under the route fall
// through to the next handler for the zone.

type Env = {
	// eslint-disable-next-line ts/naming-convention
	FLICKR_API_KEY: string
}

const worker = {
	async fetch(request: Request, env: Env): Promise<Response> {
		const url = new URL(request.url)

		if (url.pathname !== '/api/haiku-laureate') {
			return fetch(request)
		}

		const response: Record<string, unknown> = {}
		const address = url.searchParams.get('address') ?? undefined

		// Check for address
		if (address === undefined || address.length === 0) {
			response.status = 'error'
			response.reason = 'You need to pass a URL-encoded "address" query parameter'
		} else {
			response.address = address

			try {
				const haiku = await generateHaikuForAddress(address, env.FLICKR_API_KEY)
				response.status = 'success'
				response.haiku = haiku
			} catch (error) {
				response.status = 'error'
				response.reason = error instanceof Error ? error.message : 'Unknown error'
			}
		}

		return Response.json(response, {
			headers: {
				'content-type': 'application/json; charset=utf-8',
			},
		})
	},
}

export default worker
