export const NOTIFICATION_TYPE_LABELS: Record<string, string> = {
  APPOINTMENT_CONFIRMATION: 'Appointment confirmation',
  APPOINTMENT_REMINDER_24H: 'Appointment reminder (24h)',
  APPOINTMENT_REMINDER_1H: 'Appointment reminder (1h)',
  APPOINTMENT_CANCELLATION: 'Appointment cancellation',
  VERIFICATION_STATUS: 'Verification status',
  REVIEW_PROMPT: 'Review prompt',
};

export function isSmsDisabledForType(notificationType: string): boolean {
  return notificationType === 'VERIFICATION_STATUS' || notificationType === 'REVIEW_PROMPT';
}
