import { lazy, Suspense, type PropsWithChildren } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { LandingPage } from '@/features/public/pages/LandingPage';
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { VerifyEmailPage } from '@/features/auth/pages/VerifyEmailPage';
import { GuestOnlyRoute } from '@/features/auth/components/GuestOnlyRoute';
import { ProtectedRoute } from '@/features/auth/components/ProtectedRoute';
import { RoleRoute } from '@/features/auth/components/RoleRoute';
import { AccountSettingsPage } from '@/features/settings/pages/AccountSettingsPage';
import { NotificationPreferencesPage } from '@/features/settings/pages/NotificationPreferencesPage';
import { ConsentPage } from '@/features/patient/pages/ConsentPage';
import { CompletePatientAccountPage } from '@/features/patient/pages/CompletePatientAccountPage';
import { PatientPortalLayout } from '@/features/patient/layout/PatientPortalLayout';
import { DoctorPortalLayout } from '@/features/doctor/layout/DoctorPortalLayout';
import { AdminPortalLayout } from '@/features/admin/layout/AdminPortalLayout';
import { HospitalPortalLayout } from '@/features/hospital/layout/HospitalPortalLayout';
import { LabPortalLayout } from '@/features/lab/layout/LabPortalLayout';
import { RadiologyPortalLayout } from '@/features/radiology/layout/RadiologyPortalLayout';
import { OtPortalLayout } from '@/features/ot/layout/OtPortalLayout';
import { PharmacyPortalLayout } from '@/features/pharmacy/layout/PharmacyPortalLayout';
import { ReceptionPortalLayout } from '@/features/reception/layout/ReceptionPortalLayout';
import { NursingPortalLayout } from '@/features/nursing/layout/NursingPortalLayout';
import { IcuNursePortalLayout } from '@/features/icu-nurse/layout/IcuNursePortalLayout';
import { LogoLoader } from '@/shared/brand/LogoLoader';
import { BrandIdentityPage } from '@/shared/brand/BrandIdentityPage';

const DashboardPage = lazy(() =>
  import('@/features/patient/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
);
const MetricDetailPage = lazy(() =>
  import('@/features/patient/pages/MetricDetailPage').then((m) => ({ default: m.MetricDetailPage })),
);
const ProfileHubPage = lazy(() =>
  import('@/features/patient/pages/ProfileHubPage').then((m) => ({ default: m.ProfileHubPage })),
);
const VitalsPage = lazy(() =>
  import('@/features/patient/pages/VitalsPage').then((m) => ({ default: m.VitalsPage })),
);
const HealthScorePage = lazy(() =>
  import('@/features/patient/pages/HealthScorePage').then((m) => ({ default: m.HealthScorePage })),
);
const DoctorProfilePage = lazy(() =>
  import('@/features/doctor/pages/DoctorProfilePage').then((m) => ({ default: m.DoctorProfilePage })),
);
const DoctorVerificationPage = lazy(() =>
  import('@/features/doctor/pages/DoctorVerificationPage').then((m) => ({ default: m.DoctorVerificationPage })),
);
const AdminVerificationQueuePage = lazy(() =>
  import('@/features/admin/pages/AdminVerificationQueuePage').then((m) => ({ default: m.AdminVerificationQueuePage })),
);
const AdminVerificationReviewPage = lazy(() =>
  import('@/features/admin/pages/AdminVerificationReviewPage').then((m) => ({ default: m.AdminVerificationReviewPage })),
);
const HospitalProfilePage = lazy(() =>
  import('@/features/hospital/pages/HospitalProfilePage').then((m) => ({ default: m.HospitalProfilePage })),
);
const HospitalBranchesPage = lazy(() =>
  import('@/features/hospital/pages/HospitalBranchesPage').then((m) => ({ default: m.HospitalBranchesPage })),
);
const HospitalDepartmentsPage = lazy(() =>
  import('@/features/hospital/pages/HospitalDepartmentsPage').then((m) => ({ default: m.HospitalDepartmentsPage })),
);
const HospitalEmergencyPage = lazy(() =>
  import('@/features/hospital/pages/HospitalEmergencyPage').then((m) => ({ default: m.HospitalEmergencyPage })),
);
const HospitalDoctorRosterPage = lazy(() =>
  import('@/features/hospital/pages/HospitalDoctorRosterPage').then((m) => ({ default: m.HospitalDoctorRosterPage })),
);
const HospitalFacilitiesPage = lazy(() =>
  import('@/features/hospital/pages/HospitalFacilitiesPage').then((m) => ({ default: m.HospitalFacilitiesPage })),
);
const HospitalGalleryPage = lazy(() =>
  import('@/features/hospital/pages/HospitalGalleryPage').then((m) => ({ default: m.HospitalGalleryPage })),
);
const DoctorHospitalAssociationsPage = lazy(() =>
  import('@/features/doctor/pages/DoctorHospitalAssociationsPage').then((m) => ({ default: m.DoctorHospitalAssociationsPage })),
);
const DoctorSchedulePage = lazy(() =>
  import('@/features/doctor/pages/DoctorSchedulePage').then((m) => ({ default: m.DoctorSchedulePage })),
);
const RequestOpdPage = lazy(() =>
  import('@/features/patient/pages/RequestOpdPage').then((m) => ({ default: m.RequestOpdPage })),
);
const UnifiedSearchPage = lazy(() =>
  import('@/features/patient/pages/UnifiedSearchPage').then((m) => ({ default: m.UnifiedSearchPage })),
);
const PatientPrescriptionsPage = lazy(() =>
  import('@/features/patient/pages/PatientPrescriptionsPage').then((m) => ({ default: m.PatientPrescriptionsPage })),
);
const PatientOpdStatusPage = lazy(() =>
  import('@/features/patient/pages/PatientOpdStatusPage').then((m) => ({ default: m.PatientOpdStatusPage })),
);
const PatientPaymentsPage = lazy(() =>
  import('@/features/patient/pages/PatientPaymentsPage').then((m) => ({ default: m.PatientPaymentsPage })),
);
const HospitalSearchPage = lazy(() =>
  import('@/features/patient/pages/HospitalSearchPage').then((m) => ({ default: m.HospitalSearchPage })),
);
const DoctorBookingProfilePage = lazy(() =>
  import('@/features/patient/pages/DoctorBookingProfilePage').then((m) => ({ default: m.DoctorBookingProfilePage })),
);
const PublicDoctorProfilePage = lazy(() =>
  import('@/features/public/pages/PublicDoctorProfilePage').then((m) => ({ default: m.PublicDoctorProfilePage })),
);
const PublicHospitalProfilePage = lazy(() =>
  import('@/features/public/pages/PublicHospitalProfilePage').then((m) => ({ default: m.PublicHospitalProfilePage })),
);
const DoctorDashboardPage = lazy(() =>
  import('@/features/doctor/pages/DoctorDashboardPage').then((m) => ({ default: m.DoctorDashboardPage })),
);
const HospitalOpdPage = lazy(() =>
  import('@/features/hospital/pages/HospitalOpdPage').then((m) => ({ default: m.HospitalOpdPage })),
);
const HospitalIpdPage = lazy(() =>
  import('@/features/hospital/pages/HospitalIpdPage').then((m) => ({ default: m.HospitalIpdPage })),
);
const HospitalIcuPage = lazy(() =>
  import('@/features/hospital/pages/HospitalIcuPage').then((m) => ({ default: m.HospitalIcuPage })),
);
const HospitalDashboardPage = lazy(() =>
  import('@/features/hospital/pages/HospitalDashboardPage').then((m) => ({ default: m.HospitalDashboardPage })),
);
const AdminDashboardPage = lazy(() =>
  import('@/features/admin/pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
);
const LabDashboardPage = lazy(() =>
  import('@/features/lab/pages/LabDashboardPage').then((m) => ({ default: m.LabDashboardPage })),
);
const LabWorklistPage = lazy(() =>
  import('@/features/lab/pages/LabWorklistPage').then((m) => ({ default: m.LabWorklistPage })),
);
const LabOrderDetailPage = lazy(() =>
  import('@/features/lab/pages/LabOrderDetailPage').then((m) => ({ default: m.LabOrderDetailPage })),
);
const LabCatalogPage = lazy(() =>
  import('@/features/lab/pages/LabCatalogPage').then((m) => ({ default: m.LabCatalogPage })),
);
const RadiologyDashboardPage = lazy(() =>
  import('@/features/radiology/pages/RadiologyDashboardPage').then((m) => ({ default: m.RadiologyDashboardPage })),
);
const RadiologyWorklistPage = lazy(() =>
  import('@/features/radiology/pages/RadiologyWorklistPage').then((m) => ({ default: m.RadiologyWorklistPage })),
);
const ImagingOrderDetailPage = lazy(() =>
  import('@/features/radiology/pages/ImagingOrderDetailPage').then((m) => ({ default: m.ImagingOrderDetailPage })),
);
const RadiologyCatalogPage = lazy(() =>
  import('@/features/radiology/pages/RadiologyCatalogPage').then((m) => ({ default: m.RadiologyCatalogPage })),
);
const OtDashboardPage = lazy(() =>
  import('@/features/ot/pages/OtDashboardPage').then((m) => ({ default: m.OtDashboardPage })),
);
const OtWorklistPage = lazy(() =>
  import('@/features/ot/pages/OtWorklistPage').then((m) => ({ default: m.OtWorklistPage })),
);
const OtProcedureDetailPage = lazy(() =>
  import('@/features/ot/pages/OtProcedureDetailPage').then((m) => ({ default: m.OtProcedureDetailPage })),
);
const OtCatalogPage = lazy(() =>
  import('@/features/ot/pages/OtCatalogPage').then((m) => ({ default: m.OtCatalogPage })),
);
const PharmacyDashboardPage = lazy(() =>
  import('@/features/pharmacy/pages/PharmacyDashboardPage').then((m) => ({ default: m.PharmacyDashboardPage })),
);
const PharmacyWorklistPage = lazy(() =>
  import('@/features/pharmacy/pages/PharmacyWorklistPage').then((m) => ({ default: m.PharmacyWorklistPage })),
);
const MedicationOrderDetailPage = lazy(() =>
  import('@/features/pharmacy/pages/MedicationOrderDetailPage').then((m) => ({ default: m.MedicationOrderDetailPage })),
);
const PharmacyRequestsPage = lazy(() =>
  import('@/features/pharmacy/pages/PharmacyRequestsPage').then((m) => ({ default: m.PharmacyRequestsPage })),
);
const PharmacyCatalogPage = lazy(() =>
  import('@/features/pharmacy/pages/PharmacyCatalogPage').then((m) => ({ default: m.PharmacyCatalogPage })),
);
const HospitalStaffPage = lazy(() =>
  import('@/features/hospital/pages/HospitalStaffPage').then((m) => ({ default: m.HospitalStaffPage })),
);
const HospitalClinicalCatalogsPage = lazy(() =>
  import('@/features/hospital/pages/HospitalClinicalCatalogsPage').then((m) => ({
    default: m.HospitalClinicalCatalogsPage,
  })),
);
const ReceptionDashboardPage = lazy(() =>
  import('@/features/reception/pages/ReceptionDashboardPage').then((m) => ({ default: m.ReceptionDashboardPage })),
);
const ReceptionCheckoutPage = lazy(() =>
  import('@/features/billing/pages/ReceptionCheckoutPage').then((m) => ({ default: m.ReceptionCheckoutPage })),
);
const HospitalInvoicesPage = lazy(() =>
  import('@/features/billing/pages/HospitalInvoicesPage').then((m) => ({ default: m.HospitalInvoicesPage })),
);
const HospitalInvoiceDetailPage = lazy(() =>
  import('@/features/billing/pages/HospitalInvoiceDetailPage').then((m) => ({ default: m.HospitalInvoiceDetailPage })),
);
const PatientSearchPage = lazy(() =>
  import('@/features/reception/pages/PatientSearchPage').then((m) => ({ default: m.PatientSearchPage })),
);
const PatientRegisterPage = lazy(() =>
  import('@/features/reception/pages/PatientRegisterPage').then((m) => ({ default: m.PatientRegisterPage })),
);
const PatientDetailPage = lazy(() =>
  import('@/features/reception/pages/PatientDetailPage').then((m) => ({ default: m.PatientDetailPage })),
);
const PatientReceiptPage = lazy(() =>
  import('@/features/reception/pages/PatientReceiptPage').then((m) => ({ default: m.PatientReceiptPage })),
);
const NursingDashboardPage = lazy(() =>
  import('@/features/nursing/pages/NursingDashboardPage').then((m) => ({ default: m.NursingDashboardPage })),
);
const NursingWardBoardPage = lazy(() =>
  import('@/features/nursing/pages/NursingWardBoardPage').then((m) => ({ default: m.NursingWardBoardPage })),
);
const NursingAdmissionPage = lazy(() =>
  import('@/features/nursing/pages/NursingAdmissionPage').then((m) => ({ default: m.NursingAdmissionPage })),
);
const NursingMarPage = lazy(() =>
  import('@/features/nursing/pages/NursingMarPage').then((m) => ({ default: m.NursingMarPage })),
);
const NursingMarOrderPage = lazy(() =>
  import('@/features/nursing/pages/NursingMarOrderPage').then((m) => ({ default: m.NursingMarOrderPage })),
);
const IcuNurseDashboardPage = lazy(() =>
  import('@/features/icu-nurse/pages/IcuNurseDashboardPage').then((m) => ({ default: m.IcuNurseDashboardPage })),
);
const IcuNurseStayPage = lazy(() =>
  import('@/features/icu-nurse/pages/IcuNurseStayPage').then((m) => ({ default: m.IcuNurseStayPage })),
);
const LabValuesPage = lazy(() =>
  import('@/features/patient/pages/LabValuesPage').then((m) => ({ default: m.LabValuesPage })),
);
const HealthDocumentsPage = lazy(() =>
  import('@/features/patient/pages/HealthDocumentsPage').then((m) => ({ default: m.HealthDocumentsPage })),
);
const HealthTimelinePage = lazy(() =>
  import('@/features/patient/pages/HealthTimelinePage').then((m) => ({ default: m.HealthTimelinePage })),
);
const AdminUsersPage = lazy(() =>
  import('@/features/admin/pages/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })),
);
const AdminReviewModerationPage = lazy(() =>
  import('@/features/admin/pages/AdminReviewModerationPage').then((m) => ({ default: m.AdminReviewModerationPage })),
);
const AdminHospitalsPage = lazy(() =>
  import('@/features/admin/pages/AdminHospitalsPage').then((m) => ({ default: m.AdminHospitalsPage })),
);
const AdminHospitalDetailPage = lazy(() =>
  import('@/features/admin/pages/AdminHospitalDetailPage').then((m) => ({ default: m.AdminHospitalDetailPage })),
);
const AdminPlansPage = lazy(() =>
  import('@/features/admin/pages/AdminPlansPage').then((m) => ({ default: m.AdminPlansPage })),
);
const AdminAuditLogsPage = lazy(() =>
  import('@/features/admin/pages/AdminAuditLogsPage').then((m) => ({ default: m.AdminAuditLogsPage })),
);
const HospitalSubscriptionPage = lazy(() =>
  import('@/features/hospital/pages/HospitalSubscriptionPage').then((m) => ({ default: m.HospitalSubscriptionPage })),
);
const DoctorOpdPage = lazy(() =>
  import('@/features/doctor/pages/DoctorOpdPage').then((m) => ({ default: m.DoctorOpdPage })),
);
const DoctorIpdPage = lazy(() =>
  import('@/features/doctor/pages/DoctorIpdPage').then((m) => ({ default: m.DoctorIpdPage })),
);
const DoctorIpdAdmissionPage = lazy(() =>
  import('@/features/doctor/pages/DoctorIpdAdmissionPage').then((m) => ({ default: m.DoctorIpdAdmissionPage })),
);
const DoctorEncounterDetailPage = lazy(() =>
  import('@/features/doctor/pages/DoctorEncounterDetailPage').then((m) => ({ default: m.DoctorEncounterDetailPage })),
);
const PatientEncountersPage = lazy(() =>
  import('@/features/patient/pages/PatientEncountersPage').then((m) => ({ default: m.PatientEncountersPage })),
);
const PatientEncounterDetailPage = lazy(() =>
  import('@/features/patient/pages/PatientEncounterDetailPage').then((m) => ({ default: m.PatientEncounterDetailPage })),
);

function PageLoader() {
  return <LogoLoader label="Loading page" size={72} />;
}

function LazyPage({ children }: PropsWithChildren) {
  return <Suspense fallback={<PageLoader />}>{children}</Suspense>;
}

/** Legacy profile section routes redirect to accordion anchors on the single profile page. */
const profileSectionRedirects = [
  { from: 'profile/basic-info', hash: 'basic-info' },
  { from: 'profile/basic', hash: 'basic-info' },
  { from: 'profile/contact-info', hash: 'contact-info' },
  { from: 'profile/contact', hash: 'contact-info' },
  { from: 'profile/measurements', hash: 'measurements' },
  { from: 'profile/medical', hash: 'medical' },
  { from: 'profile/lifestyle', hash: 'lifestyle' },
  { from: 'profile/emergency-contacts', hash: 'emergency-contacts' },
  { from: 'profile/emergency', hash: 'emergency-contacts' },
  { from: 'profile/family-members', hash: 'family-members' },
  { from: 'profile/health-goals', hash: 'health-goals' },
] as const;

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/brand" element={<BrandIdentityPage />} />
        <Route path="/login" element={<GuestOnlyRoute><LoginPage /></GuestOnlyRoute>} />
        <Route path="/register" element={<GuestOnlyRoute><RegisterPage /></GuestOnlyRoute>} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/complete-patient-account" element={<CompletePatientAccountPage />} />
        <Route path="/doctors/:doctorId" element={<LazyPage><PublicDoctorProfilePage /></LazyPage>} />
        <Route path="/hospitals/:hospitalId" element={<LazyPage><PublicHospitalProfilePage /></LazyPage>} />
        <Route
          path="/settings/account"
          element={
            <ProtectedRoute>
              <AccountSettingsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings/notifications"
          element={
            <ProtectedRoute>
              <NotificationPreferencesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient/consent"
          element={
            <ProtectedRoute>
              <ConsentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/patient"
          element={
            <ProtectedRoute>
              <PatientPortalLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route
            path="dashboard"
            element={
              <LazyPage>
                <DashboardPage />
              </LazyPage>
            }
          />
          <Route
            path="profile"
            element={
              <LazyPage>
                <ProfileHubPage />
              </LazyPage>
            }
          />
          {profileSectionRedirects.map(({ from, hash }) => (
            <Route
              key={from}
              path={from}
              element={<Navigate to={`/patient/profile#${hash}`} replace />}
            />
          ))}
          <Route
            path="vitals"
            element={
              <LazyPage>
                <VitalsPage />
              </LazyPage>
            }
          />
          <Route
            path="health-score"
            element={
              <LazyPage>
                <HealthScorePage />
              </LazyPage>
            }
          />
          <Route
            path="dashboard/metrics/:metricType"
            element={
              <LazyPage>
                <MetricDetailPage />
              </LazyPage>
            }
          />
          <Route path="search" element={<LazyPage><UnifiedSearchPage /></LazyPage>} />
          <Route path="request-opd" element={<LazyPage><RequestOpdPage /></LazyPage>} />
          <Route path="book" element={<Navigate to="/patient/request-opd" replace />} />
          <Route path="hospitals" element={<LazyPage><HospitalSearchPage /></LazyPage>} />
          <Route path="doctors/:doctorId" element={<LazyPage><DoctorBookingProfilePage /></LazyPage>} />
          <Route path="book/:doctorId" element={<Navigate to="/patient/request-opd" replace />} />
          <Route path="reports" element={<LazyPage><HealthDocumentsPage /></LazyPage>} />
          <Route path="lab-values" element={<LazyPage><LabValuesPage /></LazyPage>} />
          <Route path="timeline" element={<LazyPage><HealthTimelinePage /></LazyPage>} />
          <Route path="prescriptions" element={<LazyPage><PatientPrescriptionsPage /></LazyPage>} />
          <Route path="opd" element={<LazyPage><PatientOpdStatusPage /></LazyPage>} />
          <Route path="payments" element={<LazyPage><PatientPaymentsPage /></LazyPage>} />
          <Route path="settings/account" element={<LazyPage><AccountSettingsPage /></LazyPage>} />
          <Route path="settings/notifications" element={<LazyPage><NotificationPreferencesPage /></LazyPage>} />
          <Route path="appointments" element={<Navigate to="/patient/opd" replace />} />
          <Route path="appointments/:appointmentId" element={<Navigate to="/patient/opd" replace />} />
          <Route path="encounters" element={<LazyPage><PatientEncountersPage /></LazyPage>} />
          <Route path="encounters/:encounterId" element={<LazyPage><PatientEncounterDetailPage /></LazyPage>} />
        </Route>
        <Route
          path="/doctor"
          element={
            <ProtectedRoute>
              <RoleRoute role="DOCTOR">
                <DoctorPortalLayout />
              </RoleRoute>
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<LazyPage><DoctorDashboardPage /></LazyPage>} />
          <Route path="profile" element={<LazyPage><DoctorProfilePage /></LazyPage>} />
          <Route
            path="verification"
            element={
              <LazyPage>
                <DoctorVerificationPage />
              </LazyPage>
            }
          />
          <Route
            path="hospitals"
            element={
              <LazyPage>
                <DoctorHospitalAssociationsPage />
              </LazyPage>
            }
          />
          <Route
            path="schedule"
            element={
              <LazyPage>
                <DoctorSchedulePage />
              </LazyPage>
            }
          />
          <Route
            path="appointments"
            element={<Navigate to="/doctor/opd" replace />}
          />
          <Route path="appointments/:appointmentId" element={<Navigate to="/doctor/opd" replace />} />
          <Route path="opd" element={<LazyPage><DoctorOpdPage /></LazyPage>} />
          <Route path="ipd" element={<LazyPage><DoctorIpdPage /></LazyPage>} />
          <Route path="ipd/admissions/:admissionId" element={<LazyPage><DoctorIpdAdmissionPage /></LazyPage>} />
          <Route path="encounters/:encounterId" element={<LazyPage><DoctorEncounterDetailPage /></LazyPage>} />
          <Route path="settings/account" element={<LazyPage><AccountSettingsPage /></LazyPage>} />
          <Route path="settings/notifications" element={<LazyPage><NotificationPreferencesPage /></LazyPage>} />
        </Route>
        <Route path="/hospital" element={<ProtectedRoute><RoleRoute role="HOSPITAL_ADMIN"><HospitalPortalLayout /></RoleRoute></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<LazyPage><HospitalDashboardPage /></LazyPage>} />
          <Route path="profile" element={<LazyPage><HospitalProfilePage /></LazyPage>} />
          <Route path="branches" element={<LazyPage><HospitalBranchesPage /></LazyPage>} />
          <Route path="departments" element={<LazyPage><HospitalDepartmentsPage /></LazyPage>} />
          <Route path="emergency" element={<LazyPage><HospitalEmergencyPage /></LazyPage>} />
          <Route path="doctors" element={<LazyPage><HospitalDoctorRosterPage /></LazyPage>} />
          <Route path="staff" element={<LazyPage><HospitalStaffPage /></LazyPage>} />
          <Route path="opd" element={<LazyPage><HospitalOpdPage /></LazyPage>} />
          <Route path="catalogs" element={<LazyPage><HospitalClinicalCatalogsPage /></LazyPage>} />
          <Route path="billing/invoices" element={<LazyPage><HospitalInvoicesPage /></LazyPage>} />
          <Route path="billing/invoices/:invoiceId" element={<LazyPage><HospitalInvoiceDetailPage /></LazyPage>} />
          <Route path="billing/checkout/:encounterId" element={<LazyPage><ReceptionCheckoutPage /></LazyPage>} />
          <Route path="ipd" element={<LazyPage><HospitalIpdPage /></LazyPage>} />
          <Route path="icu" element={<LazyPage><HospitalIcuPage /></LazyPage>} />
          <Route path="lab" element={<LazyPage><LabDashboardPage /></LazyPage>} />
          <Route path="lab/dashboard" element={<LazyPage><LabDashboardPage /></LazyPage>} />
          <Route path="radiology" element={<LazyPage><RadiologyDashboardPage /></LazyPage>} />
          <Route path="radiology/dashboard" element={<LazyPage><RadiologyDashboardPage /></LazyPage>} />
          <Route path="ot" element={<LazyPage><OtDashboardPage /></LazyPage>} />
          <Route path="ot/dashboard" element={<LazyPage><OtDashboardPage /></LazyPage>} />
          <Route path="pharmacy" element={<LazyPage><PharmacyDashboardPage /></LazyPage>} />
          <Route path="pharmacy/dashboard" element={<LazyPage><PharmacyDashboardPage /></LazyPage>} />
          <Route path="subscription" element={<LazyPage><HospitalSubscriptionPage /></LazyPage>} />
          <Route path="facilities" element={<LazyPage><HospitalFacilitiesPage /></LazyPage>} />
          <Route path="gallery" element={<LazyPage><HospitalGalleryPage /></LazyPage>} />
          <Route path="settings/account" element={<LazyPage><AccountSettingsPage /></LazyPage>} />
          <Route path="settings/notifications" element={<LazyPage><NotificationPreferencesPage /></LazyPage>} />
        </Route>
        <Route path="/admin" element={<ProtectedRoute><RoleRoute role="PLATFORM_ADMIN"><AdminPortalLayout /></RoleRoute></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<LazyPage><AdminDashboardPage /></LazyPage>} />
          <Route path="verifications" element={<LazyPage><AdminVerificationQueuePage /></LazyPage>} />
          <Route path="verifications/:doctorId" element={<LazyPage><AdminVerificationReviewPage /></LazyPage>} />
          <Route path="users" element={<LazyPage><AdminUsersPage /></LazyPage>} />
          <Route path="hospitals" element={<LazyPage><AdminHospitalsPage /></LazyPage>} />
          <Route path="hospitals/:hospitalId" element={<LazyPage><AdminHospitalDetailPage /></LazyPage>} />
          <Route path="plans" element={<LazyPage><AdminPlansPage /></LazyPage>} />
          <Route path="audit-logs" element={<LazyPage><AdminAuditLogsPage /></LazyPage>} />
          <Route path="reviews" element={<LazyPage><AdminReviewModerationPage /></LazyPage>} />
          <Route path="settings/account" element={<LazyPage><AccountSettingsPage /></LazyPage>} />
          <Route path="settings/notifications" element={<LazyPage><NotificationPreferencesPage /></LazyPage>} />
        </Route>
        <Route path="/lab" element={<ProtectedRoute><RoleRoute role="LAB_TECHNICIAN"><LabPortalLayout /></RoleRoute></ProtectedRoute>}>
          <Route index element={<Navigate to="worklist" replace />} />
          <Route path="dashboard" element={<LazyPage><LabDashboardPage /></LazyPage>} />
          <Route path="worklist" element={<LazyPage><LabWorklistPage /></LazyPage>} />
          <Route path="orders/:labOrderId" element={<LazyPage><LabOrderDetailPage /></LazyPage>} />
          <Route path="catalog" element={<LazyPage><LabCatalogPage /></LazyPage>} />
          <Route path="settings/account" element={<LazyPage><AccountSettingsPage /></LazyPage>} />
        </Route>
        <Route path="/radiology" element={<ProtectedRoute><RoleRoute role="RADIOLOGY_TECHNICIAN"><RadiologyPortalLayout /></RoleRoute></ProtectedRoute>}>
          <Route index element={<Navigate to="worklist" replace />} />
          <Route path="dashboard" element={<LazyPage><RadiologyDashboardPage /></LazyPage>} />
          <Route path="worklist" element={<LazyPage><RadiologyWorklistPage /></LazyPage>} />
          <Route path="orders/:imagingOrderId" element={<LazyPage><ImagingOrderDetailPage /></LazyPage>} />
          <Route path="catalog" element={<LazyPage><RadiologyCatalogPage /></LazyPage>} />
          <Route path="settings/account" element={<LazyPage><AccountSettingsPage /></LazyPage>} />
        </Route>
        <Route path="/ot" element={<ProtectedRoute><RoleRoute role="OT_COORDINATOR"><OtPortalLayout /></RoleRoute></ProtectedRoute>}>
          <Route index element={<Navigate to="worklist" replace />} />
          <Route path="dashboard" element={<LazyPage><OtDashboardPage /></LazyPage>} />
          <Route path="worklist" element={<LazyPage><OtWorklistPage /></LazyPage>} />
          <Route path="procedures/:procedureId" element={<LazyPage><OtProcedureDetailPage /></LazyPage>} />
          <Route path="catalog" element={<LazyPage><OtCatalogPage /></LazyPage>} />
          <Route path="settings/account" element={<LazyPage><AccountSettingsPage /></LazyPage>} />
        </Route>
        <Route path="/pharmacy" element={<ProtectedRoute><RoleRoute role="PHARMACIST"><PharmacyPortalLayout /></RoleRoute></ProtectedRoute>}>
          <Route index element={<Navigate to="worklist" replace />} />
          <Route path="dashboard" element={<LazyPage><PharmacyDashboardPage /></LazyPage>} />
          <Route path="worklist" element={<LazyPage><PharmacyWorklistPage /></LazyPage>} />
          <Route path="orders/:medicationOrderId" element={<LazyPage><MedicationOrderDetailPage /></LazyPage>} />
          <Route path="requests" element={<LazyPage><PharmacyRequestsPage /></LazyPage>} />
          <Route path="catalog" element={<LazyPage><PharmacyCatalogPage /></LazyPage>} />
          <Route path="settings/account" element={<LazyPage><AccountSettingsPage /></LazyPage>} />
        </Route>
        <Route path="/reception" element={<ProtectedRoute><RoleRoute role="RECEPTIONIST"><ReceptionPortalLayout /></RoleRoute></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<LazyPage><ReceptionDashboardPage /></LazyPage>} />
          <Route path="checkout/:encounterId" element={<LazyPage><ReceptionCheckoutPage /></LazyPage>} />
          <Route path="patients/search" element={<LazyPage><PatientSearchPage /></LazyPage>} />
          <Route path="patients/new" element={<LazyPage><PatientRegisterPage /></LazyPage>} />
          <Route path="patients/:patientId/receipt" element={<LazyPage><PatientReceiptPage /></LazyPage>} />
          <Route path="patients/:patientId" element={<LazyPage><PatientDetailPage /></LazyPage>} />
          <Route path="settings/account" element={<LazyPage><AccountSettingsPage /></LazyPage>} />
        </Route>
        <Route path="/nursing" element={<ProtectedRoute><RoleRoute role="NURSE"><NursingPortalLayout /></RoleRoute></ProtectedRoute>}>
          <Route index element={<Navigate to="ward" replace />} />
          <Route path="ward" element={<LazyPage><NursingWardBoardPage /></LazyPage>} />
          <Route path="admissions/:admissionId" element={<LazyPage><NursingAdmissionPage /></LazyPage>} />
          <Route path="mar" element={<LazyPage><NursingMarPage /></LazyPage>} />
          <Route path="mar/:medicationOrderId" element={<LazyPage><NursingMarOrderPage /></LazyPage>} />
          <Route path="dashboard" element={<LazyPage><NursingDashboardPage /></LazyPage>} />
          <Route path="settings/account" element={<LazyPage><AccountSettingsPage /></LazyPage>} />
        </Route>
        <Route path="/icu-nurse" element={<ProtectedRoute><RoleRoute role="ICU_NURSE"><IcuNursePortalLayout /></RoleRoute></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<LazyPage><IcuNurseDashboardPage /></LazyPage>} />
          <Route path="stays/:stayId" element={<LazyPage><IcuNurseStayPage /></LazyPage>} />
          <Route path="settings/account" element={<LazyPage><AccountSettingsPage /></LazyPage>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
