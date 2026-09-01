/** Shared labels — Indian hospital OPD flow (request → queue → consult → bill). */

export const VISIT_FLOW = {
  request: {
    title: 'Request OPD visit',
    short: 'Request OPD',
    patientNav: 'Request OPD',
    deskTab: 'New OPD',
    hint: 'Submit a visit request for today. Reception confirms and you join the live queue.',
    patientAction: 'Submit OPD request',
  },
  queue: {
    title: 'Live OPD queue',
    short: 'Queue',
    patientNav: 'My OPD today',
    deskTab: 'Queue',
    hint: 'All patients waiting for consultation today — from app requests and walk-ins.',
  },
  walkIn: {
    title: 'Walk-in at desk',
    short: 'Walk-in',
    deskTab: 'New OPD',
    deskAction: 'Register & add to queue',
    hint: 'Patient came to reception without using the app — search, register if needed, add to queue.',
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

export const DESK_FLOW_STEPS = [
  {
    step: 1,
    title: 'New OPD',
    body: 'Walk-in or confirm app request — register patient and add to today\'s queue.',
  },
  {
    step: 2,
    title: 'Live queue',
    body: 'Call patients, assign doctor, send to consultation room.',
  },
  {
    step: 3,
    title: 'Checkout',
    body: 'After doctor finishes, collect payment and close the visit.',
  },
] as const;

export function opdFloorHint(audience: 'desk' | 'doctor' | 'patient'): string {
  if (audience === 'desk') {
    return 'New OPD adds patients to the queue. Use Queue tab to call, assign doctor, and track progress.';
  }
  if (audience === 'doctor') {
    return 'Patients appear when reception adds them to OPD. Start consult when called; finish when Rx and orders are done.';
  }
  return 'Request OPD for today, then track your queue position under My OPD today.';
}

export function queuePositionLabel(position?: number | null): string {
  if (position == null) return '—';
  return `#${position}`;
}
