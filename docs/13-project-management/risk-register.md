# Risk Register

| Document ID | PM-RISK-001 |
| Status | DRAFT — living document |

| ID | Risk | Sev | Prob | Impact | Owner | Mitigation | Status |
|----|------|-----|------|--------|-------|------------|--------|
| R-001 | Duplicate patient records | High | Med | Wrong treatment, billing | Product | P1-F1 duplicate engine + audit | Open |
| R-002 | UHID collision | High | Low | Identity confusion | Architect | DB unique + sequence FOR UPDATE | Open |
| R-003 | Appointment/encounter status drift | Med | Med | Queue errors | Tech Lead | P2-F1 single arrive endpoint | Open |
| R-004 | Incorrect hospital scope | High | Med | Data leak | Security | HospitalScopeService mandatory | Mitigating |
| R-005 | Clinical note silent overwrite | High | Med | Compliance | Architect | ADR-009 versioning | Open |
| R-006 | Prescription safety missed | High | Med | Patient harm | Clinical lead | Configurable severity P2-F4 | Open |
| R-007 | Pharmacy stock inconsistency | Med | Med | Dispense errors | Pharmacy lead | Ledger transactions ADR-011 | Open |
| R-008 | Bed double allocation | High | Low | Operational crisis | IPD lead | Row lock + unique active assignment | Open |
| R-009 | Billing inconsistency | Med | Med | Revenue loss | Finance | Encounter-linked invoices only | Partial |
| R-010 | Payment duplication | High | Low | Financial | Architect | Idempotency keys ADR-012 | Open |
| R-011 | API breaking change | Med | Med | Client outage | Architect | ADR-007 additive only | Mitigating |
| R-012 | Mobile offline sync conflict | Med | Med | Data loss | Mobile lead | Server wins + audit | Open |
| R-013 | Flyway checksum drift | Med | Low | Deploy failure | DevOps | Never edit applied migrations | Mitigating |
| R-014 | Performance under load | Med | Med | UX degradation | Tech Lead | Indexes V40+, load test Sprint 22 | Open |
| R-015 | Walk-in without user account (DEC-004) | Med | High | Blocked registration | Architect | Shadow user or nullable user_id | **Decision pending** |

Update at each sprint retrospective.
