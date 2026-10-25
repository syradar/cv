import { mkdir, readFile, writeFile } from "node:fs/promises"
import { createServer } from "node:http"
import { extname, relative, resolve, sep } from "node:path"
import { once } from "node:events"
import puppeteer from "puppeteer"

// Serve the built site from dist/, but write PDFs to public/ so they are committed
// and shipped as static assets (Cloudflare's build has no Chrome to generate them).
const siteDirectory = resolve("dist")
const outputDirectory = resolve("public")
const pages = [
  { route: "/", filename: "cv-david-malmstrom-en.pdf" },
  { route: "/sv/", filename: "cv-david-malmstrom-sv.pdf" },
]

// Chrome stamps the current time into the PDF, which would make every run differ.
// The replacement has the same length, so the PDF's byte offsets stay valid.
const FIXED_DATE = "D:20000101000000+00'00'"
const pinPdfDates = (pdf) =>
  Buffer.from(
    Buffer.from(pdf)
      .toString("latin1")
      .replace(/\/(CreationDate|ModDate) \(D:[^)]*\)/g, `/$1 (${FIXED_DATE})`),
    "latin1",
  )

await mkdir(outputDirectory, { recursive: true })

const mimeTypes = new Map([
  [".css", "text/css"],
  [".html", "text/html"],
  [".js", "text/javascript"],
  [".svg", "image/svg+xml"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
])
const server = createServer(async (request, response) => {
  const pathname = new URL(request.url ?? "/", "http://127.0.0.1").pathname
  const relativePath =
    pathname === "/" ? "index.html" : pathname.endsWith("/") ? `${pathname}index.html` : pathname
  const filePath = resolve(siteDirectory, decodeURIComponent(relativePath).replace(/^\/+/, ""))

  const relativeFilePath = relative(siteDirectory, filePath)
  if (relativeFilePath === ".." || relativeFilePath.startsWith(`..${sep}`)) {
    response.writeHead(403).end()
    return
  }

  try {
    const contents = await readFile(filePath)
    response.writeHead(200, {
      "content-type": mimeTypes.get(extname(filePath)) ?? "application/octet-stream",
    })
    response.end(contents)
  } catch (error) {
    if (error.code === "ENOENT" || error.code === "EISDIR") {
      response.writeHead(404).end()
      return
    }
    console.error(`Failed to serve ${relativePath}:`, error)
    response.writeHead(500).end()
  }
})

server.listen(0, "127.0.0.1")
await once(server, "listening")
const { port } = server.address()
let browser

try {
  browser = await puppeteer.launch({ headless: "shell" })
  for (const { route, filename } of pages) {
    const page = await browser.newPage()
    const response = await page.goto(`http://127.0.0.1:${port}${route}`, {
      waitUntil: "networkidle0",
    })
    if (!response?.ok()) {
      throw new Error(`Could not load ${route} to generate ${filename}: ${response?.status()}`)
    }
    await page.emulateMediaType("print")
    await page.evaluate(() => document.fonts.ready)
    const bodyText = await page.$eval("body", (body) => body.innerText)
    if (!bodyText.trim()) {
      throw new Error(`Page ${route} rendered without content; refusing to generate ${filename}.`)
    }
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      displayHeaderFooter: false,
      margin: { top: "12mm", right: "12mm", bottom: "12mm", left: "12mm" },
    })
    await writeFile(resolve(outputDirectory, filename), pinPdfDates(pdf))
    await page.close()
    console.log(`Generated public/${filename}`)
  }
} finally {
  await browser?.close()
  server.close()
  await once(server, "close")
}
