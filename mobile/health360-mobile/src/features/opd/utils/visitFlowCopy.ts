/** Shared labels — Indian hospital OPD flow (request → queue → consult → bill). */

export const VISIT_FLOW = {
  request: {
    title: 'Request OPD visit',
    patientNav: 'Request OPD',
    hint: 'Submit a visit request for today. Reception confirms and you join the live queue.',
  },
  queue: {
    title: "Today's OPD",
    patientNav: 'My OPD today',
    hint: 'Track your queue position and hospital reminders here.',
  },
} as const;

export const VISIT_FLOW_STEPS = [
  {
    step: 1,
    title: 'Request OPD',
    body: 'Choose hospital (and doctor if you know). Submit your visit reason for today.',
  },
  {
    step: 2,
    title: 'Wait in queue',
    body: 'Reception adds you to the OPD queue. Track your position under My OPD today.',
  },
  {
    step: 3,
    title: 'Consult & bill',
    body: 'Doctor calls you, completes consultation. Pay at billing counter or in the app.',
  },
] as const;

export function queuePositionShort(position?: number | null): string {
  if (position == null) return '—';
  return `#${position}`;
}
