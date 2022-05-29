import Url from "url";
import Path from "path";
import Svgr from "@svgr/core";
import Filesystem from "fs-extra";

import camelcase from "camelcase";

const scriptsDir = Path.dirname(Url.fileURLToPath(import.meta.url));
const currentDir = Path.resolve(scriptsDir, "..");

const sourceIconsDir = Path.resolve(currentDir, "icons");
const targetIconsDir = Path.resolve(currentDir, "source", "icons");

const indexFilePath = Path.resolve(currentDir, "source", "index.js");
const typesFilePath = Path.resolve(currentDir, "source", "index.d.ts");

await Filesystem.remove(targetIconsDir);
await Filesystem.remove(indexFilePath);
await Filesystem.remove(typesFilePath);

await Filesystem.ensureDir(targetIconsDir);

let iconFilenames = await Filesystem.readdir(sourceIconsDir);
for (let filename of iconFilenames) {
	let filePath = Path.resolve(sourceIconsDir, filename);

	if (filename === "2fa.svg") filename = "two-factor-authentication.svg";
	if (filename === "3d-cube-sphere.svg") filename = "three-dimensions-cube-sphere.svg";

	let content = await Filesystem.readFile(filePath, "utf-8");
	let componentName = camelcase(filename.replace(/\.svg$/, ""), { pascalCase: true }) + "Icon";
	let componentFilename = filename.replace(/\.svg$/, ".jsx");
	let componentFilePath = Path.resolve(targetIconsDir, componentFilename);

	let component = await Svgr.transform(content, { icon: 24 }, { componentName });
	let componentType = `export function ${componentName}(props: any): any;\n`;
	let componentExport = `export { default as ${componentName} } from './icons/${componentFilename}';\n`;

	await Filesystem.writeFile(componentFilePath, component);
	await Filesystem.writeFile(typesFilePath, componentType, { flag: "a" });
	await Filesystem.writeFile(indexFilePath, componentExport, { flag: "a" });
}
