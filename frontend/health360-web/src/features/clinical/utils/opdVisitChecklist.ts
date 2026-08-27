import type { ClinicalNote, ClinicalOrder, Diagnosis, ClinicalVitalSign, Prescription } from '../api/clinicalApi';
import type { Invoice } from '@/features/billing/api/billingApi';

export type OpdChecklistStepId =
  | 'vitals'
  | 'consult'
  | 'diagnosis'
  | 'rx'
  | 'labs'
  | 'billing';

export type OpdChecklistStep = {
  id: OpdChecklistStepId;
  label: string;
  done: boolean;
  required: boolean;
  hint: string;
};

export type OpdVisitChecklistInput = {
  vitals: ClinicalVitalSign[];
  notes: ClinicalNote[];
  diagnoses: Diagnosis[];
  prescriptions: Prescription[];
  orders: ClinicalOrder[];
  invoice?: Invoice | null;
  invoiceForbidden?: boolean;
};

export function hasFinalConsultation(notes: ClinicalNote[]): boolean {
  return notes.some((note) => note.noteType === 'CONSULTATION' && note.status === 'FINAL');
}

export function hasSignedPrescription(prescriptions: Prescription[]): boolean {
  return prescriptions.some((p) => p.status === 'SIGNED');
}

export function checkoutBlockers(notes: ClinicalNote[], prescriptions: Prescription[]): string[] {
  const missing: string[] = [];
  if (!hasFinalConsultation(notes)) {
    missing.push('finalized consultation report');
  }
  if (!hasSignedPrescription(prescriptions)) {
    missing.push('signed e-prescription');
  }
  return missing;
}

export function canIssueCheckout(notes: ClinicalNote[], prescriptions: Prescription[]): boolean {
  return checkoutBlockers(notes, prescriptions).length === 0;
}

function consultHint(notes: ClinicalNote[]): string {
  if (hasFinalConsultation(notes)) return 'Finalized';
  if (notes.some((n) => n.noteType === 'CONSULTATION' && n.status === 'DRAFT')) {
    return 'Draft only — finalize to unlock checkout';
  }
  return 'Doctor must finalize consultation';
}

function rxHint(prescriptions: Prescription[]): string {
  if (hasSignedPrescription(prescriptions)) return 'Signed prescription on file';
  if (prescriptions.some((p) => p.status === 'DRAFT')) return 'Draft only — sign to unlock checkout';
  return 'Doctor must sign e-prescription';
}

function billingHint(invoice: Invoice | null | undefined, forbidden?: boolean): string {
  if (forbidden) return 'Collected at the desk';
  if (!invoice) return 'Invoice not issued yet';
  if (invoice.status === 'PAID') return `Paid · ${invoice.invoiceNumber}`;
  return `Issued · ${invoice.invoiceNumber}`;
}

export function buildOpdVisitChecklist(input: OpdVisitChecklistInput): OpdChecklistStep[] {
  const vitalsDone = input.vitals.length > 0;
  const consultDone = hasFinalConsultation(input.notes);
  const diagnosisDone = input.diagnoses.length > 0;
  const rxDone = hasSignedPrescription(input.prescriptions);
  const labsDone = input.orders.some((o) => o.orderType === 'LAB');
  const billingDone = Boolean(input.invoice) && input.invoice?.status !== 'CANCELLED';

  return [
    {
      id: 'vitals',
      label: 'Vitals',
      done: vitalsDone,
      required: true,
      hint: vitalsDone ? 'Recorded' : 'Record BP, pulse, temp',
    },
    {
      id: 'consult',
      label: 'Consult',
      done: consultDone,
      required: true,
      hint: consultHint(input.notes),
    },
    {
      id: 'diagnosis',
      label: 'Diagnosis',
      done: diagnosisDone,
      required: true,
      hint: diagnosisDone ? `${input.diagnoses.length} recorded` : 'Add ICD or free-text',
    },
    {
      id: 'rx',
      label: 'e-Rx',
      done: rxDone,
      required: true,
      hint: rxHint(input.prescriptions),
    },
    {
      id: 'labs',
      label: 'Labs',
      done: labsDone,
      required: false,
      hint: labsDone ? 'Lab order placed' : 'Optional',
    },
    {
      id: 'billing',
      label: 'Bill',
      done: billingDone,
      required: false,
      hint: billingHint(input.invoice, input.invoiceForbidden),
    },
  ];
}

export function opdChecklistProgress(steps: OpdChecklistStep[]): { done: number; total: number } {
  return { done: steps.filter((s) => s.done).length, total: steps.length };
}
