import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { AnimatedPage } from '@/features/patient/components/AnimatedPage';
import { DoctorProfileView } from '@/features/public/components/DoctorProfileView';
import { fetchPublicDoctorProfile } from '@/features/public/api/publicProfileApi';
import { brand } from '@/shared/brand/brand';

/** Patient-portal doctor profile — stays inside the portal shell (sidebar preserved). */
export function DoctorBookingProfilePage() {
  const { doctorId = '' } = useParams<{ doctorId: string }>();

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
    <AnimatedPage>
      <DoctorProfileView doctorId={doctorId} variant="portal" canBook />
    </AnimatedPage>
  );
}
