# Conventions

## Vue components

- ALWAYS use TypeScript type-based syntax for defineProps() instead of runtime PropType declarations
- ALWAYS destructure props directly from defineProps() to maintain reactivity and enable inline defaults; if no props are used in the script, call defineProps() without destructuring
- ALWAYS use `<script setup lang="ts">` for component's script section
- ALWAYS place the <template> section at the top of Vue SFC files, before <script> and <style> sections
- ALWAYS use key in v-for loops
- ALWAYS use multi-word component names except for Nuxt pages and layouts
- ALWAYS use shorthand syntax (`:propName`) when passing a prop with the same name as the variable, instead of the verbose form (`:propName="propName"`)
- ALWAYS use type-based syntax for defineEmits in TypeScript instead of runtime array syntax
- ALWAYS use v-for="item of items" instead of v-for="item in items" to match JavaScript for...of syntax
- PREFER to group by logical concerns rather than grouping by type (data, methods, computed) within components
- PREFER `ref()` for reactive state instead of `reactive()`
- PREFER VueUse composables and utility functions over custom implementations for common tasks like state management, DOM interactions, and browser APIs
- USE `defineModel()` for v-model implementations instead of manually defining props and emits

## Styling
