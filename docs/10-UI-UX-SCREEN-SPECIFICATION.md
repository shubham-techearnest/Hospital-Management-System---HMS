# DOC-10: Health360 AI — UI/UX Screen Specification

| Attribute | Value |
|-----------|-------|
| **Document ID** | DOC-10 |
| **Title** | UI/UX Screen Specification |
| **Version** | 1.0 |
| **Status** | **Approved** |
| **Date** | 2026-07-29 |
| **Author** | UI/UX Architect / Technical Lead |
| **References** | [DOC-03] FRS, [DOC-07] REST API, [DOC-09] Validation Catalog |
| **Next Document** | [DOC-11] System Architecture Document |

---

## 1. Executive Summary

This document specifies every user-facing **screen** for Health360 AI Phase 1 across **React web** (Material UI) and **React Native mobile**. Each screen defines purpose, components, fields, actions, validation, navigation, empty/loading states, and responsive behavior.

**Totals:** 68 screens | 5 persona portals | 4 responsive breakpoints  
**Design System:** Material UI 6 (web) | React Native Paper (mobile) — shared brand tokens

---

## 2. Design System Foundation

### 2.1 Brand Tokens

| Token | Value | Usage |
|-------|-------|-------|
| primary | `#1565C0` | Primary actions, links, active nav |
| primaryDark | `#0D47A1` | Hover states |
| secondary | `#00897B` | Healthcare accent, success |
| error | `#D32F2F` | Critical metrics, errors |
| warning | `#F57C00` | Warning classifications |
| success | `#388E3C` | Normal/healthy classifications |
| background | `#FAFAFA` | Page background |
| surface | `#FFFFFF` | Cards, panels |
| textPrimary | `#212121` | Body text |
| textSecondary | `#757575` | Labels, hints |

### 2.2 Typography (Web — MUI)

| Variant | Size | Weight | Usage |
|---------|------|--------|-------|
| h1 | 32px | 600 | Page titles |
| h2 | 24px | 600 | Section headers |
| h3 | 20px | 500 | Card titles |
| body1 | 16px | 400 | Primary content |
| body2 | 14px | 400 | Secondary content |
| caption | 12px | 400 | Labels, timestamps |

### 2.3 Responsive Breakpoints [NFR-USAB-006]

| Name | Width | Layout |
|------|-------|--------|
| xs (mobile) | 360–767px | Single column; bottom nav (mobile app) |
| sm (tablet) | 768–1023px | Single/dual column |
| md (desktop) | 1024–1439px | Sidebar + content |
| lg (wide) | 1440px+ | Max content width 1280px centered |

### 2.4 Shared Components Library

| Component | MUI/Web | Mobile |
|-----------|---------|--------|
| PrimaryButton | `<Button variant="contained">` | `<Button mode="contained">` |
| MetricCard | Custom Card + Chip classification | Same pattern |
| ProfileSectionCard | Card with completion indicator | Accordion list item |
| SearchFilterDrawer | MUI Drawer | Bottom sheet |
| EmptyState | Illustration + CTA | Same |
| SkeletonLoader | MUI Skeleton | Shimmer placeholder |
| ClassificationBadge | Chip (color by NORMAL/WARNING/CRITICAL) | Badge |
| DisclaimerBanner | Alert severity="info" | Info banner |
| DataTable | MUI DataGrid | FlatList |
| StepperWizard | MUI Stepper | Progress indicator |

### 2.5 Screen ID Convention

`SCR-{PORTAL}-{NNN}` — Portal: PUB (public), PAT (patient), DOC (doctor), HOS (hospital admin), ADM (admin)

---

## 3. Information Architecture

### 3.1 Public (Guest) Navigation

```
Landing → Search Doctors / Search Hospitals
       → Doctor Public Profile → [Login] → Book Appointment
       → Hospital Public Profile
       → Register / Login
```

### 3.2 Patient Portal Navigation (Web Sidebar / Mobile Bottom Tabs)

| Nav Item | Route | Icon |
|----------|-------|------|
| Dashboard | `/patient/dashboard` | Dashboard |
| My Profile | `/patient/profile` | Person |
| Find Care | `/patient/search` | Search |
| Appointments | `/patient/appointments` | Calendar |
| Settings | `/patient/settings` | Settings |

### 3.3 Doctor Portal Navigation

| Nav Item | Route |
|----------|-------|
| Home | `/doctor/dashboard` |
| My Profile | `/doctor/profile` |
| Schedule | `/doctor/schedule` |
| Appointments | `/doctor/appointments` |
| Settings | `/doctor/settings` |

### 3.4 Hospital Admin Portal Navigation

| Nav Item | Route |
|----------|-------|
| Overview | `/hospital/dashboard` |
| Profile | `/hospital/profile` |
| Branches | `/hospital/branches` |
| Departments | `/hospital/departments` |
| Doctors | `/hospital/doctors` |
| Settings | `/hospital/settings` |

### 3.5 Platform Admin Navigation

| Nav Item | Route |
|----------|-------|
| Dashboard | `/admin/dashboard` |
| Users | `/admin/users` |
| Verifications | `/admin/verifications` |
| Audit Logs | `/admin/audit-logs` |
| Reviews | `/admin/reviews` |

---

## 4. Screen Catalog

| ID | Screen Name | Portal | Auth | Priority |
|----|-------------|--------|------|----------|
| SCR-PUB-001 | Landing Page | Public | No | P0 |
| SCR-PUB-002 | Login | Public | No | P0 |
| SCR-PUB-003 | Register | Public | No | P0 |
| SCR-PUB-004 | Email Verification | Public | No | P0 |
| SCR-PUB-005 | Search Doctors | Public | No | P0 |
| SCR-PUB-006 | Search Hospitals | Public | No | P0 |
| SCR-PUB-007 | Doctor Public Profile | Public | No | P0 |
| SCR-PUB-008 | Hospital Public Profile | Public | No | P0 |
| SCR-PAT-001 | Health Dashboard | Patient | Yes | P0 |
| SCR-PAT-002 | Profile Hub | Patient | Yes | P0 |
| SCR-PAT-003 | Basic Information | Patient | Yes | P0 |
| SCR-PAT-004 | Contact Information | Patient | Yes | P0 |
| SCR-PAT-005 | Physical Measurements | Patient | Yes | P0 |
| SCR-PAT-006 | Medical Information | Patient | Yes | P0 |
| SCR-PAT-007 | Lifestyle Profile | Patient | Yes | P0 |
| SCR-PAT-008 | Emergency Contacts | Patient | Yes | P0 |
| SCR-PAT-009 | Family Members | Patient | Yes | P1 |
| SCR-PAT-010 | Record Vitals | Patient | Yes | P0 |
| SCR-PAT-011 | Record Lab Values | Patient | Yes | P1 |
| SCR-PAT-012 | Health Goals | Patient | Yes | P1 |
| SCR-PAT-013 | Health Documents | Patient | Yes | P1 |
| SCR-PAT-014 | Health Timeline | Patient | Yes | P1 |
| SCR-PAT-015 | Health Consent | Patient | Yes | P0 |
| SCR-PAT-016 | Book Appointment Wizard | Patient | Yes | P0 |
| SCR-PAT-017 | Appointments List | Patient | Yes | P0 |
| SCR-PAT-018 | Appointment Detail | Patient | Yes | P0 |
| SCR-PAT-019 | Submit Review | Patient | Yes | P1 |
| SCR-PAT-020 | Account Settings | Patient | Yes | P0 |
| SCR-PAT-021 | Notification Preferences | Patient | Yes | P1 |
| SCR-PAT-022 | Metric Detail | Patient | Yes | P0 |
| SCR-DOC-001 | Doctor Dashboard | Doctor | Yes | P0 |
| SCR-DOC-002 | Professional Profile Editor | Doctor | Yes | P0 |
| SCR-DOC-003 | Qualifications & Experience | Doctor | Yes | P0 |
| SCR-DOC-004 | Hospital Associations | Doctor | Yes | P0 |
| SCR-DOC-005 | Verification Status | Doctor | Yes | P0 |
| SCR-DOC-006 | Schedule Manager | Doctor | Yes | P0 |
| SCR-DOC-007 | Appointments List | Doctor | Yes | P0 |
| SCR-DOC-008 | Appointment Detail | Doctor | Yes | P0 |
| SCR-DOC-009 | Patient Summary (Limited) | Doctor | Yes | P1 |
| SCR-DOC-010 | Doctor Settings | Doctor | Yes | P0 |
| SCR-HOS-001 | Hospital Dashboard | Hospital | Yes | P0 |
| SCR-HOS-002 | Hospital Profile Editor | Hospital | Yes | P0 |
| SCR-HOS-003 | Branch Manager | Hospital | Yes | P0 |
| SCR-HOS-004 | Department Manager | Hospital | Yes | P0 |
| SCR-HOS-005 | Facility Manager | Hospital | Yes | P0 |
| SCR-HOS-006 | Doctor Roster | Hospital | Yes | P0 |
| SCR-HOS-007 | Gallery Manager | Hospital | Yes | P1 |
| SCR-HOS-008 | Emergency & ICU Info | Hospital | Yes | P0 |
| SCR-ADM-001 | Admin Dashboard | Admin | Yes | P0 |
| SCR-ADM-002 | User Management | Admin | Yes | P0 |
| SCR-ADM-003 | Doctor Verification Queue | Admin | Yes | P0 |
| SCR-ADM-004 | Verification Review Detail | Admin | Yes | P0 |
| SCR-ADM-005 | Audit Log Viewer | Admin | Yes | P0 |
| SCR-ADM-006 | Review Moderation | Admin | Yes | P1 |

**Mobile-only variants:** SCR-PAT-M01 through M05 (tab screens mirroring web patient core flows)

---

## 5. Public Screens

---

### SCR-PUB-001: Landing Page

| Attribute | Detail |
|-----------|--------|
| **Route** | `/` |
| **Purpose** | Convert guests; communicate value proposition; entry to search |
| **API** | None (static + optional featured doctors API) |

**Components:**
- Hero section: headline, subtext, CTA buttons
- Search bar (quick doctor/hospital search)
- Feature highlights (3 cards: Profile, Find Care, Book)
- Featured verified doctors carousel
- Footer: links, privacy, terms

**Buttons:**
| Button | Action | Navigation |
|--------|--------|------------|
| Find a Doctor | Primary CTA | SCR-PUB-005 |
| Find a Hospital | Secondary | SCR-PUB-006 |
| Sign Up | Header | SCR-PUB-003 |
| Log In | Header | SCR-PUB-002 |

**Empty State:** N/A  
**Loading State:** Skeleton for featured doctors carousel  
**Responsive:** Hero stacks vertically on xs; carousel 1 card mobile, 3 desktop

---

### SCR-PUB-002: Login

| Attribute | Detail |
|-----------|--------|
| **Route** | `/login` |
| **Purpose** | Authenticate returning users |
| **API** | POST `/auth/login` [API-IAM-004] |

**Fields:**

| Field | Component | Validation [DOC-09] |
|-------|-----------|---------------------|
| email | TextField type=email | VAL-IAM-002 |
| password | TextField type=password | Required |

**Buttons:** Log In (submit), Forgot Password (Phase 1.5 — disabled with tooltip), Sign Up link

**Validation:** Inline on blur; form-level on submit; show lockout message [BR-AUTH-005]

**Navigation:** Success → role-based redirect (Patient dashboard, Doctor dashboard, etc.)

**Loading State:** Button spinner, disable form  
**Responsive:** Centered card max-width 400px all breakpoints

---

### SCR-PUB-003: Register

| Attribute | Detail |
|-----------|--------|
| **Route** | `/register` |
| **API** | POST `/auth/register` [API-IAM-001] |

**Fields:** email, password, confirmPassword, firstName, lastName, phone, role (Patient/Doctor radio), acceptTerms (checkbox)

**Validation:** [VAL-IAM-001–007], Zod `registerSchema`

**Buttons:** Create Account | Already have account? Log In

**Navigation:** Success → SCR-PUB-004 (check email message)

---

### SCR-PUB-005: Search Doctors

| Attribute | Detail |
|-----------|--------|
| **Route** | `/search/doctors` |
| **API** | GET `/search/doctors` [API-SRH-002] |

**Components:**
- Search input with autocomplete
- Filter button → Filter Drawer (specialization, experience, distance, rating, fee, gender, language, availability date)
- Sort dropdown (Relevance, Nearest, Highest Rated, Most Experienced, Lowest Fee)
- Location chip (current city or "Use my location")
- Results list: DoctorCard (photo, name, specialization, rating, fee, distance, availability badge)
- Map toggle (list/map split on md+)

**Empty State:** "No doctors found. Try adjusting filters." + Clear Filters button  
**Loading State:** Skeleton cards (6 placeholders)  
**Responsive:** Filters in bottom sheet (mobile); side drawer (desktop)

---

### SCR-PUB-007: Doctor Public Profile

| Attribute | Detail |
|-----------|--------|
| **Route** | `/doctors/:doctorId` |
| **API** | GET `/doctors/{id}/public` [API-DOC-014] |

**Components:**
- Profile header: photo, name, title, verification badge, specialization, rating
- About: biography, languages, experience years
- Qualifications list
- Hospitals & fees table
- Reviews section (paginated)
- Availability preview (next 7 days)
- Sticky footer: **Book Appointment** button

**Buttons:**
| Button | Auth | Action |
|--------|------|--------|
| Book Appointment | Required | → SCR-PAT-016 or login prompt |
| Write Review | Patient + completed appt | → SCR-PAT-019 |

**Empty States:** No reviews: "No reviews yet"  
**Loading:** Skeleton profile header + content blocks

---

## 6. Patient Portal Screens

---

### SCR-PAT-001: Health Dashboard

| Attribute | Detail |
|-----------|--------|
| **Route** | `/patient/dashboard` |
| **Purpose** | Primary patient home — wellness overview and key metrics |
| **API** | GET `/analytics/patients/me/dashboard` [API-ANL-001] |

**Components:**
1. **ProfileCompletionBanner** (if score < 100%) — progress bar + "Complete Profile" CTA → SCR-PAT-002
2. **ScoreGaugesRow** — Wellness Score + Health Risk Score (circular gauges)
3. **DisclaimerBanner** [BR-ANL-001]
4. **MetricsGrid** — 2×4 grid of MetricCards (BMI, BMR, BP, etc.); tap → SCR-PAT-022
5. **GoalsProgressRow** — horizontal chips with progress bars
6. **VitalsTrendSparklines** — mini charts (BP, weight, glucose)
7. **RecentTimeline** — last 5 events → SCR-PAT-014

**Buttons:** Export PDF (P2), Recalculate (debug hidden in prod)

**Empty State (new user):** Welcome card + "Start your health profile" CTA → SCR-PAT-015 consent  
**Loading State:** Full-page skeleton matching layout grid  
**Responsive:** Metrics grid 1 col (xs), 2 col (sm), 4 col (md+); gauges stack on mobile

---

### SCR-PAT-002: Profile Hub

| Attribute | Detail |
|-----------|--------|
| **Route** | `/patient/profile` |
| **Purpose** | Navigation hub for all profile sections with completion status |
| **API** | GET `/patients/me/profile/completion` [API-PAT-025] |

**Components:**
- Overall completion ring (large, center top)
- Section list cards (11 sections): icon, title, description, completion checkmark, chevron
- Each card shows % complete for that section

**Section Cards → Navigation:**

| Section | Route |
|---------|-------|
| Basic Information | SCR-PAT-003 |
| Contact Information | SCR-PAT-004 |
| Physical Measurements | SCR-PAT-005 |
| Medical Information | SCR-PAT-006 |
| Lifestyle | SCR-PAT-007 |
| Emergency Contacts | SCR-PAT-008 |
| Family Members | SCR-PAT-009 |
| Vitals | SCR-PAT-010 |
| Lab Values | SCR-PAT-011 |
| Health Goals | SCR-PAT-012 |
| Documents | SCR-PAT-013 |

**Precondition:** SCR-PAT-015 consent must be accepted first

---

### SCR-PAT-003: Basic Information

| Attribute | Detail |
|-----------|--------|
| **API** | PUT `/patients/me/profile/basic-info` [API-PAT-003] |

**Fields:** dateOfBirth (DatePicker), gender (Select), bloodGroup (Select), maritalStatus, nationality (Select country), profilePhoto (upload)

**Buttons:** Save (primary), Cancel (back to hub)

**Validation:** [VAL-PAT-001], inline errors  
**Loading:** Save button spinner  
**Success:** Snackbar "Basic information saved" + update completion score

---

### SCR-PAT-005: Physical Measurements

**Fields:** heightCm, weightKg, waistCm, hipCm, neckCm, bodyFatPercent, measuredAt  
**Components:** BMI preview (live calc as user types), measurement history table below form  
**Validation:** [VAL-PAT-002]  
**API:** PUT physical-measurements + GET history

---

### SCR-PAT-006: Medical Information

**Components:** Tabbed sub-sections — Allergies, Medications, Surgeries, Vaccinations, Chronic Conditions  
Each tab: DataTable + Add button → Dialog form  
**API:** CRUD endpoints [API-PAT-009–013]  
**Empty State per tab:** "No allergies recorded" + Add button

---

### SCR-PAT-010: Record Vitals

**Fields:** systolicBp, diastolicBp, heartRate, temperature, spo2, bloodGlucose, glucoseReadingType, recordedAt  
**Components:** BP classification preview, vitals history chart  
**Validation:** [VAL-PAT-003, VAL-PAT-004]  
**Note:** Append-only — no edit/delete UI [BR-PAT-004]

---

### SCR-PAT-015: Health Data Consent

| Attribute | Detail |
|-----------|--------|
| **Route** | `/patient/profile/consent` |
| **Purpose** | DPDP compliance — explicit consent before profile data collection |
| **API** | POST `/patients/me/profile/consent` |

**Components:** Consent text (scrollable), checkbox "I consent to processing of my health data", Privacy Policy link

**Buttons:** Accept & Continue (disabled until checked), Decline (logout)

**Navigation:** Accept → SCR-PAT-002

---

### SCR-PAT-016: Book Appointment Wizard

| Attribute | Detail |
|-----------|--------|
| **Route** | `/patient/book/:doctorId` |
| **Purpose** | Multi-step booking flow [UC-007] |
| **API** | GET availability, POST `/scheduling/appointments` |

**Steps (MUI Stepper):**

| Step | Screen Content |
|------|---------------|
| 1. Select Hospital | Radio list if doctor at multiple hospitals |
| 2. Select Date | Calendar with available dates highlighted |
| 3. Select Time | Time slot chips (AVAILABLE only) |
| 4. Confirm | Summary: doctor, hospital, date/time, fee, reasonForVisit textarea |
| 5. Success | Confirmation card + appointment ID; Add to calendar (ICS download P2) |

**Validation:** Slot required; reason optional max 500 chars  
**Error States:** SLOT_UNAVAILABLE → return to step 3 with message  
**Loading:** Slot grid skeleton; booking step full overlay spinner  
**Responsive:** Full-screen wizard mobile; modal/dialog variant tablet optional

---

### SCR-PAT-017: Appointments List

**Components:** Tab filter (Upcoming | Past | Cancelled), AppointmentCard list  
**AppointmentCard:** doctor photo, name, hospital, date/time, status chip, actions (Cancel, Reschedule)  
**API:** GET `/scheduling/appointments/me`  
**Empty State:** "No appointments yet" + Find a Doctor CTA  
**Loading:** Skeleton list items

---

### SCR-PAT-018: Appointment Detail

**Components:** Full appointment info, status timeline, action buttons (Cancel if allowed [BR-SCH-004], Reschedule, Write Review if COMPLETED)  
**API:** GET `/scheduling/appointments/{id}`

---

### SCR-PAT-019: Submit Review

**Fields:** rating (1–5 stars), comment (textarea max 1000)  
**API:** POST `/reviews/doctors` or `/reviews/hospitals`  
**Validation:** [VAL-REV-001, BR-REV-001]  
**Navigation:** Success → back to appointment detail or doctor profile

---

### SCR-PAT-022: Metric Detail

| Attribute | Detail |
|-----------|--------|
| **Route** | `/patient/dashboard/metrics/:metricType` |
| **API** | GET `/analytics/patients/me/metrics/{type}`, GET history |

**Components:**
- Large metric value + unit
- ClassificationBadge
- Interpretation paragraph
- DisclaimerBanner
- Reference range table
- Trend line chart (if ≥ 2 points [BR-ANL-006])
- Missing fields CTA (if INSUFFICIENT_DATA)

---

## 7. Doctor Portal Screens

---

### SCR-DOC-001: Doctor Dashboard

**Components:**
- Verification status alert (if not VERIFIED)
- Today's appointments list
- Upcoming week calendar mini-view
- Quick stats: total appointments, rating, pending actions
- CTA: Manage Schedule, Complete Profile

**API:** GET appointments, GET profile status

---

### SCR-DOC-005: Verification Status

**Components:**
- Status stepper: Draft → Submitted → Under Review → Verified/Rejected
- Checklist of requirements (qualifications, certificate, hospital association)
- Rejection reason alert (if REJECTED)
- Upload documents section
- Submit for Verification button (enabled when checklist complete)

**API:** POST submit-verification [API-DOC-013]  
**Error:** 422 shows missing items list inline

---

### SCR-DOC-006: Schedule Manager

**Components:**
- Hospital selector dropdown (if multiple associations)
- Weekly grid editor (day × time blocks)
- Slot duration / buffer settings
- Block dates calendar (leave management)
- Preview generated slots

**Fields per block:** dayOfWeek, startTime, endTime, consultationType  
**Validation:** [BR-SCH-001] — overlapping blocks show inline error  
**API:** CRUD `/scheduling/doctors/me/schedules`

---

### SCR-DOC-008: Appointment Detail (Doctor)

**Components:** Patient name, appointment info, actions: Mark Completed, Mark No-Show, View Patient Summary  
**View Patient Summary:** → SCR-DOC-009 (only within access window [BR-AUTH-007])

---

### SCR-DOC-009: Patient Summary (Limited)

**Components:** Read-only display of allowed fields [FR-PAT-015] — allergies, medications, conditions, latest vitals/labs  
**Banner:** "Limited view — appointment context only"  
**Error 403:** "Patient summary not available outside appointment window"

---

## 8. Hospital Admin Portal Screens

---

### SCR-HOS-003: Branch Manager

**Components:** Branch list cards, Add Branch dialog  
**Add Branch Form:** name, address fields, map picker for lat/lng (Google Maps), phone, working hours editor  
**Validation:** [VAL-HOS-002], [BR-HOS-001]  
**API:** CRUD `/hospitals/me/branches`

---

### SCR-HOS-006: Doctor Roster

**Components:** Search doctors, associated doctors table, Associate Doctor dialog  
**Actions:** Associate, Remove association  
**API:** GET/POST/DELETE `/hospitals/me/doctors`

---

### SCR-HOS-007: Gallery Manager

**Components:** Image grid (max 20), upload dropzone, reorder drag-and-drop  
**Validation:** [VAL-HOS-003] — 5 MB, JPEG/PNG  
**Empty State:** "Add photos of your facility"

---

## 9. Platform Admin Screens

---

### SCR-ADM-003: Doctor Verification Queue

**Components:** DataTable — doctor name, registration #, submitted date, status; filter by PENDING  
**Row action:** Review → SCR-ADM-004  
**SLA indicator:** color if > 48 hours [DOC-02 §8.2]

---

### SCR-ADM-004: Verification Review Detail

**Components:**
- Doctor profile summary (read-only)
- Document viewer (registration certificate, ID proof)
- Approve / Reject buttons
- Reject: reason textarea (required)

**API:** POST approve/reject [API-ADM-DOC-002/003]  
**Navigation:** Back to queue with success snackbar

---

### SCR-ADM-005: Audit Log Viewer

**Components:** Filter bar (user, action, entity, date range), paginated DataTable, expandable row for old/new JSON diff  
**API:** GET `/admin/audit-logs`  
**Loading:** Table skeleton rows

---

## 10. Mobile-Specific UX (React Native)

### 10.1 Patient Bottom Navigation

| Tab | Screen |
|-----|--------|
| Home | SCR-PAT-001 Dashboard |
| Profile | SCR-PAT-002 Hub |
| Search | SCR-PUB-005 |
| Appointments | SCR-PAT-017 |
| More | Settings menu |

### 10.2 Mobile Patterns

| Pattern | Implementation |
|---------|---------------|
| Location permission | SCR-PUB-005 prompts on first search [FR-LOC-006] |
| Pull to refresh | Dashboard, appointments, search results |
| Offline indicator | Banner when no network [NFR-USAB-017] |
| Touch targets | Min 44×44 px [NFR-USAB-016] |
| Biometric login | Phase 1.5 — not in Phase 1 |

### 10.3 Mobile Screen Parity

All P0 patient screens must have mobile equivalents. P1/P2 may be web-first with mobile follow-up in sprint planning.

---

## 11. Global UX Patterns

### 11.1 Loading States

| Context | Pattern |
|---------|---------|
| Page load | Full layout skeleton |
| Button action | Inline CircularProgress, disable button |
| List fetch | Skeleton cards/rows |
| Background refresh | Subtle top progress bar (TanStack Query isFetching) |

### 11.2 Empty States

| Context | Illustration | Message | CTA |
|---------|-------------|---------|-----|
| No appointments | Calendar empty | "No appointments scheduled" | Find a Doctor |
| No vitals | Heart icon | "Record your first vital signs" | Add Vitals |
| No search results | Search icon | "No results found" | Clear Filters |
| Incomplete profile | Profile icon | "Complete your profile for insights" | Go to Profile |

### 11.3 Error States

| Type | UI |
|------|-----|
| Form validation | Inline field error + summary alert |
| API 409 conflict | Dialog with specific message (slot taken) |
| API 403 | Full page or snackbar with explanation |
| Network error | Retry banner with button |
| 500 error | "Something went wrong" + support contact |

### 11.4 Success Feedback

- Snackbar (3 sec auto-dismiss) for saves
- Dialog for major actions (booking confirmed)
- Optimistic UI for non-critical toggles (notification prefs)

---

## 12. Accessibility [NFR-USAB-011]

| Requirement | Implementation |
|-------------|---------------|
| Color contrast | ≥ 4.5:1 text; classification badges include text labels not color-only |
| Keyboard nav | All interactive elements tabbable; focus visible |
| ARIA labels | Icon buttons, gauges, charts |
| Form labels | Explicit `<label>` linked to inputs |
| Screen reader | Metric cards announce value + classification |
| Motion | Respect prefers-reduced-motion |

---

## 13. Screen-to-API Traceability (Sample)

| Screen | Primary APIs |
|--------|-------------|
| SCR-PAT-001 | API-ANL-001 |
| SCR-PAT-016 | API-DOC-017, API-SCH-005 |
| SCR-PUB-005 | API-SRH-002, API-LOC-001 |
| SCR-DOC-006 | API-SCH-001–004 |
| SCR-ADM-004 | API-ADM-DOC-002, API-ADM-DOC-003 |

---

## 14. Approval

| Role | Name | Signature | Date | Status |
|------|------|-----------|------|--------|
| Product Owner | _________________ | _________________ | ________ | Pending |
| UI/UX Lead | _________________ | _________________ | ________ | Pending |
| Technical Lead / Architect | _________________ | _________________ | ________ | Pending |
| Engineering Lead | _________________ | _________________ | ________ | Pending |

---

*End of DOC-10 — UI/UX Screen Specification v1.0*
