# P1-F2-14 — UAT Plan

| Feature | P1-F2 |
| Status | Pending UAT |

---

## Scripts

| ID | Steps | Expected |
|----|-------|----------|
| UAT-P1-F2-01 | Doctor opens IN_PROGRESS encounter; records BP 120/80 + HR 72 | Row appears in list; NORMAL classification |
| UAT-P1-F2-02 | Record second set later same encounter | Two rows, newest first |
| UAT-P1-F2-03 | Submit with no values | Blocked / 400 |
| UAT-P1-F2-04 | Nurse enters encounter ID on nursing portal; records SpO2 | Saved; visible on doctor view |
| UAT-P1-F2-05 | Patient opens `/patient/vitals` | Wellness flow only; no clinical table dependency |
| UAT-P1-F2-06 | Receptionist GET vitals (if permitted) | Can read; cannot POST |

## Sign-off

All critical passed → feature board IN UAT → RELEASED
