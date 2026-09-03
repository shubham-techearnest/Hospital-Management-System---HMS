import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMyStaffScope } from '@/features/hospital/hooks/useStaffQueries';
import { fetchPublicHospitalProfile } from '@/features/public/api/publicProfileApi';
import type { StaffScope } from '@/features/hospital/api/staffApi';

export interface BranchOption {
  id: string;
  name: string;
  primary?: boolean;
  city?: string;
}

export function useStaffHospitalScope() {
  const { data: scopes = [], isLoading, isError } = useMyStaffScope();
  const [activeScopeIndex, setActiveScopeIndex] = useState(0);
  const [branchId, setBranchId] = useState('');

  const activeScope: StaffScope | undefined = scopes[activeScopeIndex];
  const hospitalId = activeScope?.hospitalId ?? '';

  const { data: hospitalProfile } = useQuery({
    queryKey: ['public-hospital-branches', hospitalId],
    queryFn: () => fetchPublicHospitalProfile(hospitalId),
    enabled: Boolean(hospitalId),
  });

  const branches: BranchOption[] = useMemo(
    () =>
      (hospitalProfile?.branches ?? []).map((branch) => ({
        id: branch.id,
        name: branch.name,
        primary: branch.primary,
        city: branch.city,
      })),
    [hospitalProfile],
  );

  useEffect(() => {
    if (!activeScope) return;
    if (!branchId || !branches.some((branch) => branch.id === branchId)) {
      const preferred =
        branches.find((branch) => branch.id === activeScope.branchId) ??
        branches.find((branch) => branch.primary) ??
        branches[0];
      if (preferred) setBranchId(preferred.id);
    }
  }, [activeScope, branches, branchId]);

  const effectiveBranchId =
    activeScope?.hospitalWide && !branchId
      ? (activeScope.branchId ?? branches[0]?.id ?? '')
      : branchId;

  return {
    scopes,
    activeScopeIndex,
    setActiveScopeIndex,
    activeScope,
    hospitalId,
    branchId: effectiveBranchId,
    setBranchId,
    branches,
    hospitalName: activeScope?.hospitalName ?? hospitalProfile?.name,
    scopeReady: Boolean(hospitalId && effectiveBranchId),
    isLoading,
    isError,
    hasAssignment: scopes.length > 0,
  };
}
