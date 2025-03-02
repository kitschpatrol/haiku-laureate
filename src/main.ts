import 'dotenv/config'
import Flickr from 'flickr-sdk'
// eslint-disable-next-line ts/naming-convention
import _ from 'lodash'
import NodeGeocoder from 'node-geocoder'
import { syllable } from 'syllable'

// This script generates a haiku about a particular location based on the
// titles of nearby flickr photographs.

type LatLon = [lat: number, lon: number]

function countSyllables(word: string): number {
	return syllable(word)
}

function hasVowels(s: string): boolean {
	return /[aeiou]+/.test(s)
}

function isPicture(s: string): boolean {
	return /jpg$|gif$|png$|jpeg$/.test(s)
}

function isTiny(s: string): boolean {
	return s.length <= 1
}

function isNumeric(s: string): boolean {
	return /\d+/.test(s)
}

function isTerminallyBoring(s: string): boolean {
	// Words to be excluded entirely
	return ['geo', 'lat', 'lon', 'unitedstates'].includes(s)
}

function isBoring(s: string): boolean {
	return [
		'a',
		'and',
		'at',
		'for',
		'i',
		'in',
		'is',
		'it',
		'of',
		'on',
		'or',
		'that',
		'the',
		'this',
		'to',
		'you',
		'your',
	].includes(s)
}

// Address to latitude longitude
// Switched from Google to OpenStreetMap to avoid API requirement
async function geocode(address: string): Promise<LatLon> {
	// eslint-disable-next-line new-cap
	const geocoder = NodeGeocoder({
		// @ts-expect-error - Liminal fetch zone...
		async fetch(url, init) {
			const response = fetch(url as string, {
				...((init ?? {}) as RequestInit),
				headers: {
					'user-agent': 'Haiku Warrior <eric@ericmika.com>',
				},
			})

			return response
		},
		provider: 'openstreetmap',
	})

	const response = await geocoder.geocode(address)

	// TODO better way to validate?
	if (
		typeof response === 'object' &&
		Array.isArray(response) &&
		response.length > 0 &&
		Object.hasOwn(response[0], 'latitude') &&
		Object.hasOwn(response[0], 'longitude')
	) {
		return [response[0].latitude ?? 0, response[0].longitude ?? 0]
	}

	throw new Error('Bad Geocode!')
}

// Get Flickr tags for a given location
// Returns a map with the word and its frequency, sorted by descending frequency
// Todo calc syllables as well?
async function findTagsForLocation(location: LatLon): Promise<Map<string, number>> {
	const flickrApiKey = process.env.FLICKR_API_KEY
	if (flickrApiKey === undefined) {
		throw new Error('Missing FLICKR_API_KEY')
	}

	const flickr = new Flickr(flickrApiKey)

	// Search Flickr for images near the address given.
	// Moar info on the API call: https://www.flickr.com/services/api/flickr.photos.search.html
	const tags = new Map<string, number>()
	const tagsWanted = 150
	let searchRadius = 1
	let currentPage = 1

	// TODO max tries...
	while (tags.size < tagsWanted) {
		// TODO throws... but errors bubble up?

		const response = (await flickr.photos.search({
			accuracy: 16,
			extras: 'tags',
			lat: location[0],
			lon: location[1],
			// eslint-disable-next-line ts/naming-convention
			min_taken_date: '1900-01-01 00:00:00',
			page: currentPage,
			// eslint-disable-next-line ts/naming-convention
			per_page: 250, // Docs claim 500 max, but I only ever get 250...
			radius: searchRadius,
		})) as {
			// TODO real types...
			body: {
				photos: {
					pages: number
					photo: Array<{
						tags: string
					}>
				}
			}
		}

		const totalPages = response.body.photos.pages

		// Wtf, photos.photo?
		for (const photo of response.body.photos.photo) {
			// Also strips punctuation
			for (const word of _.words(photo.tags)) {
				// Validate...
				if (
					!isTiny(word) &&
					!isNumeric(word) &&
					hasVowels(word) &&
					!isPicture(word) &&
					!isTerminallyBoring(word)
				) {
					// eslint-disable-next-line max-depth
					if (tags.has(word)) {
						tags.set(word, (tags.get(word) ?? 0) + 1)
					} else {
						tags.set(word, 1)
					}
				}
			}
		}

		if (currentPage >= totalPages) {
			currentPage = 0
			searchRadius += 1
			// Console.log(`Expanding search radius to ${searchRadius}km`);
		} else {
			currentPage++
			// Console.log(`Scraping page ${currentPage}`);
		}
	}

	// Sort the map (insertion order)
	// https://stackoverflow.com/a/31159284
	const sortedTags = new Map([...tags.entries()].sort((a, b) => b[1] - a[1]))

	return sortedTags
}

function generateHaikuFromTags(tags: Map<string, number>, quantity = 1): string {
	// Generate the Haiku
	const usedWords = new Array<string>() // Make sure we only use words once.
	const rows = [5, 7, 5] // Set the syllable scheme and row cout.
	let haiku = ''

	for (let i = 0; i < quantity; i++) {
		for (const syllablesWanted of rows) {
			let syllablesInRow = 0
			let usedBoring = 0

			// Go through each tag, sorted by frequency.
			for (const [word, _] of tags.entries()) {
				// Make sure the word won't put us past the syllable limit for the row.
				const syllablesInWord = countSyllables(word)
				const tentativeSyllablesInRow = syllablesInRow + syllablesInWord

				if (isBoring(word) && usedBoring > 0) {
					// Skip the boring word...
					continue
				}

				if (usedWords.includes(word)) {
					// Keep looking, already used it
					continue
				}

				if (tentativeSyllablesInRow === syllablesWanted && isBoring(word)) {
					// Don't end a line with a boring word
					continue
				}

				if (tentativeSyllablesInRow <= syllablesWanted) {
					// eslint-disable-next-line max-depth
					if (isBoring(word)) {
						usedBoring = 1 // We used our boring card for this line...
					}

					haiku += word + ' '

					syllablesInRow = tentativeSyllablesInRow
					usedWords.push(word)

					// Optionally print syllable count for a sanity check.
					// console.log(`${word} has ${syllablesInWord} syllables`);
				}
			}

			haiku = haiku.trim() + '\n'
		}

		haiku += '\n'
	}

	return haiku
}

/**
 * Generate a haiku about a given address from geographically adjacent Flickr photos.
 * @param address - The address to generate a haiku for, reasonably forgiving.
 * @param quantity - The number of haikus to generate.
 */
export async function generateHaikuForAddress(address: string, quantity = 1): Promise<string> {
	const location = await geocode(address)
	const tags = await findTagsForLocation(location)
	const haiku = generateHaikuFromTags(tags, quantity)

	return haiku
}
