import { useAuth } from '@/features/auth/context/AuthContext';

/** Returns false when the user is not signed in — use to gate protected API queries. */
export function useAuthenticatedQueryEnabled(enabled = true) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated && enabled;
}
