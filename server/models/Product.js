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
    category: { type: String, required: true, enum: CATEGORIES },
    price: { type: Number, required: true, min: 0 },
    condition: { type: String, required: true, enum: ['New', 'Used'] },
    images: {
      type: [String],
      validate: [(arr) => arr.length <= 5, 'Maximum 5 images allowed'],
      default: [],
    },
    residence: {
      type: String,
      required: true,
      enum: ['Sokomoko', 'KU', 'Annex'],
    },
    status: {
      type: String,
      enum: ['Available', 'Reserved', 'Sold'],
      default: 'Available',
    },
    // Timestamp of when status became "Sold". Used by the TTL index below
    // to auto-delete the product 2 days after it was marked Sold.
    // Stays null while status is Available/Reserved.
    soldAt: { type: Date, default: null },
    views: { type: Number, default: 0 },
    favoritedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
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
