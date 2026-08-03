import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import type { PropsWithChildren } from 'react';

interface RoleRouteProps extends PropsWithChildren {
  role: string;
  fallback?: string;
}

export function RoleRoute({ children, role, fallback = '/' }: RoleRouteProps) {
  const user = useSelector((state: RootState) => state.auth.user);

  if (user && !user.roles.includes(role)) {
    return <Navigate to={fallback} replace />;
  }

  return children;
}
