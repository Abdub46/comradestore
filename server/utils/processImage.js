const sharp = require('sharp');

// Converts an uploaded image buffer to WebP, resized to a sane max width.
// This typically shrinks product photos by 25-50% with no visible quality
// loss, directly cutting bandwidth and speeding up page loads for anyone
// browsing the marketplace.
async function convertToWebP(buffer) {
  return sharp(buffer)
    .resize({ width: 1200, withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer();
}

module.exports = { convertToWebP };