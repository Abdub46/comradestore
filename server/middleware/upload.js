
const multer = require('multer');

// Images are held in memory only long enough for the controller to convert
// them to WebP (via sharp) and stream the result to Cloudinary - never
// written to disk. Resizing now happens in processImage.js instead of via
// a Cloudinary transformation, since sharp handles that before upload.
const storage = multer.memoryStorage();

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per image
  fileFilter: (req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Only JPG, PNG, and WEBP images are allowed'));
    }
  },
});

module.exports = upload;