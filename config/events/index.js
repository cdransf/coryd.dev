import fs from "fs";
import path from "path";
import { minify } from "terser";

export const minifyJsComponents = async () => {
  const scriptsDir = "dist/assets/scripts";

  const minifyJsFilesInDir = async (dir) => {
    const files = fs.readdirSync(dir);
    for (const fileName of files) {
      const filePath = path.join(dir, fileName);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        await minifyJsFilesInDir(filePath);
      } else if (fileName.endsWith(".js")) {
        const fileContent = fs.readFileSync(filePath, "utf8");
        const minified = await minify(fileContent);
        if (minified.error) {
          console.error(`Error minifying ${filePath}:`, minified.error);
        } else {
          fs.writeFileSync(filePath, minified.code);
        }
      } else {
        console.log(`No .js files to minify in ${filePath}`);
      }
    }
  };

  await minifyJsFilesInDir(scriptsDir);
};
