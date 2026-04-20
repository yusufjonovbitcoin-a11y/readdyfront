export function normalizeWhitespace(value: string): string {
  return value.replace(/\s+/g, " ").trim();
}

export function isBlank(value: string): boolean {
  return normalizeWhitespace(value).length === 0;
}

export function isValidEmail(value: string): boolean {
  const trimmed = value.trim();
  if (trimmed.length === 0) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed);
}

export function normalizePhoneDigits(value: string): string {
  return value.replace(/\D/g, "");
}

/**
 * Current UI placeholders imply Uzbek phone format.
 * We accept only +998 based numbers (12 digits including country code).
 */
export function isValidUzPhone(value: string): boolean {
  const digits = normalizePhoneDigits(value);
  return digits.length === 12 && digits.startsWith("998");
}

