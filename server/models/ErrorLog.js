const mongoose = require('mongoose');

const errorLogSchema = new mongoose.Schema(
  {
    source: { type: String, enum: ['server', 'client'], required: true },
    // 'security' is for things like failed admin-access attempts or an
    // invalid cron key - not a crash, but worth an admin's attention.
    severity: { type: String, enum: ['error', 'security'], default: 'error' },
    message: { type: String, required: true, maxlength: 1000 },
    path: { type: String, maxlength: 300 },
    statusCode: { type: Number },
    stack: { type: String, maxlength: 4000 },
  },
  { timestamps: true }
);

// Safety net in case the admin never manually clears these - auto-purge
// after 30 days so this collection can't grow forever.
errorLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 30 * 24 * 60 * 60 });

module.exports = mongoose.model('ErrorLog', errorLogSchema);