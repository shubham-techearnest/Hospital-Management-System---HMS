import { getPrimaryRole, RoleGuard } from '@/features/auth/components/RoleGuard';
import { useAuth } from '@/features/auth/context/AuthContext';
import { UnauthorizedScreen } from '@/features/auth/screens/UnauthorizedScreen';
import {
  isStaffWorklistRole,
  resolveAppShellKind,
  type StaffWorklistRole,
} from '@/features/auth/utils/appShell';
import { AdminStackNavigator } from './AdminStackNavigator';
import { DoctorTabNavigator } from './DoctorTabNavigator';
import { HospitalTabNavigator } from './HospitalTabNavigator';
import { PatientAppNavigator } from './PatientAppNavigator';
import { ReceptionTabNavigator } from './ReceptionTabNavigator';
import { StaffRoleTabNavigator } from './StaffRoleTabNavigator';

export function AppShellNavigator() {
  const { user } = useAuth();
  const primaryRole = getPrimaryRole(user);
  const shell = resolveAppShellKind(primaryRole);

  if (shell === 'PLATFORM_ADMIN') {
    return (
      <RoleGuard role="PLATFORM_ADMIN">
        <AdminStackNavigator />
      </RoleGuard>
    );
  }

  if (shell === 'DOCTOR') {
    return (
      <RoleGuard role="DOCTOR">
        <DoctorTabNavigator />
      </RoleGuard>
    );
  }

  if (shell === 'RECEPTIONIST') {
    return (
      <RoleGuard role="RECEPTIONIST">
        <ReceptionTabNavigator />
      </RoleGuard>
    );
  }

  if (shell === 'HOSPITAL_ADMIN') {
    return (
      <RoleGuard role="HOSPITAL_ADMIN">
        <HospitalTabNavigator />
      </RoleGuard>
    );
  }

  if (shell === 'STAFF_WORKLIST' && isStaffWorklistRole(primaryRole)) {
    return (
      <RoleGuard role={primaryRole}>
        <StaffRoleTabNavigator role={primaryRole as StaffWorklistRole} />
      </RoleGuard>
    );
  }

  if (shell === 'PATIENT') {
    return (
      <RoleGuard role="PATIENT">
        <PatientAppNavigator />
      </RoleGuard>
    );
  }

  return <UnauthorizedScreen />;
}
