import withNuxt from "./.nuxt/eslint.config.mjs"
import customConfig from "@lttr/nuxt-config-eslint"
import baselineJs from "eslint-plugin-baseline-js"
import esX from "eslint-plugin-es-x"
import css from "@eslint/css"
import { mergeProcessors } from "eslint-merge-processors"
import processorVueBlocks from "eslint-processor-vue-blocks"

// CSS baseline config (reused for standalone and Vue style blocks)
const cssRules = {
  "css/use-baseline": ["warn", { available: "widely" }],
}

export default [
  // Global ignores - exclude standalone CSS from JS/Vue rules
  { ignores: ["**/*.css"] },

  // CSS baseline - standalone files
  {
    name: "css-baseline",
    files: ["**/*.css"],
    plugins: { css },
    language: "css/css",
    rules: cssRules,
  },

  // CSS baseline - Vue SFC <style> blocks (virtual files)
  {
    name: "vue-css-baseline",
    files: ["**/*.vue/*.css"],
    plugins: { css },
    language: "css/css",
    rules: cssRules,
  },

  // Nuxt + custom configs for JS/Vue
  ...(await withNuxt(
    customConfig,

    // JS baseline - register plugins
    { plugins: { "baseline-js": baselineJs, "es-x": esX } },
    // Baseline rule for all JS/TS/Vue
    {
      files: ["**/*.{js,cjs,mjs,jsx,ts,cts,mts,tsx,vue}"],
      rules: {
        "baseline-js/use-baseline": ["warn", { available: "widely" }],
        // Explicitly ban Iterator helpers (ES2025, not widely available)
        "es-x/no-iterator-prototype-map": "warn",
        "es-x/no-iterator-prototype-filter": "warn",
        "es-x/no-iterator-prototype-flatmap": "warn",
        "es-x/no-iterator-prototype-foreach": "warn",
        "es-x/no-iterator-prototype-reduce": "warn",
        "es-x/no-iterator-prototype-take": "warn",
        "es-x/no-iterator-prototype-drop": "warn",
        "es-x/no-iterator-prototype-toarray": "warn",
      },
    },

    // Extract <style> blocks from Vue SFCs for CSS linting
    {
      files: ["**/*.vue"],
      processor: mergeProcessors([
        "vue/.vue",
        processorVueBlocks({
          styles: true,
          script: false,
          template: false,
        }),
      ]),
    },
  )),
]
