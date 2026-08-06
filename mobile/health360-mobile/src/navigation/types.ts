import type { NavigatorScreenParams } from '@react-navigation/native';
import type { ProfileSectionId } from '@/features/patient/utils/patientUtils';

export type { ProfileSectionId };

export type AuthStackParamList = {
  Welcome: undefined;
  Login: { message?: string } | undefined;
  Register: undefined;
  VerifyEmail: { token?: string };
};

export type SettingsStackParamList = {
  AccountSettings: { focusPassword?: boolean } | undefined;
  NotificationPreferences: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Vitals: undefined;
  HealthAnalytics: undefined;
  MetricDetail: { metricType: string };
  LabValues: undefined;
  HealthDocuments: undefined;
  HealthTimeline: undefined;
};

export type CareStackParamList = {
  UnifiedSearch: undefined;
  DoctorSearch: undefined;
  HospitalSearch: undefined;
  PublicDoctorProfile: { doctorId: string };
  PublicHospitalProfile: { hospitalId: string };
  BookAppointment: { doctorId: string };
  AppointmentsList: undefined;
  AppointmentDetail: { appointmentId: string };
};

export type AppointmentsStackParamList = {
  AppointmentsList: undefined;
  AppointmentDetail: { appointmentId: string };
};

export type PatientTabParamList = {
  Dashboard: undefined;
  Doctors: NavigatorScreenParams<CareStackParamList>;
  Appointments: NavigatorScreenParams<AppointmentsStackParamList>;
  Profile: { focusSection?: ProfileSectionId } | undefined;
  Settings: undefined;
};

export type DoctorAppointmentsStackParamList = {
  DoctorAppointmentsList: undefined;
  DoctorAppointmentDetail: { appointmentId: string };
};

export type DoctorTabParamList = {
  Overview: undefined;
  Profile: undefined;
  Verification: undefined;
  Hospitals: undefined;
  Schedule: undefined;
  Appointments: NavigatorScreenParams<DoctorAppointmentsStackParamList>;
  Settings: undefined;
};

export type HospitalTabParamList = {
  Overview: undefined;
  Profile: undefined;
  Branches: undefined;
  Manage: NavigatorScreenParams<HospitalManageStackParamList>;
  Settings: undefined;
};

export type HospitalManageStackParamList = {
  ManageHub: undefined;
  Departments: undefined;
  Emergency: undefined;
  Doctors: undefined;
  Facilities: undefined;
  Gallery: undefined;
};

export type AdminTabParamList = {
  Overview: undefined;
  Users: undefined;
  Settings: undefined;
};

export type AdminStackParamList = {
  AdminTabs: undefined;
  VerificationQueue: undefined;
  VerificationReview: { doctorId: string };
  ReviewModeration: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
