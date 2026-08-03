import type { AuthUser } from '@/features/auth/api/authApi';
import type { UserProfile } from '@/features/settings/api/userApi';

export function mergeProfileIntoAuthUser(profile: UserProfile, existing: AuthUser): AuthUser {
  return {
    ...existing,
    email: profile.email,
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone,
    roles: profile.roles,
    permissions: profile.permissions,
    status: profile.status,
    emailVerified: profile.emailVerified,
    timezone: profile.timezone,
    locale: profile.locale,
  };
}
