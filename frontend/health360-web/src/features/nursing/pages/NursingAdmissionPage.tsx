import { IpdPatientChart } from '@/features/ipd/components/IpdPatientChart';

export function NursingAdmissionPage() {
  return (
    <IpdPatientChart
      portal="nurse"
      backTo="/nursing/ward"
      backLabel="Back to ward board"
      title="IPD nursing chart"
      subtitle="Vitals, nursing rounds, assessments, MAR — same admission as doctor/hospital"
    />
  );
}
