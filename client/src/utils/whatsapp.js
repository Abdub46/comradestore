// Builds a wa.me link that opens WhatsApp with a pre-filled message about a product
export function buildWhatsAppLink(phone, productTitle) {
  const message = `Hello, I'm interested in your ${productTitle}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}
