import { createRequire } from "module";
import dotenvFlow from "dotenv-flow";
import filters from "./config/filters/index.js";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import tablerIcons from "@cdransf/eleventy-plugin-tabler-icons";
import { minifyJsComponents } from "./config/events/index.js";
import {
  popularPosts,
  albumReleasesCalendar,
} from "./config/collections/index.js";
import plugins from "./config/plugins/index.js";

// load .env
dotenvFlow.config();

// get app version
const require = createRequire(import.meta.url);
const appVersion = require("./package.json").version;

export default async function (eleventyConfig) {
  eleventyConfig.addPlugin(syntaxHighlight);
  eleventyConfig.addPlugin(tablerIcons);
  eleventyConfig.addPlugin(plugins.cssConfig);
  eleventyConfig.addPlugin(plugins.htmlConfig);

  eleventyConfig.setQuietMode(true);
  eleventyConfig.configureErrorReporting({ allowMissingExtensions: true });
  eleventyConfig.setLiquidOptions({ jsTruthy: true });

  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("_redirects");
  eleventyConfig.addPassthroughCopy("_headers");
  eleventyConfig.addPassthroughCopy({
    "node_modules/@cdransf/api-text/api-text.js":
      "assets/scripts/components/api-text.js",
    "node_modules/@cdransf/select-pagination/select-pagination.js":
      "assets/scripts/components/select-pagination.js",
    "node_modules/minisearch/dist/umd/index.js":
      "assets/scripts/components/minisearch.js",
    "node_modules/youtube-video-element/youtube-video-element.js":
      "assets/scripts/components/youtube-video-element.js",
  });

  eleventyConfig.addCollection("popularPosts", popularPosts);
  eleventyConfig.addCollection("albumReleasesCalendar", albumReleasesCalendar);

  eleventyConfig.setLibrary("md", plugins.markdownLib);

  eleventyConfig.addLiquidFilter("markdown", (content) => {
    if (!content) return;
    return plugins.markdownLib.render(content);
  });

  Object.keys(filters).forEach((filterName) => {
    eleventyConfig.addLiquidFilter(filterName, filters[filterName]);
  });

  eleventyConfig.addShortcode("appVersion", () => appVersion);

  // events
  eleventyConfig.on("afterBuild", minifyJsComponents);

  return {
    dir: {
      input: "src",
      includes: "includes",
      layouts: "layouts",
      data: "data",
      output: "dist",
    },
  };
}
