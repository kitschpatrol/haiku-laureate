import "dotenv/config";
import { syllable } from "syllable";
import NodeGeocoder from "node-geocoder";
import nodeFetch from "node-fetch";
import _ from "lodash";
import Flickr from "flickr-sdk";

// This script generates a haiku about a particular location based on the
// titles of nearby flickr photographs.

type LatLon = [lat: number, lon: number];

function countSyllables(word: string): number {
  return syllable(word);
}

function hasVowels(s: string): boolean {
  return /[aeiou]+/.test(s);
}

function isPicture(s: string): boolean {
  return /jpg$|gif$|png$|jpeg$/.test(s);
}

function isTiny(s: string): boolean {
  return s.length <= 1;
}

function isNumeric(s: string): boolean {
  return /\d+/.test(s);
}

function isTerminallyBoring(s: string): boolean {
  // Words to be excluded entirely
  return ["lat", "lon", "geo", "unitedstates"].includes(s);
}

function isBoring(s: string): boolean {
  return [
    "i",
    "the",
    "of",
    "and",
    "to",
    "or",
    "a",
    "on",
    "at",
    "for",
    "is",
    "in",
    "your",
    "you",
    "it",
    "that",
    "this",
  ].includes(s);
}

// Addres to latitude longitude
// Switched from Google to OpenStreetMap to avoid API requirement
async function geocode(address: string): Promise<LatLon> {
  const geocoder = NodeGeocoder({
    provider: "openstreetmap",
    fetch: function fetch(url, options) {
      return nodeFetch(url, {
        ...options,
        headers: {
          "user-agent": "Haiku Warrior <eric@ericmika.com>",
        },
      });
    },
  });

  const response = await geocoder.geocode(address);

  // TODO better way to validate?
  if (
    typeof response == "object" &&
    Array.isArray(response) &&
    response.length > 0 &&
    Object.prototype.hasOwnProperty.call(response[0], "latitude") &&
    Object.prototype.hasOwnProperty.call(response[0], "longitude")
  ) {
    return [response[0].latitude, response[0].longitude];
  } else {
    throw new Error("Bad Geocode!");
  }
}

// Get Flickr tags for a given location
// Returns a map with the word and its frequency, sorted by descending frequency
// Todo calc syllables as well?
async function findTagsForLocation(location: LatLon): Promise<Map<string, number>> {
  const flickrApiKey = process.env.FLICKR_API_KEY;
  const flickr = new Flickr(flickrApiKey);

  // Search Flickr for images near the address given.
  // Moar info on thie API call: https://www.flickr.com/services/api/flickr.photos.search.html
  const tags = new Map<string, number>();
  const tagsWanted = 150;
  let searchRadius = 1;
  let currentPage = 1;

  // TODO max tries...
  while (tags.size < tagsWanted) {
    // TODO throws... but errors bubble up?
    const response = await flickr.photos.search({
      page: currentPage,
      lat: location[0],
      lon: location[1],
      min_taken_date: "1900-01-01 00:00:00",
      accuracy: 16,
      radius: searchRadius,
      per_page: 250, // Docs claim 500 max, but I only ever get 250...
      extras: "tags",
    });

    const totalPages = response.body.photos.pages;

    response.body.photos.photo.forEach((photo) => {
      // Also strips punctuation
      _.words(photo.tags).forEach((word) => {
        // Validate...
        if (!isTiny(word) && !isNumeric(word) && hasVowels(word) && !isPicture(word) && !isTerminallyBoring(word)) {
          if (!tags.has(word)) {
            tags.set(word, 1);
          } else {
            tags.set(word, tags.get(word) + 1);
          }
        }
      });
    });

    if (currentPage >= totalPages) {
      currentPage = 0;
      searchRadius += 1;
      //console.log(`Expanding search radius to ${searchRadius}km`);
    } else {
      currentPage++;
      //console.log(`Scraping page ${currentPage}`);
    }
  }

  // sort the map (insertion order)
  // https://stackoverflow.com/a/31159284
  const sortedTags = new Map(
    [...tags.entries()].sort((a, b) => {
      return b[1] - a[1];
    }),
  );

  return sortedTags;
}

function generateHaikuFromTags(tags: Map<string, number>, quantity = 1): string {
  // Generate the Haiku
  const usedWords = new Array<string>(); // Make sure we only use words once.
  const rows = [5, 7, 5]; // Set the syllable scheme and row cout.
  let haiku = "";

  [...Array(quantity).keys()].forEach(() => {
    rows.forEach((syllablesWanted) => {
      let syllablesInRow = 0;
      let usedBoring = 0;

      // Go through each tag, sorted by frequency.
      tags.forEach((frequency, word) => {
        // Make sure the word won't put us past the syllable limit for the row.
        const syllablesInWord = countSyllables(word);
        const tentativeStyllablesInRow = syllablesInRow + syllablesInWord;

        if (isBoring(word) && usedBoring > 0) {
          // Skip the boring word...
          return;
        }

        if (usedWords.includes(word)) {
          // Keep looking, already used it
          return;
        }

        if (tentativeStyllablesInRow == syllablesWanted && isBoring(word)) {
          //don't end a line with a boring word
          return;
        }

        if (tentativeStyllablesInRow <= syllablesWanted) {
          if (isBoring(word)) {
            usedBoring = 1; // we used our boring card for this line...
          }

          haiku += word + " ";

          syllablesInRow = tentativeStyllablesInRow;
          usedWords.push(word);

          // Optionally print syllable count for a sanity check.
          // console.log(`${word} has ${syllablesInWord} syllables`);
        }
      });

      haiku = haiku.trim() + "\n";
    });

    haiku += "\n";
  });

  return haiku;
}

export async function generateHaikuForAddress(address: string, quantity = 1): Promise<string> {
  const location = await geocode(address);
  const tags = await findTagsForLocation(location);
  const haiku = generateHaikuFromTags(tags, quantity);

  return haiku;
}
