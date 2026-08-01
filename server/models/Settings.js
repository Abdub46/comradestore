const mongoose = require('mongoose');

const settingsSchema = new mongoose.Schema(
  {
    maintenanceMode: { type: Boolean, default: false },
    maintenanceMessage: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "We're currently performing maintenance. Some features may be temporarily unavailable.",
    },
    // Where "Contact Us" form submissions get emailed to
    contactEmail: {
      type: String,
      trim: true,
      default: 'infohorizoncentre@gmail.com',
    },
  },
  { timestamps: true }
);

// This app only ever needs one settings document - always read/write the
// same one, creating it with defaults the first time it's requested.
settingsSchema.statics.getSingleton = async function () {
  let settings = await this.findOne();
  if (!settings) {
    settings = await this.create({});
  }
  return settings;
};

module.exports = mongoose.model('Settings', settingsSchema);