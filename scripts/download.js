import Url from "url";
import Path from "path";
import Svgr from "@svgr/core";
import Puppeteer from "puppeteer";
import Filesystem from "fs-extra";

import camelcase from "camelcase";

const scriptsDir = Path.dirname(Url.fileURLToPath(import.meta.url));
const currentDir = Path.resolve(scriptsDir, "..");
const iconsDir = Path.resolve(currentDir, "icons");

await Filesystem.ensureDir(iconsDir);

let browser = await Puppeteer.launch({ headless: false });
let [page] = await browser.pages();

await page.goto("https://tablericons.com/", { waitUntil: "networkidle2" });

let icons = await page.evaluate(function () {
	let result = {};
	let elements = document.querySelectorAll(`div[class="flex items-center justify-center flex-1 mx-auto"] > svg.icon`);

	for (let element of elements) {
		let elementHtml = element.outerHTML;
		let componentName = element.parentElement.parentElement.innerText;

		result[componentName] = elementHtml;
	}

	return result;
});

for (let iconName in icons) {
	let iconHtml = icons[iconName];
	let iconFilename = iconName + ".svg";
	let iconFilePath = Path.resolve(iconsDir, iconFilename);

	await Filesystem.writeFile(iconFilePath, iconHtml);
}

await browser.close();
