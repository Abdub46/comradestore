const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
  type: String,
  minlength: 8,
  required: function () {
    return !this.googleId; // password not needed for Google-signed-in users
  },
},
googleId: { type: String, unique: true, sparse: true },
    isAdmin: { type: Boolean, default: false },
    resetPasswordToken: { type: String, select: false },
resetPasswordExpires: { type: Date, select: false },
    // Stored in normalized WhatsApp format e.g. 254712345678
    phone: { type: String, required: true, unique: true },
    residence: {
      type: String,
      required: true,
      enum: ['Sokomoko', 'KU', 'Annex'],
    },
  avatar: {
  type: String,
  default: '/default-avatar.png',
},
  // Timestamp of this user's last "meaningful visit" to the homepage.
  // Used by the ComradeMarket Pulse "Since You Last Visited" section to
  // compute what changed since they were last here. null means the user
  // has never had a recorded visit yet (existing users included) - the
  // Pulse endpoint treats that as a first-time visit rather than fabricating
  // a fake previous session.
  lastSeenAt: { type: Date, default: null },
  // Simple per-user toggles for the notification types added in Phase 3.
  // All default to true so existing users keep getting notified exactly as
  // before unless they explicitly opt out.
  notificationPreferences: {
    priceDrops: { type: Boolean, default: true },
    savedItemStatus: { type: Boolean, default: true },
    residenceActivity: { type: Boolean, default: true },
    wantedMatches: { type: Boolean, default: true },
  },
  // Last time the residence-activity digest job notified this user, so it
  // only counts listings posted since then instead of re-notifying about
  // the same ones every run. null = never digested yet.
  lastDigestAt: { type: Date, default: null },
  },
  { timestamps: true }
);

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false; // Google-only account, no password to match
  return bcrypt.compare(enteredPassword, this.password);
};

// Never send password back to client
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
