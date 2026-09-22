---
status: accepted
---

# Intent — explicit imports and enforced layer boundaries

Three things I want, in the order they came to mind:

- **No extensive relative paths** into the shared layer or into an individual
  layer. Use aliases instead. `../../../` chains are unreadable and they break
  the moment a file moves.
- **Add a dependencies-between-layers check.** Which layer may import from which
  should be enforced by tooling, not remembered.
- **Transition to explicit imports for most of the code**, except core Vue and
  Nuxt APIs. Those stay auto-imported — `ref`, `useFetch`, `navigateTo` are
  unambiguous and spelling them out everywhere is noise.

Background: the repo is worked on mostly by coding agents, and Nuxt's
directory-based auto-imports hide the dependency graph from them. An agent cannot
see where a composable comes from without reading generated `.nuxt/` types, and
dead-code and boundary tools cannot follow edges that only exist in those
generated files.

I expect to use `Lazy*` components in the future, so whatever we do must leave a
way to lazy-load a component.
