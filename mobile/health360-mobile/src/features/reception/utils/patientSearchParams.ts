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

export function looksLikePhone(value: string): boolean {
  const digits = value.replace(/\D/g, '');
  return digits.length >= 10;
}

function parseNameFromQuery(query: string): { firstName: string; lastName: string } | null {
  const parts = query.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) return null;
  return {
    firstName: parts[0],
    lastName: parts.slice(1).join(' '),
  };
}

export function buildPatientSearchParams(
  query: string,
  nameDob?: { firstName: string; lastName: string; dateOfBirth: string },
): PatientSearchParams | null {
  const q = query.trim();
  const firstName = nameDob?.firstName.trim() ?? '';
  const lastName = nameDob?.lastName.trim() ?? '';
  const dateOfBirth = nameDob?.dateOfBirth?.trim() ?? '';
  const hasNameFields = Boolean(firstName && lastName);

  if (q && looksLikeUuid(q)) return { patientId: q };
  if (q && looksLikeEmail(q)) return { email: q };
  if (q && looksLikeUhid(q)) return { uhid: q.toUpperCase() };
  if (q && looksLikePhone(q)) return { mobile: q };

  if (hasNameFields) {
    return {
      firstName,
      lastName,
      ...(dateOfBirth ? { dateOfBirth } : {}),
    };
  }

  const parsedName = q ? parseNameFromQuery(q) : null;
  if (parsedName) {
    return {
      firstName: parsedName.firstName,
      lastName: parsedName.lastName,
      ...(dateOfBirth ? { dateOfBirth } : {}),
    };
  }

  return null;
}
