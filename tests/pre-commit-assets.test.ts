import { execFileSync } from "node:child_process"
import { chmodSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join, resolve } from "node:path"
import { afterEach, describe, expect, it } from "vite-plus/test"

const script = resolve("scripts/pre-commit-assets.mjs")
const fixtures: string[] = []
const outputs = [
  "favicon.svg",
  "favicon.ico",
  "apple-touch-icon.png",
  "og-en.png",
  "og-sv.png",
  "cv-david-malmstrom-en.pdf",
  "cv-david-malmstrom-sv.pdf",
]

function fixture() {
  const root = mkdtempSync(join(tmpdir(), "cv-hook-test-"))
  const git = (...args: string[]) => execFileSync("git", args, { cwd: root, encoding: "utf8" })

  fixtures.push(root)
  mkdirSync(join(root, "src"))
  mkdirSync(join(root, "public"))
  mkdirSync(join(root, "node_modules"))
  mkdirSync(join(root, "bin"))
  writeFileSync(join(root, "src/content.txt"), "original")

  for (const output of outputs) {
    writeFileSync(join(root, "public", output), "original")
  }

  writeFileSync(
    join(root, "bin/vp"),
    `#!/usr/bin/env node
const fs = require('node:fs');
if (process.env.FAIL_GENERATION && process.argv[3] === 'pdf') process.exit(1);
for (const file of ${JSON.stringify(outputs)}) {
  fs.writeFileSync('public/' + file, fs.readFileSync('src/content.txt'));
}
`,
  )
  chmodSync(join(root, "bin/vp"), 0o755)
  git("init", "--quiet")
  git("add", "src", "public")
  git(
    "-c",
    "user.name=Test",
    "-c",
    "user.email=test@example.com",
    "-c",
    "core.hooksPath=/dev/null",
    "commit",
    "--quiet",
    "-m",
    "initial",
  )

  return {
    root,
    git,
    run: (fail = false) =>
      execFileSync(process.execPath, [script], {
        cwd: root,
        env: {
          ...process.env,
          PATH: `${join(root, "bin")}:${process.env.PATH}`,
          FAIL_GENERATION: fail ? "1" : "",
        },
        stdio: "pipe",
      }),
    stageSource: () => {
      writeFileSync(join(root, "src/content.txt"), "staged")
      git("add", "src")
    },
  }
}

afterEach(() => {
  const roots = fixtures.splice(0)

  for (const root of roots) {
    rmSync(root, { recursive: true, force: true })
  }
})

describe("pre-commit generated assets", () => {
  it("generates and stages every output from the index, preserving unstaged source edits", () => {
    const f = fixture()
    f.stageSource()
    writeFileSync(join(f.root, "src/content.txt"), "unstaged")
    f.run()

    for (const output of outputs) {
      expect(f.git("show", `:public/${output}`)).toBe("staged")
    }

    expect(readFileSync(join(f.root, "src/content.txt"), "utf8")).toBe("unstaged")
  })

  it("does not publish any outputs when generation fails", () => {
    const f = fixture()
    f.stageSource()

    expect(() => f.run(true)).toThrow()
    expect(f.git("show", ":public/favicon.svg")).toBe("original")
    expect(readFileSync(join(f.root, "public/favicon.svg"), "utf8")).toBe("original")
  })

  it("protects unstaged generated edits", () => {
    const f = fixture()
    f.stageSource()
    writeFileSync(join(f.root, "public/favicon.svg"), "manual edit")

    expect(() => f.run()).toThrow()
    expect(readFileSync(join(f.root, "public/favicon.svg"), "utf8")).toBe("manual edit")
  })

  it("skips unrelated changes", () => {
    const f = fixture()
    writeFileSync(join(f.root, "README.md"), "docs")
    f.git("add", "README.md")
    f.run(true)

    expect(f.git("show", ":public/favicon.svg")).toBe("original")
  })
})
