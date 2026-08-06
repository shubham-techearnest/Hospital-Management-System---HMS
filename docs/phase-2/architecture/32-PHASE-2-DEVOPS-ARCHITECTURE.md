# DOC-32: Health360 AI — Phase 2 DevOps & Deployment (Delta)

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-32 |
| **Title** | Phase 2 DevOps & Deployment Architecture (Delta) |
| **Version** | 1.0 |
| **Status** | **Draft** |
| **Date** | 2026-08-03 |
| **References** | [DOC-13](../../phase-1/architecture/13-DEVOPS-AND-DEPLOYMENT-ARCHITECTURE.md) |

---

## 1. Infrastructure Additions

| Component | Purpose |
|-----------|---------|
| CloudFront CDN | Static assets, prescription PDF edge cache (signed URLs) |
| AWS WAF | OWASP rules on ALB (Phase 1.5 → Phase 2 hardening) |
| Secrets Manager | Payment API keys, video SDK secrets |
| S3 buckets | `health360-clinical-docs-{env}` with SSE-KMS |

---

## 2. CI/CD Additions

| Pipeline step | Phase 2 |
|---------------|---------|
| Payment webhook contract tests | Mock Razorpay events |
| PCI scan (Qualys) | Pre-prod gate |
| Synthetic payment smoke | Staging nightly |

---

## 3. Monitoring Alerts (New)

| Alert | Threshold |
|-------|-----------|
| Payment webhook failure rate | > 2% in 15 min → P0 |
| Video room creation failure | > 5% in 15 min → P1 |
| Prescription PDF generation error | Any → P1 |

---

## 4. Environment Strategy

| Env | Phase 2 modules |
|-----|-----------------|
| Local | Razorpay test mode; video SDK sandbox |
| Staging | Full integration; test cards |
| Production | Manual approval gate for payment keys rotation |

---

*End of DOC-32 — Phase 2 DevOps Delta v1.0*
