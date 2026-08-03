/** Accepts standard UUID strings including dev seed IDs (e.g. 00000000-0000-0000-0000-...). */
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(value: string | undefined | null): value is string {
  return Boolean(value && UUID_PATTERN.test(value));
}
