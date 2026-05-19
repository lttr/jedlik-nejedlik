---
name: vue-conventions
description: Vue/Nuxt code conventions for SFC structure, props, state, template directives, and composables. Load whenever writing or editing Vue Single-File Components (.vue) or Nuxt-specific code anywhere in this repo — components, pages, layouts, composables, or plugins.
---

# Vue/Nuxt Code Conventions

Apply these whenever creating or modifying `.vue` files or Nuxt composables/plugins in this repo.

## Vue SFC Structure

- ALWAYS place `<template>` first in the SFC, before `<script>` and `<style>`.
- ALWAYS use `<script setup lang="ts">`.
- PREFER grouping by logical concern, not by type (data/methods/computed).

## Props & State

- ALWAYS use TypeScript type-based `defineProps()`, never runtime `PropType`.
- ALWAYS use type-based `defineEmits()`, never runtime array syntax.
- ALWAYS destructure props directly from `defineProps()` for reactivity + inline defaults. Do not use `withDefaults` or assign to a `props` variable. If the script uses no props, call `defineProps()` without destructuring.
- ALWAYS use same-name shorthand `:propName` instead of `:propName="propName"`.
- NEVER mutate props or their nested properties; emit changes to the parent.
- ALWAYS keep computed properties pure — no mutations, no async, no logging.
- USE `defineModel()` for two-way binding instead of manual prop+emit pairs.
- PREFER `ref()` over `reactive()` for state.
- PREFER VueUse composables over custom browser/DOM/state implementations (e.g. `useEventListener` over manual `addEventListener` + cleanup). `@vueuse/nuxt` is installed and auto-imports.

## Template Directives

- ALWAYS use `v-for="item of items"`, never `v-for="item in items"`.

## Composables

- PREFER `toValue()` to accept refs, getters, or plain values as input in shared composables.
- PREFER grouping composable code by concern/feature, not by Vue API type.
- PREFER extracting calculations to pure helper functions; the composable only handles reactivity.
- PREFER plain utility functions over composables unless reactivity or lifecycle hooks are needed. Expose state; let components handle presentation.
