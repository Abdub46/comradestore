const cloudinary = require('../config/cloudinary');

// Uploads an in-memory image buffer directly to Cloudinary (no temp file
// needed) and resolves with the resulting secure URL. Used after sharp has
// already converted the image to WebP.
function uploadBufferToCloudinary(buffer, folder = 'marketplace-products') {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type: 'image' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(buffer);
  });
}

module.exports = { uploadBufferToCloudinary };