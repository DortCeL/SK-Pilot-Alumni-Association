export function normalizeBdPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("880") && digits.length >= 13) {
    return `0${digits.slice(3, 13)}`;
  }
  if (digits.startsWith("0") && digits.length === 11) {
    return digits;
  }
  if (digits.length === 10 && digits.startsWith("1")) {
    return `0${digits}`;
  }
  return digits;
}

export function isValidBdPhone(phone: string): boolean {
  return /^01[3-9]\d{8}$/.test(normalizeBdPhone(phone));
}

/** Login id for the Better Auth username plugin (phone → `p01XXXXXXXXX`). */
export function phoneToAuthUsername(phone: string): string {
  const normalized = normalizeBdPhone(phone);
  return `p${normalized}`;
}