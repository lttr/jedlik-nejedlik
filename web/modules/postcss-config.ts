import { defineNuxtModule } from "@nuxt/kit"

export interface ModuleOptions {
  filesWithGlobals: string[]
}

function postcssConfig(files: string[]) {
  return {
    plugins: {
      "postcss-import": true,
      autoprefixer: false,
      // https://github.com/csstools/postcss-plugins/tree/main/plugin-packs/postcss-preset-env
      "@csstools/postcss-global-data": {
        // https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-custom-media#modular-css-processing
        files,
      },
      "postcss-preset-env": {
        stage: false,
        autoprefixer: true,
        features: {
          "color-function": true,
          "color-mix": true,
          "custom-media-queries": true,
          "media-query-ranges": true,
          "nesting-rules": true,
          "oklab-function": true,
          "relative-color-syntax": true,
        },
      },
      "postcss-combine-duplicated-selectors": true,
      "postcss-dark-theme-class": true,
      cssnano: {
        preset: "default",
      },
    },
  }
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: "postcss-config",
    configKey: "postcssConfig",
  },
  defaults: {
    filesWithGlobals: [],
  },
  setup(options, nuxt) {
    nuxt.options.postcss = postcssConfig(options.filesWithGlobals)
  },
})
