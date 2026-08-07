export function isDoctorProfileEditable(status?: string): boolean {
  return status === 'DRAFT' || status === 'REJECTED';
}

export function doctorProfileLockMessage(status?: string): string | null {
  if (!status || isDoctorProfileEditable(status)) return null;
  if (status === 'VERIFIED') {
    return 'Your profile is verified and locked for editing. Verified doctors cannot change professional details through this form.';
  }
  if (status === 'PENDING_VERIFICATION') {
    return 'Your profile is under admin review and cannot be edited until verification is complete.';
  }
  return 'This profile cannot be edited in its current status.';
}
