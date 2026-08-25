#!/usr/bin/env node
// Deterministic scan for the dependency-update skill.
//
// Runs `pnpm outdated --format=json` over the workspace, normalises its two
// output shapes, tags each row against pnpm-workspace.yaml (exact pin,
// `catalog:` alias, override workaround) so out-of-scope rows never surface as
// phantom "outdated" entries, lists the DELETE-WHEN conditions, and resolves
// every package to its GitHub repo. Everything else — release notes, impact,
// batching — is the skill's job.
//
// Usage: node .claude/skills/dependency-update/scripts/dep-scan.mjs [--no-net]
// Output: one JSON blob on stdout.

import { execFileSync } from "node:child_process"
import { existsSync, readFileSync } from "node:fs"
import { dirname, join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../../..")
const offline = process.argv.includes("--no-net")

function readJson(path) {
  try {
    return JSON.parse(readFileSync(path, "utf8"))
  } catch {
    return null
  }
}

function pnpmOutdated(args) {
  const run = (a) =>
    execFileSync("pnpm", ["outdated", "--format=json", ...a], {
      cwd: repoRoot,
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
    })
  try {
    return JSON.parse(run(args) || "{}")
  } catch (error) {
    // `pnpm outdated` exits 1 when anything is outdated but still prints JSON.
    if (error.stdout) {
      try {
        return JSON.parse(error.stdout || "{}")
      } catch {
        /* fall through */
      }
    }
    throw new Error(`pnpm outdated ${args.join(" ")} failed: ${error.message}`, { cause: error })
  }
}

/** pnpm prints either { pkg: info } or { workspacePath: { pkg: info } }. */
function normalise(raw, fallbackWorkspace, rows) {
  for (const [key, value] of Object.entries(raw ?? {})) {
    if (!value || typeof value !== "object") {
      continue
    }
    // pnpm 11 recursive shape: flat, with a dependentPackages[] per row.
    if (Array.isArray(value.dependentPackages) && value.dependentPackages.length > 0) {
      for (const dependent of value.dependentPackages) {
        add(rows, key, value, workspaceLabel(dependent.location ?? dependent.name))
      }
      continue
    }
    const isWorkspaceBucket =
      !value.current &&
      !value.latest &&
      Object.values(value).some((v) => v && typeof v === "object" && (v.current || v.latest))
    if (isWorkspaceBucket) {
      for (const [pkg, info] of Object.entries(value)) {
        add(rows, pkg, info, workspaceLabel(key))
      }
    } else {
      add(rows, key, value, fallbackWorkspace)
    }
  }
}

function workspaceLabel(pathOrName) {
  const relative = pathOrName.startsWith(repoRoot)
    ? pathOrName.slice(repoRoot.length).replace(/^\/+/, "")
    : pathOrName
  return relative === "" ? "." : relative
}

function add(rows, name, info, workspace) {
  const key = `${workspace}::${name}`
  if (rows.has(key)) {
    return
  }
  rows.set(key, {
    name,
    workspace,
    dependencyType: info.dependencyType ?? null,
    current: info.current ?? null,
    wanted: info.wanted ?? null,
    latest: info.latest ?? null,
  })
}

function parseVersion(version) {
  const parts = String(version)
    .replace(/^[^\d]*/, "")
    .split(".")
  return {
    major: Number(parts[0]) || 0,
    minor: Number(parts[1]) || 0,
    patch: Number(parts[2]) || 0,
  }
}

/** Semver bump kind, treating a 0.x minor as the breaking digit. */
function bumpKind(current, latest) {
  if (!current || !latest) {
    return "unknown"
  }
  const a = parseVersion(current)
  const b = parseVersion(latest)
  if (a.major !== b.major) {
    return "major"
  }
  if (a.major === 0) {
    return a.minor !== b.minor ? "major" : "minor"
  }
  if (a.minor !== b.minor) {
    return "minor"
  }
  if (a.patch !== b.patch) {
    return "patch"
  }
  return "none"
}

const EXACT = /^\d+\.\d+\.\d+(?:[-+].*)?$/

function workspacePackages() {
  const yaml = readFileSync(join(repoRoot, "pnpm-workspace.yaml"), "utf8")
  const dirs = ["."]
  let inPackages = false
  for (const line of yaml.split("\n")) {
    if (/^packages:\s*$/.test(line)) {
      inPackages = true
      continue
    }
    if (inPackages) {
      const match = line.match(/^\s+-\s+["']?([^"'\s]+)["']?\s*$/)
      if (match) {
        dirs.push(match[1])
      } else if (line.trim() !== "" && !line.trim().startsWith("#")) {
        break
      }
    }
  }
  return dirs
}

/** Declared range per `workspace::name`, from each package.json. */
function declaredSpecs(dirs) {
  const specs = new Map()
  for (const dir of dirs) {
    const pkg = readJson(join(repoRoot, dir, "package.json"))
    if (!pkg) {
      continue
    }
    for (const field of ["dependencies", "devDependencies", "optionalDependencies"]) {
      for (const [name, spec] of Object.entries(pkg[field] ?? {})) {
        specs.set(`${dir}::${name}`, { spec, field })
      }
    }
  }
  return specs
}

/** DELETE-WHEN blocks: the ISSUE/DELETE WHEN comment pairs in the workspace file. */
function deleteWhenConditions() {
  const lines = readFileSync(join(repoRoot, "pnpm-workspace.yaml"), "utf8").split("\n")
  const conditions = []
  lines.forEach((line, index) => {
    const match = line.match(/#\s*DELETE[ -]WHEN:?\s*(.*)$/i)
    if (!match) {
      return
    }
    // A wrapped comment continues on following comment lines.
    let text = match[1].trim()
    for (let i = index + 1; i < lines.length; i++) {
      const next = lines[i].match(/^\s*#\s{2,}(\S.*)$/)
      if (!next) {
        break
      }
      text += ` ${next[1].trim()}`
    }
    let issue = null
    for (let i = index - 1; i >= 0; i--) {
      const found = lines[i].match(/#\s*ISSUE:?\s*(.*)$/i)
      if (found) {
        issue = found[1].trim()
        break
      }
      if (!lines[i].trim().startsWith("#")) {
        break
      }
    }
    conditions.push({ line: index + 1, issue, condition: text })
  })
  return conditions
}

function workspaceConfig() {
  const yaml = readFileSync(join(repoRoot, "pnpm-workspace.yaml"), "utf8")
  const section = (name) => {
    const lines = yaml.split("\n")
    const start = lines.findIndex((l) => l.startsWith(`${name}:`))
    if (start === -1) {
      return []
    }
    const out = []
    for (let i = start + 1; i < lines.length; i++) {
      if (/^\S/.test(lines[i])) {
        break
      }
      const trimmed = lines[i].trim()
      if (trimmed && !trimmed.startsWith("#")) {
        out.push(trimmed)
      }
    }
    return out
  }
  const names = (entries) =>
    entries.map((e) => e.match(/^["']?(@?[^"':\s]+)["']?\s*:/)?.[1]).filter(Boolean)
  return {
    catalog: names(section("catalog")),
    overrides: names(section("overrides")),
    minimumReleaseAgeExclude: section("minimumReleaseAgeExclude").map((l) =>
      l.replace(/^-\s*["']?/, "").replace(/["']$/, ""),
    ),
  }
}

function scopeOf(row, declared, config) {
  const spec = declared?.spec
  if (spec?.startsWith("catalog:")) {
    return {
      inScope: false,
      reason: `catalog: alias — resolved by pnpm-workspace.yaml (${spec}), report only`,
    }
  }
  if (spec && EXACT.test(spec)) {
    return { inScope: false, reason: `exact pin (${spec}) — deliberate, report only` }
  }
  if (spec?.startsWith("npm:")) {
    return { inScope: false, reason: `aliased spec (${spec}) — report only` }
  }
  if (config.overrides.includes(row.name)) {
    return {
      inScope: false,
      reason: "covered by a pnpm-workspace.yaml override workaround — report only",
    }
  }
  if (!spec) {
    return { inScope: false, reason: "not a direct dependency — report only" }
  }
  return { inScope: true, reason: null }
}

function extractGitHubRepo(field) {
  if (!field) {
    return null
  }
  const url = typeof field === "object" ? field.url : field
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

async function resolveRepo(name) {
  for (const base of [join(repoRoot, "node_modules"), join(repoRoot, "web/node_modules")]) {
    const path = join(base, name, "package.json")
    if (!existsSync(path)) {
      continue
    }
    const pkg = readJson(path)
    const repo = extractGitHubRepo(pkg?.repository) || extractGitHubRepo(pkg?.homepage)
    if (repo) {
      return { repo, source: "node_modules" }
    }
  }
  if (offline) {
    return { repo: null, source: "offline" }
  }
  try {
    const response = await fetch(`https://registry.npmjs.org/${name.replace("/", "%2F")}`, {
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) {
      return { repo: null, source: "registry-miss" }
    }
    const data = await response.json()
    const latest = data["dist-tags"]?.latest
    const manifest = latest ? data.versions?.[latest] : null
    const repo =
      extractGitHubRepo(data.repository) ||
      extractGitHubRepo(manifest?.repository) ||
      extractGitHubRepo(data.homepage)
    return { repo: repo ?? null, source: repo ? "registry" : "registry-miss" }
  } catch (error) {
    return { repo: null, source: `registry-error: ${error.message}` }
  }
}

const dirs = workspacePackages()
const declared = declaredSpecs(dirs)
const config = workspaceConfig()

const rowMap = new Map()
normalise(pnpmOutdated(["-r"]), null, rowMap)

const rows = [...rowMap.values()].filter((row) => row.workspace)
for (const row of rows) {
  const spec = declared.get(`${row.workspace}::${row.name}`)
  const scope = scopeOf(row, spec, config)
  row.declared = spec?.spec ?? null
  row.bump = bumpKind(row.current, row.latest)
  row.inScope = scope.inScope
  row.outOfScopeReason = scope.reason
}

const resolved = await Promise.all(
  [...new Set(rows.map((r) => r.name))].map(async (name) => [name, await resolveRepo(name)]),
)
const repos = new Map(resolved)
for (const row of rows) {
  const { repo, source } = repos.get(row.name)
  row.repo = repo
  row.repoSource = source
}

rows.sort((a, b) => Number(b.inScope) - Number(a.inScope) || a.name.localeCompare(b.name))

console.log(
  JSON.stringify(
    {
      generatedFrom: "pnpm outdated --format=json (root + -r)",
      workspaces: dirs,
      counts: {
        total: rows.length,
        inScope: rows.filter((r) => r.inScope).length,
        outOfScope: rows.filter((r) => !r.inScope).length,
        major: rows.filter((r) => r.inScope && r.bump === "major").length,
      },
      updates: rows,
      workspaceConfig: config,
      deleteWhen: deleteWhenConditions(),
    },
    null,
    2,
  ),
)
