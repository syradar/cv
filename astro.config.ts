// @ts-check
import type { AstroIntegration } from "astro"
import { defineConfig, fontProviders } from "astro/config"

// The identity comparison page only exists under `astro dev`.
const devCompareRoute: AstroIntegration = {
  name: "syr-dev-compare-route",
  hooks: {
    "astro:config:setup": ({ command, injectRoute }) => {
      if (command !== "dev") return
      injectRoute({
        pattern: "/design-system/compare",
        entrypoint: "./src/dev/compare.astro",
      })
    },
  },
}

export default defineConfig({
  site: "https://syradar.se",
  integrations: [devCompareRoute],
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Bricolage Grotesque",
      cssVariable: "--font-bricolage-grotesque",
      weights: ["200 800"],
      options: {
        experimental: {
          variableAxis: {
            wdth: [[75, 100]],
            opsz: [[12, 96]],
          },
        },
      },
    },
    {
      // Use full local fonts to preserve discretionary ligatures and true small caps.
      provider: fontProviders.local(),
      name: "Junicode",
      cssVariable: "--font-junicode",
      options: {
        variants: [
          {
            src: ["./src/assets/fonts/junicode/roman.woff2"],
            weight: "300 700",
            stretch: "75% 125%",
            style: "normal",
          },
          {
            src: ["./src/assets/fonts/junicode/italic.woff2"],
            weight: "300 700",
            stretch: "75% 125%",
            style: "italic",
          },
        ],
      },
    },
    {
      provider: fontProviders.google(),
      name: "Inter",
      cssVariable: "--font-inter",
      weights: ["100 900"],
    },
  ],
  i18n: {
    locales: ["en", "sv"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
    },
  },
})
