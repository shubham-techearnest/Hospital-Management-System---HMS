import { Navigate, useParams } from 'react-router-dom';

/** Legacy patient-portal doctor profile URL redirects to the public profile page. */
export function DoctorBookingProfilePage() {
  const { doctorId = '' } = useParams<{ doctorId: string }>();
  return <Navigate to={`/doctors/${doctorId}`} replace />;
}
