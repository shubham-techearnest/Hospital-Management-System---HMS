import { IpdPatientChart } from '@/features/ipd/components/IpdPatientChart';

export function HospitalIpdAdmissionPage() {
  return (
    <IpdPatientChart
      portal="hospital"
      backTo="/hospital/ipd"
      backLabel="Back to IPD patients"
      title="IPD patient chart"
      subtitle="Rounds, clinical notes, orders, billing, and discharge for this stay"
    />
  );
}
