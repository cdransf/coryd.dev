import { DateTime } from 'luxon'
import ics from 'ics'

const BASE_URL = 'https://coryd.dev'

const tagsToHashtags = (tags) => {
  const hashtags = tags.map(tag => {
    const words = tag.split(' ')
    const hashtag = words.map(word => {
      const normalizedWord = word.toLowerCase()
      const wordMap = {
        'ai': 'AI',
        'css': 'CSS',
        'ios': 'iOS',
        'javascript': 'JavaScript',
        'macos': 'macOS',
        'tv': 'TV'
      }
      if (wordMap[normalizedWord]) return wordMap[normalizedWord]
      return word.charAt(0).toUpperCase() + word.slice(1)
    }).join('')
    return '#' + hashtag
  })
  return hashtags.join(' ')
}

export const popularPosts = (collection) => {
  const collectionData = collection.getAll()[0]
  const { data } = collectionData
  const { posts, analytics } = data

  return posts
    .filter((post) => {
      if (analytics.find((p) => p.page.includes(post.slug))) return true
    })
    .sort((a, b) => {
      const visitors = (page) => analytics.filter((p) => p.page.includes(page.slug)).pop()?.visitors
      return visitors(b) - visitors(a)
    })
}

export const processContent = (collection) => {
  const searchIndex = []
  const aggregateContent = []
  const siteMapContent = []
  let id = 0
  const collectionData = collection.getAll()[0]
  const { data } = collectionData
  const { posts, links, movies, books, pages, artists, genres, tv } = data

  const parseDate = (date) => {
    if (!date) return null
    let parsedDate = DateTime.fromISO(date)
    if (!parsedDate.isValid) parsedDate = DateTime.fromFormat(date, 'yyyy-MM-dd')
    if (!parsedDate.isValid) parsedDate = DateTime.fromFormat(date, 'MM/dd/yyyy')
    if (!parsedDate.isValid) parsedDate = DateTime.fromFormat(date, 'dd-MM-yyyy')
    return parsedDate.isValid ? parsedDate : null
  }

  const addSiteMapContent = (items, getTitle, getDate) => {
    const addedUrls = new Set()

    if (items) {
      items.forEach((item) => {
        let url
        if (item?.['url']) url = item['url']
        if (item?.['permalink']) url = item['permalink']
        if (item?.['slug']) url = item['slug']
        if (!url || addedUrls.has(url)) return

        const parsedDate = getDate ? parseDate(getDate(item)) : null
        const formattedDate = parsedDate ? parsedDate.toFormat("yyyy-MM-dd'T'HH:mm:ssZZ") : null

        const content = {
          url,
          title: getTitle(item),
          date: formattedDate
        }
        siteMapContent.push(content)
        addedUrls.add(url)
      })
    }
  }

  const movieData = movies['movies'].filter((movie) => movie['review']?.length && movie['rating'])
  const bookData = books.all.filter((book) => book['review']?.length && book['rating'])

  const addItemToIndex = (items, icon, getUrl, getTitle, getTags) => {
    if (items) {
      items.forEach((item) => {
        searchIndex.push({
          id,
          url: getUrl(item),
          title: `${icon}: ${getTitle(item)}`,
          tags: getTags ? getTags(item) : []
        })
        id++
      })
    }
  }

  const addContent = (items, icon, getTitle, getDate) => {
    if (items) {
      items.forEach((item) => {
        let attribution

        if (item?.['authors']?.['mastodon']) {
          const mastoUrl = new URL(item['authors']['mastodon'])
          attribution = `${mastoUrl.pathname.replace('/', '')}@${mastoUrl.host}`
        } else if (!item?.['authors']?.['mastodon'] && item?.['authors']?.['name']) {
          attribution = item['authors']['name']
        }

        const content = {
          url: `${BASE_URL}${item['url']}`,
          title: `${icon}: ${getTitle(item)}${attribution ? ' via ' + attribution : ''}${item?.['tags']?.length > 0 ? ' ' + tagsToHashtags(item['tags']) : ''}`
        }
        if (item?.['link']) content['url'] = item?.['link']
        if (item?.['slug']) content['url'] = new URL(item['slug'], BASE_URL).toString()
        if (item?.['description']) {
          content['description'] = `${item['description'].split(' ').slice(0, 25).join(' ')}...<br/><br/>`
        } else {
          content['description'] = ''
        }

        const date = getDate ? parseDate(getDate(item)) : null
        if (date) content['date'] = date
        aggregateContent.push(content)
      })
    }
  }
  addItemToIndex(posts, '📝', (item) => new URL(item['slug'], BASE_URL).toString(), (item) => item['title'], (item) => item['tags'])
  addItemToIndex(links, '🔗', (item) => item['link'], (item) => item['title'], (item) => item['tags'])
  addItemToIndex(artists, '🎙️', (item) => item['url'], (item) => `${item['name']} (${item['country']}) - ${item['genre']}`, (item) => `['${item['genre']}']`)
  addItemToIndex(genres, '🎵', (item) => item['url'], (item) => item['name'], (item) => item.artists.map(artist => artist['name_string']))
  if (movieData) addItemToIndex(movieData, '🎥', (item) => item['url'], (item) => `${item['title']} (${item['rating']})`, (item) => item['tags'])
  if (bookData) addItemToIndex(bookData, '📖', (item) => item['url'], (item) => `${item['title']} (${item['rating']})`, (item) => item['tags'])

  addContent(posts, '📝', (item) => item['title'], (item) => item['date'])
  addContent(links, '🔗', (item) => item['title'], (item) => item['date'])
  addContent(books.all.filter((book) => book['status'] === 'finished'), '📖', (item) => `${item['title']}${item['rating'] ? ' (' + item['rating'] + ')' : ''}`, (item) => item['date'])
  addContent(movies['movies'], '🎥', (item) => `${item['title']}${item['rating'] ? ' (' + item['rating'] + ')' : ''}`, (item) => item['lastWatched'])

  addSiteMapContent(posts, (item) => item.title, (item) => item.date)
  addSiteMapContent(pages, (item) => item.title, (item) => item.date)
  addSiteMapContent(artists, (item) => item.name, (item) => item.date)
  addSiteMapContent(genres, (item) => item.name, (item) => item.date)
  addSiteMapContent(movies['movies'], (item) => item.title, (item) => item.date)
  addSiteMapContent(books.all, (item) => item.title, (item) => item.date)
  addSiteMapContent(tv?.['shows'], (item) => item.title, (item) => item.date)

  return {
    searchIndex,
    allContent: aggregateContent.sort((a, b) => {
      const dateA = a['date'] ? DateTime.fromISO(a['date']) : DateTime.fromMillis(0)
      const dateB = b['date'] ? DateTime.fromISO(b['date']) : DateTime.fromMillis(0)
      return dateB - dateA
    }),
    siteMap: siteMapContent.sort((a, b) => {
      const dateA = a['date'] ? DateTime.fromISO(a['date']) : DateTime.fromMillis(0)
      const dateB = b['date'] ? DateTime.fromISO(b['date']) : DateTime.fromMillis(0)
      return dateB - dateA
    })
  }
}

export const albumReleasesCalendar = (collection) => {
  const collectionData = collection.getAll()[0]
  const { data } = collectionData
  const { albumReleases } = data
  if (!albumReleases || albumReleases.length === 0) return ''
  const events = albumReleases.map(album => {
    const date = DateTime.fromFormat(album.date, 'MMMM d, yyyy')
    if (!date.isValid) return null

    return {
      start: [date.year, date.month, date.day],
      startInputType: 'local',
      startOutputType: 'local',
      title: `Release: ${album.artist} - ${album.title}`,
      description: `Check out this new album release: ${album.url}`,
      url: album.url,
      uid: `${date.toFormat('yyyyMMdd')}-${album.artist}-${album.title}@coryd.dev`,
      timestamp: DateTime.now().toUTC().toFormat("yyyyMMdd'T'HHmmss'Z'")
    };
  }).filter(event => event !== null)

  const { error, value } = ics.createEvents(events)
  if (error) {
    console.error('Error creating events: ', error)
    events.forEach((event, index) => {
      console.error(`Event ${index}:`, event)
    })
    return ''
  }

  return value
}