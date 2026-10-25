import { defineConfig } from 'vite-plus';

export default defineConfig({
  staged: {
    "*": "vp check --fix"
  },
  fmt: {
    semi: false,
    ignorePatterns: [
      ".vscode/extensions.json",
      "README.md",
      "package.json",
      "pnpm-workspace.yaml",
      "vite.config.ts",
    ],
  },
  lint: {
    ignorePatterns: [
      ".vscode/extensions.json",
      "README.md",
      "package.json",
      "pnpm-workspace.yaml",
      "vite.config.ts",
      "wrangler.jsonc",
    ],
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    rules: { "vite-plus/prefer-vite-plus-imports": "error" },
    options: { typeAware: true, typeCheck: true },
  },
});
