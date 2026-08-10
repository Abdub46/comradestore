const mongoose = require('mongoose');
const Product = require('./Product');

const wantedSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true, default: '' },
    // Optional - a buyer may not know/care which category their item falls
    // under. null means "match on title keywords instead" (see
    // jobs/wantedMatcher.js).
    category: { type: String, enum: Product.CATEGORIES, default: null },
    minBudget: { type: Number, default: null, min: 0 },
    maxBudget: { type: Number, default: null, min: 0 },
    residence: {
      type: String,
      required: true,
      enum: ['Sokomoko', 'KU', 'Annex'],
      index: true,
    },
    status: { type: String, enum: ['Active', 'Fulfilled'], default: 'Active', index: true },
  },
  { timestamps: true }
);

// Auto-expire a request 30 days after posting so the Wanted Board doesn't
// fill up with stale/forgotten requests.
wantedSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('Wanted', wantedSchema);