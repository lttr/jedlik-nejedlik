#!/usr/bin/env node
// Deterministic scan for the dependency-update skill.
//
// Runs `pnpm outdated --format=json -r`, tags each row against its package.json
// and pnpm-workspace.yaml (exact pin, `catalog:`/`npm:` alias, override
// workaround) so out-of-scope rows never surface as phantom "outdated" entries,
// resolves every package to its GitHub repo, and reports hoist skew. Everything
// else — release notes, impact, batching, DELETE-WHEN conditions — is the
// skill's job, read straight from the files.
//
// Usage: node .claude/skills/dependency-update/scripts/dep-scan.mjs [--no-net]
// Output: one JSON blob on stdout.

import { execFileSync } from "node:child_process"
import { readFileSync } from "node:fs"
import { dirname, join, relative, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..")
const offline = process.argv.includes("--no-net")
const EXACT = /^\d+\.\d+\.\d+(?:[-+].*)?$/

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"))
  } catch {
    return null
  }
}

/** pnpm's stdout, also on exit 1 (`outdated` exits 1 whenever anything is outdated). */
function pnpm(...args) {
  try {
    return execFileSync("pnpm", args, { cwd: repoRoot, encoding: "utf8", maxBuffer: 64 * 1024 * 1024 })
  } catch (error) {
    if (error.stdout) {
      return error.stdout
    }
    throw error
  }
}

/** Package names under `overrides:` in pnpm-workspace.yaml. */
function overriddenNames() {
  const yaml = readFileSync(join(repoRoot, "pnpm-workspace.yaml"), "utf8")
  const block = yaml.match(/^overrides:\n((?:[ \t#].*\n|\n)*)/m)?.[1] ?? ""
  return [...block.matchAll(/^[ \t]+["']?(@?[^"'#:\s]+)["']?[ \t]*:/gm)].map((m) => m[1])
}

/** Why a row is report-only, or null when it may be bumped. */
function outOfScopeReason(name, spec, overrides) {
  if (!spec) {
    return "not a direct dependency — report only"
  }
  if (spec.startsWith("catalog:")) {
    return `catalog: alias — resolved by pnpm-workspace.yaml (${spec}), report only`
  }
  if (spec.startsWith("npm:")) {
    return `aliased spec (${spec}) — report only`
  }
  if (EXACT.test(spec)) {
    return `exact pin (${spec}) — deliberate, report only`
  }
  if (overrides.includes(name)) {
    return "covered by a pnpm-workspace.yaml override workaround — report only"
  }
  return null
}

/** Semver bump kind, treating a 0.x minor as the breaking digit. */
function bumpKind(current, latest) {
  if (!current || !latest) {
    return "unknown"
  }
  const [a, b] = [current, latest].map((v) =>
    v.replace(/^\D*/, "").split(".").map((n) => Number(n) || 0),
  )
  if (a[0] !== b[0]) {
    return "major"
  }
  if (a[1] !== b[1]) {
    return a[0] === 0 ? "major" : "minor"
  }
  return a[2] !== b[2] ? "patch" : "none"
}

function githubRepo(field) {
  const url = typeof field === "object" ? field?.url : field
  if (typeof url !== "string") {
    return null
  }
  // npm shorthands: "owner/repo" and "github:owner/repo".
  const shorthand = url.replace(/^github:/, "")
  if (/^[\w.-]+\/[\w.-]+$/.test(shorthand)) {
    return shorthand.replace(/\.git$/, "")
  }
  return url.match(/github\.com[/:]([^/]+\/[^/]+?)(?:\.git|\/|$)/)?.[1] ?? null
}

async function resolveRepo(name, workspaceDir) {
  for (const base of [workspaceDir, repoRoot]) {
    const pkg = readJson(join(base, "node_modules", name, "package.json"))
    const repo = githubRepo(pkg?.repository) || githubRepo(pkg?.homepage)
    if (repo) {
      return { repo, repoSource: "node_modules" }
    }
  }
  if (offline) {
    return { repo: null, repoSource: "offline" }
  }
  try {
    const response = await fetch(`https://registry.npmjs.org/${name.replace("/", "%2F")}`, {
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) {
      return { repo: null, repoSource: "registry-miss" }
    }
    const data = await response.json()
    const manifest = data.versions?.[data["dist-tags"]?.latest]
    const repo =
      githubRepo(data.repository) || githubRepo(manifest?.repository) || githubRepo(data.homepage)
    return { repo, repoSource: repo ? "registry" : "registry-miss" }
  } catch (error) {
    return { repo: null, repoSource: `registry-error: ${error.message}` }
  }
}

// Packages installed at more than one major, that Nuxt also maps in its
// generated tsconfig `paths`. Under `shamefullyHoist` exactly one copy reaches
// the repo root, Nuxt points bare imports at whichever that is, and which one
// wins is decided at install time — not by the lockfile. So a regen can flip it
// with no diff to show for it, and `import type { X } from "<pkg>"` silently
// starts resolving against the wrong major. That is what h3 did on 2026-09-03:
// h3 v2 rode in transitively with @nuxt/eslint, outranked nitro's v1 at the
// root, and broke typecheck in every server file (fixed by the exact `h3` pin
// in web/package.json). Reported, never auto-fixed — the cure is a pin naming
// the copy the framework resolves, and that is a judgement call.
function hoistSkew() {
  const paths = readJson(join(repoRoot, "web/.nuxt/tsconfig.server.json"))?.compilerOptions?.paths ?? {}
  if (Object.keys(paths).length === 0) {
    return { checked: false, reason: "web/.nuxt/tsconfig.server.json absent — run `vp install` first", skewed: [] }
  }
  let tree
  try {
    tree = JSON.parse(pnpm("list", "--depth", "Infinity", "--json", "-r"))
  } catch (error) {
    return { checked: false, reason: `pnpm list failed: ${error.message}`, skewed: [] }
  }

  const majors = new Map()
  const walk = (deps) => {
    for (const [name, node] of Object.entries(deps ?? {})) {
      if (node?.version) {
        majors.set(name, (majors.get(name) ?? new Set()).add(node.version.split(".")[0]))
      }
      walk(node?.dependencies)
    }
  }
  for (const ws of tree) {
    walk(ws.dependencies)
    walk(ws.devDependencies)
  }

  const skewed = Object.keys(paths)
    .filter((name) => majors.get(name)?.size > 1)
    .map((name) => ({
      name,
      majors: [...majors.get(name)].sort(),
      hoistedAtRoot: readJson(join(repoRoot, "node_modules", name, "package.json"))?.version ?? null,
      nuxtPathsAt: paths[name][0] ?? null,
    }))
  return { checked: true, reason: null, skewed }
}

const overrides = overriddenNames()
const manifests = new Map()
const rows = []
for (const [name, info] of Object.entries(JSON.parse(pnpm("outdated", "--format=json", "-r") || "{}"))) {
  // One row per dependent workspace; `location` is absolute.
  for (const { location } of info.dependentPackages ?? []) {
    if (!manifests.has(location)) {
      manifests.set(location, readJson(join(location, "package.json")) ?? {})
    }
    const declared = manifests.get(location)[info.dependencyType]?.[name] ?? null
    const reason = outOfScopeReason(name, declared, overrides)
    rows.push({
      name,
      workspace: relative(repoRoot, location) || ".",
      dependencyType: info.dependencyType ?? null,
      current: info.current ?? null,
      wanted: info.wanted ?? null,
      latest: info.latest ?? null,
      declared,
      bump: bumpKind(info.current, info.latest),
      inScope: reason === null,
      outOfScopeReason: reason,
      ...(await resolveRepo(name, location)),
    })
  }
}

rows.sort((a, b) => Number(b.inScope) - Number(a.inScope) || a.name.localeCompare(b.name))

console.log(
  JSON.stringify(
    {
      counts: {
        total: rows.length,
        inScope: rows.filter((r) => r.inScope).length,
        outOfScope: rows.filter((r) => !r.inScope).length,
        major: rows.filter((r) => r.inScope && r.bump === "major").length,
      },
      updates: rows,
      hoistSkew: hoistSkew(),
    },
    null,
    2,
  ),
)
