import sys
import string
import flickrapi
from operator import itemgetter
import urllib
from xml.dom import minidom
import re
import nltk
from nltk_contrib.readability import textanalyzer
import ConfigParser

config = ConfigParser.RawConfigParser()
config.read('credentials.cfg')

# This script generates a haiku about a particular location based on the
# titles of nearby flickr photographs.

# Sample command line use:
# > python geo_haiku.py "721 broadway, new york ny"

# Optionally, pass the number of Haikus you want as a second argument:
# > python geo_haiku.py "721 broadway, new york ny" 3

# Set to true to print extra garbage.
debug = 0

# HELPER FUNCTIONS.

# Phonetic syllable counter via nltk_contrib.
# Dictionary-based approaches don't work reliably with the weird words of Flickr.
t = textanalyzer.textanalyzer('eng')
def count_syllables(word):
  temp_list = list()
  temp_list.append(word)
  count = t.countSyllables(temp_list)

  if count == 0:
    count = 1

  return count

def strip_punctuation(s):
  return s.translate(string.maketrans("",""), string.punctuation)

def has_vowel(s):
  return re.search(r'[aeiou]+', s)

def is_picture(s):
  return re.search(r'jpg$|gif$|png$|jpeg$', s)


def geocode(address):
  #google_maps_api_key = config.get("google", "map_key")
  geo_url = 'http://maps.googleapis.com/maps/api/geocode/xml?address=' + address
  geocode = urllib.urlopen(geo_url)
  geocode_xml = minidom.parse(geocode)

  result = geocode_xml.getElementsByTagName('result')[0].getElementsByTagName('geometry')[0].getElementsByTagName('location')[0]
  latitude = result.getElementsByTagName('lat')[0].firstChild.nodeValue
  longitude = result.getElementsByTagName('lng')[0].firstChild.nodeValue

  geocode.close()

  if debug: print address + ' is at lat: ' + latitude + ' lon: ' + longitude

  return (latitude, longitude)

def find_tags_for_location(latitude, longitude):
  # Get the Flickr lib here: http://stuvel.eu/projects/flickrapi
  flickr_api_key = config.get("flickr", "api_key")
  flickr_api_secret = config.get("flickr", "api_secret")
  flickr = flickrapi.FlickrAPI(flickr_api_key, flickr_api_secret, format='etree')

  tags = dict()
  tags_wanted = 150
  tags_found = 0
  search_radius = 1
  current_page = 1

  while tags_found < tags_wanted:
    # Search Flickr for images near the address given.
    # Moar info on the API call: http://www.flickr.com/services/api/flickr.photos.search.html
    geo_photos = flickr.photos_search(page = str(current_page), min_taken_date = '1900-01-01 00:00:00', lat = str(latitude), lon = str(longitude), accuracy = '16', radius = str(search_radius), per_page = '250', extras = 'tags')

    total_pages = int(geo_photos[0].attrib['pages'])

    if debug: print 'reading page ' + str(current_page) + ' of ' + str(total_pages)

    for photo in geo_photos.getiterator('photo'):
      # Originally planned on using tags, seems to give more interesting results
      # with photo titles instead.
      photo_tags = photo.attrib['title'].encode('ascii', 'ignore').split(' ')
      #photo_tags = photo.attrib['tags'].encode('ascii', 'ignore').split(' ')

      for tag in photo_tags:
        tag = strip_punctuation(tag.lower())
        # Add to the dictionary, otherwise increment the frequency count.
        # Make sure the tag exists, and don't let numbers through (they're boring),
        # and that is has a vowel, and that it doesn't look like a meta-reference to a filename.
        if (len(tag) >= 1) and not re.search(r'\d+', tag) and has_vowel(tag) and not is_picture(tag):
          if tag not in tags:
            tags[tag] = 1
          else:
            tags[tag] += 1

    # To get truly regional, need to subtract wider-area tags from a smaller search radius?
    # Maybe next iteration.

    # Update tags found.
    tags_found = len(tags)

    if debug: print 'Found ' + str(tags_found) + ' unique tags in a ' + str(search_radius) + ' mile radius'

    # If we didn't get everything we wanted, then we'll have to go to the next
    # page of Flickr result, or increase the search radius for the next round.
    # I found that I have to set a hard limit around 20 pages per search radius,
    # otherwise it's too tough to find unique tags.
    if (current_page >= total_pages) or (current_page >= 20):
      # Reset current page.
      current_page = 1

      # Bump the search radius.
      if debug: print 'Searching a larger area...'
      search_radius += 1
    else:
      # Search the next page.
      if debug: print 'Going to the next page'
      current_page += 1

  # Perhaps a cleaner way to sort dictionaries?
  # http://code.activestate.com/recipes/304440/
  if debug:
    # Print each word found, and its frequency.
    print '{'
    for tag in sorted(tags.items(), key = itemgetter(1), reverse = True):
      print '"' + tag[0] + '": '+ str(tag[1]) + ', '
    print '}'
    print '\n'

  return tags;

def generate_haiku_from_tags(tags, quantity=1):
  # GENERATE THE HAIKU.
  used_words = list() # Make sure we only use words once.
  rows = [5, 7, 5] # Set the syllable scheme and row cout.
  haiku = ''

  # Allow just one boring word per line, and don't let the line end in a boring word.
  boring_words = ['i', 'the', 'of', 'and', 'to', 'or', 'a', 'on', 'at', 'for', 'is', 'in', 'your', 'you', 'it', 'that', 'this']


  # Figure out how many haikus to write on the topic.
  haikus_wanted = quantity

  for i in range(haikus_wanted):
    # Build each row.
    for syllables_wanted in rows:
      syllables_in_row = 0
      used_boring = 0

      # Go through each tag, sorted by frequency.
      for tag in sorted(tags.items(), key = itemgetter(1), reverse = True):
        word = tag[0]

        # Make sure the word won't put us past the syllable limit for the row.
        syllables_in_word = count_syllables(strip_punctuation(word))
        tentative_syllables_in_row = syllables_in_row + syllables_in_word

        if (word in boring_words) and used_boring:
          # don't get to use more than one boring word per line.
          if debug: print word + ' is boring, and we already spent our boring allowance, skip it'
          continue

        if word in used_words:
          # keep looking if we already used the word
          continue

        if (tentative_syllables_in_row == syllables_wanted) and (word in boring_words):
          # don't end a line with a boring word
          continue

        if tentative_syllables_in_row <= syllables_wanted:

          if word in boring_words:
            if debug: print word + ' is boring...'
            used_boring = 1 # we used our boring card for this line...

          haiku += word + ' '
          syllables_in_row = tentative_syllables_in_row
          used_words.append(word)

          # Optionally print syllable count for a sanity check.
          if debug: print "\"" + word + "\" has " + str(syllables_in_word)

      haiku = haiku.strip() + '\n'

    # Keep writing haikus!
    haiku += '\n'

  return haiku;
  #return haiku.strip()


def generate_haiku_for_address(address, quantity):
  print "generating!"
  latlon = geocode(address);
  tags = find_tags_for_location(latlon[0], latlon[1])
  return generate_haiku_from_tags(tags, quantity)
