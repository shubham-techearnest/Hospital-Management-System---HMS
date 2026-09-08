import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import type { RootState } from '@/app/store';
import { fetchPublicDoctorProfile } from '@/features/public/api/publicProfileApi';
import { DoctorProfileView } from '@/features/public/components/DoctorProfileView';
import { PublicProfileLayout } from '@/features/public/components/PublicProfileLayout';
import { brand } from '@/shared/brand/brand';

export function PublicDoctorProfilePage() {
  const { doctorId = '' } = useParams<{ doctorId: string }>();
  const user = useSelector((state: RootState) => state.auth.user);

  const { data: profile } = useQuery({
    queryKey: ['public', 'doctor', doctorId],
    queryFn: () => fetchPublicDoctorProfile(doctorId),
    enabled: Boolean(doctorId),
  });

  useEffect(() => {
    if (profile?.name) {
      document.title = `${profile.name} — ${brand.name}`;
    }
    return () => {
      document.title = brand.name;
    };
  }, [profile?.name]);

  return (
    <PublicProfileLayout>
      <DoctorProfileView doctorId={doctorId} variant="public" canBook={Boolean(user)} />
    </PublicProfileLayout>
  );
}
