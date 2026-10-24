// Chrome is only needed locally to generate the PDFs (`pnpm pdf`); skip the download on CI/Cloudflare.
const onCi = Boolean(process.env.CI || process.env.CF_PAGES || process.env.WORKERS_CI);

/** @type {import("puppeteer").Configuration} */
module.exports = {
  skipDownload: onCi,
};
