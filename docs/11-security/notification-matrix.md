# Notification Matrix (Master)

| Document ID | SEC-NOTIF-001 |
| Status | DRAFT |

| Event | Channel | Recipient | Phase |
|-------|---------|-----------|-------|
| Appointment confirmed | SMS/Push | Patient | As-built |
| Appointment reminder | SMS/Push | Patient | As-built |
| Queue called | In-app / display | Patient | P2 |
| Lab critical result | SMS + in-app | Doctor, ordering physician | P3 |
| Rx ready for pickup | SMS | Patient | P3 |
| Invoice issued | SMS/Email | Patient | P2-F5 |
| Payment received | SMS/Email | Patient | P5 |
| Admission approved | In-app | Patient, ward | P4 |
| Discharge summary ready | SMS/Email | Patient | P4 |
| Insurance pre-auth status | Email | TPA user | P5 |

**P1-F1:** Optional registration SMS with UHID (DEC-005 pending).

Implementation: extend notifications module; template per hospital config.
