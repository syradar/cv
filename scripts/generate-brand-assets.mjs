import { createRequire } from "node:module"
import { readFile, writeFile } from "node:fs/promises"

// Reuse the image processor shipped with Astro; no additional dependency is needed.
const require = createRequire(import.meta.resolve("astro"))
const sharp = require("sharp")
const root = new URL("../", import.meta.url)
const publicFile = (name) => new URL(`public/${name}`, root)
const escape = (value) =>
  value.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll('"', "&quot;")
const favicon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128"><rect width="128" height="128" rx="28" fill="#b83a00"/><g fill="none" stroke="#fff" stroke-width="8" stroke-linecap="square" stroke-linejoin="round"><path d="M24 42h12c27 0 27 44 0 44H24Z"/><path d="M70 86V42l15 23 15-23v44"/></g></svg>`

await writeFile(publicFile("favicon.svg"), favicon)
const icon = await sharp(Buffer.from(favicon)).resize(32, 32).png().toBuffer()
const header = Buffer.alloc(22)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(1, 4)
header[6] = 32
header[7] = 32
header.writeUInt16LE(1, 10)
header.writeUInt16LE(32, 12)
header.writeUInt32LE(icon.length, 14)
header.writeUInt32LE(22, 18)
await writeFile(publicFile("favicon.ico"), Buffer.concat([header, icon]))
await sharp(Buffer.from(favicon))
  .resize(180, 180)
  .png()
  .toFile(publicFile("apple-touch-icon.png").pathname)

const pattern = await readFile(publicFile("hero-pattern.svg"))
const background = `data:image/svg+xml;base64,${pattern.toString("base64")}`
const locales = ["en", "sv"]

for (const locale of locales) {
  const cv = JSON.parse(await readFile(new URL(`src/data/cv.${locale}.json`, root), "utf8"))
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
    <defs><pattern id="contours" width="600" height="600" patternUnits="userSpaceOnUse"><image href="${background}" width="600" height="600"/></pattern></defs>
    <rect width="1200" height="630" fill="#b83a00"/>
    <rect width="1200" height="630" fill="url(#contours)" opacity="0.65"/>
    <g fill="#fff" font-family="Arial, Helvetica, sans-serif">
      <text x="76" y="94" font-size="21" letter-spacing="4" font-weight="700">${locale === "sv" ? "FRONTENDUTVECKLARE &amp; DESIGNER" : "FRONTEND ENGINEER &amp; DESIGNER"}</text>
      <text x="72" y="245" font-size="116" font-weight="700" letter-spacing="-6">David</text>
      <text x="72" y="365" font-size="116" font-weight="700" letter-spacing="-6">Malmström</text>
      <text x="76" y="444" font-size="39">${escape(cv.headline)}</text>
      <path d="M76 502H1124" stroke="#fff" stroke-opacity="0.4"/>
      <text x="76" y="562" font-size="27" font-weight="700">syradar.se</text>
      <text x="1124" y="562" text-anchor="end" font-size="23">${escape(cv.location)}</text>
    </g>
    <rect x="1036" y="58" width="88" height="88" rx="20" fill="#fff" fill-opacity="0.12" stroke="#fff" stroke-opacity="0.5"/>
    <g transform="translate(1036 58) scale(0.6875)" fill="none" stroke="#fff" stroke-width="8" stroke-linejoin="round"><path d="M24 42h12c27 0 27 44 0 44H24Z"/><path d="M70 86V42l15 23 15-23v44"/></g>
  </svg>`

  await sharp(Buffer.from(svg))
    .png()
    .toFile(publicFile(`og-${locale}.png`).pathname)
}
