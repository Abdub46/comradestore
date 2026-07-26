const mongoose = require('mongoose');

// Each document = one page view. sessionId groups views from the same
// browser tab together, which is what lets us compute "visitors" (distinct
// sessions) separately from raw "page views" (total row count), plus
// bounce rate and average pages-per-session.
const pageViewSchema = new mongoose.Schema(
  {
    path: { type: String, required: true },
    sessionId: { type: String, required: true, index: true },
    device: { type: String, enum: ['Desktop', 'Mobile', 'Tablet'], default: 'Desktop' },
  },
  { timestamps: true }
);

pageViewSchema.index({ createdAt: 1 });

module.exports = mongoose.model('PageView', pageViewSchema);