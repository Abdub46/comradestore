const mongoose = require('mongoose');

// There is only ever one banner document for the whole site - it's a
// global setting, not per-user. Controller uses findOneAndUpdate with
// upsert so it's created automatically the first time an admin saves it.
const bannerSchema = new mongoose.Schema(
  {
    text: { type: String, default: '', trim: true },
    linkUrl: { type: String, default: '', trim: true },
    linkText: { type: String, default: '', trim: true },
    backgroundColor: { type: String, default: '#16a34a' },
    textColor: { type: String, default: '#ffffff' },
    showLinkIcon: { type: Boolean, default: true },
    showCloseButton: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Banner', bannerSchema);