import { IpdPatientChart } from '@/features/ipd/components/IpdPatientChart';

export function HospitalIpdAdmissionPage() {
  return (
    <IpdPatientChart
      portal="hospital"
      backTo="/hospital/ipd"
      backLabel="Back to IPD ops"
      title="IPD patient chart"
      subtitle="Admission overview, billing, and discharge for this inpatient stay"
    />
  );
}
