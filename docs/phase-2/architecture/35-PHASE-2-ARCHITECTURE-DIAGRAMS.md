# DOC-35: Health360 AI — Phase 2 Architecture Diagrams Pack

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-35 |
| **Title** | Phase 2 Architecture Diagrams Pack |
| **Version** | 1.0 |
| **Status** | **Draft** |
| **Date** | 2026-08-03 |
| **References** | [DOC-16](../../phase-1/architecture/16-ARCHITECTURE-DIAGRAMS-PACK.md), [DOC-30](./30-PHASE-2-SYSTEM-ARCHITECTURE.md) |

---

## 1. Care Journey (Phase 2 End-to-End)

```mermaid
sequenceDiagram
  participant P as Patient
  participant W as Web/Mobile App
  participant API as Health360 API
  participant PG as Payment Gateway
  participant PH as Pharmacy

  P->>W: Book appointment
  W->>API: POST /appointments
  P->>W: Pay consultation fee
  W->>PG: Checkout
  PG->>API: Webhook CAPTURED
  Note over API: Visit COMPLETED
  API->>W: Doctor issues prescription
  P->>W: Order medicines
  W->>PG: Pay pharmacy order
  PG->>API: Webhook CAPTURED
  API->>PH: Fulfillment notification
  PH->>API: Status DELIVERED
  API->>W: Patient timeline updated
```

---

## 2. Module Dependency Diagram

```mermaid
flowchart LR
  subgraph core [Phase 1 Core]
    IAM[IAM]
    SCH[Scheduling]
    PAT[Patient]
    DOC[Doctor]
  end

  subgraph commerce [Phase 2 Commerce]
    RX[Prescription]
    PHR[Pharmacy]
    LAB[Laboratory]
    PAY[Payments]
  end

  subgraph care [Phase 2 Care Delivery]
    TEL[Telemedicine]
    EMR[Clinical Notes]
  end

  IAM --> RX
  IAM --> PAY
  SCH --> RX
  SCH --> TEL
  SCH --> PAY
  DOC --> RX
  DOC --> LAB
  DOC --> EMR
  RX --> PHR
  PHR --> PAY
  LAB --> PAY
  PAT --> PHR
  PAT --> LAB
```

---

## 3. Payment State Machine

```mermaid
stateDiagram-v2
  [*] --> PENDING
  PENDING --> CAPTURED: webhook success
  PENDING --> FAILED: webhook fail / timeout
  CAPTURED --> REFUNDED: admin refund
  CAPTURED --> [*]
  FAILED --> [*]
  REFUNDED --> [*]
```

---

## 4. Deployment View (Phase 2 Additions)

```mermaid
flowchart TB
  User[Users] --> CF[CloudFront CDN]
  CF --> ALB[ALB + WAF]
  ALB --> ECS[ECS Fargate - Monolith]
  ECS --> RDS[(PostgreSQL)]
  ECS --> Redis[(Redis)]
  ECS --> S3[S3 Clinical Docs]
  ECS --> PG[Razorpay API]
  ECS --> Video[Daily.co / Twilio]
  PG --> Webhook[Webhook /payments/webhook]
  Webhook --> ECS
```

---

## 5. Data Flow — Lab Result Release

```
Lab uploads result (S3 + structured values)
  → lab_results.status = PENDING_REVIEW
  → Lab tech marks RELEASED
  → Event LabResultReleased
  → Patient lab_values + timeline updated
  → Push/email notification
```

---

*End of DOC-35 — Phase 2 Architecture Diagrams v1.0*
