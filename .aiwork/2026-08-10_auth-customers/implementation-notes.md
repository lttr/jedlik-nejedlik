# Implementation notes — Auth / customers layer (area 02)

Chronological log. Workflow events plus decisions that were not settled by
`spec.md`.

## 2026-08-10

- Area 02 had no spec or tickets — only the six-line paragraph in
  `../2026-06-09_kurzy-platforma/implementation-areas.md`. Wrote
  `spec.md` + four tickets before touching code.
- Three decisions were taken by the user at the clarity gate rather than
  by the spec author: spec-first over code-first, Directus public
  registration over a service-token route, and `nuxt-auth-utils` over a
  hand-rolled h3 sealed session.
- **Deviation from `/aiwork:implement`:** the skill has the orchestrator
  spawn one subagent per ticket. This session runs the ticket loop inline
  instead — the session instructions forbid the Agent tool unless the user
  asks for it. No effect on the artifacts; only on who executes them.
- Ticket 04 is human-only by construction (instance settings + a real
  inbox), same shape as area 01's FP-11 ticket. Tickets 01–03 are written
  so an agent can finish them without instance access.
