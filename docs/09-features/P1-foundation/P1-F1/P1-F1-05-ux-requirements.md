# P1-F1-05 — UX Requirements

| Feature | P1-F1 |
| Status | DRAFT |

---

## Screens

### `/reception/patients/search`

- Search bar with mode tabs: UHID | Mobile | Name
- Name mode: first name, last name, DOB required
- Results table: UHID, name, mobile, DOB, last visit (if available)
- Empty state: "No patient found — Register new"
- Loading skeleton; error toast on 403/500

### `/reception/patients/new`

- Form sections: Identity, Contact, Address
- Required: legal first/last name, DOB, gender, primary mobile
- Submit → duplicate modal if 409
- Success → redirect to receipt

### Duplicate modal

- Table of candidates with match reason
- Actions: **Open Existing** (primary) | **Continue New Registration** (secondary, requires reason text)
- Continue New disabled for RECEPTIONIST if policy requires HOSPITAL_ADMIN (configurable)

### `/reception/patients/:id/receipt`

- Hospital logo/name (from staff context)
- UHID large format
- Print button (browser print CSS)
- "Proceed to visit" CTA (disabled until P2 — label "Coming soon" or link to existing OPD if available)

---

## Accessibility

- Form labels, keyboard navigation, MUI contrast standards

---

## Responsive

- Desktop-first reception desk; tablet minimum width 768px

---

## No manual hospital UUID

Hospital and branch displayed read-only from staff session.
