# Health360 Test Data

| Doc | H360-TEST-DATA-001 |
| Master | [HEALTH360_END_TO_END_SYSTEM_VALIDATION.md](./HEALTH360_END_TO_END_SYSTEM_VALIDATION.md) |

## Hospital

| Field | Value |
|-------|-------|
| Name | Health360 Test Multispeciality Hospital |
| Registration / Code | H360-TEST-001 |
| Type | Multispeciality (or closest UI option) |
| Plan | FREE (or available seed plan) |
| Isolation peer | Health360 Test Hospital B |

## Departments (minimum)

General Medicine · Orthopedics · Cardiology · Laboratory · Pharmacy · Nursing / IPD

## Wards & beds

| Ward | Rooms | Beds (min) | Purpose |
|------|-------|------------|---------|
| General Ward | GW-1 | 4 | Patient 3 admit |
| Semi-Private | SP-1 | 2 | Transfer target |
| Private | PR-1 | 2 | Optional |
| ICU | ICU-1 | 2 | Escalate optional |

Initial bed status: `AVAILABLE`

## Lab catalog (minimum)

| Test | Category | Notes |
|------|----------|-------|
| CBC | Hematology | Patient 2 |
| Blood Sugar (RBS/FBS) | Biochemistry | Patient 2 |
| Lipid Profile | Biochemistry | Patient 2 |

Record prices if catalog supports them.

## Pharmacy medicines (minimum)

| Medicine | Generic | Initial stock | Notes |
|----------|---------|---------------|-------|
| Paracetamol 500mg | Paracetamol | 200 | Expiry > 6 months |
| Amoxicillin 500mg | Amoxicillin | 100 | |
| Pantoprazole 40mg | Pantoprazole | 100 | |
| Vitamin D3 | Cholecalciferol | 50 | |
| Metformin 500mg | Metformin | 100 | |

Include batch #, purchase/selling price, reorder level (e.g. 20).

## Patients

| ID | Name | Age | Gender | DOB (example) | Mobile | Email (if self-reg) | Journey |
|----|------|-----|--------|---------------|--------|---------------------|---------|
| P1 | Rahul Sharma | 32 | Male | 1994-03-15 | 9000000001 | rahul.sharma.h360qa@example.com | J1 OPD |
| P2 | Priya Patil | 28 | Female | 1998-07-22 | 9000000002 | _(none initially)_ | J2 OPD+Lab+Rx |
| P3 | Amit Kulkarni | 56 | Male | 1970-01-10 | 9000000003 | amit.kulkarni.h360qa@example.com | J3 IPD |

Passwords: set at registration / desk temp password — record in [TEST_USERS.md](./TEST_USERS.md).

## Clinical sample data

| Context | Sample |
|---------|--------|
| P1 chief complaint | Fever and body ache × 3 days |
| P1 vitals | BP 120/80, Pulse 78, Temp 38.2, SpO2 98% |
| P1 diagnosis | Acute viral fever (or ICD from catalog) |
| P1 Rx | Paracetamol 500mg TDS × 3 days |
| P2 labs | CBC, RBS, Lipid Profile |
| P3 admission reason | Unstable angina / observation (or GM admit) |
| P3 transfer | General → Semi-Private |

## Billing workaround (known gap G-001/G-002)

When lab/pharmacy do not auto-create invoice lines, add **manual** line items on checkout/invoice and note PARTIAL in execution summary.
