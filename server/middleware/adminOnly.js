const adminOnly = (req, res, next) => {
  const adminEmails = (process.env.ADMIN_EMAIL || '')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  const isAdmin = req.user && (req.user.isAdmin || adminEmails.includes(req.user.email.toLowerCase()));

  if (!isAdmin) {
    return res.status(403).json({ message: 'Access denied. Admins only.' });
  }

  next();
};

module.exports = adminOnly;