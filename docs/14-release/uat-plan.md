# UAT Plan (Master)

| Document ID | UAT-001 |
| Status | DRAFT |

---

## Process

1. QA completes integration/regression
2. BA prepares UAT scripts from acceptance criteria
3. Hospital pilot users execute on staging
4. Defects → backlog; critical block release
5. Sign-off recorded in feature doc

---

## P1-F1 UAT scripts

| ID | Scenario | Pass criteria |
|----|----------|---------------|
| UAT-PAT-01 | Register new patient | UHID assigned, receipt printable |
| UAT-PAT-02 | Search by mobile | Correct patient within 2s |
| UAT-PAT-03 | Duplicate blocked | Candidates shown; open existing works |
| UAT-PAT-04 | Wrong role | Reception features denied to PATIENT |
| UAT-PAT-05 | Scope | Receptionist cannot see other hospital patients |

---

## Environment

- Staging with anonymized seed data
- Same Flyway version as production target

---

## Evidence

Screenshots, API correlation IDs, signed UAT checklist per release.
