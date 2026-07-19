// Client-side mirror of the server's phone normalizer, used for inline validation hints
export function formatPhoneNumber(rawPhone) {
  if (!rawPhone) return null;
  let digits = String(rawPhone).replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('0')) digits = digits.slice(1);
  if (digits.startsWith('254')) digits = digits.slice(3);
  if (digits.length !== 9) return null;
  return `254${digits}`;
}

export function isValidKenyanPhone(rawPhone) {
  const formatted = formatPhoneNumber(rawPhone);
  return formatted !== null && /^254(7|1)\d{8}$/.test(formatted);
}
