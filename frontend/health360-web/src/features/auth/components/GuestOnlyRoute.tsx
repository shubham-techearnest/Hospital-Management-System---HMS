import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import type { PropsWithChildren } from 'react';
import { getRoleDashboardPathFromRoles } from '@/shared/auth/roleNavigation';

/** Redirect authenticated users away from login/register pages. */
export function GuestOnlyRoute({ children }: PropsWithChildren) {
  const accessToken = useSelector((state: RootState) => state.auth.accessToken);
  const user = useSelector((state: RootState) => state.auth.user);
  const storedToken = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  if (accessToken || storedToken) {
    return <Navigate to={getRoleDashboardPathFromRoles(user?.roles)} replace />;
  }

  return children;
}
