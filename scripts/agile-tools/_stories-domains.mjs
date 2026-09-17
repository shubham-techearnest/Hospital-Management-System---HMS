/**
 * Domain story packs for _build-stories-inventory.mjs
 */
export function registerDomains(ctx) {
  const { bulk, atomics, ac, VISION } = ctx;

  // ─── PLATFORM ADMIN ─────────────────────────────────────────────────────
  bulk('ADM', 'EPIC-ADM-001', 'Platform Admin', [
    { id: 'US-ADM-001', sub: 'List users', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want to browse platform users so that I can support accounts.', api: 'AdminUserController', web: 'AdminUsersPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'AdminUsersPage.tsx; AdminUserController', pri: 'P1 — High' },
    { id: 'US-ADM-002', sub: 'Edit user', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want to update user records so that I can correct account issues.', api: 'AdminUserController', web: 'AdminUsersPage.tsx', status: 'UNKNOWN', ev: 'AdminUserController; AdminUsersPage.tsx', pri: 'P1 — High' },
    { id: 'US-ADM-003', sub: 'Disable user', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want to disable a user so that compromised accounts cannot access the system.', api: 'AdminUserController', status: 'UNKNOWN', ev: 'AdminUserController', pri: 'P1 — High' },
    { id: 'US-ADM-004', sub: 'List hospitals', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want to list hospitals so that I can manage tenants.', api: 'AdminHospitalController', web: 'AdminHospitalsPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'AdminHospitalsPage.tsx; AdminHospitalController', pri: 'P1 — High' },
    { id: 'US-ADM-005', sub: 'Hospital detail', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want hospital detail so that I can inspect tenant configuration.', api: 'AdminHospitalController', web: 'AdminHospitalDetailPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'AdminHospitalDetailPage.tsx; AdminHospitalController', pri: 'P1 — High' },
    { id: 'US-ADM-006', sub: 'Onboarding queue', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want to process the onboarding queue so that requests are reviewed.', api: 'AdminOnboardingRequestController; OnboardingRequestService', web: 'AdminOnboardingRequestsPage.tsx', db: 'V104', status: 'PARTIALLY IMPLEMENTED', ev: 'Phase C #15 — queue works; GAP-ONB-001 no auto-provision', pri: 'P0 — Critical' },
    { id: 'US-ADM-007', sub: 'Approve onboarding', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want to approve onboarding so that applicants can proceed.', api: 'OnboardingRequestService', web: 'AdminOnboardingRequestsPage.tsx', db: 'V104', status: 'PARTIALLY IMPLEMENTED', ev: 'OnboardingRequestService; GAP-ONB-001', pri: 'P0 — Critical', ac: ac('request pending', 'I approve', 'status APPROVED but accounts not auto-provisioned') },
    { id: 'US-ADM-008', sub: 'Reject onboarding', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want to reject onboarding with reason so that unqualified applicants stop.', api: 'AdminOnboardingRequestController', web: 'AdminOnboardingRequestsPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'AdminOnboardingRequestController', pri: 'P1 — High' },
    { id: 'US-ADM-009', sub: 'Auto-provision gap', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want approval to auto-provision hospital/doctor accounts so that manual setup is not required.', status: 'PLANNED', ev: 'GAP-ONB-001 OnboardingRequestService', pri: 'P1 — High' },
    { id: 'US-ADM-010', sub: 'Verification queue', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want to review doctor verification submissions so that only verified doctors practice.', api: 'AdminDoctorVerificationController', web: 'AdminVerificationQueuePage.tsx', status: 'IMPLEMENTED', ev: 'Phase C #9 — AdminDoctorVerificationController', pri: 'P0 — Critical' },
    { id: 'US-ADM-011', sub: 'Approve verification', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want to approve doctor verification so that the doctor becomes verified.', api: 'AdminDoctorVerificationController', web: 'AdminVerificationReviewPage.tsx', status: 'IMPLEMENTED', ev: 'Phase C #9', pri: 'P0 — Critical' },
    { id: 'US-ADM-012', sub: 'Reject verification', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want to reject doctor verification with reason so that the doctor can resubmit.', api: 'AdminDoctorVerificationController', web: 'AdminVerificationReviewPage.tsx', status: 'IMPLEMENTED', ev: 'AdminDoctorVerificationController', pri: 'P1 — High' },
    { id: 'US-ADM-013', sub: 'Audit logs', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want to browse audit logs so that I can investigate events.', api: 'AdminAuditLogController', web: 'AdminAuditLogsPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'AdminAuditLogsPage.tsx; AdminAuditLogController', pri: 'P1 — High', audit: 'AdminAuditLogController browse' },
    { id: 'US-ADM-014', sub: 'Admin dashboard', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want an admin dashboard so that I see platform overview.', api: 'DashboardController; HealthController', web: 'AdminDashboardPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'AdminDashboardPage.tsx; HealthController', pri: 'P2 — Medium' },
    { id: 'US-ADM-015', sub: 'Health probe', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want to probe platform health so that I know services are up.', api: 'HealthController', status: 'IMPLEMENTED', ev: 'HealthController — FEAT-PLT-AUDIT-002', pri: 'P1 — High' },
    { id: 'US-ADM-016', sub: 'Review moderation', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want to moderate reviews so that inappropriate content is removed.', api: 'AdminReviewController', web: 'AdminReviewModerationPage.tsx', db: 'V69', status: 'UNKNOWN', ev: 'AdminReviewModerationPage.tsx; AdminReviewController; V69', pri: 'P2 — Medium' },
    { id: 'US-ADM-017', sub: 'Partners list', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want to manage partners so that B2B orgs are tracked.', api: 'AdminPartnerController', web: 'AdminPartnersPage.tsx', status: 'UNKNOWN', ev: 'AdminPartnersPage.tsx; AdminPartnerController', pri: 'P2 — Medium' },
    { id: 'US-ADM-018', sub: 'Partner detail', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want partner detail so that I can edit partner attributes.', api: 'AdminPartnerController', web: 'AdminPartnerDetailPage.tsx', status: 'UNKNOWN', ev: 'AdminPartnerDetailPage.tsx; AdminPartnerController', pri: 'P2 — Medium' },
    { id: 'US-ADM-019', sub: 'Subscription plans', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want to administer plans so that entitlements are defined.', api: 'AdminSubscriptionPlanController', web: 'AdminPlansPage.tsx', db: 'V70', status: 'UNKNOWN', ev: 'AdminPlansPage.tsx; AdminSubscriptionPlanController; V70', pri: 'P1 — High' },
    { id: 'US-ADM-020', sub: 'Hospital subscriptions', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want to manage hospital subscriptions so that tenants are entitled.', api: 'AdminHospitalSubscriptionController', db: 'V70', status: 'UNKNOWN', ev: 'AdminHospitalSubscriptionController; V70', pri: 'P1 — High' },
    { id: 'US-ADM-021', sub: 'Create hospital tenant', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want to create a hospital tenant so that a new facility can onboard.', api: 'AdminHospitalController', web: 'AdminHospitalsPage.tsx', status: 'UNKNOWN', ev: 'AdminHospitalController; AdminHospitalsPage.tsx', pri: 'P1 — High' },
    { id: 'US-ADM-022', sub: 'Suspend hospital', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want to suspend a hospital so that non-paying tenants lose access.', api: 'AdminHospitalController', status: 'UNKNOWN', ev: 'AdminHospitalController', pri: 'P1 — High' },
    { id: 'US-ADM-023', sub: 'Feature entitlement enforce', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want subscription feature enforcement so that unpaid modules stay locked.', db: 'V70__subscription_feature_enforcement.sql', status: 'UNKNOWN', ev: 'V70__subscription_feature_enforcement.sql', pri: 'P1 — High' },
    { id: 'US-ADM-024', sub: 'RBAC probe', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want RBAC probe endpoints so that role wiring can be validated.', api: 'RbacProbeController', status: 'PARTIALLY IMPLEMENTED', ev: 'RbacProbeController', pri: 'P2 — Medium' },
    { id: 'US-ADM-025', sub: 'Search users', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want to search users by email/name so that support is faster.', api: 'AdminUserController', web: 'AdminUsersPage.tsx', status: 'UNKNOWN', ev: 'AdminUsersPage.tsx; AdminUserController', pri: 'P2 — Medium' },
  ]);

  // ─── PUBLIC ─────────────────────────────────────────────────────────────
  bulk('PUB', 'EPIC-PUB-001', 'Public', [
    { id: 'US-PUB-001', sub: 'Consumer landing', actor: 'Public visitor', story: 'As a public visitor, I want to browse the consumer landing page so that I understand Health360.', web: 'LandingPage.tsx', status: 'IMPLEMENTED', ev: 'LandingPage.tsx — FEAT-PUB-LAND-001', pri: 'P1 — High', pre: 'None' },
    { id: 'US-PUB-002', sub: 'Hospital landing', actor: 'Hospital prospect', story: 'As a hospital prospect, I want to browse the hospital landing page so that I can request access.', web: 'HospitalLandingPage.tsx', status: 'IMPLEMENTED', ev: 'HospitalLandingPage.tsx; Phase C #15', pri: 'P1 — High', pre: 'None' },
    { id: 'US-PUB-003', sub: 'Request access submit', actor: 'Doctor or hospital prospect', story: 'As a doctor or hospital prospect, I want to submit an access/demo request so that admins can review me.', api: 'PublicOnboardingRequestController; OnboardingRequestService', web: 'RequestAccessPage.tsx', db: 'V104', status: 'IMPLEMENTED', ev: 'Phase C #15 — RequestAccessPage/OnboardingRequestService/V104', pri: 'P0 — Critical', pre: 'None' },
    { id: 'US-PUB-004', sub: 'Doctor access request', actor: 'Doctor prospect', story: 'As a doctor prospect, I want to submit a doctor access request so that I can join the platform.', api: 'PublicOnboardingRequestController', web: 'RequestAccessPage.tsx', db: 'V104', status: 'IMPLEMENTED', ev: 'Phase C #15 FEAT-PUB-ONB-001', pri: 'P0 — Critical', pre: 'None' },
    { id: 'US-PUB-005', sub: 'Hospital demo request', actor: 'Hospital prospect', story: 'As a hospital prospect, I want to submit a hospital demo request so that sales/admin can engage.', api: 'PublicOnboardingRequestController', web: 'RequestAccessPage.tsx; HospitalLandingPage.tsx', db: 'V104', status: 'IMPLEMENTED', ev: 'Phase C #15 FEAT-PUB-ONB-002', pri: 'P0 — Critical', pre: 'None' },
    { id: 'US-PUB-006', sub: 'Public doctor profile', actor: 'Public visitor', story: 'As a public visitor, I want to view a public doctor profile so that I can evaluate a clinician.', api: 'PublicDoctorProfileController', web: 'PublicDoctorProfilePage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'PublicDoctorProfilePage.tsx; PublicDoctorProfileController', pri: 'P1 — High', pre: 'None' },
    { id: 'US-PUB-007', sub: 'Public hospital profile', actor: 'Public visitor', story: 'As a public visitor, I want to view a public hospital profile so that I can evaluate a facility.', api: 'PublicHospitalProfileController', web: 'PublicHospitalProfilePage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'PublicHospitalProfilePage.tsx; PublicHospitalProfileController', pri: 'P1 — High', pre: 'None' },
    { id: 'US-PUB-008', sub: 'Brand identity', actor: 'Public visitor', story: 'As a public visitor, I want to view brand identity content so that I recognize the product.', web: 'BrandIdentityPage.tsx', status: 'UNKNOWN', ev: 'BrandIdentityPage.tsx', pri: 'P3 — Future', pre: 'None' },
  ]);

  // ─── HOSPITAL ORG / STAFF ───────────────────────────────────────────────
  bulk('HOS', 'EPIC-HOS-001', 'Hospital Org', [
    { id: 'US-HOS-001', sub: 'Hospital profile', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want to manage hospital profile so that public and staff see accurate org info.', api: 'HospitalController', web: 'HospitalProfilePage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'HospitalProfilePage.tsx; HospitalController', pri: 'P1 — High' },
    { id: 'US-HOS-002', sub: 'Branches', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want to manage branches so that multi-site operations are represented.', web: 'HospitalBranchesPage.tsx', api: 'HospitalController', status: 'UNKNOWN', ev: 'HospitalBranchesPage.tsx; HospitalController', pri: 'P2 — Medium' },
    { id: 'US-HOS-003', sub: 'Departments', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want to manage departments so that clinical org structure is defined.', web: 'HospitalDepartmentsPage.tsx', status: 'UNKNOWN', ev: 'HospitalDepartmentsPage.tsx', pri: 'P2 — Medium' },
    { id: 'US-HOS-004', sub: 'Facilities list', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want to manage facilities so that patients see amenities.', web: 'HospitalFacilitiesPage.tsx', api: 'FacilityController', status: 'UNKNOWN', ev: 'HospitalFacilitiesPage.tsx; FacilityController', pri: 'P3 — Future' },
    { id: 'US-HOS-005', sub: 'Gallery', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want to manage gallery images so that marketing reflects the facility.', web: 'HospitalGalleryPage.tsx', api: 'HospitalGalleryController', status: 'UNKNOWN', ev: 'HospitalGalleryPage.tsx; HospitalGalleryController', pri: 'P3 — Future' },
    { id: 'US-HOS-006', sub: 'Clinical catalogs', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want to maintain clinical catalogs so that diagnosis/services are standardized.', api: 'HospitalClinicalCatalogController', web: 'HospitalClinicalCatalogsPage.tsx', status: 'UNKNOWN', ev: 'HospitalClinicalCatalogsPage.tsx; HospitalClinicalCatalogController', pri: 'P2 — Medium' },
    { id: 'US-HOS-007', sub: 'IPD service catalog', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want to maintain IPD service catalog so that admissions bill correct services.', api: 'HospitalIpdServicesController', web: 'HospitalIpdServicesPage.tsx', db: 'V79', status: 'PARTIALLY IMPLEMENTED', ev: 'HospitalIpdServicesPage.tsx; HospitalIpdServicesController; V79', pri: 'P1 — High' },
    { id: 'US-HOS-008', sub: 'Doctor roster', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want to manage the doctor roster so that OPD scheduling knows available doctors.', web: 'HospitalDoctorRosterPage.tsx', api: 'DoctorHospitalAssociationController', status: 'PARTIALLY IMPLEMENTED', ev: 'HospitalDoctorRosterPage.tsx; DoctorHospitalAssociationController', pri: 'P1 — High' },
    { id: 'US-HOS-009', sub: 'Staff invite', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want to invite hospital staff so that roles can operate the hospital portal.', api: 'StaffController.inviteStaff; StaffService.inviteStaff', web: 'HospitalStaffPage.tsx', db: 'V63; V71', status: 'IMPLEMENTED', ev: 'Phase C #10 — HospitalStaffPage → StaffController / StaffService.inviteStaff', pri: 'P0 — Critical' },
    { id: 'US-HOS-010', sub: 'Staff role assign', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want to assign roles to staff so that permissions match duties.', api: 'StaffController', web: 'HospitalStaffPage.tsx', status: 'IMPLEMENTED', ev: 'StaffController; HospitalStaffPage.tsx; Phase C #10', pri: 'P0 — Critical' },
    { id: 'US-HOS-011', sub: 'Staff list', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want to list staff members so that I can manage workforce access.', api: 'StaffController', web: 'HospitalStaffPage.tsx', status: 'IMPLEMENTED', ev: 'HospitalStaffPage.tsx; StaffController', pri: 'P1 — High' },
    { id: 'US-HOS-012', sub: 'Hospital dashboard', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want a hospital dashboard so that I see operational overview.', api: 'DashboardController; CommandCenterController', web: 'HospitalDashboardPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'HospitalDashboardPage.tsx; CommandCenterController', pri: 'P1 — High' },
    { id: 'US-HOS-013', sub: 'Letterhead', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want hospital letterhead configured so that clinical prints are branded.', db: 'V89__hospital_letterhead.sql', web: 'ClinicalDocumentPrintPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'V89__hospital_letterhead.sql; ClinicalDocumentPrintPage.tsx', pri: 'P2 — Medium' },
    { id: 'US-HOS-014', sub: 'Subscription view', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want to view our subscription so that I know entitled features.', web: 'HospitalSubscriptionPage.tsx', db: 'V70', status: 'UNKNOWN', ev: 'HospitalSubscriptionPage.tsx; V70', pri: 'P2 — Medium' },
    { id: 'US-HOS-015', sub: 'Revoke staff access', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want to revoke staff access so that departed employees cannot log in.', api: 'StaffController', web: 'HospitalStaffPage.tsx', status: 'UNKNOWN', ev: 'StaffController; HospitalStaffPage.tsx', pri: 'P1 — High' },
    { id: 'US-HOS-016', sub: 'Reinvite staff', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want to re-send staff invites so that incomplete onboardings can finish.', api: 'StaffController.inviteStaff', web: 'HospitalStaffPage.tsx', status: 'UNKNOWN', ev: 'StaffController.inviteStaff; HospitalStaffPage.tsx', pri: 'P2 — Medium' },
  ]);

  // ─── PATIENT ────────────────────────────────────────────────────────────
  bulk('PAT', 'EPIC-PAT-001', 'Patient', [
    { id: 'US-PAT-001', sub: 'Profile hub', actor: 'PATIENT', story: 'As a patient, I want a profile hub so that I can navigate my health information.', api: 'PatientProfileController', web: 'ProfileHubPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'ProfileHubPage.tsx; PatientProfileController', pri: 'P1 — High' },
    { id: 'US-PAT-002', sub: 'Consent gate', actor: 'PATIENT', story: 'As a patient, I want to accept consent so that care features unlock legally.', web: 'ConsentPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'ConsentPage.tsx', pri: 'P0 — Critical' },
    { id: 'US-PAT-003', sub: 'Capture vitals', actor: 'PATIENT', story: 'As a patient, I want to capture vitals so that my longitudinal health is tracked.', web: 'VitalsPage.tsx', api: 'PatientProfileController / ClinicalController', status: 'PARTIALLY IMPLEMENTED', ev: 'VitalsPage.tsx', pri: 'P1 — High' },
    { id: 'US-PAT-004', sub: 'Vitals history', actor: 'PATIENT', story: 'As a patient, I want to view vitals history so that I can see trends.', web: 'VitalsPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'VitalsPage.tsx', pri: 'P1 — High' },
    { id: 'US-PAT-005', sub: 'Health score', actor: 'PATIENT', story: 'As a patient, I want to view my health score so that I understand wellness status.', web: 'HealthScorePage.tsx', status: 'UNKNOWN', ev: 'HealthScorePage.tsx', pri: 'P2 — Medium' },
    { id: 'US-PAT-006', sub: 'Health timeline', actor: 'PATIENT', story: 'As a patient, I want a health timeline so that encounters and events are chronological.', web: 'HealthTimelinePage.tsx', api: 'PatientSummaryController', status: 'UNKNOWN', ev: 'HealthTimelinePage.tsx; PatientSummaryController', pri: 'P2 — Medium' },
    { id: 'US-PAT-007', sub: 'Lab values view', actor: 'PATIENT', story: 'As a patient, I want to view lab values so that I can track results.', web: 'LabValuesPage.tsx', status: 'UNKNOWN', ev: 'LabValuesPage.tsx', pri: 'P2 — Medium' },
    { id: 'US-PAT-008', sub: 'Request OPD', actor: 'PATIENT', story: 'As a patient, I want to request an OPD visit so that I can see a doctor same-day.', api: 'OpdController.registerOpdRequest', web: 'RequestOpdPage.tsx', db: 'V31; V67', status: 'IMPLEMENTED', ev: 'Phase C #3 — RequestOpdPage.tsx → OpdController.registerOpdRequest → V31/V67', pri: 'P0 — Critical' },
    { id: 'US-PAT-009', sub: 'OPD request status', actor: 'PATIENT', story: 'As a patient, I want to view OPD request status so that I know queue progress.', web: 'PatientOpdStatusPage.tsx', api: 'OpdController', status: 'IMPLEMENTED', ev: 'PatientOpdStatusPage.tsx; OpdController; Phase C #3', pri: 'P1 — High' },
    { id: 'US-PAT-010', sub: 'Encounter list', actor: 'PATIENT', story: 'As a patient, I want to list my encounters so that I can open past visits.', web: 'PatientEncountersPage.tsx', api: 'ClinicalController', status: 'PARTIALLY IMPLEMENTED', ev: 'PatientEncountersPage.tsx; ClinicalController', pri: 'P1 — High' },
    { id: 'US-PAT-011', sub: 'Encounter detail', actor: 'PATIENT', story: 'As a patient, I want encounter detail so that I can review notes and orders shared with me.', web: 'PatientEncounterDetailPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'PatientEncounterDetailPage.tsx', pri: 'P1 — High' },
    { id: 'US-PAT-012', sub: 'Prescriptions list', actor: 'PATIENT', story: 'As a patient, I want to view prescriptions so that I can fulfill medications.', web: 'PatientPrescriptionsPage.tsx', api: 'ClinicalController', db: 'V48', status: 'PARTIALLY IMPLEMENTED', ev: 'PatientPrescriptionsPage.tsx; ClinicalController; V48', pri: 'P1 — High' },
    { id: 'US-PAT-013', sub: 'Health documents', actor: 'PATIENT', story: 'As a patient, I want health documents so that I can download clinical outputs.', web: 'HealthDocumentsPage.tsx', api: 'ClinicalDocumentController', status: 'UNKNOWN', ev: 'HealthDocumentsPage.tsx; ClinicalDocumentController', pri: 'P2 — Medium' },
    { id: 'US-PAT-014', sub: 'IPD stays view', actor: 'PATIENT', story: 'As a patient, I want to view my IPD stays so that I understand admission history.', web: 'PatientIpdStaysPage.tsx', api: 'PatientIpdPortalController', status: 'PARTIALLY IMPLEMENTED', ev: 'PatientIpdStaysPage.tsx; PatientIpdPortalController', pri: 'P1 — High' },
    { id: 'US-PAT-015', sub: 'Payments view', actor: 'PATIENT', story: 'As a patient, I want to view payments so that I can pay outstanding amounts online.', web: 'PatientPaymentsPage.tsx', api: 'OnlinePaymentController', db: 'V73', status: 'IMPLEMENTED', ev: 'Phase C #8 — PatientPaymentsPage → OnlinePaymentController → V73', pri: 'P0 — Critical' },
    { id: 'US-PAT-016', sub: 'Metric detail', actor: 'PATIENT', story: 'As a patient, I want metric detail drill-down so that I understand a specific health metric.', web: 'MetricDetailPage.tsx', status: 'UNKNOWN', ev: 'MetricDetailPage.tsx', pri: 'P3 — Future' },
    { id: 'US-PAT-017', sub: 'Update demographics', actor: 'PATIENT', story: 'As a patient, I want to update demographics so that hospitals see current contact info.', api: 'PatientProfileController', web: 'ProfileHubPage.tsx', status: 'UNKNOWN', ev: 'PatientProfileController; ProfileHubPage.tsx', pri: 'P1 — High' },
    { id: 'US-PAT-018', sub: 'Emergency contacts', actor: 'PATIENT', story: 'As a patient, I want to maintain emergency contacts so that staff can reach family.', api: 'PatientProfileController', status: 'UNKNOWN', ev: 'PatientProfileController', pri: 'P2 — Medium' },
    { id: 'US-PAT-019', sub: 'Allergy list', actor: 'PATIENT', story: 'As a patient, I want to record allergies so that clinicians avoid harmful drugs.', api: 'PatientProfileController / ClinicalController', status: 'UNKNOWN', ev: 'PatientProfileController; ClinicalController', pri: 'P1 — High' },
    { id: 'US-PAT-020', sub: 'Patient summary', actor: 'PATIENT', story: 'As a patient, I want a care summary so that I see key conditions and meds at a glance.', api: 'PatientSummaryController', status: 'UNKNOWN', ev: 'PatientSummaryController', pri: 'P2 — Medium' },
  ]);

  // ─── DOCTOR ─────────────────────────────────────────────────────────────
  bulk('DOC', 'EPIC-DOC-001', 'Doctor', [
    { id: 'US-DOC-001', sub: 'Doctor profile', actor: 'DOCTOR', story: 'As a doctor, I want to manage my profile so that patients see accurate credentials.', api: 'DoctorProfileController', web: 'DoctorProfilePage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'DoctorProfilePage.tsx; DoctorProfileController', pri: 'P1 — High' },
    { id: 'US-DOC-002', sub: 'Submit verification', actor: 'DOCTOR', story: 'As a doctor, I want to submit verification documents so that admin can approve my practice.', api: 'DoctorProfileController / verification APIs', web: 'DoctorVerificationPage.tsx', db: 'V7', status: 'IMPLEMENTED', ev: 'Phase C #9 doctor submit — DoctorVerificationPage; AdminDoctorVerificationController', pri: 'P0 — Critical' },
    { id: 'US-DOC-003', sub: 'Hospital associations', actor: 'DOCTOR', story: 'As a doctor, I want to manage hospital associations so that I practice at linked hospitals.', api: 'DoctorHospitalAssociationController', web: 'DoctorHospitalAssociationsPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'DoctorHospitalAssociationsPage.tsx; DoctorHospitalAssociationController', pri: 'P1 — High' },
    { id: 'US-DOC-004', sub: 'Schedule slots', actor: 'DOCTOR', story: 'As a doctor, I want to manage schedule slots so that patients can book appointments.', api: 'SchedulingController', web: 'DoctorSchedulePage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'DoctorSchedulePage.tsx; SchedulingController', pri: 'P1 — High' },
    { id: 'US-DOC-005', sub: 'Doctor dashboard', actor: 'DOCTOR', story: 'As a doctor, I want a dashboard so that I see today\'s workload.', web: 'DoctorDashboardPage.tsx', api: 'DashboardController', status: 'PARTIALLY IMPLEMENTED', ev: 'DoctorDashboardPage.tsx', pri: 'P1 — High' },
    { id: 'US-DOC-006', sub: 'OPD workbench', actor: 'DOCTOR', story: 'As a doctor, I want an OPD workbench so that I can select queued patients.', web: 'DoctorOpdPage.tsx', api: 'OpdController; ClinicalController', status: 'IMPLEMENTED', ev: 'DoctorOpdPage.tsx; Phase C #5 DoctorEncounterDetailPage path', pri: 'P0 — Critical' },
    { id: 'US-DOC-007', sub: 'Encounter notes Rx vitals', actor: 'DOCTOR', story: 'As a doctor, I want to document encounter notes, prescriptions, and vitals so that care is recorded.', api: 'ClinicalController', web: 'DoctorEncounterDetailPage.tsx', db: 'V30; V48', status: 'IMPLEMENTED', ev: 'Phase C #5 — DoctorEncounterDetailPage → ClinicalController → V30/V48', pri: 'P0 — Critical' },
    { id: 'US-DOC-008', sub: 'Clinical notes', actor: 'DOCTOR', story: 'As a doctor, I want to capture structured clinical notes so that the visit is documented.', api: 'ClinicalController', web: 'DoctorEncounterDetailPage.tsx', db: 'V30', status: 'IMPLEMENTED', ev: 'Phase C #5 — ClinicalController; V30', pri: 'P0 — Critical' },
    { id: 'US-DOC-009', sub: 'Encounter vitals', actor: 'DOCTOR', story: 'As a doctor, I want to record encounter vitals so that physiologic data is captured.', api: 'ClinicalController', web: 'DoctorEncounterDetailPage.tsx', status: 'IMPLEMENTED', ev: 'Phase C #5 — ClinicalController vitals', pri: 'P0 — Critical' },
    { id: 'US-DOC-010', sub: 'Write prescription', actor: 'DOCTOR', story: 'As a doctor, I want to write prescriptions so that pharmacy can dispense.', api: 'ClinicalController', web: 'DoctorEncounterDetailPage.tsx', db: 'V48__clinical_prescriptions.sql', status: 'IMPLEMENTED', ev: 'Phase C #5 — ClinicalController → V48', pri: 'P0 — Critical' },
    { id: 'US-DOC-011', sub: 'Place lab order', actor: 'DOCTOR', story: 'As a doctor, I want to place lab orders so that diagnostics are performed.', api: 'ClinicalController; LabController', web: 'DoctorEncounterDetailPage.tsx', db: 'V35', status: 'IMPLEMENTED', ev: 'Phase C #6 — Clinical orders → LabController', pri: 'P0 — Critical' },
    { id: 'US-DOC-012', sub: 'Place imaging order', actor: 'DOCTOR', story: 'As a doctor, I want to place imaging orders so that radiology can fulfill studies.', api: 'ClinicalController; RadiologyController', web: 'DoctorEncounterDetailPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'ClinicalController; RadiologyController; ImagingOrderDetailPage.tsx', pri: 'P1 — High' },
    { id: 'US-DOC-013', sub: 'Place medication order', actor: 'DOCTOR', story: 'As a doctor, I want to place medication orders so that pharmacy and nursing can administer.', api: 'ClinicalController; PharmacyController', web: 'DoctorEncounterDetailPage.tsx', db: 'V38', status: 'PARTIALLY IMPLEMENTED', ev: 'ClinicalController; PharmacyController; MedicationOrderDetailPage.tsx', pri: 'P1 — High' },
    { id: 'US-DOC-014', sub: 'Recommend IPD', actor: 'DOCTOR', story: 'As a doctor, I want to recommend IPD admission so that hospital can admit the patient.', api: 'IpdController', web: 'DoctorIpdAdmissionPage.tsx; DoctorIpdPage.tsx', db: 'V33; V80', status: 'IMPLEMENTED', ev: 'Phase C #7 — Doctor recommend → IpdController → V33+', pri: 'P0 — Critical' },
    { id: 'US-DOC-015', sub: 'Doctor IPD list', actor: 'DOCTOR', story: 'As a doctor, I want to view my IPD patients so that I can continue inpatient care.', web: 'DoctorIpdPage.tsx', api: 'IpdController', status: 'IMPLEMENTED', ev: 'DoctorIpdPage.tsx; IpdController; Phase C #7', pri: 'P1 — High' },
    { id: 'US-DOC-016', sub: 'My Work queue', actor: 'DOCTOR', story: 'As a doctor, I want a My Work queue so that tasks and follow-ups are visible.', web: 'DoctorMyWorkPage.tsx', api: 'TaskController', status: 'PARTIALLY IMPLEMENTED', ev: 'DoctorMyWorkPage.tsx; TaskController', pri: 'P2 — Medium' },
    { id: 'US-DOC-017', sub: 'Doctor appointments', actor: 'DOCTOR', story: 'As a doctor, I want to list appointments so that I can manage booked visits.', web: 'DoctorAppointmentsPage.tsx', api: 'SchedulingController', status: 'PARTIALLY IMPLEMENTED', ev: 'DoctorAppointmentsPage.tsx; SchedulingController', pri: 'P1 — High' },
    { id: 'US-DOC-018', sub: 'Appointment detail', actor: 'DOCTOR', story: 'As a doctor, I want appointment detail so that I can prepare for a booked patient.', web: 'DoctorAppointmentDetailPage.tsx', api: 'SchedulingController', status: 'UNKNOWN', ev: 'DoctorAppointmentDetailPage.tsx; SchedulingController', pri: 'P2 — Medium' },
    { id: 'US-DOC-019', sub: 'Checkout checklist gate', actor: 'DOCTOR', story: 'As a doctor, I want checkout checklist gating so that incomplete encounters are not closed prematurely.', web: 'DoctorEncounterDetailPage.tsx', api: 'ClinicalController', status: 'IMPLEMENTED', ev: 'Phase C #5 — checkout checklist gate on DoctorEncounterDetailPage', pri: 'P1 — High' },
    { id: 'US-DOC-020', sub: 'Wellness plan', actor: 'DOCTOR', story: 'As a doctor, I want to attach wellness plans so that patients receive follow-up guidance.', api: 'ClinicalController', web: 'DoctorEncounterDetailPage.tsx', status: 'UNKNOWN', ev: 'ClinicalController; DoctorEncounterDetailPage.tsx', pri: 'P2 — Medium' },
  ]);

  // ─── SEARCH / SCHEDULING ────────────────────────────────────────────────
  bulk('SEA', 'EPIC-SEA-001', 'Search', [
    { id: 'US-SEA-001', sub: 'Doctor search', actor: 'PATIENT', story: 'As a patient, I want to search doctors so that I can find a suitable clinician.', api: 'DoctorSearchController', web: 'DoctorSearchPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'DoctorSearchPage.tsx; DoctorSearchController', pri: 'P1 — High', pre: 'None or authenticated' },
    { id: 'US-SEA-002', sub: 'Doctor booking profile', actor: 'PATIENT', story: 'As a patient, I want a doctor booking profile so that I can choose a slot.', web: 'DoctorBookingProfilePage.tsx', api: 'DoctorSearchController; SchedulingController', status: 'PARTIALLY IMPLEMENTED', ev: 'DoctorBookingProfilePage.tsx; SchedulingController', pri: 'P1 — High' },
    { id: 'US-SEA-003', sub: 'Hospital search', actor: 'PATIENT', story: 'As a patient, I want to search hospitals so that I can choose a facility.', api: 'SearchController', web: 'HospitalSearchPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'HospitalSearchPage.tsx; SearchController', pri: 'P1 — High', pre: 'None or authenticated' },
    { id: 'US-SEA-004', sub: 'Unified search', actor: 'PATIENT', story: 'As a patient, I want unified search so that doctors and hospitals appear together.', api: 'SearchController', web: 'UnifiedSearchPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'UnifiedSearchPage.tsx; SearchController', pri: 'P2 — Medium' },
    { id: 'US-SEA-005', sub: 'Location assist', actor: 'PATIENT', story: 'As a patient, I want location-assisted discovery so that nearby care is prioritized.', api: 'LocationController', status: 'UNKNOWN', ev: 'LocationController', pri: 'P2 — Medium' },
  ]);

  bulk('SCH', 'EPIC-SCH-001', 'Scheduling', [
    { id: 'US-SCH-001', sub: 'Book appointment', actor: 'PATIENT', story: 'As a patient, I want to book an appointment so that I have a confirmed slot.', api: 'SchedulingController', web: 'BookAppointmentPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'BookAppointmentPage.tsx; SchedulingController', pri: 'P1 — High' },
    { id: 'US-SCH-002', sub: 'Patient appointments list', actor: 'PATIENT', story: 'As a patient, I want to list my appointments so that I can track upcoming visits.', web: 'PatientAppointmentsPage.tsx', api: 'SchedulingController', status: 'PARTIALLY IMPLEMENTED', ev: 'PatientAppointmentsPage.tsx; SchedulingController', pri: 'P1 — High' },
    { id: 'US-SCH-003', sub: 'Patient appointment detail', actor: 'PATIENT', story: 'As a patient, I want appointment detail so that I see time, doctor, and status.', web: 'PatientAppointmentDetailPage.tsx', api: 'SchedulingController', status: 'UNKNOWN', ev: 'PatientAppointmentDetailPage.tsx', pri: 'P2 — Medium' },
    { id: 'US-SCH-004', sub: 'Cancel appointment', actor: 'PATIENT', story: 'As a patient, I want to cancel an appointment so that the slot frees for others.', api: 'SchedulingController', status: 'UNKNOWN', ev: 'SchedulingController', pri: 'P1 — High' },
    { id: 'US-SCH-005', sub: 'Reschedule appointment', actor: 'PATIENT', story: 'As a patient, I want to reschedule an appointment so that I can change timing.', api: 'SchedulingController', status: 'UNKNOWN', ev: 'SchedulingController', pri: 'P1 — High' },
    { id: 'US-SCH-006', sub: 'Appointment reminders', actor: 'PATIENT', story: 'As a patient, I want appointment reminders so that I do not miss visits.', api: 'SchedulingController / notification gateways', status: 'UNKNOWN', ev: 'SchedulingController; notification stubs', pri: 'P2 — Medium', notification: 'Email/SMS/push reminder — may be stub' },
    { id: 'US-SCH-007', sub: 'Doctor block slots', actor: 'DOCTOR', story: 'As a doctor, I want to block schedule slots so that leave is reflected.', api: 'SchedulingController', web: 'DoctorSchedulePage.tsx', status: 'UNKNOWN', ev: 'DoctorSchedulePage.tsx; SchedulingController', pri: 'P2 — Medium' },
    { id: 'US-SCH-008', sub: 'Hospital view schedules', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want to view doctor schedules so that OPD capacity is visible.', api: 'SchedulingController', status: 'UNKNOWN', ev: 'SchedulingController', pri: 'P2 — Medium' },
  ]);

  // ─── RECEPTION / OPD ────────────────────────────────────────────────────
  bulk('RCV', 'EPIC-RCV-001', 'Reception', [
    { id: 'US-RCV-001', sub: 'Search hospital patient', actor: 'RECEPTIONIST', story: 'As a receptionist, I want to search hospital patients so that I can find existing UHID records.', api: 'HospitalPatientRegistryController', web: 'PatientSearchPage.tsx', status: 'IMPLEMENTED', ev: 'Phase C #4 — Reception pages → HospitalPatientRegistryController', pri: 'P0 — Critical' },
    { id: 'US-RCV-002', sub: 'Register hospital patient', actor: 'RECEPTIONIST', story: 'As a receptionist, I want to register a hospital patient so that a UHID is created at the desk.', api: 'HospitalPatientRegistryController', web: 'PatientRegisterPage.tsx', db: 'V42', status: 'IMPLEMENTED', ev: 'Phase C #4 — HospitalPatientRegistryController; V42', pri: 'P0 — Critical' },
    { id: 'US-RCV-003', sub: 'UHID patient detail', actor: 'RECEPTIONIST', story: 'As a receptionist, I want patient detail by UHID so that I can confirm identity.', web: 'PatientDetailPage.tsx', api: 'HospitalPatientRegistryController', status: 'IMPLEMENTED', ev: 'PatientDetailPage.tsx; HospitalPatientRegistryController', pri: 'P1 — High' },
    { id: 'US-RCV-004', sub: 'Patient receipt', actor: 'RECEPTIONIST', story: 'As a receptionist, I want to print/view patient receipt so that registration proof is given.', web: 'PatientReceiptPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'PatientReceiptPage.tsx', pri: 'P2 — Medium' },
    { id: 'US-RCV-005', sub: 'Reception dashboard', actor: 'RECEPTIONIST', story: 'As a receptionist, I want a reception dashboard so that desk workload is visible.', web: 'ReceptionDashboardPage.tsx', status: 'IMPLEMENTED', ev: 'ReceptionDashboardPage.tsx; Phase C #4', pri: 'P1 — High' },
    { id: 'US-RCV-006', sub: 'Walk-in OPD register', actor: 'RECEPTIONIST', story: 'As a receptionist, I want to register walk-in OPD so that patients enter the queue.', api: 'OpdController.registerWalkIn', status: 'IMPLEMENTED', ev: 'Phase C #4 — OpdController.registerWalkIn', pri: 'P0 — Critical' },
    { id: 'US-RCV-007', sub: 'Reception checkout', actor: 'RECEPTIONIST', story: 'As a receptionist, I want to complete encounter checkout payment so that billing closes the visit.', api: 'BillingController', web: 'ReceptionCheckoutPage.tsx', db: 'V41', status: 'IMPLEMENTED', ev: 'Phase C #8 — ReceptionCheckoutPage → BillingController → V41', pri: 'P0 — Critical' },
    { id: 'US-RCV-008', sub: 'OPD display board', actor: 'RECEPTIONIST', story: 'As a receptionist, I want an OPD display board so that waiting patients see queue status.', web: 'OpdDisplayBoardPage.tsx', api: 'OpdController', status: 'PARTIALLY IMPLEMENTED', ev: 'OpdDisplayBoardPage.tsx; OpdController', pri: 'P2 — Medium' },
    { id: 'US-RCV-009', sub: 'Link patient portal account', actor: 'RECEPTIONIST', story: 'As a receptionist, I want to link a portal account to UHID so that patient self-service works.', api: 'HospitalPatientRegistryController', status: 'UNKNOWN', ev: 'HospitalPatientRegistryController', pri: 'P2 — Medium' },
    { id: 'US-RCV-010', sub: 'Update patient demographics desk', actor: 'RECEPTIONIST', story: 'As a receptionist, I want to update patient demographics at desk so that records stay current.', api: 'HospitalPatientRegistryController', web: 'PatientDetailPage.tsx', status: 'UNKNOWN', ev: 'HospitalPatientRegistryController; PatientDetailPage.tsx', pri: 'P1 — High' },
  ]);

  bulk('OPD', 'EPIC-OPD-001', 'OPD', [
    { id: 'US-OPD-001', sub: 'Patient OPD intake', actor: 'PATIENT', story: 'As a patient, I want OPD request intake persisted so that reception/doctors see my request.', api: 'OpdController.registerOpdRequest', db: 'V31; V66; V67', web: 'RequestOpdPage.tsx', status: 'IMPLEMENTED', ev: 'Phase C #3 — OpdController; V31/V67', pri: 'P0 — Critical' },
    { id: 'US-OPD-002', sub: 'Hospital OPD board', actor: 'HOSPITAL_ADMIN', story: 'As a hospital operator, I want an OPD operations board so that queue health is visible.', web: 'HospitalOpdPage.tsx', api: 'OpdController', status: 'PARTIALLY IMPLEMENTED', ev: 'HospitalOpdPage.tsx; OpdController', pri: 'P1 — High' },
    { id: 'US-OPD-003', sub: 'Queue call next', actor: 'RECEPTIONIST', story: 'As a receptionist, I want to call the next patient so that the queue advances.', api: 'OpdController', status: 'UNKNOWN', ev: 'OpdController', pri: 'P1 — High' },
    { id: 'US-OPD-004', sub: 'Patient self check-in', actor: 'PATIENT', story: 'As a patient, I want to self check-in so that I confirm arrival for my slot.', api: 'OpdController', status: 'UNKNOWN', ev: 'OpdController', pri: 'P2 — Medium' },
    { id: 'US-OPD-005', sub: 'Create encounter', actor: 'DOCTOR', story: 'As a doctor, I want to create an OPD encounter so that documentation can begin.', api: 'OpdController; ClinicalController', db: 'V30; V31', status: 'IMPLEMENTED', ev: 'Phase C #5 — ClinicalController / OPD encounter path', pri: 'P0 — Critical' },
    { id: 'US-OPD-006', sub: 'Close encounter', actor: 'DOCTOR', story: 'As a doctor, I want to close an encounter after checklist so that billing can proceed.', api: 'ClinicalController', web: 'DoctorEncounterDetailPage.tsx', status: 'IMPLEMENTED', ev: 'Phase C #5 checkout checklist gate', pri: 'P0 — Critical' },
    { id: 'US-OPD-007', sub: 'Transfer queue doctor', actor: 'RECEPTIONIST', story: 'As a receptionist, I want to transfer a queued patient to another doctor so that load balances.', api: 'OpdController', status: 'UNKNOWN', ev: 'OpdController', pri: 'P2 — Medium' },
    { id: 'US-OPD-008', sub: 'Cancel OPD request', actor: 'PATIENT', story: 'As a patient, I want to cancel an OPD request so that I am removed from queue.', api: 'OpdController', web: 'PatientOpdStatusPage.tsx', status: 'UNKNOWN', ev: 'OpdController; PatientOpdStatusPage.tsx', pri: 'P2 — Medium' },
    { id: 'US-OPD-009', sub: 'Same-day queue rule', actor: 'PATIENT', story: 'As a patient, I want same-day OPD queueing so that walk-in/request timing is enforced.', api: 'OpdController', db: 'V31; V67', status: 'IMPLEMENTED', ev: 'Phase C #3 — same-day queue notes', pri: 'P1 — High' },
    { id: 'US-OPD-010', sub: 'OPD registration type', actor: 'RECEPTIONIST', story: 'As a receptionist, I want registration type captured so that patient vs walk-in is distinguished.', api: 'OpdController', db: 'V67__opd_patient_request_registration_type.sql', status: 'IMPLEMENTED', ev: 'V67; OpdController', pri: 'P2 — Medium' },
  ]);

  // Continue remaining domains in part 2 file load
  registerClinicalAndBeyond(ctx);
}

function registerClinicalAndBeyond(ctx) {
  const { bulk, atomics, ac, VISION } = ctx;

  // ─── CLINICAL DOCS ──────────────────────────────────────────────────────
  bulk('CLN', 'EPIC-CLN-001', 'Clinical', [
    { id: 'US-CLN-001', sub: 'Structured notes', actor: 'DOCTOR', story: 'As a doctor, I want structured notes so that documentation is consistent.', api: 'ClinicalController', web: 'DoctorEncounterDetailPage.tsx', db: 'V30', status: 'IMPLEMENTED', ev: 'Phase C #5 ClinicalController V30', pri: 'P0 — Critical' },
    { id: 'US-CLN-002', sub: 'Encounter review attach', actor: 'DOCTOR', story: 'As a doctor, I want encounter reviews captured so that feedback is stored.', api: 'ClinicalController; ReviewController', db: 'V69', status: 'UNKNOWN', ev: 'ReviewController; V69__encounter_reviews.sql', pri: 'P2 — Medium' },
    { id: 'US-CLN-003', sub: 'Clinical document print', actor: 'DOCTOR', story: 'As a doctor, I want clinical document print so that patients receive printed outputs.', api: 'ClinicalDocumentController', web: 'ClinicalDocumentPrintPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'ClinicalDocumentPrintPage.tsx; ClinicalDocumentController', pri: 'P2 — Medium' },
    { id: 'US-CLN-004', sub: 'Letterhead on print', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want letterhead on clinical prints so that documents are branded.', db: 'V89', web: 'ClinicalDocumentPrintPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'V89; ClinicalDocumentPrintPage.tsx', pri: 'P2 — Medium' },
    { id: 'US-CLN-005', sub: 'Amend note', actor: 'DOCTOR', story: 'As a doctor, I want to amend a clinical note so that corrections are auditable.', api: 'ClinicalController', status: 'UNKNOWN', ev: 'ClinicalController', pri: 'P1 — High', audit: 'Note amend should audit' },
    { id: 'US-CLN-006', sub: 'Diagnosis coding', actor: 'DOCTOR', story: 'As a doctor, I want to attach diagnosis codes so that billing and analytics align.', api: 'ClinicalController; HospitalClinicalCatalogController', status: 'UNKNOWN', ev: 'ClinicalController; HospitalClinicalCatalogController', pri: 'P2 — Medium' },
    { id: 'US-CLN-007', sub: 'Order set', actor: 'DOCTOR', story: 'As a doctor, I want order sets so that common lab/imaging bundles are one click.', status: 'PLANNED', ev: 'ClinicalController — order sets RULE TO BE CONFIRMED', pri: 'P3 — Future' },
    { id: 'US-CLN-008', sub: 'AI CDS suggestions', actor: 'DOCTOR', story: 'As a doctor, I want AI clinical decision support suggestions so that care quality improves.', status: 'NOT STARTED', ev: VISION, pri: 'P3 — Future', pre: 'None — vision only' },
  ]);

  // ─── IPD ────────────────────────────────────────────────────────────────
  bulk('IPD', 'EPIC-IPD-001', 'IPD', [
    { id: 'US-IPD-001', sub: 'Admit with bed', actor: 'HOSPITAL_ADMIN', story: 'As hospital staff, I want to admit a patient and assign a bed so that inpatient stay starts.', api: 'IpdController', web: 'HospitalIpdAdmissionPage.tsx', db: 'V33; V80; V81', status: 'IMPLEMENTED', ev: 'Phase C #7 — IpdController → V33+', pri: 'P0 — Critical' },
    { id: 'US-IPD-002', sub: 'Admission request states', actor: 'DOCTOR', story: 'As a doctor, I want linked admission request states so that recommend→admit is tracked.', api: 'IpdController', db: 'V80', status: 'IMPLEMENTED', ev: 'Phase C #7 linked request states; V80', pri: 'P0 — Critical' },
    { id: 'US-IPD-003', sub: 'Hospital IPD board', actor: 'HOSPITAL_ADMIN', story: 'As a hospital operator, I want an IPD board so that census is visible.', web: 'HospitalIpdPage.tsx', api: 'IpdController', status: 'PARTIALLY IMPLEMENTED', ev: 'HospitalIpdPage.tsx; IpdController', pri: 'P1 — High' },
    { id: 'US-IPD-004', sub: 'Bed ward board', actor: 'HOSPITAL_ADMIN', story: 'As a hospital operator, I want an enterprise bed/ward board so that capacity is managed.', api: 'IpdController', db: 'V81__ipd_bed_enterprise.sql', status: 'PARTIALLY IMPLEMENTED', ev: 'IpdController; V81', pri: 'P1 — High' },
    { id: 'US-IPD-005', sub: 'Transfer bed', actor: 'NURSE', story: 'As a nurse, I want to transfer a patient bed so that ward moves are recorded.', api: 'IpdController; AdtController', db: 'V81; V91', status: 'UNKNOWN', ev: 'IpdController; AdtController; V81; V91', pri: 'P1 — High' },
    { id: 'US-IPD-006', sub: 'IPD meds diagnostics', actor: 'DOCTOR', story: 'As a doctor, I want IPD meds and diagnostics orders so that inpatient care continues.', api: 'IpdController', db: 'V82', status: 'PARTIALLY IMPLEMENTED', ev: 'IpdController; V82__ipd_meds_diagnostics.sql', pri: 'P1 — High' },
    { id: 'US-IPD-007', sub: 'Isolation flag', actor: 'DOCTOR', story: 'As a doctor, I want to flag isolation so that infection control is visible.', api: 'IpdController', db: 'V83', status: 'UNKNOWN', ev: 'IpdController; V83__ipd_icu_ot_isolation.sql', pri: 'P2 — Medium' },
    { id: 'US-IPD-008', sub: 'Payer on IPD', actor: 'BILLING_CLERK', story: 'As billing staff, I want payer on IPD so that insurance vs self-pay is clear.', api: 'IpdController; BillingController', db: 'V84', status: 'UNKNOWN', ev: 'IpdController; V84__ipd_billing_payer.sql', pri: 'P1 — High' },
    { id: 'US-IPD-009', sub: 'Enterprise discharge', actor: 'DOCTOR', story: 'As a doctor, I want enterprise discharge so that stay closure is complete.', api: 'IpdController', db: 'V85', web: 'HospitalIpdPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'IpdController; V85__ipd_discharge_enterprise.sql', pri: 'P1 — High' },
    { id: 'US-IPD-010', sub: 'Post-discharge follow-up', actor: 'DOCTOR', story: 'As a doctor, I want post-discharge follow-up tasks so that continuity continues.', api: 'IpdController; TaskController', db: 'V86', status: 'UNKNOWN', ev: 'IpdController; V86__ipd_post_discharge.sql', pri: 'P2 — Medium' },
    { id: 'US-IPD-011', sub: 'IPD metrics indexes', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want IPD dashboard metrics so that occupancy KPIs show.', api: 'IpdController; DashboardController', db: 'V87', status: 'UNKNOWN', ev: 'V87__ipd_dashboard_metrics_indexes.sql', pri: 'P2 — Medium' },
    { id: 'US-IPD-012', sub: 'Nurse ward read', actor: 'NURSE', story: 'As a nurse, I want ward/bed read access so that I can see assigned patients.', api: 'IpdController', db: 'V72', status: 'PARTIALLY IMPLEMENTED', ev: 'V72__nurse_ipd_ward_bed_read.sql; NursingWardBoardPage.tsx', pri: 'P1 — High' },
    { id: 'US-IPD-013', sub: 'Reject admission request', actor: 'HOSPITAL_ADMIN', story: 'As hospital staff, I want to reject an admission request so that inappropriate admits stop.', api: 'IpdController', db: 'V80', status: 'UNKNOWN', ev: 'IpdController; V80', pri: 'P2 — Medium' },
    { id: 'US-IPD-014', sub: 'Assign ward', actor: 'HOSPITAL_ADMIN', story: 'As hospital staff, I want to assign ward on admit so that nursing ownership is clear.', api: 'IpdController', db: 'V81', status: 'PARTIALLY IMPLEMENTED', ev: 'IpdController; V81', pri: 'P1 — High' },
    { id: 'US-IPD-015', sub: 'Discharge summary', actor: 'DOCTOR', story: 'As a doctor, I want a discharge summary so that the stay narrative is documented.', api: 'IpdController; ClinicalDocumentController', db: 'V85', status: 'UNKNOWN', ev: 'IpdController; ClinicalDocumentController; V85', pri: 'P1 — High' },
  ]);

  atomics('IPD', 'EPIC-IPD-001', 'IPD', 'HOSPITAL_ADMIN', 'IpdController; V33+', 'UNKNOWN', 'P2 — Medium', [
    'Mark bed dirty after discharge',
    'Mark bed clean and available',
    'View expected discharges today',
    'Capture admit diagnosis on IPD',
    'Record attending doctor on stay',
    'Record referring doctor on stay',
    'Print admission wristband data',
    'View census by ward',
    'View census by specialty',
    'Hold bed for pending admit',
  ]);

  // ─── ICU ────────────────────────────────────────────────────────────────
  bulk('ICU', 'EPIC-ICU-001', 'ICU', [
    { id: 'US-ICU-001', sub: 'ICU hospital board', actor: 'HOSPITAL_ADMIN', story: 'As a hospital operator, I want an ICU stay board so that critical care census is visible.', api: 'IcuController', web: 'HospitalIcuPage.tsx', db: 'V83', status: 'PARTIALLY IMPLEMENTED', ev: 'HospitalIcuPage.tsx; IcuController; V83', pri: 'P1 — High' },
    { id: 'US-ICU-002', sub: 'ICU nurse dashboard', actor: 'ICU_NURSE', story: 'As an ICU nurse, I want an ICU dashboard so that assigned stays are listed.', web: 'IcuNurseDashboardPage.tsx', api: 'IcuController', status: 'PARTIALLY IMPLEMENTED', ev: 'IcuNurseDashboardPage.tsx; IcuController', pri: 'P1 — High' },
    { id: 'US-ICU-003', sub: 'ICU stay monitor', actor: 'ICU_NURSE', story: 'As an ICU nurse, I want stay monitoring so that vitals/alerts for ICU patients are tracked.', web: 'IcuNurseStayPage.tsx', api: 'IcuController', status: 'UNKNOWN', ev: 'IcuNurseStayPage.tsx; IcuController', pri: 'P1 — High' },
  ]);
  atomics('ICU', 'EPIC-ICU-001', 'ICU', 'ICU_NURSE', 'IcuController; HospitalIcuPage.tsx; V83', 'UNKNOWN', 'P2 — Medium', [
    'Record ICU acuity score',
    'Escalate ICU patient to attending',
    'Document ventilator settings',
    'Document ICU intake/output',
    'Transfer patient out of ICU',
    'Admit patient into ICU from ward',
    'View ICU bed availability',
    'Flag ICU infection precautions',
    'Capture ICU nursing shift handover',
    'View ICU orders pending',
  ]);

  // ─── NURSING / MAR ──────────────────────────────────────────────────────
  bulk('NUR', 'EPIC-NUR-001', 'Nursing', [
    { id: 'US-NUR-001', sub: 'Ward board', actor: 'NURSE', story: 'As a nurse, I want a ward board so that I see patients on my ward.', web: 'NursingWardBoardPage.tsx', api: 'IpdController', db: 'V72', status: 'PARTIALLY IMPLEMENTED', ev: 'NursingWardBoardPage.tsx; V72', pri: 'P1 — High' },
    { id: 'US-NUR-002', sub: 'Nursing admission view', actor: 'NURSE', story: 'As a nurse, I want an admission nursing view so that new admits get intake.', web: 'NursingAdmissionPage.tsx', status: 'UNKNOWN', ev: 'NursingAdmissionPage.tsx', pri: 'P1 — High' },
    { id: 'US-NUR-003', sub: 'Nursing My Work', actor: 'NURSE', story: 'As a nurse, I want My Work so that tasks assigned to me are listed.', web: 'NursingMyWorkPage.tsx', api: 'TaskController', status: 'PARTIALLY IMPLEMENTED', ev: 'NursingMyWorkPage.tsx; TaskController', pri: 'P2 — Medium' },
    { id: 'US-NUR-004', sub: 'Nursing dashboard', actor: 'NURSE', story: 'As a nurse, I want a nursing dashboard so that shift overview is clear.', web: 'NursingDashboardPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'NursingDashboardPage.tsx', pri: 'P2 — Medium' },
    { id: 'US-NUR-005', sub: 'MAR worklist', actor: 'NURSE', story: 'As a nurse, I want a MAR worklist so that due medications are visible.', web: 'NursingMarPage.tsx', api: 'PharmacyController', db: 'V38; V82', status: 'IMPLEMENTED', ev: 'Phase C #13 — NursingMarPage → PharmacyController.administerMedication → V38/V82', pri: 'P0 — Critical' },
    { id: 'US-NUR-006', sub: 'Administer medication', actor: 'NURSE', story: 'As a nurse, I want to administer medication on MAR so that doses are recorded.', api: 'PharmacyController.administerMedication', web: 'NursingMarPage.tsx; NursingMarOrderPage.tsx', status: 'IMPLEMENTED', ev: 'Phase C #13 — PharmacyController.administerMedication requires READY', pri: 'P0 — Critical' },
    { id: 'US-NUR-007', sub: 'MAR order detail', actor: 'NURSE', story: 'As a nurse, I want MAR order detail so that I confirm dose instructions before giving.', web: 'NursingMarOrderPage.tsx', api: 'PharmacyController', status: 'IMPLEMENTED', ev: 'NursingMarOrderPage.tsx; PharmacyController; Phase C #13', pri: 'P1 — High' },
    { id: 'US-NUR-008', sub: 'Document refused dose', actor: 'NURSE', story: 'As a nurse, I want to document refused doses so that MAR remains accurate.', api: 'PharmacyController', status: 'UNKNOWN', ev: 'PharmacyController', pri: 'P1 — High' },
    { id: 'US-NUR-009', sub: 'PRN administration', actor: 'NURSE', story: 'As a nurse, I want to administer PRN meds with reason so that as-needed dosing is tracked.', api: 'PharmacyController', status: 'UNKNOWN', ev: 'PharmacyController', pri: 'P2 — Medium' },
    { id: 'US-NUR-010', sub: 'Nursing vitals round', actor: 'NURSE', story: 'As a nurse, I want to record ward vitals rounds so that trends update.', api: 'ClinicalController / IpdController', status: 'UNKNOWN', ev: 'ClinicalController; NursingWardBoardPage.tsx', pri: 'P1 — High' },
  ]);

  // ─── ED / ADT ───────────────────────────────────────────────────────────
  bulk('ED', 'EPIC-ED-001', 'Emergency', [
    { id: 'US-ED-001', sub: 'ED board', actor: 'ED_STAFF', story: 'As ED staff, I want an emergency board so that triage census is visible.', api: 'EmergencyController', web: 'HospitalEdBoardPage.tsx; HospitalEmergencyPage.tsx', db: 'V91', status: 'PARTIALLY IMPLEMENTED', ev: 'HospitalEdBoardPage.tsx; EmergencyController; V91', pri: 'P1 — High' },
    { id: 'US-ED-002', sub: 'ADT admit event', actor: 'ED_STAFF', story: 'As ED staff, I want ADT admit events so that movements are recorded.', api: 'AdtController', db: 'V91__hms13_emergency_adt.sql', status: 'PARTIALLY IMPLEMENTED', ev: 'AdtController; V91', pri: 'P1 — High' },
    { id: 'US-ED-003', sub: 'ADT transfer event', actor: 'ED_STAFF', story: 'As ED staff, I want ADT transfer events so that location changes are tracked.', api: 'AdtController', db: 'V91', status: 'UNKNOWN', ev: 'AdtController; V91', pri: 'P1 — High' },
    { id: 'US-ED-004', sub: 'ADT discharge event', actor: 'ED_STAFF', story: 'As ED staff, I want ADT discharge events so that ED departure is recorded.', api: 'AdtController', db: 'V91', status: 'UNKNOWN', ev: 'AdtController; V91', pri: 'P1 — High' },
    { id: 'US-ED-005', sub: 'Triage acuity', actor: 'ED_STAFF', story: 'As ED staff, I want to set triage acuity so that priority is clear.', api: 'EmergencyController', status: 'UNKNOWN', ev: 'EmergencyController', pri: 'P1 — High' },
    { id: 'US-ED-006', sub: 'ED to IPD handoff', actor: 'ED_STAFF', story: 'As ED staff, I want ED-to-IPD handoff so that admissions from ED are linked.', api: 'EmergencyController; IpdController', status: 'UNKNOWN', ev: 'EmergencyController; IpdController; V91', pri: 'P1 — High' },
  ]);
  atomics('ED', 'EPIC-ED-001', 'Emergency', 'ED_STAFF', 'EmergencyController; AdtController; V91', 'UNKNOWN', 'P2 — Medium', [
    'Register ED walk-in',
    'Assign ED bay',
    'Record ED chief complaint',
    'Order ED labs',
    'Order ED imaging',
    'Document ED disposition',
    'Mark ED left without being seen',
    'View ED length of stay',
  ]);

  // ─── LAB ────────────────────────────────────────────────────────────────
  bulk('LAB', 'EPIC-LAB-001', 'Laboratory', [
    { id: 'US-LAB-001', sub: 'Lab catalog', actor: 'LAB_TECH', story: 'As lab staff, I want a lab test catalog so that orderables are maintained.', api: 'LabController', web: 'LabCatalogPage.tsx', db: 'V35', status: 'PARTIALLY IMPLEMENTED', ev: 'LabCatalogPage.tsx; LabController; V35', pri: 'P1 — High' },
    { id: 'US-LAB-002', sub: 'Lab worklist', actor: 'LAB_TECH', story: 'As lab staff, I want a lab worklist so that pending orders are fulfilled.', api: 'LabController; LabFulfillmentService', web: 'LabWorklistPage.tsx', db: 'V35', status: 'IMPLEMENTED', ev: 'Phase C #6 — LabWorklistPage → LabController / LabFulfillmentService → V35', pri: 'P0 — Critical' },
    { id: 'US-LAB-003', sub: 'Lab order detail', actor: 'LAB_TECH', story: 'As lab staff, I want lab order detail so that I can enter results.', web: 'LabOrderDetailPage.tsx', api: 'LabController', status: 'IMPLEMENTED', ev: 'LabOrderDetailPage.tsx; LabController; Phase C #6', pri: 'P0 — Critical' },
    { id: 'US-LAB-004', sub: 'Lab dashboard', actor: 'LAB_TECH', story: 'As lab staff, I want a lab dashboard so that TAT overview is visible.', web: 'LabDashboardPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'LabDashboardPage.tsx; LabController', pri: 'P2 — Medium' },
    { id: 'US-LAB-005', sub: 'Sample collect', actor: 'LAB_TECH', story: 'As lab staff, I want to record sample collection so that specimen handling starts.', api: 'LabController', status: 'UNKNOWN', ev: 'LabController; V35', pri: 'P1 — High' },
    { id: 'US-LAB-006', sub: 'Sample receive', actor: 'LAB_TECH', story: 'As lab staff, I want to receive samples so that accessioning is tracked.', api: 'LabController', status: 'UNKNOWN', ev: 'LabController', pri: 'P1 — High' },
    { id: 'US-LAB-007', sub: 'Enter results', actor: 'LAB_TECH', story: 'As lab staff, I want to enter results so that clinicians can review.', api: 'LabController', web: 'LabOrderDetailPage.tsx', status: 'IMPLEMENTED', ev: 'Phase C #6 lab fulfill path', pri: 'P0 — Critical' },
    { id: 'US-LAB-008', sub: 'Verify results', actor: 'LAB_TECH', story: 'As lab staff, I want to verify results so that released values are signed off.', api: 'LabController', status: 'UNKNOWN', ev: 'LabController', pri: 'P1 — High' },
    { id: 'US-LAB-009', sub: 'Reject sample', actor: 'LAB_TECH', story: 'As lab staff, I want to reject unsuitable samples so that recollection is requested.', api: 'LabController', status: 'UNKNOWN', ev: 'LabController', pri: 'P2 — Medium' },
    { id: 'US-LAB-010', sub: 'Critical value alert', actor: 'LAB_TECH', story: 'As lab staff, I want critical value alerts so that clinicians are notified urgently.', api: 'LabController', status: 'UNKNOWN', ev: 'LabController', pri: 'P1 — High', notification: 'Critical value notify — RULE TO BE CONFIRMED' },
  ]);
  atomics('LAB', 'EPIC-LAB-001', 'Laboratory', 'LAB_TECH', 'LabController; LabWorklistPage.tsx; V35', 'UNKNOWN', 'P2 — Medium', [
    'Add lab catalog item',
    'Disable obsolete lab test',
    'Print specimen label',
    'Batch release results',
    'View overdue lab orders',
    'Attach instrument result file',
    'Correct released result with reason',
    'Map external lab codes',
  ]);

  // ─── RADIOLOGY ──────────────────────────────────────────────────────────
  bulk('RAD', 'EPIC-RAD-001', 'Radiology', [
    { id: 'US-RAD-001', sub: 'Imaging catalog', actor: 'RAD_TECH', story: 'As radiology staff, I want an imaging catalog so that studies are orderable.', api: 'RadiologyController', web: 'RadiologyCatalogPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'RadiologyCatalogPage.tsx; RadiologyController', pri: 'P1 — High' },
    { id: 'US-RAD-002', sub: 'Radiology worklist', actor: 'RAD_TECH', story: 'As radiology staff, I want a worklist so that pending studies are fulfilled.', api: 'RadiologyController', web: 'RadiologyWorklistPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'RadiologyWorklistPage.tsx; RadiologyController', pri: 'P1 — High' },
    { id: 'US-RAD-003', sub: 'Imaging order detail', actor: 'RAD_TECH', story: 'As radiology staff, I want imaging order detail so that I can update study status.', web: 'ImagingOrderDetailPage.tsx', api: 'RadiologyController', status: 'PARTIALLY IMPLEMENTED', ev: 'ImagingOrderDetailPage.tsx; RadiologyController', pri: 'P1 — High' },
    { id: 'US-RAD-004', sub: 'Radiology dashboard', actor: 'RAD_TECH', story: 'As radiology staff, I want a dashboard so that modality load is visible.', web: 'RadiologyDashboardPage.tsx', status: 'UNKNOWN', ev: 'RadiologyDashboardPage.tsx; RadiologyController', pri: 'P2 — Medium' },
  ]);
  atomics('RAD', 'EPIC-RAD-001', 'Radiology', 'RAD_TECH', 'RadiologyController; RadiologyWorklistPage.tsx', 'UNKNOWN', 'P2 — Medium', [
    'Schedule imaging slot',
    'Mark study in progress',
    'Upload preliminary report',
    'Finalize radiology report',
    'Addend radiology report',
    'Cancel imaging order with reason',
    'Assign modality and technician',
    'Flag contrast allergy risk',
    'View STAT imaging queue',
    'Print imaging requisition',
  ]);

  // ─── OT ─────────────────────────────────────────────────────────────────
  bulk('OT', 'EPIC-OT-001', 'OT', [
    { id: 'US-OT-001', sub: 'OT catalog', actor: 'OT_STAFF', story: 'As OT staff, I want an OT procedure catalog so that surgeries are orderable.', api: 'OtController', web: 'OtCatalogPage.tsx', db: 'V76', status: 'PARTIALLY IMPLEMENTED', ev: 'OtCatalogPage.tsx; OtController; V76', pri: 'P1 — High' },
    { id: 'US-OT-002', sub: 'OT worklist', actor: 'OT_STAFF', story: 'As OT staff, I want an OT worklist so that scheduled procedures are tracked.', api: 'OtController', web: 'OtWorklistPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'OtWorklistPage.tsx; OtController', pri: 'P1 — High' },
    { id: 'US-OT-003', sub: 'OT procedure detail', actor: 'OT_STAFF', story: 'As OT staff, I want procedure detail so that implants and anesthesia are recorded.', web: 'OtProcedureDetailPage.tsx', api: 'OtController', db: 'V76; V78', status: 'PARTIALLY IMPLEMENTED', ev: 'OtProcedureDetailPage.tsx; OtController; V76; V78', pri: 'P1 — High' },
    { id: 'US-OT-004', sub: 'OT dashboard', actor: 'OT_STAFF', story: 'As OT staff, I want an OT dashboard so that theatre utilization is visible.', web: 'OtDashboardPage.tsx', status: 'UNKNOWN', ev: 'OtDashboardPage.tsx; OtController', pri: 'P2 — Medium' },
    { id: 'US-OT-005', sub: 'Record implants', actor: 'OT_STAFF', story: 'As OT staff, I want to record implants so that device traceability exists.', api: 'OtController', db: 'V76__ot_implants.sql', status: 'PARTIALLY IMPLEMENTED', ev: 'OtController; V76__ot_implants.sql', pri: 'P1 — High' },
    { id: 'US-OT-006', sub: 'Anesthesia chart', actor: 'ANESTHETIST', story: 'As an anesthetist, I want anesthesia charts so that peri-op meds are documented.', api: 'OtController', db: 'V78__ot_anesthesia_charts.sql', status: 'PARTIALLY IMPLEMENTED', ev: 'OtController; V78__ot_anesthesia_charts.sql', pri: 'P1 — High' },
  ]);
  atomics('OT', 'EPIC-OT-001', 'OT', 'OT_STAFF', 'OtController; OtWorklistPage.tsx; V76; V78', 'UNKNOWN', 'P2 — Medium', [
    'Schedule OT theatre slot',
    'Assign OT team',
    'Mark procedure started',
    'Mark procedure completed',
    'Cancel OT procedure',
    'Record blood loss',
    'Record OT consumables used',
    'Pre-op checklist completion',
    'Post-op recovery handoff',
    'View theatre turnaround times',
  ]);

  // ─── PHARMACY ───────────────────────────────────────────────────────────
  bulk('PHA', 'EPIC-PHA-001', 'Pharmacy', [
    { id: 'US-PHA-001', sub: 'Medication catalog', actor: 'PHARMACIST', story: 'As a pharmacist, I want a medication catalog so that formulary items are maintained.', api: 'PharmacyController', web: 'PharmacyCatalogPage.tsx', db: 'V38', status: 'PARTIALLY IMPLEMENTED', ev: 'PharmacyCatalogPage.tsx; PharmacyController; V38', pri: 'P1 — High' },
    { id: 'US-PHA-002', sub: 'Pharmacy worklist', actor: 'PHARMACIST', story: 'As a pharmacist, I want a medication order worklist so that I can verify and dispense.', api: 'PharmacyController', web: 'PharmacyWorklistPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'PharmacyWorklistPage.tsx; PharmacyController', pri: 'P1 — High' },
    { id: 'US-PHA-003', sub: 'Medication order detail', actor: 'PHARMACIST', story: 'As a pharmacist, I want medication order detail so that I can mark READY for MAR.', web: 'MedicationOrderDetailPage.tsx', api: 'PharmacyController', status: 'PARTIALLY IMPLEMENTED', ev: 'MedicationOrderDetailPage.tsx; PharmacyController', pri: 'P1 — High' },
    { id: 'US-PHA-004', sub: 'Pharmacy requests', actor: 'PHARMACIST', story: 'As a pharmacist, I want a requests queue so that ward requests are fulfilled.', web: 'PharmacyRequestsPage.tsx', api: 'PharmacyController', status: 'UNKNOWN', ev: 'PharmacyRequestsPage.tsx; PharmacyController', pri: 'P2 — Medium' },
    { id: 'US-PHA-005', sub: 'Pharmacy dashboard', actor: 'PHARMACIST', story: 'As a pharmacist, I want a pharmacy dashboard so that pending volumes are visible.', web: 'PharmacyDashboardPage.tsx', status: 'UNKNOWN', ev: 'PharmacyDashboardPage.tsx', pri: 'P2 — Medium' },
    { id: 'US-PHA-006', sub: 'Mark medication READY', actor: 'PHARMACIST', story: 'As a pharmacist, I want to mark medication READY so that nursing can administer on MAR.', api: 'PharmacyController', status: 'PARTIALLY IMPLEMENTED', ev: 'PharmacyController; Phase C #13 READY prerequisite', pri: 'P0 — Critical' },
  ]);
  atomics('PHA', 'EPIC-PHA-001', 'Pharmacy', 'PHARMACIST', 'PharmacyController; PharmacyWorklistPage.tsx; V38', 'UNKNOWN', 'P2 — Medium', [
    'Verify prescription clinically',
    'Reject prescription with reason',
    'Dispense partial quantity',
    'Record batch and expiry on dispense',
    'Return unused ward stock',
    'Manage controlled drug register',
    'View drug interaction warnings',
    'Substitute formulary equivalent',
  ]);

  registerBillingOpsAndRest(ctx);
}

function registerBillingOpsAndRest(ctx) {
  const { bulk, atomics, ac, VISION } = ctx;

  // ─── BILLING ────────────────────────────────────────────────────────────
  bulk('BIL', 'EPIC-BIL-001', 'Billing', [
    { id: 'US-BIL-001', sub: 'Invoice list', actor: 'BILLING_CLERK', story: 'As billing staff, I want to list hospital invoices so that I can manage receivables.', api: 'BillingController', web: 'HospitalInvoicesPage.tsx', db: 'V41', status: 'IMPLEMENTED', ev: 'Phase C #8 — BillingController; HospitalInvoicesPage; V41', pri: 'P0 — Critical' },
    { id: 'US-BIL-002', sub: 'Invoice detail', actor: 'BILLING_CLERK', story: 'As billing staff, I want invoice detail so that line items are reviewable.', web: 'HospitalInvoiceDetailPage.tsx', api: 'BillingController', status: 'IMPLEMENTED', ev: 'HospitalInvoiceDetailPage.tsx; BillingController; V41', pri: 'P0 — Critical' },
    { id: 'US-BIL-003', sub: 'Reception checkout pay', actor: 'RECEPTIONIST', story: 'As a receptionist, I want to collect encounter checkout payment so that the visit is financially closed.', api: 'BillingController', web: 'ReceptionCheckoutPage.tsx', db: 'V41', status: 'IMPLEMENTED', ev: 'Phase C #8 — ReceptionCheckoutPage → BillingController → V41', pri: 'P0 — Critical' },
    { id: 'US-BIL-004', sub: 'Razorpay intent', actor: 'PATIENT', story: 'As a patient, I want to pay via Razorpay intent so that I can settle online.', api: 'OnlinePaymentController', web: 'PatientPaymentsPage.tsx', db: 'V73__razorpay_payment_intents.sql', status: 'IMPLEMENTED', ev: 'Phase C #8 — PatientPaymentsPage → OnlinePaymentController → V73', pri: 'P0 — Critical', integration: 'RazorpayPaymentGatewayClient (sandbox)' },
    { id: 'US-BIL-005', sub: 'Charge engine DRY_RUN', actor: 'BILLING_CLERK', story: 'As billing staff, I want charge engine DRY_RUN so that I can preview charges without posting.', api: 'ChargePostingService; ChargeController', db: 'V92', status: 'PARTIALLY IMPLEMENTED', ev: 'Phase C #12 — ChargePostingService + V92', pri: 'P1 — High' },
    { id: 'US-BIL-006', sub: 'Charge engine POST', actor: 'BILLING_CLERK', story: 'As billing staff, I want charge engine POST so that charges persist for billing.', api: 'ChargePostingService', db: 'V92', status: 'PARTIALLY IMPLEMENTED', ev: 'Phase C #12 — POST ≠ invoice lines (BUG-BIL-001)', pri: 'P1 — High' },
    { id: 'US-BIL-007', sub: 'Charge attach invoice', actor: 'BILLING_CLERK', story: 'As billing staff, I want to attach charges to invoices so that source linkage is complete.', api: 'ChargeController attach', db: 'V93', web: 'chargesApi.ts', status: 'PARTIALLY IMPLEMENTED', ev: 'Phase C #12 — ChargeController attach vs chargesApi; BUG-BIL-001 FE no attach', pri: 'P1 — High' },
    { id: 'US-BIL-008', sub: 'Wire charge attach FE', actor: 'BILLING_CLERK', story: 'As billing staff, I want FE charge attach wired so that POST creates invoice lines.', status: 'PLANNED', ev: 'BUG-BIL-001 ChargeController attach vs chargesApi.ts', pri: 'P1 — High' },
    { id: 'US-BIL-009', sub: 'Charge exceptions', actor: 'BILLING_CLERK', story: 'As billing staff, I want charge exception handling so that failed posts are remediated.', api: 'ChargeController', web: 'HospitalChargeExceptionsPage.tsx', status: 'IMPLEMENTED', ev: 'HospitalChargeExceptionsPage.tsx; ChargeController — FEAT-BIL-XCP-001', pri: 'P1 — High' },
    { id: 'US-BIL-010', sub: 'SaaS invoice sequence', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want SaaS invoice sequencing so that subscription invoices are unique.', db: 'V75__saas_invoice_sequence_version.sql', status: 'UNKNOWN', ev: 'V75__saas_invoice_sequence_version.sql', pri: 'P2 — Medium' },
    { id: 'US-BIL-011', sub: 'Razorpay webhook', actor: 'Platform', story: 'As the platform, I want Razorpay webhooks so that payment status updates reliably.', api: 'OnlinePaymentController; RazorpayPaymentGatewayClient', status: 'PARTIALLY IMPLEMENTED', ev: 'RazorpayPaymentGatewayClient; SEC-PAY-001 blank webhook secret sandbox', pri: 'P1 — High', integration: 'Razorpay' },
    { id: 'US-BIL-012', sub: 'Refund payment', actor: 'BILLING_CLERK', story: 'As billing staff, I want to refund a payment so that incorrect collections are reversed.', api: 'BillingController / OnlinePaymentController', status: 'UNKNOWN', ev: 'BillingController; OnlinePaymentController', pri: 'P1 — High' },
    { id: 'US-BIL-013', sub: 'Partial payment', actor: 'RECEPTIONIST', story: 'As a receptionist, I want to accept partial payment so that balances can remain.', api: 'BillingController', web: 'ReceptionCheckoutPage.tsx', status: 'UNKNOWN', ev: 'BillingController; ReceptionCheckoutPage.tsx', pri: 'P2 — Medium' },
    { id: 'US-BIL-014', sub: 'Discount approval', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want discount approval so that write-offs are controlled.', api: 'BillingController; ApprovalController', status: 'UNKNOWN', ev: 'BillingController; ApprovalController', pri: 'P2 — Medium' },
    { id: 'US-BIL-015', sub: 'Cash vs card tender', actor: 'RECEPTIONIST', story: 'As a receptionist, I want to record cash vs card tender so that reconciliation works.', api: 'BillingController', web: 'ReceptionCheckoutPage.tsx', status: 'UNKNOWN', ev: 'BillingController; ReceptionCheckoutPage.tsx', pri: 'P2 — Medium' },
  ]);
  atomics('BIL', 'EPIC-BIL-001', 'Billing', 'BILLING_CLERK', 'BillingController; ChargePostingService; V41; V92', 'UNKNOWN', 'P2 — Medium', [
    'Generate estimate before admit',
    'Add manual invoice line',
    'Void invoice with reason',
    'Reopen settled invoice',
    'Export invoices CSV',
    'View aging receivables',
    'Apply advance deposit',
    'Allocate payment across invoices',
    'Print invoice PDF',
    'Configure charge master prices',
  ]);

  // ─── INSURANCE ──────────────────────────────────────────────────────────
  bulk('INS', 'EPIC-INS-001', 'Insurance', [
    { id: 'US-INS-001', sub: 'Insurance case ops', actor: 'INSURANCE_DESK', story: 'As insurance desk staff, I want TPA case ops so that pre-auth and claims progress.', api: 'InsuranceController', web: 'HospitalInsurancePage.tsx', db: 'V98', status: 'PARTIALLY IMPLEMENTED', ev: 'HospitalInsurancePage.tsx; InsuranceController; V98__hms19_insurance_tpa.sql', pri: 'P1 — High' },
  ]);
  atomics('INS', 'EPIC-INS-001', 'Insurance', 'INSURANCE_DESK', 'InsuranceController; HospitalInsurancePage.tsx; V98', 'UNKNOWN', 'P2 — Medium', [
    'Create insurance case',
    'Submit pre-authorization',
    'Update pre-auth status',
    'Attach claim documents',
    'Submit claim to TPA',
    'Record claim settlement',
    'Record claim rejection reason',
    'Link payer to IPD stay',
    'View pending pre-auths',
    'Escalate stuck claims',
  ]);

  // ─── INVENTORY / PROCUREMENT / ASSET / FACILITY / BLOOD ────────────────
  bulk('INV', 'EPIC-INV-001', 'Inventory', [
    { id: 'US-INV-001', sub: 'Consumable inventory', actor: 'STORE_KEEPER', story: 'As store staff, I want consumable inventory management so that stock levels are tracked.', api: 'InventoryController', web: 'HospitalInventoryPage.tsx', db: 'V94', status: 'PARTIALLY IMPLEMENTED', ev: 'HospitalInventoryPage.tsx; InventoryController; V94 — note BUG-API-001 double /api/v1', pri: 'P1 — High' },
  ]);
  atomics('INV', 'EPIC-INV-001', 'Inventory', 'STORE_KEEPER', 'InventoryController; HospitalInventoryPage.tsx; V94', 'UNKNOWN', 'P2 — Medium', [
    'Receive stock into bin',
    'Issue stock to ward',
    'Adjust stock with reason',
    'View low stock alerts',
    'View expiry soon items',
    'Transfer stock between stores',
    'Cycle count inventory',
    'Quarantine damaged stock',
    'Define reorder level',
    'Consume stock against OT case',
  ]);

  bulk('PRC', 'EPIC-PRC-001', 'Procurement', [
    { id: 'US-PRC-001', sub: 'PR PO GRN', actor: 'PROCUREMENT', story: 'As procurement staff, I want PR/PO/GRN flows so that purchasing is controlled.', api: 'ProcurementController', web: 'HospitalProcurementPage.tsx', db: 'V95', status: 'PARTIALLY IMPLEMENTED', ev: 'HospitalProcurementPage.tsx; ProcurementController; V95__hms16_procurement.sql', pri: 'P1 — High' },
  ]);
  atomics('PRC', 'EPIC-PRC-001', 'Procurement', 'PROCUREMENT', 'ProcurementController; HospitalProcurementPage.tsx; V95', 'UNKNOWN', 'P2 — Medium', [
    'Create purchase requisition',
    'Approve purchase requisition',
    'Convert PR to PO',
    'Send PO to vendor',
    'Record GRN receipt',
    'Match GRN to PO',
    'Close PO short-closed',
    'Track vendor lead time',
    'Flag price variance on GRN',
    'Cancel PO with reason',
  ]);

  bulk('AST', 'EPIC-AST-001', 'Assets', [
    { id: 'US-AST-001', sub: 'Asset register', actor: 'ASSET_MANAGER', story: 'As an asset manager, I want an enterprise asset register so that equipment is tracked.', api: 'AssetController', web: 'HospitalAssetPage.tsx', db: 'V88; V96', status: 'PARTIALLY IMPLEMENTED', ev: 'HospitalAssetPage.tsx; AssetController; V88; V96 — BUG-API-001 risk', pri: 'P1 — High' },
    { id: 'US-AST-002', sub: 'Asset portal', actor: 'ASSET_MANAGER', story: 'As an asset manager, I want an asset portal so that work is centralized.', web: 'AssetPortalPage.tsx', api: 'AssetController', status: 'PARTIALLY IMPLEMENTED', ev: 'AssetPortalPage.tsx; AssetController', pri: 'P2 — Medium' },
  ]);
  atomics('AST', 'EPIC-AST-001', 'Assets', 'ASSET_MANAGER', 'AssetController; HospitalAssetPage.tsx; V96', 'UNKNOWN', 'P2 — Medium', [
    'Register new asset',
    'Assign asset to department',
    'Schedule preventive maintenance',
    'Log breakdown ticket',
    'Record calibration due',
    'Retire asset',
    'Transfer asset location',
    'Attach warranty documents',
  ]);

  bulk('FAC', 'EPIC-FAC-001', 'Facility', [
    { id: 'US-FAC-001', sub: 'Facility work orders', actor: 'FACILITY_MANAGER', story: 'As a facility manager, I want work-order ops so that engineering tickets are tracked.', api: 'FacilityController', web: 'HospitalFacilityPage.tsx', db: 'V97', status: 'PARTIALLY IMPLEMENTED', ev: 'HospitalFacilityPage.tsx; FacilityController; V97 — BUG-API-001 risk', pri: 'P2 — Medium' },
  ]);
  atomics('FAC', 'EPIC-FAC-001', 'Facility', 'FACILITY_MANAGER', 'FacilityController; HospitalFacilityPage.tsx; V97', 'UNKNOWN', 'P2 — Medium', [
    'Create facility work order',
    'Assign work order technician',
    'Complete work order',
    'Prioritize urgent facility ticket',
    'Track SLA breach on work orders',
    'Log spare parts used on WO',
    'Schedule facility inspection',
    'Close work order with sign-off',
  ]);

  bulk('BLD', 'EPIC-BLD-001', 'Blood Bank', [
    { id: 'US-BLD-001', sub: 'Blood bank ops', actor: 'BLOOD_BANK', story: 'As blood bank staff, I want inventory and requests so that transfusion demand is met.', api: 'BloodController', web: 'HospitalBloodBankPage.tsx', db: 'V99', status: 'PARTIALLY IMPLEMENTED', ev: 'HospitalBloodBankPage.tsx; BloodController; V99__hms20_blood_bank.sql', pri: 'P1 — High' },
  ]);
  atomics('BLD', 'EPIC-BLD-001', 'Blood Bank', 'BLOOD_BANK', 'BloodController; HospitalBloodBankPage.tsx; V99', 'UNKNOWN', 'P2 — Medium', [
    'Register blood unit',
    'Update blood unit status',
    'Create crossmatch request',
    'Issue blood unit to patient',
    'Return unused blood unit',
    'Discard expired blood unit',
    'View blood stock by group',
    'Record transfusion reaction',
    'Reserve blood for OT',
    'Notify low blood stock',
  ]);

  // ─── STAFF OPS / AUTOMATION / CC / PRED ─────────────────────────────────
  bulk('STO', 'EPIC-STO-001', 'Staff Ops', [
    { id: 'US-STO-001', sub: 'Roster leave ops', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want staff roster and leave ops so that coverage is planned.', api: 'StaffOpsController', web: 'HospitalStaffOpsPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'HospitalStaffOpsPage.tsx; StaffOpsController', pri: 'P2 — Medium' },
  ]);
  atomics('STO', 'EPIC-STO-001', 'Staff Ops', 'HOSPITAL_ADMIN', 'StaffOpsController; HospitalStaffOpsPage.tsx', 'UNKNOWN', 'P2 — Medium', [
    'Publish weekly roster',
    'Request leave',
    'Approve leave',
    'Swap shifts',
    'View understaffed wards',
    'Assign on-call doctor',
    'Track attendance exceptions',
    'Export roster PDF',
  ]);

  bulk('AUT', 'EPIC-AUT-001', 'Automation', [
    { id: 'US-AUT-001', sub: 'Domain event triggers', actor: 'Platform', story: 'As the platform, I want domain events to trigger automation so that tasks are created.', api: 'TaskController / automation services', db: 'V90__hms12_automation_platform.sql', status: 'PARTIALLY IMPLEMENTED', ev: 'V90__hms12_automation_platform.sql', pri: 'P2 — Medium' },
    { id: 'US-AUT-002', sub: 'My Work tasks', actor: 'Hospital staff', story: 'As hospital staff, I want My Work task queues so that cross-role work is visible.', api: 'TaskController', web: 'HospitalMyWorkPage.tsx; DoctorMyWorkPage.tsx; NursingMyWorkPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'TaskController; My Work pages — BUG-API-001 on tasks APIs', pri: 'P1 — High' },
    { id: 'US-AUT-003', sub: 'Approval actions', actor: 'Approver', story: 'As an approver, I want approval workflow actions so that gated requests progress.', api: 'ApprovalController', status: 'PARTIALLY IMPLEMENTED', ev: 'ApprovalController; V90', pri: 'P1 — High' },
  ]);
  atomics('AUT', 'EPIC-AUT-001', 'Automation', 'Hospital staff', 'TaskController; ApprovalController; V90', 'UNKNOWN', 'P2 — Medium', [
    'Complete assigned task',
    'Reassign task',
    'Snooze task',
    'Escalate overdue task',
    'Approve pending request',
    'Reject pending request with comment',
    'Configure automation rule',
    'Disable automation rule',
    'View automation run history',
    'Retry failed automation',
  ]);

  bulk('CC', 'EPIC-CC-001', 'Command Center', [
    { id: 'US-CC-001', sub: 'View command center', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want a command center so that operational KPIs are centralized.', api: 'CommandCenterController', web: 'HospitalDashboardPage.tsx; commandCenterApi.ts', status: 'PARTIALLY IMPLEMENTED', ev: 'Phase C #14 — CommandCenterController; commandCenterApi double-prefix bug BUG-API-001', pri: 'P1 — High' },
    { id: 'US-CC-002', sub: 'Fix command center API prefix', actor: 'Platform engineer', story: 'As a platform engineer, I want to fix double /api/v1 prefix on commandCenterApi so that KPIs load.', web: 'commandCenterApi.ts', status: 'PLANNED', ev: 'BUG-API-001 commandCenterApi.ts', pri: 'P1 — High' },
    { id: 'US-CC-003', sub: 'Bed occupancy widget', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want bed occupancy in command center so that capacity decisions are faster.', api: 'CommandCenterController', status: 'UNKNOWN', ev: 'CommandCenterController', pri: 'P2 — Medium' },
    { id: 'US-CC-004', sub: 'ED wait widget', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want ED wait metrics in command center so that bottlenecks show.', api: 'CommandCenterController', status: 'UNKNOWN', ev: 'CommandCenterController', pri: 'P2 — Medium' },
    { id: 'US-CC-005', sub: 'OR utilization widget', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want OR utilization in command center so that theatre load is clear.', api: 'CommandCenterController', status: 'UNKNOWN', ev: 'CommandCenterController', pri: 'P2 — Medium' },
  ]);

  bulk('PRD', 'EPIC-PRED-001', 'Predictive', [
    { id: 'US-PRD-001', sub: 'Predictive insights', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want heuristic predictive insights so that demand can be anticipated.', api: 'PredictiveController', status: 'UNKNOWN', ev: 'PredictiveController', pri: 'P3 — Future' },
  ]);
  atomics('PRD', 'EPIC-PRED-001', 'Predictive', 'HOSPITAL_ADMIN', 'PredictiveController', 'UNKNOWN', 'P3 — Future', [
    'View predicted census',
    'View predicted ED surge',
    'View predicted no-show risk',
    'View staffing recommendation',
    'Dismiss predictive insight',
    'Export predictive snapshot',
  ]);

  // ─── SUBSCRIPTIONS / PARTNERS / REVIEWS / ANALYTICS ─────────────────────
  bulk('SUB', 'EPIC-SUB-001', 'Subscriptions', [
    { id: 'US-SUB-001', sub: 'Plan catalog admin', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want plan catalog administration so that packages are sellable.', api: 'AdminSubscriptionPlanController', web: 'AdminPlansPage.tsx', db: 'V70', status: 'UNKNOWN', ev: 'AdminPlansPage.tsx; AdminSubscriptionPlanController; V70', pri: 'P1 — High' },
    { id: 'US-SUB-002', sub: 'Hospital subscription mgmt', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want hospital subscription management so that tenants are billed/entitled.', api: 'AdminHospitalSubscriptionController', db: 'V70', status: 'UNKNOWN', ev: 'AdminHospitalSubscriptionController; V70', pri: 'P1 — High' },
    { id: 'US-SUB-003', sub: 'Hospital view entitlement', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want to see entitled modules so that we know what is enabled.', web: 'HospitalSubscriptionPage.tsx', db: 'V70', status: 'UNKNOWN', ev: 'HospitalSubscriptionPage.tsx; V70', pri: 'P2 — Medium' },
  ]);

  bulk('PTR', 'EPIC-PTR-001', 'Partners', [
    { id: 'US-PTR-001', sub: 'Partner self view', actor: 'PARTNER', story: 'As a partner user, I want partner APIs/views so that partner org data is accessible.', api: 'PartnerController', status: 'UNKNOWN', ev: 'PartnerController', pri: 'P2 — Medium' },
  ]);
  atomics('PTR', 'EPIC-PTR-001', 'Partners', 'PARTNER', 'PartnerController; AdminPartnerController', 'UNKNOWN', 'P2 — Medium', [
    'View partner hospitals',
    'View partner performance metrics',
    'Update partner contact profile',
    'Submit partner support ticket',
  ]);

  bulk('REV', 'EPIC-REV-001', 'Reviews', [
    { id: 'US-REV-001', sub: 'Submit encounter review', actor: 'PATIENT', story: 'As a patient, I want to submit an encounter review so that I can rate care.', api: 'ReviewController', db: 'V69', status: 'UNKNOWN', ev: 'ReviewController; V69__encounter_reviews.sql', pri: 'P2 — Medium' },
    { id: 'US-REV-002', sub: 'Moderate review', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want to moderate reviews so that abuse is removed.', api: 'AdminReviewController', web: 'AdminReviewModerationPage.tsx', status: 'UNKNOWN', ev: 'AdminReviewModerationPage.tsx; AdminReviewController', pri: 'P2 — Medium' },
  ]);
  atomics('REV', 'EPIC-REV-001', 'Reviews', 'PATIENT', 'ReviewController; V69', 'UNKNOWN', 'P3 — Future', [
    'Edit pending review',
    'Delete own review',
    'View doctor average rating',
    'Flag abusive review',
  ]);

  bulk('ANL', 'EPIC-ANL-001', 'Analytics', [
    { id: 'US-ANL-001', sub: 'Analytics surfaces', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want analytics/metrics surfaces so that performance is measurable.', api: 'AnalyticsController', status: 'UNKNOWN', ev: 'AnalyticsController', pri: 'P2 — Medium' },
    { id: 'US-ANL-002', sub: 'Role dashboards', actor: 'Hospital staff', story: 'As hospital staff, I want role dashboards so that daily KPIs match my role.', api: 'DashboardController', web: 'DoctorDashboardPage.tsx; HospitalDashboardPage.tsx; NursingDashboardPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'DashboardController; role dashboard pages', pri: 'P1 — High' },
  ]);
  atomics('ANL', 'EPIC-ANL-001', 'Analytics', 'HOSPITAL_ADMIN', 'AnalyticsController; DashboardController', 'UNKNOWN', 'P2 — Medium', [
    'View OPD volume chart',
    'View revenue summary',
    'View average length of stay',
    'View lab TAT metrics',
    'Filter analytics by date range',
    'Export analytics CSV',
    'View no-show rate',
    'View specialty mix',
  ]);

  // ─── NOTIFICATIONS ──────────────────────────────────────────────────────
  bulk('NTF', 'EPIC-NTF-001', 'Notifications', [
    { id: 'US-NTF-001', sub: 'Email notification send', actor: 'Platform', story: 'As the platform, I want email notifications so that users receive transactional mail.', status: 'PARTIALLY IMPLEMENTED', ev: 'Notification gateways / AccountSettings prefs — completeness UNKNOWN', pri: 'P1 — High', notification: 'Email channel' },
    { id: 'US-NTF-002', sub: 'SMS notification send', actor: 'Platform', story: 'As the platform, I want SMS notifications so that urgent alerts reach phones.', status: 'PARTIALLY IMPLEMENTED', ev: 'TECH-NTF-001 DefaultSmsNotificationGateway log stub', pri: 'P1 — High', notification: 'SMS stub logs only' },
    { id: 'US-NTF-003', sub: 'Push device tokens', actor: 'PATIENT', story: 'As a patient, I want device push tokens registered so that mobile pushes can deliver.', db: 'V68__device_push_tokens.sql', mobile: 'mobile/health360-mobile', status: 'PARTIALLY IMPLEMENTED', ev: 'V68__device_push_tokens.sql; mobile/health360-mobile', pri: 'P2 — Medium', notification: 'Push' },
    { id: 'US-NTF-004', sub: 'WhatsApp notifications', actor: 'PATIENT', story: 'As a patient, I want WhatsApp notifications so that I receive reminders on WhatsApp.', status: 'NOT STARTED', ev: VISION, pri: 'P3 — Future', pre: 'None — vision only', notification: 'WhatsApp — vision only' },
  ]);
  atomics('NTF', 'EPIC-NTF-001', 'Notifications', 'PATIENT', 'notification gateways; V68', 'UNKNOWN', 'P2 — Medium', [
    'Receive appointment reminder email',
    'Receive appointment reminder SMS',
    'Receive lab result ready notice',
    'Receive payment receipt email',
    'Opt out of marketing notifications',
    'Receive IPD admit family SMS',
  ]);

  // ─── MOBILE ─────────────────────────────────────────────────────────────
  bulk('MOB', 'EPIC-MOB-001', 'Mobile', [
    { id: 'US-MOB-001', sub: 'Patient mobile auth', actor: 'PATIENT', story: 'As a patient, I want mobile auth so that I can use the consumer app.', mobile: 'mobile/health360-mobile', status: 'UNKNOWN', ev: 'mobile/health360-mobile — parity UNKNOWN', pri: 'P1 — High' },
    { id: 'US-MOB-002', sub: 'Patient mobile OPD request', actor: 'PATIENT', story: 'As a patient, I want to request OPD from mobile so that care access matches web.', mobile: 'mobile/health360-mobile', deps: 'US-PAT-008', status: 'UNKNOWN', ev: 'mobile/health360-mobile; OpdController', pri: 'P1 — High' },
    { id: 'US-MOB-003', sub: 'Patient mobile payments', actor: 'PATIENT', story: 'As a patient, I want mobile payments so that Razorpay works on app.', mobile: 'mobile/health360-mobile', deps: 'US-BIL-004', status: 'UNKNOWN', ev: 'mobile/health360-mobile; OnlinePaymentController', pri: 'P1 — High' },
    { id: 'US-MOB-004', sub: 'Staff mobile shell', actor: 'Hospital staff', story: 'As hospital staff, I want a staff mobile shell so that limited tasks are available on phone.', mobile: 'mobile/health360-mobile', status: 'UNKNOWN', ev: 'mobile/health360-mobile staff shell — UNKNOWN', pri: 'P2 — Medium' },
  ]);
  atomics('MOB', 'EPIC-MOB-001', 'Mobile', 'PATIENT', 'mobile/health360-mobile', 'UNKNOWN', 'P2 — Medium', [
    { sub: 'View appointments on mobile', story: 'As a patient, I want to view appointments on mobile so that I track visits on the go.', mobile: 'mobile/health360-mobile' },
    { sub: 'View prescriptions on mobile', story: 'As a patient, I want prescriptions on mobile so that I can show Rx at pharmacy.', mobile: 'mobile/health360-mobile' },
    { sub: 'View vitals on mobile', story: 'As a patient, I want vitals on mobile so that trends are handy.', mobile: 'mobile/health360-mobile' },
    { sub: 'Upload document on mobile', story: 'As a patient, I want to upload documents on mobile so that records stay complete.', mobile: 'mobile/health360-mobile' },
    { sub: 'Receive push on mobile', story: 'As a patient, I want push notifications on mobile so that I am alerted timely.', mobile: 'mobile/health360-mobile', notification: 'Push via V68 tokens' },
    { sub: 'Biometric unlock mobile', story: 'As a patient, I want biometric unlock so that app access is faster.', mobile: 'mobile/health360-mobile' },
    { sub: 'Offline encounter cache', story: 'As a patient, I want offline cache of last encounter summary so that I can view without network.', mobile: 'mobile/health360-mobile', status: 'PLANNED', ev: 'mobile/health360-mobile — offline PLANNED' },
    { sub: 'Staff MAR on mobile', story: 'As a nurse, I want MAR on mobile so that bedside admin is possible.', actor: 'NURSE', mobile: 'mobile/health360-mobile', deps: 'US-NUR-006' },
    { sub: 'Doctor queue on mobile', story: 'As a doctor, I want OPD queue on mobile so that I can work away from desk.', actor: 'DOCTOR', mobile: 'mobile/health360-mobile' },
    { sub: 'Mobile deep link appointment', story: 'As a patient, I want appointment deep links so that reminders open the right screen.', mobile: 'mobile/health360-mobile' },
  ]);

  // ─── JOURNEYS ───────────────────────────────────────────────────────────
  bulk('JRN', 'EPIC-JRN-001', 'Cross-Module Journeys', [
    { id: 'US-JRN-001', sub: 'Patient OPD end-to-end', actor: 'PATIENT', story: 'As a patient, I want an end-to-end OPD journey from request to checkout so that outpatient care completes.', deps: 'US-PAT-008,US-RCV-006,US-DOC-007,US-BIL-003', status: 'IMPLEMENTED', ev: 'Phase C #3+#4+#5+#8 combined evidence paths', pri: 'P0 — Critical', flow: 'Request OPD → Reception/queue → Doctor encounter → Checkout/payment' },
    { id: 'US-JRN-002', sub: 'IPD recommend to discharge', actor: 'DOCTOR', story: 'As a care team, I want IPD journey from recommend through admit and discharge so that inpatient care completes.', deps: 'US-DOC-014,US-IPD-001,US-IPD-009', status: 'PARTIALLY IMPLEMENTED', ev: 'Phase C #7 IpdController; discharge V85 partial', pri: 'P0 — Critical' },
    { id: 'US-JRN-003', sub: 'Surgery journey', actor: 'OT_STAFF', story: 'As OT staff, I want a surgery journey from schedule to anesthesia/implants so that peri-op is tracked.', deps: 'US-OT-002,US-OT-005,US-OT-006', status: 'PARTIALLY IMPLEMENTED', ev: 'OtController; OtWorklistPage; V76; V78', pri: 'P1 — High' },
    { id: 'US-JRN-004', sub: 'Lab order to result', actor: 'DOCTOR', story: 'As a doctor, I want lab order-to-result journey so that diagnostics close the loop.', deps: 'US-DOC-011,US-LAB-002', status: 'IMPLEMENTED', ev: 'Phase C #5+#6 ClinicalController → LabController', pri: 'P0 — Critical' },
    { id: 'US-JRN-005', sub: 'MAR pharmacy to nurse', actor: 'NURSE', story: 'As a nurse, I want pharmacy READY to MAR administer journey so that meds are safely given.', deps: 'US-PHA-006,US-NUR-006', status: 'IMPLEMENTED', ev: 'Phase C #13 PharmacyController.administerMedication', pri: 'P0 — Critical' },
    { id: 'US-JRN-006', sub: 'Onboarding to verification', actor: 'DOCTOR', story: 'As a doctor prospect, I want onboarding request through verification approval so that I can practice.', deps: 'US-PUB-004,US-ADM-011,US-DOC-002', status: 'PARTIALLY IMPLEMENTED', ev: 'Phase C #15+#9; GAP-ONB-001', pri: 'P0 — Critical' },
    { id: 'US-JRN-007', sub: 'ED to IPD journey', actor: 'ED_STAFF', story: 'As ED staff, I want ED-to-IPD journey so that emergency admits become inpatient stays.', deps: 'US-ED-001,US-IPD-001', status: 'UNKNOWN', ev: 'EmergencyController; IpdController; V91', pri: 'P1 — High' },
    { id: 'US-JRN-008', sub: 'Insurance with IPD billing', actor: 'INSURANCE_DESK', story: 'As insurance desk, I want insurance case linked to IPD billing so that payer settlement works.', deps: 'US-INS-001,US-IPD-008,US-BIL-001', status: 'UNKNOWN', ev: 'InsuranceController; V98; V84; BillingController', pri: 'P1 — High' },
  ]);

  // ─── SECURITY / AUDIT / TENANT ──────────────────────────────────────────
  bulk('SEC', 'EPIC-SEC-001', 'Security', [
    { id: 'US-SEC-001', sub: 'Tenant isolation verify', actor: 'Security officer', story: 'As a security officer, I want tenant isolation verified so that hospitals cannot read each other.', api: 'hospital-scoped controllers', status: 'PARTIALLY IMPLEMENTED', ev: 'Staff membership scope; hospital-scoped controllers', pri: 'P0 — Critical', audit: 'Access denials should audit' },
    { id: 'US-SEC-002', sub: 'Audit clinical access', actor: 'PLATFORM_ADMIN', story: 'As a platform admin, I want clinical access audited so that PHI access is traceable.', api: 'AdminAuditLogController', web: 'AdminAuditLogsPage.tsx', status: 'PARTIALLY IMPLEMENTED', ev: 'AdminAuditLogController; AdminAuditLogsPage.tsx', pri: 'P0 — Critical', audit: 'Required' },
    { id: 'US-SEC-003', sub: 'Razorpay webhook secret', actor: 'Platform engineer', story: 'As a platform engineer, I want Razorpay webhook secrets enforced so that forged callbacks fail.', api: 'RazorpayPaymentGatewayClient', status: 'PLANNED', ev: 'SEC-PAY-001 RazorpayPaymentGatewayClient sandbox blank secret', pri: 'P1 — High' },
    { id: 'US-SEC-004', sub: 'PHI field encryption at rest', actor: 'Security officer', story: 'As a security officer, I want PHI encryption at rest so that database compromise risk drops.', status: 'PLANNED', ev: 'Security policy — RULE TO BE CONFIRMED', pri: 'P2 — Medium' },
    { id: 'US-SEC-005', sub: 'Break-glass access', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want break-glass access with audit so that emergencies override soft locks.', status: 'NOT STARTED', ev: VISION, pri: 'P3 — Future', pre: 'None' },
  ]);
  atomics('SEC', 'EPIC-SEC-001', 'Security', 'Security officer', 'AdminAuditLogController; IAM seeds; RoleRoute', 'UNKNOWN', 'P2 — Medium', [
    'Review privileged role assignments',
    'Force password reset for user',
    'View failed auth attempts',
    'Export audit log range',
    'Validate CORS and cookie settings',
    'Rotate JWT signing keys',
  ]);

  // ─── VISION PRODUCTS ────────────────────────────────────────────────────
  bulk('VIS', 'EPIC-VIS-001', 'Vision Products', [
    { id: 'US-VIS-001', sub: 'Ambulance dispatch', actor: 'Dispatch operator', story: 'As a dispatch operator, I want ambulance dispatch so that emergency transport is coordinated.', status: 'NOT STARTED', ev: VISION, pri: 'P3 — Future', pre: 'None — vision only' },
    { id: 'US-VIS-002', sub: 'Home healthcare visits', actor: 'Home care nurse', story: 'As a home care nurse, I want home healthcare visit scheduling so that domiciliary care is delivered.', status: 'NOT STARTED', ev: VISION, pri: 'P3 — Future', pre: 'None — vision only' },
    { id: 'US-VIS-003', sub: 'Physiotherapy product', actor: 'Physiotherapist', story: 'As a physiotherapist, I want a physiotherapy product module so that rehab plans are managed.', status: 'NOT STARTED', ev: VISION, pri: 'P3 — Future', pre: 'None — vision only' },
    { id: 'US-VIS-004', sub: 'Full telemedicine product', actor: 'DOCTOR', story: 'As a doctor, I want a full telemedicine product so that video consults are first-class.', status: 'NOT STARTED', ev: VISION, pri: 'P3 — Future', pre: 'None — vision only' },
    { id: 'US-VIS-005', sub: 'ABHA linked records', actor: 'PATIENT', story: 'As a patient, I want ABHA-linked records so that national health ID connects my history.', status: 'NOT STARTED', ev: VISION, pri: 'P3 — Future', pre: 'None — vision only' },
    { id: 'US-VIS-006', sub: 'ABDM health exchange', actor: 'HOSPITAL_ADMIN', story: 'As a hospital admin, I want ABDM health information exchange so that referrals share records.', status: 'NOT STARTED', ev: VISION, pri: 'P3 — Future', pre: 'None — vision only' },
    { id: 'US-VIS-007', sub: 'WhatsApp care bot', actor: 'PATIENT', story: 'As a patient, I want WhatsApp care messaging so that I can book and get reminders in chat.', status: 'NOT STARTED', ev: VISION, pri: 'P3 — Future', pre: 'None — vision only' },
    { id: 'US-VIS-008', sub: 'AI CDS product', actor: 'DOCTOR', story: 'As a doctor, I want productized AI CDS so that suggestions assist diagnosis safely.', status: 'NOT STARTED', ev: VISION, pri: 'P3 — Future', pre: 'None — vision only' },
  ]);

  // Extra atomic coverage to reach 450+
  atomics('PLT', 'EPIC-PLT-001', 'Platform', 'PLATFORM_ADMIN', 'HealthController; DashboardController; V74__phase_g_foundation.sql', 'UNKNOWN', 'P2 — Medium', [
    'View foundation phase flags',
    'Toggle maintenance mode',
    'Seed demo hospital data',
    'Purge soft-deleted tenants',
    'View API version info',
    'Manage feature flags',
    'View job scheduler status',
    'Replay failed outbox events',
    'Configure retention policy',
    'Validate multi-tenant migrations',
    'Browse system configuration',
    'Update support contact banner',
  ]);

  atomics('HOS', 'EPIC-HOS-001', 'Hospital Org', 'HOSPITAL_ADMIN', 'HospitalController; StaffController', 'UNKNOWN', 'P2 — Medium', [
    'Upload hospital logo',
    'Set hospital timezone',
    'Configure OPD hours',
    'Configure visiting hours',
    'Define ward list',
    'Define room types',
    'Set default currency',
    'Configure tax profile',
    'Manage hospital phone numbers',
    'Publish hospital specialties',
  ]);

  atomics('PAT', 'EPIC-PAT-001', 'Patient', 'PATIENT', 'PatientProfileController; ProfileHubPage.tsx', 'UNKNOWN', 'P2 — Medium', [
    'Upload profile photo',
    'Add chronic condition',
    'Add current medication list',
    'Share profile with caregiver',
    'Download personal health record export',
    'Set preferred hospital',
    'Set preferred language',
    'View consent history',
    'Revoke a consent',
    'Link family member account',
  ]);

  atomics('DOC', 'EPIC-DOC-001', 'Doctor', 'DOCTOR', 'DoctorProfileController; ClinicalController', 'UNKNOWN', 'P2 — Medium', [
    'Add language spoken',
    'Add qualification entry',
    'Set consultation fee',
    'Pause new appointments',
    'View patient longitudinal summary in encounter',
    'Copy previous Rx',
    'Add follow-up date',
    'Request second opinion task',
    'Sign encounter digitally',
    'View my verification status',
  ]);
}
