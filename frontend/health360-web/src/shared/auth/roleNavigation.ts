export type AppRole =
  | 'PATIENT'
  | 'DOCTOR'
  | 'HOSPITAL_ADMIN'
  | 'PLATFORM_ADMIN'
  | 'LAB_TECHNICIAN'
  | 'PHARMACIST';

const ROLE_PRIORITY: AppRole[] = [
  'PLATFORM_ADMIN',
  'HOSPITAL_ADMIN',
  'DOCTOR',
  'LAB_TECHNICIAN',
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
    case 'PHARMACIST':
      return '/pharmacy/dashboard';
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
    case 'PHARMACIST':
      return '/pharmacy/settings';
    default:
      return '/settings/account';
  }
}
