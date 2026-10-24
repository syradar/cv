// @ts-check
import type { AstroIntegration } from "astro";
import { defineConfig } from "astro/config";

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
  i18n: {
    locales: ["en", "sv"],
    defaultLocale: "en",
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
