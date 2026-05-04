// TypeScript shim for `.vue` SFC imports. Added by `vp migrate` so non-Volar
// tooling (Oxlint, Oxfmt, plain `tsc`) can resolve `import Foo from './Foo.vue'`
// without erroring. vue-tsc / Volar don't need this, but the unified Vite+
// toolchain runs checks outside Volar context.
declare module "*.vue" {
  import type { DefineComponent } from "vue"
  const component: DefineComponent<object, object, unknown>
  export default component
}
