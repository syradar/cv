// @ts-check
import type { AstroIntegration } from "astro";
import { defineConfig, fontProviders } from "astro/config";

// The identity comparison page only exists under `astro dev`.
const devCompareRoute: AstroIntegration = {
  name: "syr-dev-compare-route",
  hooks: {
    "astro:config:setup": ({ command, injectRoute }) => {
      if (command !== "dev") return;
      injectRoute({
        pattern: "/design-system/compare",
        entrypoint: "./src/dev/compare.astro",
      });
    },
  },
};

export default defineConfig({
  integrations: [devCompareRoute],
  fonts: [
    {
      provider: fontProviders.google(),
      name: "Bricolage Grotesque",
      cssVariable: "--font-bricolage-grotesque",
      weights: ["400", "700"],
      options: {
        experimental: {
          variableAxis: {
            wdth: ["75", "100"],
          },
        },
      },
    },
  ],
  i18n: {
    locales: ["en", "sv"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
