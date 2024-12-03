import fs from "node:fs/promises";
import path from "node:path";
import postcss from "postcss";
import postcssImport from "postcss-import";
import postcssImportExtGlob from "postcss-import-ext-glob";
import autoprefixer from "autoprefixer";
import cssnano from "cssnano";

export const cssConfig = (eleventyConfig) => {
  eleventyConfig.addTemplateFormats("css");
  eleventyConfig.addExtension("css", {
    outputFileExtension: "css",
    compile: async (inputContent, inputPath) => {
      const outputPath = "dist/assets/css/index.css";

      if (inputPath.endsWith("index.css")) {
        return async () => {
          let result = await postcss([
            postcssImportExtGlob,
            postcssImport,
            autoprefixer,
            cssnano,
          ]).process(inputContent, { from: inputPath });

          await fs.mkdir(path.dirname(outputPath), { recursive: true });
          await fs.writeFile(outputPath, result.css);

          return result.css;
        };
      }
    },
  });
};
