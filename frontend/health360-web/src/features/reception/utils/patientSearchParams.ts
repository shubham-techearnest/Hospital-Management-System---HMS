export type PatientSearchParams = {
  uhid?: string;
  mobile?: string;
  email?: string;
  patientId?: string;
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
};

export function looksLikeUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.trim());
}

export function looksLikeUhid(value: string): boolean {
  return /^H360-\d{4}-\d+$/i.test(value.trim());
}

export function looksLikeEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

/** Build hospital patient search params from a single query field + optional name/DOB. */
export function buildPatientSearchParams(
  query: string,
  nameDob?: { firstName: string; lastName: string; dateOfBirth: string },
): PatientSearchParams | null {
  const q = query.trim();
  const hasNameDob = Boolean(nameDob?.firstName && nameDob?.lastName && nameDob?.dateOfBirth);

  if (q && looksLikeUuid(q)) {
    return { patientId: q };
  }
  if (q && looksLikeEmail(q)) {
    return { email: q };
  }
  if (q && looksLikeUhid(q)) {
    return { uhid: q.toUpperCase() };
  }
  if (hasNameDob && nameDob) {
    return {
      firstName: nameDob.firstName.trim(),
      lastName: nameDob.lastName.trim(),
      dateOfBirth: nameDob.dateOfBirth,
    };
  }
  if (q) {
    return { mobile: q };
  }
  return null;
}
