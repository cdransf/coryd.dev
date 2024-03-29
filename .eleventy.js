import syntaxHighlight from '@11ty/eleventy-plugin-syntaxhighlight'
import tablerIcons from '@cdransf/eleventy-plugin-tabler-icons'
import postGraph from '@rknightuk/eleventy-plugin-post-graph'

import markdownIt from 'markdown-it'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItFootnote from 'markdown-it-footnote'
import htmlmin from 'html-minifier-terser'

import filters from './config/filters/index.js'
import { slugifyString } from './config/utils/index.js'
import { svgToJpeg } from './config/events/index.js'
import { minifyJsComponents } from './config/events/index.js'
import { searchIndex, tagList, tagMap, postStats, tagsSortedByCount } from './config/collections/index.js'
import { img } from './config/shortcodes/index.js'

import { execSync } from 'child_process'

// load .env
import dotenvFlow from 'dotenv-flow'
dotenvFlow.config()

// get app version
import { createRequire } from 'module'

const require = createRequire(import.meta.url)
const appVersion = require('./package.json').version

/**
 *  @param {import("@11ty/eleventy/src/UserConfig")} eleventyConfig
 */
export default async function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight)
  eleventyConfig.addPlugin(tablerIcons)
  eleventyConfig.addPlugin(postGraph, {
    boxColorLight: '#d9dee4',
    highlightColorLight: '#2563eb',
    textColorLight: '#1f2937',
    boxColorDark: '#4b515d',
    highlightColorDark: '#60a5fa',
    textColorDark: '#fff',
  })

  // quiet build output
  eleventyConfig.setQuietMode(true)

  // template options
  eleventyConfig.setLiquidOptions({
    jsTruthy: true,
  })

  // passthrough
  eleventyConfig.addPassthroughCopy('src/assets')
  eleventyConfig.addPassthroughCopy('_redirects')
  eleventyConfig.addPassthroughCopy({
    'node_modules/@daviddarnes/mastodon-post/mastodon-post.js': 'assets/scripts/components/mastodon-post.js'
  })
  eleventyConfig.addPassthroughCopy({
    'node_modules/minisearch/dist/umd/index.js': 'assets/scripts/components/minisearch.js',
  })
  eleventyConfig.addPassthroughCopy({
    'node_modules/@cdransf/api-text/api-text.js': 'assets/scripts/components/api-text.js',
  })
  eleventyConfig.addPassthroughCopy({
    'node_modules/@cdransf/theme-toggle/theme-toggle.js': 'assets/scripts/components/theme-toggle.js',
  })
  eleventyConfig.addPassthroughCopy({
    'node_modules/@zachleat/webcare-webshare/webcare-webshare.js': 'assets/scripts/components/webcare-webshare.js'
  })
  eleventyConfig.addPassthroughCopy({
    'node_modules/youtube-video-element/youtube-video-element.js': 'assets/scripts/components/youtube-video-element.js'
  })

  // enable merging of tags
  eleventyConfig.setDataDeepMerge(true)

  // create excerpts
  eleventyConfig.setFrontMatterParsingOptions({
    excerpt: true,
    excerpt_alias: 'post_excerpt',
    excerpt_separator: '<!-- excerpt -->',
  })

  // collections
  eleventyConfig.addCollection('searchIndex', searchIndex)
  eleventyConfig.addCollection('tagList', tagList)
  eleventyConfig.addCollection('tagMap', tagMap)
  eleventyConfig.addCollection('postStats', postStats)
  eleventyConfig.addCollection('tagsSortedByCount', tagsSortedByCount)

  const md = markdownIt({ html: true, linkify: true })
  md.use(markdownItAnchor, {
    level: [1, 2],
    permalink: markdownItAnchor.permalink.headerLink({
      safariReaderFix: true,
    }),
  })
  md.use(markdownItFootnote)
  eleventyConfig.setLibrary('md', md)

  // filters
  eleventyConfig.addLiquidFilter('markdown', (content) => {
    if (!content) return
    return md.render(content)
  })
  Object.keys(filters).forEach((filterName) => {
    eleventyConfig.addLiquidFilter(filterName, filters[filterName])
  })
  eleventyConfig.addFilter('slugify', slugifyString)

  // shortcodes
  eleventyConfig.addShortcode('image', img)
  eleventyConfig.addShortcode('appVersion', () => appVersion)

  // transforms
  eleventyConfig.addTransform('html-minify', (content, path) => {
    if (path && path.endsWith('.html')) {
      return htmlmin.minify(content, {
        collapseBooleanAttributes: true,
        collapseWhitespace: true,
        decodeEntities: true,
        includeAutoGeneratedTags: false,
        minifyCSS: true,
        minifyJS: true,
        minifyURLs: true,
        noNewlinesBeforeTagClose: true,
        quoteCharacter: '"',
        removeComments: true,
        sortAttributes: true,
        sortClassName: true,
        useShortDoctype: true,
        processScripts: ['application/ld+json'], // minify JSON-LD scripts
      })
    }
    return content
  })

  // events
  eleventyConfig.on('afterBuild', svgToJpeg)
  eleventyConfig.on('afterBuild', minifyJsComponents)

  return {
    passthroughFileCopy: true,
    dir: {
      input: 'src',
      includes: '_includes',
      data: '_data',
      output: '_site',
    },
  }
}
