import type { NavigatorScreenParams } from '@react-navigation/native';
import type { ProfileSectionId } from '@/features/patient/utils/patientUtils';

export type { ProfileSectionId };

export type AuthStackParamList = {
  Welcome: undefined;
  Login: { message?: string } | undefined;
  Register: undefined;
  ForgotPassword: undefined;
  ResetPassword: { token?: string } | undefined;
  VerifyEmail: { token?: string };
  CompletePatientAccount: { token?: string } | undefined;
};

export type SettingsStackParamList = {
  SettingsHome: undefined;
  AccountSettings: { focusPassword?: boolean } | undefined;
  NotificationPreferences: undefined;
  NotificationsInbox: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Vitals: undefined;
  HealthAnalytics: undefined;
  MetricDetail: { metricType: string };
  LabValues: undefined;
  HealthDocuments: undefined;
  HealthTimeline: undefined;
  EncountersList: undefined;
  EncounterDetail: { encounterId: string };
  RequestOpd: { hospitalId?: string; branchId?: string; doctorId?: string } | undefined;
  OpdStatus: undefined;
  Prescriptions: undefined;
  Payments: undefined;
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
  RequestOpd: { hospitalId?: string; branchId?: string; doctorId?: string } | undefined;
  EncountersList: undefined;
  EncounterDetail: { encounterId: string };
  Prescriptions: undefined;
  Payments: undefined;
  HealthTimeline: undefined;
  LabValues: undefined;
  AppointmentDetail: { appointmentId: string };
};

export type PatientTabParamList = {
  Dashboard: NavigatorScreenParams<HomeStackParamList> | undefined;
  Doctors: NavigatorScreenParams<CareStackParamList>;
  Appointments: NavigatorScreenParams<AppointmentsStackParamList>;
  Profile: { focusSection?: ProfileSectionId } | undefined;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};

export type DoctorAppointmentsStackParamList = {
  DoctorAppointmentsList: undefined;
  DoctorAppointmentDetail: { appointmentId: string };
  DoctorOpdQueue: undefined;
  DoctorEncounterDetail: { encounterId: string };
};

export type ReceptionPatientsStackParamList = {
  PatientSearch: undefined;
  PatientRegister: undefined;
  PatientDetail: { patientId: string };
  PatientReceipt: { patientId: string };
  WalkIn: { patientId?: string } | undefined;
  Checkout: { encounterId: string };
};

export type ReceptionTabParamList = {
  OpdQueue: undefined;
  Patients: NavigatorScreenParams<ReceptionPatientsStackParamList>;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
};

export type StaffRoleTabParamList = {
  Worklist: undefined;
  Settings: NavigatorScreenParams<SettingsStackParamList>;
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
  Staff: undefined;
  Departments: undefined;
  Emergency: undefined;
  Doctors: undefined;
  Facilities: undefined;
  Gallery: undefined;
  Subscription: undefined;
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
  HospitalsList: undefined;
  HospitalDetail: { hospitalId: string };
  Plans: undefined;
  AuditLogs: undefined;
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
