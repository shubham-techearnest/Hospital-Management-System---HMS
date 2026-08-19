export type AppRole =
  | 'PATIENT'
  | 'DOCTOR'
  | 'HOSPITAL_ADMIN'
  | 'PLATFORM_ADMIN'
  | 'RECEPTIONIST'
  | 'NURSE'
  | 'ICU_NURSE'
  | 'LAB_TECHNICIAN'
  | 'RADIOLOGY_TECHNICIAN'
  | 'OT_COORDINATOR'
  | 'PHARMACIST';

const ROLE_PRIORITY: AppRole[] = [
  'PLATFORM_ADMIN',
  'HOSPITAL_ADMIN',
  'DOCTOR',
  'ICU_NURSE',
  'NURSE',
  'RECEPTIONIST',
  'LAB_TECHNICIAN',
  'RADIOLOGY_TECHNICIAN',
  'OT_COORDINATOR',
  'PHARMACIST',
  'PATIENT',
];

export function resolvePrimaryRole(roles: string[] | undefined): AppRole | null {
  if (!roles?.length) {
    return null;
  }
  for (const role of ROLE_PRIORITY) {
    if (roles.includes(role)) {
      return role;
    }
  }
  return null;
}

export function getRoleDashboardPath(role: AppRole): string {
  switch (role) {
    case 'PATIENT':
      return '/patient/dashboard';
    case 'DOCTOR':
      return '/doctor/dashboard';
    case 'HOSPITAL_ADMIN':
      return '/hospital/dashboard';
    case 'PLATFORM_ADMIN':
      return '/admin/dashboard';
    case 'LAB_TECHNICIAN':
      return '/lab/dashboard';
    case 'RADIOLOGY_TECHNICIAN':
      return '/radiology/dashboard';
    case 'OT_COORDINATOR':
      return '/ot/dashboard';
    case 'PHARMACIST':
      return '/pharmacy/dashboard';
    case 'RECEPTIONIST':
      return '/reception/dashboard';
    case 'NURSE':
      return '/nursing/dashboard';
    case 'ICU_NURSE':
      return '/icu-nurse/dashboard';
    default:
      return '/login';
  }
}

export function getRoleDashboardPathFromRoles(roles: string[] | undefined): string {
  const role = resolvePrimaryRole(roles);
  return role ? getRoleDashboardPath(role) : '/login';
}

export function getRoleSettingsBasePath(role: AppRole): string {
  switch (role) {
    case 'PATIENT':
      return '/patient/settings';
    case 'DOCTOR':
      return '/doctor/settings';
    case 'HOSPITAL_ADMIN':
      return '/hospital/settings';
    case 'PLATFORM_ADMIN':
      return '/admin/settings';
    case 'LAB_TECHNICIAN':
      return '/lab/settings';
    case 'RADIOLOGY_TECHNICIAN':
      return '/radiology/settings';
    case 'OT_COORDINATOR':
      return '/ot/settings';
    case 'PHARMACIST':
      return '/pharmacy/settings';
    case 'RECEPTIONIST':
      return '/reception/settings';
    case 'NURSE':
      return '/nursing/settings';
    case 'ICU_NURSE':
      return '/icu-nurse/settings';
    default:
      return '/settings/account';
  }
}
