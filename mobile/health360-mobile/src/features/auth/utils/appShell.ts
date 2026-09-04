export const STAFF_WORKLIST_ROLES = [
  'LAB_TECHNICIAN',
  'RADIOLOGY_TECHNICIAN',
  'PHARMACIST',
  'OT_COORDINATOR',
  'NURSE',
  'ICU_NURSE',
] as const;

export type StaffWorklistRole = (typeof STAFF_WORKLIST_ROLES)[number];

export type AppShellKind =
  | 'PLATFORM_ADMIN'
  | 'HOSPITAL_ADMIN'
  | 'DOCTOR'
  | 'RECEPTIONIST'
  | 'STAFF_WORKLIST'
  | 'PATIENT'
  | 'UNAUTHORIZED';

export function isStaffWorklistRole(role: string | null | undefined): role is StaffWorklistRole {
  return Boolean(role && (STAFF_WORKLIST_ROLES as readonly string[]).includes(role));
}

/** Maps resolved primary role → which mobile shell mounts (not Unauthorized for staff). */
export function resolveAppShellKind(primaryRole: string | null): AppShellKind {
  if (primaryRole === 'PLATFORM_ADMIN') return 'PLATFORM_ADMIN';
  if (primaryRole === 'DOCTOR') return 'DOCTOR';
  if (primaryRole === 'RECEPTIONIST') return 'RECEPTIONIST';
  if (primaryRole === 'HOSPITAL_ADMIN') return 'HOSPITAL_ADMIN';
  if (isStaffWorklistRole(primaryRole)) return 'STAFF_WORKLIST';
  if (primaryRole === 'PATIENT') return 'PATIENT';
  return 'UNAUTHORIZED';
}

export const STAFF_WORKLIST_KIND_BY_ROLE: Record<StaffWorklistRole, string> = {
  LAB_TECHNICIAN: 'lab',
  RADIOLOGY_TECHNICIAN: 'radiology',
  PHARMACIST: 'pharmacy',
  OT_COORDINATOR: 'ot',
  NURSE: 'nursing',
  ICU_NURSE: 'icu',
};
