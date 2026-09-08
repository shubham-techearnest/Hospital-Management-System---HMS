import { IpdPatientChart } from '@/features/ipd/components/IpdPatientChart';

export function DoctorIpdAdmissionPage() {
  return (
    <IpdPatientChart
      portal="doctor"
      backTo="/doctor/ipd"
      backLabel="Back to IPD list"
      title="IPD patient chart"
      subtitle="One chart for this admission — clinical notes, vitals, orders, and rounds"
    />
  );
}
