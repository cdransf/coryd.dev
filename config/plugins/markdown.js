import markdownIt from "markdown-it";
import markdownItAnchor from "markdown-it-anchor";
import markdownItFootnote from "markdown-it-footnote";
import markdownItLinkAttributes from "markdown-it-link-attributes";
import markdownItPrism from "markdown-it-prism";

export const markdownLib = markdownIt({ html: true, linkify: true })
  .use(markdownItAnchor, {
    level: [1, 2],
    permalink: markdownItAnchor.permalink.headerLink({
      safariReaderFix: true,
    }),
  })
  .use(markdownItLinkAttributes, [
    {
      matcher(href) {
        return href.match(/^https?:\/\//);
      },
      attrs: {
        rel: "noopener",
      },
    },
  ])
  .use(markdownItFootnote)
  .use(markdownItPrism);
