import { getPrimaryRole, RoleGuard } from '@/features/auth/components/RoleGuard';
import { useAuth } from '@/features/auth/context/AuthContext';
import { UnauthorizedScreen } from '@/features/auth/screens/UnauthorizedScreen';
import { DoctorTabNavigator } from './DoctorTabNavigator';
import { HospitalTabNavigator } from './HospitalTabNavigator';
import { PatientAppNavigator } from './PatientAppNavigator';

export function AppShellNavigator() {
  const { user } = useAuth();
  const primaryRole = getPrimaryRole(user);

  if (primaryRole === 'DOCTOR') {
    return (
      <RoleGuard role="DOCTOR">
        <DoctorTabNavigator />
      </RoleGuard>
    );
  }

  if (primaryRole === 'HOSPITAL_ADMIN') {
    return (
      <RoleGuard role="HOSPITAL_ADMIN">
        <HospitalTabNavigator />
      </RoleGuard>
    );
  }

  if (primaryRole === 'PATIENT') {
    return (
      <RoleGuard role="PATIENT">
        <PatientAppNavigator />
      </RoleGuard>
    );
  }

  return <UnauthorizedScreen />;
}
