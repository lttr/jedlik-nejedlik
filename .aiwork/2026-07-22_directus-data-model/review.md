# Review — Directus data model (area 01)

Branch review of `5446604..HEAD` (tickets 01–04), 2026-07-23, medium effort,
run by a worktree review agent over the whole diff (schema snapshot +
directus-sync dump + permissions, layer codecs, probe suite, tooling).

## Findings and resolutions

| #   | Severity | Finding                                                                                                                                                        | Resolution                                                                                                                                                                                  |
| --- | -------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Medium   | `order_consent.granted_at` client-writable — consent trail (TO-7) rested on a client-controlled timestamp                                                      | Fixed: student create permission presets `granted_at: $NOW`, field removed from writable list; probes assert server-set value and 403 on supplying one. **04a must not send `granted_at`.** |
| 2   | Medium   | `order.price_czk` client-supplied with no relational validation possible at create; 04b could charge a spoofed amount                                          | Contract recorded in implementation-notes: **04b must re-read `course.price_czk`, never trust `order.price_czk`** for the charge. No schema change.                                         |
| 3   | Medium   | Entitled-lesson probes asserted over all published courses — would break when the author publishes the dummy course                                            | Fixed: probes scoped to the entitled course (`filter[section][course]`).                                                                                                                    |
| 4   | Low      | Author file `update` (fields `*` incl. `folder`) let a marketing asset be moved into Materiály kurzů and then deleted, bypassing the folder-scoped delete rule | Fixed: author file update now filtered to materials-folder files OR own uploads; denial probe added.                                                                                        |

Minor notes accepted without change: author enumerates name+email of all
users (needed for admin-app M2O pickers; sensitive fields probe-verified
403), vacuous-403 shape of two foreign-order probes, section/lesson orphans
possible if the author suite dies mid-run. Reapplicability gaps (composite
unique index on `entitlement(student,course)` and the consent-guard flow
operation are not in the committed config) were already documented in
implementation-notes.

## Clean areas

- No secrets anywhere in the diff (entropy + keyword scan incl. dump JSONs);
  the Ecomail key stays excluded via the `operations` exclusion.
- Public policy: outline-only, published-only, no paid fields, no
  transactional collections, marketing permissions untouched.
- Student policy: own-row scoping, `$CURRENT_USER` create preset, no
  status/payment writes, entitlement chain on lesson/file/junction reads.
- Author policy: content CRUD, transactional read-only, entitlement
  create/delete without update, no administration.
- Layer codecs match the snapshot (names, enums, nullability convention).
- Probe cleanup only touches ids created within the run.

## Verification after fixes

- Probe matrix 61/61 green against production (public 14, student 29,
  author 18), two runs.
- `vp check`, eslint, `nuxi typecheck`, fallow, `nuxi build` all green;
  `directus-sync diff` clean after re-pull.
