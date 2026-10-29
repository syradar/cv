import { execFileSync } from "node:child_process"
import { copyFileSync, mkdtempSync, rmSync, symlinkSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"

const generatedFiles = [
  "public/favicon.svg",
  "public/favicon.ico",
  "public/apple-touch-icon.png",
  "public/og-en.png",
  "public/og-sv.png",
  "public/cv-david-malmstrom-en.pdf",
  "public/cv-david-malmstrom-sv.pdf",
]
const git = (...args) => execFileSync("git", args, { encoding: "utf8" })
const root = git("rev-parse", "--show-toplevel").trim()
const stagedFiles = git("diff", "--cached", "--name-only", "-z").split("\0")
const affectsAssets = stagedFiles.some((file) => {
  if (file.startsWith("src/dev/") || file.startsWith("src/components/examples/")) {
    return false
  }

  return (
    file.startsWith("src/") ||
    file.startsWith("scripts/") ||
    /^(astro\.config\.|package\.json$|pnpm-lock\.yaml$|pnpm-workspace\.yaml$)/.test(file) ||
    file === "public/hero-pattern.svg" ||
    file === ".vite-hooks/pre-commit"
  )
})

if (affectsAssets) {
  const unstagedFiles = git("diff", "--name-only", "-z", "--", ...generatedFiles)

  if (unstagedFiles) {
    throw new Error(
      "Stage or stash your generated asset edits before committing; regeneration would overwrite them.",
    )
  }

  const snapshot = mkdtempSync(join(tmpdir(), "cv-pre-commit-"))

  try {
    console.log(
      "CV sources changed, regenerating share images, icons and PDFs from staged sources...",
    )
    git("checkout-index", "--all", `--prefix=${snapshot}/`)
    symlinkSync(join(root, "node_modules"), join(snapshot, "node_modules"), "dir")
    execFileSync("vp", ["run", "assets"], { cwd: snapshot, stdio: "inherit" })
    execFileSync("vp", ["run", "pdf"], { cwd: snapshot, stdio: "inherit" })

    for (const file of generatedFiles) {
      copyFileSync(join(snapshot, file), join(root, file))
    }

    git("add", "--", ...generatedFiles)
  } finally {
    rmSync(snapshot, { recursive: true, force: true })
  }
}
