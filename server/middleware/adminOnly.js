// Restricts a route to only the account(s) listed in ADMIN_EMAIL.
// Must be used AFTER the `protect` middleware, since it relies on req.user
// already being set.
const adminOnly = (req, res, next) => {
    const adminEmails = (process.env.ADMIN_EMAIL || '')
      .split(',')
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean);
  
    if (!req.user || !adminEmails.includes(req.user.email.toLowerCase())) {
      return res.status(403).json({ message: 'Access denied. Admins only.' });
    }
  
    next();
  };
  
  module.exports = adminOnly;