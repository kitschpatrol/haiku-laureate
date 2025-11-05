import type { Handler } from '@netlify/functions'
import { generateHaikuForAddress } from '../../src/main'

const handler: Handler = async (event) => {
	const response: Record<string, unknown> = {}

	const { address } = event.queryStringParameters ?? {}

	// Check for address
	if (address === undefined || address.length === 0) {
		response.status = 'error'
		response.reason = 'You need to pass a URL-encoded "address" query parameter'
	} else {
		response.address = address

		try {
			const haiku = await generateHaikuForAddress(address)
			response.status = 'success'
			response.haiku = haiku
		} catch (error) {
			response.status = 'error'
			response.reason = error instanceof Error ? error.message : 'Unknown error'
		}
	}

	return {
		body: JSON.stringify(response),
		headers: {
			'access-control-allow-origin': 'https://frontiernerds.com',
			'Content-Type': 'application/json; charset=utf-8',
			// "access-control-allow-origin": "*",
		},
		statusCode: 200,
	}
}

export { handler }
