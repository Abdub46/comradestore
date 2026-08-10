const mongoose = require('mongoose');

const CATEGORIES = [
  'Beds',
  'Sofas',
  'Dining Tables',
  'Office Chairs',
  'Plastic Chairs',
  'TV Stands',
  'Wardrobes',
  'Cupboards',
  'Mattresses',
  'Curtains',
  'Kitchen Items',
  'Gas Cookers',
  'Fridges',
  'Microwaves',
  'Phones',
  'Electronics',
  'Other',
];

const productSchema = new mongoose.Schema(
  {
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    category: { type: String, required: true, enum: CATEGORIES, index: true },
    price: {
      type: Number,
      required: true,
      min: [0.01, 'Price must be a positive number greater than 0'],
      validate: {
        validator: (value) => Number.isFinite(value),
        message: 'Price must be a valid number',
      },
    },
    condition: { type: String, required: true, enum: ['New', 'Used'], index: true },
    images: {
      type: [String],
      validate: [(arr) => arr.length <= 5, 'Maximum 5 images allowed'],
      default: [],
    },
    residence: {
      type: String,
      required: true,
      enum: ['Sokomoko', 'KU', 'Annex'],
      index: true,
    },
    status: {
      type: String,
      enum: ['Available', 'Reserved', 'Sold'],
      default: 'Available',
      index: true,
    },
    // Timestamp of when status became "Sold". Used by the TTL index below
    // to auto-delete the product 2 days after it was marked Sold.
    // Stays null while status is Available/Reserved.
    soldAt: { type: Date, default: null },
    // Timestamp of when a buyer clicked "Contact Seller" (status became
    // Reserved). Drives the 24h-then-24h reservation lifecycle below.
    contactedAt: { type: Date, default: null },
    // Tracks whether the 24-hour "please confirm the sale" reminder has
    // already been sent for the current Reserved cycle, so it only fires once.
    reminderSent: { type: Boolean, default: false },
    // When that reminder was actually sent - the second 24h window (after
    // which the listing auto-flips to Sold if the seller took no action)
    // is measured from this, not from contactedAt.
    reminderSentAt: { type: Date, default: null },
    views: { type: Number, default: 0 },
    favoritedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    // Optional discount percentage set by the seller (e.g. 10 -> "-10%" badge).
    // Left at 0 (falsy) when the seller doesn't want to advertise a discount.
    discount: {
      type: Number,
      default: 0,
      min: [0, 'Discount cannot be negative'],
      max: [100, 'Discount cannot exceed 100%'],
    },
    // The price this listing had immediately before its most recent price
    // edit. Set by updateProduct only when the seller actually changes the
    // price (see productController.js), so it stays null for listings that
    // have never been price-edited - we never guess/backfill a "previous"
    // price for existing records. This is what powers the real Price Drops
    // pulse section (previousPrice > price = genuine reduction).
    previousPrice: { type: Number, default: null },
    // Cumulative count of "Contact Seller" clicks (see markAsContactedSold
    // in productController.js) - incremented every time, not just the
    // first. Powers the seller-intelligence "💬 contacts" metric.
    contactsCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

productSchema.index({ title: 'text', description: 'text' });

// TTL index: MongoDB automatically deletes a product 2 days (172800 seconds)
// after its soldAt timestamp is set. Documents where soldAt is null are
// ignored by the TTL monitor, so Available/Reserved products are never touched.
productSchema.index({ soldAt: 1 }, { expireAfterSeconds: 172800 });

productSchema.statics.CATEGORIES = CATEGORIES;

module.exports = mongoose.model('Product', productSchema);