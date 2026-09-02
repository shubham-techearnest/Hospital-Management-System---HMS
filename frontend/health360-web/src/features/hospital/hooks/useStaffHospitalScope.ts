import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useMyStaffScope } from '@/features/hospital/hooks/useStaffQueries';
import { fetchPublicHospitalProfile } from '@/features/public/api/publicProfileApi';
import type { StaffScope } from '@/features/hospital/api/staffApi';
import type { OpdBranchOption } from '@/features/opd/components/OpdBranchScopeBar';

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

  const branches: OpdBranchOption[] = useMemo(
    () => (hospitalProfile?.branches ?? []).map((b) => ({
      id: b.id,
      name: b.name,
      primary: b.primary,
      city: b.city,
    })),
    [hospitalProfile],
  );

  useEffect(() => {
    if (!activeScope) return;
    if (!branchId || !branches.some((b) => b.id === branchId)) {
      const preferred = branches.find((b) => b.id === activeScope.branchId)
        ?? branches.find((b) => b.primary)
        ?? branches[0];
      if (preferred) setBranchId(preferred.id);
    }
  }, [activeScope, branches, branchId]);

  const effectiveBranchId = activeScope?.hospitalWide && !branchId
    ? (activeScope.branchId ?? branches[0]?.id ?? '')
    : branchId;

  const hospitalName = activeScope?.hospitalName ?? hospitalProfile?.name;

  return {
    scopes,
    activeScopeIndex,
    setActiveScopeIndex,
    activeScope,
    hospitalId,
    branchId: effectiveBranchId,
    setBranchId,
    branches,
    hospitalName,
    scopeReady: Boolean(hospitalId && effectiveBranchId),
    isLoading,
    isError,
    hasAssignment: scopes.length > 0,
  };
}
