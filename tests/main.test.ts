import 'dotenv/config'
import { expect, it } from 'vitest'
import { generateHaikuForAddress } from '../src/index'

function getFlickrApiKey(): string {
	const flickrApiKey = process.env.FLICKR_API_KEY
	if (flickrApiKey === undefined) {
		throw new Error('Missing FLICKR_API_KEY, run `pnpm run init` to create the .env file')
	}

	return flickrApiKey
}

it(
	'generates haiku for a dense address',
	{
		timeout: 60_000,
	},
	async () => {
		const address = '123 William Street, New York NY'

		const result = await generateHaikuForAddress(address, getFlickrApiKey())

		console.log(result)
		expect(result).not.toBe('')
	},
)

it(
	'generates haiku for a sparse address',
	{
		timeout: 60_000,
	},
	async () => {
		const address = '106 3rd St Climax, Kansas'
		const result = await generateHaikuForAddress(address, getFlickrApiKey())

		// These might not be stable over long durations...
		console.log(result)
		expect(result).not.toBe('')
	},
)

it(
	'handles invalid address',
	{
		timeout: 60_000,
	},
	async () => {
		await expect(async () => {
			const address = '3412341234239489823498712034908124'
			const result = await generateHaikuForAddress(address, getFlickrApiKey())
			console.log(result)
		}).rejects.toThrow('Bad Geocode!')
	},
)
