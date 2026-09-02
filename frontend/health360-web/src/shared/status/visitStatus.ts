/**
 * Product status labels aligned with docs/15-ecosystem/ECOSYSTEM-STATUS-MAP.md.
 * Database enums stay unchanged; UI shows patient-friendly copy.
 */

export type ChipColor = 'default' | 'warning' | 'info' | 'success' | 'error';

const APPOINTMENT_LABELS: Record<string, string> = {
  PENDING: 'Booked',
  CONFIRMED: 'Confirmed',
  ARRIVED: 'Checked in',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No show',
  RESCHEDULED: 'Rescheduled',
  POSTPONED: 'Postponed',
};

const QUEUE_LABELS: Record<string, string> = {
  WAITING: 'Waiting',
  CALLED: 'Called — please proceed',
  IN_SERVICE: 'In consultation',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
  NO_SHOW: 'No show',
  SKIPPED: 'Skipped',
};

const ENCOUNTER_LABELS: Record<string, string> = {
  REGISTERED: 'Registered',
  WAITING: 'Waiting',
  IN_PROGRESS: 'In consultation',
  COMPLETED: 'Completed',
  CANCELLED: 'Cancelled',
};

/** Maps laboratory.lab_orders statuses to ECO-P3 journey language (DB enums unchanged). */
const LAB_ORDER_LABELS: Record<string, string> = {
  ORDERED: 'Ordered — book hospital lab',
  RECEIVED: 'Booked at hospital lab',
  SAMPLE_COLLECTED: 'Sample collected',
  RESULTS_DRAFT: 'Results entered',
  VERIFIED: 'Verified',
  RELEASED: 'Report published',
  CANCELLED: 'Cancelled',
};

/** Maps pharmacy.pharmacy_requests statuses to ECO-P4 journey language. */
const PHARMACY_REQUEST_LABELS: Record<string, string> = {
  REQUESTED: 'Sent to pharmacy',
  RECEIVED: 'Received by pharmacy',
  UNDER_REVIEW: 'Under review',
  PARTIALLY_AVAILABLE: 'Partially available',
  AVAILABLE: 'Available',
  READY: 'Medicines ready',
  DISPENSED: 'Dispensed',
  CANCELLED: 'Cancelled',
};

const INVOICE_LABELS: Record<string, string> = {
  DRAFT: 'Bill draft',
  ISSUED: 'Payment pending',
  PARTIALLY_PAID: 'Partially paid',
  PAID: 'Paid',
  CANCELLED: 'Cancelled',
};

export function invoiceStatusLabel(status: string | undefined | null): string {
  if (!status) return 'No bill yet';
  return INVOICE_LABELS[status] ?? status.replace(/_/g, ' ');
}

export function invoiceStatusColor(status: string | undefined | null): ChipColor {
  switch (status) {
    case 'PAID':
      return 'success';
    case 'ISSUED':
    case 'PARTIALLY_PAID':
      return 'warning';
    case 'DRAFT':
      return 'default';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
}

export function patientDisplayLabel(name?: string | null, uhid?: string | null): string {
  if (name?.trim()) return name.trim();
  if (uhid?.trim()) return uhid.trim();
  return 'Patient';
}

export function registrationTypeLabel(type: string): string {
  switch (type) {
    case 'PATIENT_REQUEST':
      return 'App request';
    case 'WALK_IN':
      return 'Walk-in';
    case 'APPOINTMENT':
      return 'Appointment';
    default:
      return type.replace(/_/g, ' ');
  }
}

export function registrationTypeColor(type: string): ChipColor {
  switch (type) {
    case 'PATIENT_REQUEST':
      return 'info';
    case 'WALK_IN':
      return 'default';
    case 'APPOINTMENT':
      return 'warning';
    default:
      return 'default';
  }
}

export function appointmentStatusLabel(status: string): string {
  return APPOINTMENT_LABELS[status] ?? status.replace(/_/g, ' ');
}

export function queueStatusLabel(status: string): string {
  return QUEUE_LABELS[status] ?? status.replace(/_/g, ' ');
}

export function visitEncounterStatusLabel(status: string): string {
  return ENCOUNTER_LABELS[status] ?? status.replace(/_/g, ' ');
}

export function labOrderStatusLabel(status: string): string {
  return LAB_ORDER_LABELS[status] ?? status.replace(/_/g, ' ');
}

export function pharmacyRequestStatusLabel(status: string): string {
  return PHARMACY_REQUEST_LABELS[status] ?? status.replace(/_/g, ' ');
}

export function appointmentStatusColor(status: string): ChipColor {
  switch (status) {
    case 'CONFIRMED':
      return 'success';
    case 'PENDING':
      return 'info';
    case 'ARRIVED':
      return 'info';
    case 'COMPLETED':
      return 'default';
    case 'CANCELLED':
    case 'RESCHEDULED':
      return 'error';
    case 'POSTPONED':
    case 'NO_SHOW':
      return 'warning';
    default:
      return 'default';
  }
}

export function queueStatusColor(status: string): ChipColor {
  switch (status) {
    case 'WAITING':
    case 'SKIPPED':
      return 'warning';
    case 'CALLED':
    case 'IN_SERVICE':
      return 'info';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    case 'NO_SHOW':
      return 'default';
    default:
      return 'default';
  }
}

export function visitEncounterStatusColor(status: string): ChipColor {
  switch (status) {
    case 'REGISTERED':
      return 'default';
    case 'WAITING':
      return 'warning';
    case 'IN_PROGRESS':
      return 'info';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
}

export function labOrderStatusColor(status: string): ChipColor {
  switch (status) {
    case 'ORDERED':
      return 'warning';
    case 'RECEIVED':
    case 'SAMPLE_COLLECTED':
    case 'RESULTS_DRAFT':
      return 'info';
    case 'VERIFIED':
    case 'RELEASED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
}
