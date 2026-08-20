# ADR-014: Mobile HMS Expansion

| Status | PROPOSED |

## Decision
Extend Expo 52 React Native app with role-based stacks (doctor rounds, nurse vitals/MAR, lab, pharmacy). No Flutter rewrite. Offline: queue vitals locally with sync (Phase 4+).

## Priority order
Doctor IPD rounds → Nurse vitals → MAR → Lab sample → Pharmacy dispense.
