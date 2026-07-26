const mongoose = require('mongoose');

// Each document = one page view. sessionId groups views from the same
// browser tab together, which is what lets us compute "visitors" (distinct
// sessions) separately from raw "page views" (total row count), plus
// bounce rate and average pages-per-session.
const pageViewSchema = new mongoose.Schema(
  {
    path: { type: String, required: true, index: true },
    sessionId: { type: String, required: true, index: true },
    device: { type: String, enum: ['Desktop', 'Mobile', 'Tablet'], default: 'Desktop', index: true },
  },
  { timestamps: true }
);

// This single index does two jobs at once:
//  1. Speeds up every aggregation in adminController.js that filters/sorts
//     by createdAt (which is all of them - today/week/month/daily-trend).
//  2. TTL retention: MongoDB automatically deletes any page view once it's
//     older than 90 days, so the pageviews collection never grows without
//     bound. 90 days comfortably covers "this month" stats and the 14-day
//     trend graph with room to spare. Adjust the number below to change
//     how long raw page views are kept.
pageViewSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 * 60 * 24 * 90 });

module.exports = mongoose.model('PageView', pageViewSchema);