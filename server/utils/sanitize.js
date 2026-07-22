const sanitizeHtml = require('sanitize-html');

// Strips ALL HTML tags and attributes, leaving only plain text.
// Defense-in-depth against stored XSS: React already escapes text when
// rendering, but this ensures no raw <script>/<img onerror>/etc. ever sits
// in the database or gets embedded into an HTML email in the first place.
const stripHtml = (value) => {
  if (typeof value !== 'string') return value;
  return sanitizeHtml(value, { allowedTags: [], allowedAttributes: {} }).trim();
};

module.exports = { stripHtml };