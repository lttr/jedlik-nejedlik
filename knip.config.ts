import type { KnipConfig } from "knip"

// Knip's Nuxt plugin reads srcDir/dir.* from nuxt.config and resolves Nuxt 4's
// app/ pages/layouts/middleware/plugins/server itself — only the cases it can't
// see are configured below.
const config: KnipConfig = {
  // catalog `vite`/`vitest` are consumed via pnpm-workspace.yaml `overrides`,
  // not a direct `catalog:` specifier — the only form Knip's check traces.
  rules: { catalog: "off" },
  workspaces: {
    ".": {
      entry: ["vite.config.ts", "certificate/app.js"],
      ignoreBinaries: ["scripts/smoke-dev.sh"],
    },
    web: {
      entry: [
        "sentry.{client,server}.config.ts",
        "shared/**/*.ts",
        "server/runtime-config.schema.ts",
        "*.d.ts",
        // Components are auto-imported by name; Knip 6.14 can't trace them.
        "app/components/**/*.vue",
      ],
      project: ["**/*.{ts,vue}", "!.nuxt/**", "!.output/**", "!archive/**"],
      // nuxt-svgo turns assets/svgs/* imports into virtual components.
      ignoreUnresolved: [/assets\/svgs\//],
      ignoreDependencies: [
        // Imported by @nuxt/vite-builder (see CLAUDE.md).
        "rolldown",
        // Icon collections referenced by name string, resolved by @nuxt/icon.
        /^@iconify-json\//,
        // Implicit via Nuxt / nuxi (devtools, routing, typecheck).
        "@nuxt/devtools",
        "vue-router",
        "vue-tsc",
        // Transitive: provided by nuxt / eslint config, imported directly.
        "@nuxt/kit",
        "nitropack",
        "eslint-plugin-es-x",
        // Peer of @vueuse/nuxt.
        "@vueuse/core",
        // Used via CSS @import in main.css — Knip doesn't resolve CSS deps.
        "@lttr/puleo",
        // TS language-service plugin (tsconfig compilerOptions.plugins).
        "@dxup/unimport",
      ],
    },
  },
}

export default config
