import { lazy, Suspense, type PropsWithChildren } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { Box, CircularProgress } from '@mui/material';
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
import { PatientPortalLayout } from '@/features/patient/layout/PatientPortalLayout';
import { DoctorPortalLayout } from '@/features/doctor/layout/DoctorPortalLayout';
import { AdminPortalLayout } from '@/features/admin/layout/AdminPortalLayout';
import { HospitalPortalLayout } from '@/features/hospital/layout/HospitalPortalLayout';
import { LabPortalLayout } from '@/features/lab/layout/LabPortalLayout';
import { PharmacyPortalLayout } from '@/features/pharmacy/layout/PharmacyPortalLayout';
import { PlaceholderPage } from '@/shared/pages/PlaceholderPage';

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
const BookAppointmentPage = lazy(() =>
  import('@/features/patient/pages/BookAppointmentPage').then((m) => ({ default: m.BookAppointmentPage })),
);
const DoctorSearchPage = lazy(() =>
  import('@/features/patient/pages/DoctorSearchPage').then((m) => ({ default: m.DoctorSearchPage })),
);
const UnifiedSearchPage = lazy(() =>
  import('@/features/patient/pages/UnifiedSearchPage').then((m) => ({ default: m.UnifiedSearchPage })),
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
const HospitalDashboardPage = lazy(() =>
  import('@/features/hospital/pages/HospitalDashboardPage').then((m) => ({ default: m.HospitalDashboardPage })),
);
const AdminDashboardPage = lazy(() =>
  import('@/features/admin/pages/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })),
);
const LabDashboardPage = lazy(() =>
  import('@/features/lab/pages/LabDashboardPage').then((m) => ({ default: m.LabDashboardPage })),
);
const PharmacyDashboardPage = lazy(() =>
  import('@/features/pharmacy/pages/PharmacyDashboardPage').then((m) => ({ default: m.PharmacyDashboardPage })),
);
const PatientAppointmentsPage = lazy(() =>
  import('@/features/patient/pages/PatientAppointmentsPage').then((m) => ({ default: m.PatientAppointmentsPage })),
);
const PatientAppointmentDetailPage = lazy(() =>
  import('@/features/patient/pages/PatientAppointmentDetailPage').then((m) => ({ default: m.PatientAppointmentDetailPage })),
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
const DoctorAppointmentsPage = lazy(() =>
  import('@/features/doctor/pages/DoctorAppointmentsPage').then((m) => ({ default: m.DoctorAppointmentsPage })),
);
const DoctorAppointmentDetailPage = lazy(() =>
  import('@/features/doctor/pages/DoctorAppointmentDetailPage').then((m) => ({ default: m.DoctorAppointmentDetailPage })),
);

function PageLoader() {
  return (
    <Box display="flex" justifyContent="center" py={8}>
      <CircularProgress aria-label="Loading page" />
    </Box>
  );
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
        <Route path="/login" element={<GuestOnlyRoute><LoginPage /></GuestOnlyRoute>} />
        <Route path="/register" element={<GuestOnlyRoute><RegisterPage /></GuestOnlyRoute>} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
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
          <Route path="book" element={<LazyPage><DoctorSearchPage /></LazyPage>} />
          <Route path="hospitals" element={<LazyPage><HospitalSearchPage /></LazyPage>} />
          <Route path="doctors/:doctorId" element={<LazyPage><DoctorBookingProfilePage /></LazyPage>} />
          <Route path="book/:doctorId" element={<LazyPage><BookAppointmentPage /></LazyPage>} />
          <Route path="reports" element={<LazyPage><HealthDocumentsPage /></LazyPage>} />
          <Route path="lab-values" element={<LazyPage><LabValuesPage /></LazyPage>} />
          <Route path="timeline" element={<LazyPage><HealthTimelinePage /></LazyPage>} />
          <Route path="prescriptions" element={<LazyPage><PlaceholderPage title="Prescriptions" /></LazyPage>} />
          <Route path="payments" element={<LazyPage><PlaceholderPage title="Payments" /></LazyPage>} />
          <Route path="settings/account" element={<LazyPage><AccountSettingsPage /></LazyPage>} />
          <Route path="settings/notifications" element={<LazyPage><NotificationPreferencesPage /></LazyPage>} />
          <Route
            path="appointments"
            element={
              <LazyPage>
                <PatientAppointmentsPage />
              </LazyPage>
            }
          />
          <Route
            path="appointments/:appointmentId"
            element={
              <LazyPage>
                <PatientAppointmentDetailPage />
              </LazyPage>
            }
          />
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
            element={
              <LazyPage>
                <DoctorAppointmentsPage />
              </LazyPage>
            }
          />
          <Route path="appointments/:appointmentId" element={<LazyPage><DoctorAppointmentDetailPage /></LazyPage>} />
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
          <Route path="reviews" element={<LazyPage><AdminReviewModerationPage /></LazyPage>} />
          <Route path="settings/account" element={<LazyPage><AccountSettingsPage /></LazyPage>} />
          <Route path="settings/notifications" element={<LazyPage><NotificationPreferencesPage /></LazyPage>} />
        </Route>
        <Route path="/lab" element={<ProtectedRoute><RoleRoute role="LAB_TECHNICIAN"><LabPortalLayout /></RoleRoute></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<LazyPage><LabDashboardPage /></LazyPage>} />
          <Route path="settings/account" element={<LazyPage><AccountSettingsPage /></LazyPage>} />
        </Route>
        <Route path="/pharmacy" element={<ProtectedRoute><RoleRoute role="PHARMACIST"><PharmacyPortalLayout /></RoleRoute></ProtectedRoute>}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<LazyPage><PharmacyDashboardPage /></LazyPage>} />
          <Route path="settings/account" element={<LazyPage><AccountSettingsPage /></LazyPage>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
