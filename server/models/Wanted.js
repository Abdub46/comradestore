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
    status: { type: String, enum: ['Active', 'Reserved', 'Fulfilled'], default: 'Active', index: true },
    // Timestamp of when status became "Fulfilled". Mirrors Product.soldAt -
    // used by the TTL index below to auto-delete the request 2 days after
    // it's fulfilled, the same way a Sold product is auto-removed.
    // Stays null while status is Active/Reserved.
    fulfilledAt: { type: Date, default: null },
    // Timestamp of when a seller clicked "Contact the Buyer" (status became
    // Reserved). Drives the 24h-then-24h lifecycle below, same concept as
    // Product.contactedAt.
    contactedAt: { type: Date, default: null },
    // Tracks whether the 24-hour "did you get it?" reminder has already
    // been sent for the current Reserved cycle, so it only fires once.
    reminderSent: { type: Boolean, default: false },
    // When that reminder was actually sent - the second 24h window (after
    // which the request auto-flips to Fulfilled if the buyer took no
    // action) is measured from this, not from contactedAt.
    reminderSentAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Auto-expire a request 30 days after posting so the Wanted Board doesn't
// fill up with stale/forgotten requests.
wantedSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

// TTL index: MongoDB automatically deletes a request 2 days (172800 seconds)
// after its fulfilledAt timestamp is set. Documents where fulfilledAt is
// null are ignored by the TTL monitor, so Active/Reserved requests are
// never touched by this one (only by the createdAt TTL index above).
wantedSchema.index({ fulfilledAt: 1 }, { expireAfterSeconds: 172800 });

module.exports = mongoose.model('Wanted', wantedSchema);