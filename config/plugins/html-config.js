import htmlmin from "html-minifier-terser";

export const htmlConfig = (eleventyConfig) => {
  eleventyConfig.addTransform("html-minify", (content, path) => {
    if (path && path.endsWith(".html")) {
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
      });
    }

    return content;
  });
};
