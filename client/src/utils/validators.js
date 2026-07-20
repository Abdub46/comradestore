// Shared validation helpers used across every form in the app, so the
// same rules (and error messages) apply consistently everywhere.

export const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// react-hook-form "validate" function: blocks whitespace-only input
// (e.g. someone typing just spaces to satisfy a "required" check)
export const notBlank = (value) =>
  (typeof value === 'string' && value.trim().length > 0) || 'This field cannot be empty';

// react-hook-form "validate" function: proper email format, not just "non-empty"
export const isValidEmail = (value) => EMAIL_PATTERN.test(value) || 'Please enter a valid email address';

// Plain boolean version for use outside react-hook-form (e.g. manual form state)
export const isValidEmailFormat = (value) => EMAIL_PATTERN.test(String(value || '').trim());

// Basic phone sanity check for general contact forms (not Kenya-specific -
// use isValidKenyanPhone from utils/phone.js instead when the number must
// be a working Kenyan WhatsApp number, e.g. registration/listings)
export const isPlausiblePhone = (value) => {
  const digits = String(value || '').replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15;
};