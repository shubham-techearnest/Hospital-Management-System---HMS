export function displayName(firstName?: string, lastName?: string, email?: string) {
  const name = [firstName, lastName].filter(Boolean).join(' ').trim();
  return name || email || 'Account';
}

export function initials(firstName?: string, lastName?: string, email?: string) {
  const combined = `${firstName?.charAt(0) ?? ''}${lastName?.charAt(0) ?? ''}`.trim();
  return combined || email?.charAt(0)?.toUpperCase() || '?';
}
