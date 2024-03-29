import EleventyFetch from '@11ty/eleventy-fetch'
import { artistCapitalization, sanitizeMediaString } from './helpers/music.js'

export default async function () {
  const MUSIC_KEY = process.env.API_KEY_LASTFM
  const url = `https://ws.audioscrobbler.com/2.0/?method=user.gettopalbums&user=coryd_&api_key=${MUSIC_KEY}&limit=8&format=json&period=7day`
  const formatAlbumData = (albums) => albums.map((album) => {
    return {
      title: album['name'],
      artist: artistCapitalization(album['artist']['name']),
      plays: album['playcount'],
      rank: album['@attr']['rank'],
      image: `https://cdn.coryd.dev/albums/${encodeURIComponent(sanitizeMediaString(album['artist']['name']).replace(/\s+/g, '-').toLowerCase())}-${encodeURIComponent(sanitizeMediaString(album['name'].replace(/[:\/\\,'']+/g
      , '').replace(/\s+/g, '-').toLowerCase()))}.jpg`,
      url: album['mbid']
        ? `https://musicbrainz.org/album/${album['mbid']}`
        : `https://musicbrainz.org/taglookup/index?tag-lookup.artist=${album['artist'][
            'name'
          ].replace(/\s+/g, '+')}&tag-lookup.release=${album['name'].replace(/\s+/g, '+')}`,
      type: 'album',
    }
  })

  const res = EleventyFetch(url, {
    duration: '1h',
    type: 'json',
  }).catch()
  const data = await res
  return formatAlbumData(data['topalbums']['album'])
}
