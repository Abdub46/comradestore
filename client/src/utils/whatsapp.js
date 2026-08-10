// Builds a wa.me link that opens WhatsApp with a pre-filled message about a product
export function buildWhatsAppLink(phone, productTitle) {
  const message = `Hello, I'm interested in your ${productTitle}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

// Builds a wa.me link for a seller responding to someone's Wanted request
export function buildWantedWhatsAppLink(phone, wantedTitle) {
  const message = `Hi, I saw you're looking for "${wantedTitle}" on ComradeMarket - I might have what you need!`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
