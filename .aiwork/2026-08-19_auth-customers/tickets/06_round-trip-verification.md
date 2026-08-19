---
status: ready
blocked_by: [03, 04, 05]
references:
  - "Spec: ../spec.md"
---

# 06 — Full round-trip verification

**What to build:** the area's verify criterion, proven on production:
register → logout → login → reset e-mail → new password → login → change
password. Documents the outcome and closes the area.

## Acceptance criteria

- [ ] Documented manual round-trip completed, including the e-mail leg;
      Czech rendering of the reset e-mail checked (template override
      opened as follow-up only if poor)
- [ ] Full probe suite (area 01's + auth probes) green twice
      consecutively, self-cleaning
- [ ] Implementation notes written per the aiwork protocol (deviations,
      instance changes actually applied, follow-ups)
