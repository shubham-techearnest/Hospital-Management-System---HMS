# Health360 AI — Mobile Sprint Status

| Attribute | Value |
|-----------|-------|
| **Document ID** | MOBILE-STATUS-001 |
| **Version** | 1.0.0 |
| **Last Updated** | 2026-07-31 |
| **Strategy** | [MOBILE_DEVELOPMENT_STRATEGY.md](./MOBILE_DEVELOPMENT_STRATEGY.md) |

---

## 1. Summary

| Workstream | Through Sprint | Status |
|------------|----------------|--------|
| Backend | S9 (target) | Ahead of mobile |
| Web Frontend | S9 (target) | Ahead of mobile |
| **Mobile** | **S11+** | Search/geo and P1 features in progress |
| Documentation | MOBILE-STRAT-001 + S1 notes | Active |

**Next mobile iteration:** S12 — doctor/hospital search per roadmap.

---

## 2. Catch-Up Progress

| Sprint | Backend/Web | Mobile Status | Mobile Screens | Notes |
|--------|-------------|---------------|----------------|-------|
| S0 | Scaffold | ✅ Complete | — | TypeScript shell only; no RN native project |
| S1 | Auth | ✅ Complete | Login, Register, Verify Email | Expo init; secure storage; API client; role home placeholders |
| S2 | RBAC + Settings | ✅ Complete | Account Settings, Change Password, Notification Prefs | Bottom tabs; settings stack; RoleGuard |
| S3 | Patient Profile | ✅ Complete | Consent, Profile accordion (6 sections) | Medical/emergency CRUD; completion widget |
| S4 | Vitals + Completion | ✅ Complete | Dashboard, Vitals screen, Record dialog | Latest vitals cards; compact completion widget |
| S5 | Doctor Profile | ✅ Complete | Doctor profile accordion (5 sections) | Professional, qualifications, experience, specialization, fees |
| S6 | Doctor Verification | ✅ Complete | Document upload, Submit, Status | expo-document-picker; verification tab |
| S7 | Hospital Setup | ✅ Complete | Hospital portal + doctor associations | HOSPITAL_ADMIN routing; manage stack |
| S8 | Scheduling Core | ✅ Complete | Doctor schedule, book appointment | Weekly templates; availability; booking |
| S9 | Scheduling Lifecycle | ✅ Complete | Appointments list + detail | Cancel/reschedule; history |
| S10 | Formula Engine | ✅ Complete (backend) | — | Backend-only sprint |
| S11 | Health Dashboard | ✅ Complete | Dashboard scores + metrics | `useHealthDashboard`, PatientHomeScreen |
| S12+ | Ongoing | 🔄 In Progress | Per [DOC-15](../delivery/15-DEVELOPMENT-ROADMAP.md) | Search, geo, public profiles |

**Legend:** ✅ Complete · 🔄 In Progress · ⬜ Pending · ⏸ Blocked (API not ready)

---

## 3. Navigation Structure (Current)

```
RootNavigator
├── AuthStack (unauthenticated)
│   ├── LoginScreen
│   ├── RegisterScreen
│   └── VerifyEmailScreen
└── AppShell (authenticated, role-based)
    ├── PatientTabNavigator (role: PATIENT)
    │   ├── Dashboard (HomeStack)
    │   │   ├── PatientHomeScreen — completion widget + latest vitals
    │   │   └── VitalsScreen — 8-card grid + record FAB
    │   ├── Doctors (CareStack)
    │   │   ├── DoctorSearchScreen — browse/search verified doctors
    │   │   ├── BookAppointmentScreen — location + slot picker + book
    │   │   ├── AppointmentsListScreen — upcoming/past/cancelled
    │   │   └── AppointmentDetailScreen — cancel/reschedule
    │   ├── Appointments (AppointmentsStack)
    │   │   ├── AppointmentsListScreen
    │   │   └── AppointmentDetailScreen
    │   ├── Profile → ProfileHubScreen (consent gate via PatientAppNavigator)
    │   └── Settings → SettingsStack
    └── DoctorTabNavigator (role: DOCTOR)
        ├── Profile → DoctorProfileScreen (5 accordion sections)
        ├── Verification → DoctorVerificationScreen
        ├── Schedule → DoctorScheduleScreen
        ├── Hospitals → DoctorHospitalAssociationsScreen
        └── Settings → SettingsStack (shared)
    └── HospitalTabNavigator (role: HOSPITAL_ADMIN)
        ├── Profile → HospitalProfileScreen
        ├── Branches → HospitalBranchesScreen
        ├── Manage → HospitalManageStack (Departments, Emergency, Doctors)
        └── Settings → SettingsStack (shared)
```

---

## 4. Implemented Screens

| Screen ID | Name | Sprint | File |
|-----------|------|--------|------|
| SCR-PUB-002 | Login | S1 | `src/features/auth/screens/LoginScreen.tsx` |
| SCR-PUB-003 | Register | S1 | `src/features/auth/screens/RegisterScreen.tsx` |
| SCR-PUB-004 | Verify Email | S1 | `src/features/auth/screens/VerifyEmailScreen.tsx` |
| SCR-PAT-009 | Record Vital Signs | S4 | `RecordVitalsDialog.tsx`, `VitalsScreen.tsx` |
| SCR-PAT-014 | Profile Completion (dashboard) | S4 | `ProfileCompletionWidget` compact on dashboard |
| SCR-PAT-001 | Health Dashboard | S4 | `PatientHomeScreen.tsx` |
| SCR-PAT-015 | Health Data Consent | S3 | `ConsentScreen.tsx` |
| SCR-PAT-002–008 | Health Profile (accordion) | S3 | `ProfileHubScreen.tsx` + section components |
| — | Doctor Profile (accordion) | S5 | `DoctorProfileScreen.tsx` + section components |
| SCR-DOC-005 | Doctor Verification | S6 | `DoctorVerificationScreen.tsx` |
| SCR-HOS-002 | Hospital Profile | S7 | `HospitalProfileScreen.tsx` |
| SCR-HOS-003 | Branches | S7 | `HospitalBranchesScreen.tsx` |
| SCR-HOS-004 | Departments | S7 | `HospitalDepartmentsScreen.tsx` |
| SCR-HOS-005 | Emergency & ICU | S7 | `HospitalEmergencyScreen.tsx` |
| SCR-HOS-006 | Doctor Roster | S7 | `HospitalDoctorsScreen.tsx` |
| SCR-DOC-004 | Doctor Hospital Associations | S7 | `DoctorHospitalAssociationsScreen.tsx` |
| SCR-DOC-006 | Doctor Weekly Schedule | S8 | `DoctorScheduleScreen.tsx` |
| SCR-PAT-016 | Find Doctor / Book Appointment | S8 | `DoctorSearchScreen.tsx`, `BookAppointmentScreen.tsx` |
| SCR-PAT-017 | Appointments List | S9 | `AppointmentsListScreen.tsx` |
| SCR-PAT-018 | Appointment Detail | S9 | `AppointmentDetailScreen.tsx` |
| SCR-PAT-020 | Account Settings | S2 | `src/features/settings/screens/AccountSettingsScreen.tsx` |
| SCR-PAT-021 | Notification Preferences | S2 | `src/features/settings/screens/NotificationPreferencesScreen.tsx` |
| — | Unauthorized (unsupported role) | S2 | `src/features/auth/screens/UnauthorizedScreen.tsx` |

---

## 5. Reusable Components

| Component | Sprint | File |
|-----------|--------|------|
| ScreenContainer | S1 | `src/shared/components/ScreenContainer.tsx` |
| AuthProvider / useAuth | S1 | `src/features/auth/context/AuthContext.tsx` |
| apiClient (Axios + refresh) | S1 | `src/shared/api/client.ts` |
| secureStorage | S1 | `src/shared/storage/secureStorage.ts` |
| RoleGuard / getPrimaryRole | S2 | `src/features/auth/components/RoleGuard.tsx` |
| usePatientProfile / mutations | S3 | `src/features/patient/hooks/usePatientQueries.ts` |
| VitalCard | S4 | `src/features/patient/components/VitalCard.tsx` |
| RecordVitalsDialog | S4 | `src/features/patient/components/RecordVitalsDialog.tsx` |
| useLatestVitals / useRecordVitals | S4 | `src/features/patient/hooks/usePatientQueries.ts` |
| useDoctorProfile / doctor mutations | S5 | `src/features/doctor/hooks/useDoctorQueries.ts` |
| ProfileAccordionSection (shared) | S3/S5 | patient + doctor profile hubs |

---

## 6. APIs Consumed (Mobile)

| Sprint | Endpoints | Status |
|--------|-----------|--------|
| S1 | `POST /auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `GET /auth/verify-email` | ✅ Integrated |
| S2 | `GET/PATCH /users/me`, `PUT /auth/password`, `GET/PUT /users/me/notification-preferences` | ✅ Integrated |
| S3 | `/patients/me/profile/*`, consent, section PUTs, medical/emergency CRUD | ✅ Integrated |
| S4 | `POST/GET /patients/me/profile/vitals`, `/vitals/latest` | ✅ Integrated |
| S5 | `/doctors/me/profile/*`, `/doctors/specializations` | ✅ Integrated |
| S6 | `/doctors/me/profile/verification-documents`, `/submit-verification`, `/languages` | ✅ Integrated |
| S7 | `/hospitals/me/*`, `/doctors/me/hospital-associations` | ✅ Integrated |
| S8 | `/scheduling/doctors/me/schedules`, `/scheduling/doctors/{id}/locations`, `/scheduling/doctors/{id}/availability`, `POST /scheduling/appointments`, `/search/doctors` | ✅ Integrated |
| S10 | `/analytics/patients/me/dashboard` | ✅ Integrated |
| S11 | `/analytics/patients/me/dashboard`, `/analytics/patients/me/metrics` | ✅ Integrated |

Full reference: [MOBILE_API_INTEGRATION_GUIDE.md](./MOBILE_API_INTEGRATION_GUIDE.md).

---

## 7. Pending Work

### 7.1 Immediate (S12+)

- [ ] Doctor/hospital search and geo discovery per roadmap

### 7.2 Infrastructure

- [ ] CI mobile build job (`ci-mobile` workflow enhancement)
- [ ] Detox or Maestro E2E (S4+)
- [ ] Push notification setup (S9+)

---

## 8. Sprint Notes

### 2026-07-31 — S9 Mobile Appointment History Complete

- Appointments list with upcoming/past/cancelled filters
- Appointment detail with cancel and reschedule dialogs
- Lifecycle API hooks in `schedulingApi.ts`

### 2026-08-01 — S11 Mobile Health Dashboard

- Wellness and health risk score cards on patient home
- Top calculated metrics from `/analytics/patients/me/dashboard`
- `analyticsApi.ts` + `useHealthDashboard` hook

### 2026-08-01 — S8 Mobile booking UX refresh

- **Find Doctor** tab with `DoctorSearchScreen` (search/browse via `/search/doctors`)
- Dedicated **Appointments** tab (`AppointmentsStackNavigator`)
- Removed manual doctor-ID entry screen; booking starts from search results
- Hospital location picker shows readable hospital/branch labels

### 2026-07-31 — S8 Mobile Scheduling Core Complete

- Doctor Schedule tab: weekly blocks, location picker, create/update schedule
- Patient booking: search doctor → select hospital location → pick AVAILABLE slot → book
- `schedulingApi.ts` + `useSchedulingQueries.ts`
- Backend V11 migration (`scheduling` schema); pessimistic lock on booking

### 2026-07-31 — S7 Mobile Hospital Setup Complete

- Hospital admin tab navigator: profile, branches, manage stack (departments, emergency, doctors)
- Doctor hospital associations tab
- `hospitalApi.ts` + `useHospitalQueries.ts`; HOSPITAL_ADMIN role routing
- Test with `hospital.admin@health360.test` / `SecureP@ss1!`

### 2026-07-31 — S6 Mobile Doctor Verification Complete

- Verification tab with checklist, language chips, document upload/remove, submit flow
- `expo-document-picker` for PDF/JPEG/PNG uploads via multipart FormData
- Verification API hooks in `doctorApi.ts` + `useDoctorQueries.ts`
- Profile CTA navigates to Verification when status is DRAFT or REJECTED

### 2026-07-30 — S5 Mobile Doctor Profile Complete

- Doctor profile accordion with 5 sections (professional, qualifications, experience, specialization, consultation fees)
- `doctorApi.ts` + `useDoctorQueries.ts` mirroring web
- Verification status chip; lazy-mount accordion sections
- Doctor tab Profile screen replaces S1 placeholder

### 2026-07-30 — S4 Mobile Vitals + Dashboard Complete

- Health dashboard with compact profile completion widget
- Latest vitals summary cards (BP, pulse, SpO2, BMI)
- RecordVitalsDialog + full VitalsScreen (8-card grid)
- useLatestVitals / useRecordVitals hooks; vitals API in patientApi

### 2026-07-30 — S3 Mobile Patient Profile Complete

- Consent screen with POST `/patients/me/profile/consent`
- Profile hub with 6 accordion sections (basic, contact, measurements, medical, lifestyle, emergency)
- React Query patient hooks mirroring web
- PatientAppNavigator consent gate before portal tabs

### 2026-07-30 — S2 Mobile Settings + RBAC Nav Complete

- Account settings (profile PATCH, change password with forced re-login)
- Notification preferences (email/SMS toggles per type)
- Patient/Doctor bottom-tab shell with shared Settings stack
- RoleGuard + UnauthorizedScreen for unsupported roles
- React Query hooks for user profile and notification prefs

### 2026-07-30 — S1 Mobile Auth Complete

- Expo SDK 52 project initialized in `mobile/health360-mobile/`
- Auth screens: Login, Register, Verify Email (deep link support)
- `expo-secure-store` session persistence; Axios client with 401 refresh retry
- Role-based routing to Patient/Doctor placeholder homes after login
- `npm run typecheck` passes

### 2026-07-30 — Strategy Update

- Parallel mobile development policy adopted ([MOBILE-STRAT-001](./MOBILE_DEVELOPMENT_STRATEGY.md))
- Mobile remains at S0 scaffold; catch-up begins with S1 in next mobile iteration
- Backend/web continue without interruption
- [MOBILE-API-001](./MOBILE_API_INTEGRATION_GUIDE.md) available for API handover

---

## 9. Change Log

| Date | Sprint | Change |
|------|--------|--------|
| 2026-08-01 | S8 | Find Doctor tab, DoctorSearchScreen, Appointments tab; removed BookAppointmentEntryScreen |
| 2026-07-31 | S7 | Hospital portal screens, HOSPITAL_ADMIN routing, doctor associations |
| 2026-07-31 | S6 | Doctor verification screen, document picker, verification API hooks |
| 2026-07-30 | S5 | Doctor profile accordion, doctor API module |
| 2026-07-30 | S4 | Vitals entry, dashboard widgets, VitalsScreen |
| 2026-07-30 | S3 | Patient consent + profile accordion, patient API module |
| 2026-07-30 | S2 | Settings screens, RBAC tab navigation, user API integration |
| 2026-07-30 | S1 | Auth stack, API client, secure storage, navigation — mobile catch-up |
| 2026-07-30 | — | Initial status document; catch-up program defined |
