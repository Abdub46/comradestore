// Converts a Kenyan phone number to the WhatsApp/international format: 2547XXXXXXXX
// Accepts inputs like "0712345678", "+254712345678", "254712345678", "712345678"
function formatPhoneNumber(rawPhone) {
  if (!rawPhone) return null;

  // Strip everything except digits
  let digits = String(rawPhone).replace(/\D/g, '');

  // Remove a leading "00" (international dial prefix) e.g. 00254712345678
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  // 0712345678 -> 712345678 -> 254712345678
  if (digits.startsWith('0')) {
    digits = digits.slice(1);
  }

  // Already has country code 254...
  if (digits.startsWith('254')) {
    digits = digits.slice(3);
  }

  // At this point "digits" should be the 9-digit subscriber number e.g. 712345678
  if (digits.length !== 9) {
    return null; // invalid number
  }

  return `254${digits}`;
}

function isValidKenyanPhone(rawPhone) {
  const formatted = formatPhoneNumber(rawPhone);
  return formatted !== null && /^254(7|1)\d{8}$/.test(formatted);
}

module.exports = { formatPhoneNumber, isValidKenyanPhone };
