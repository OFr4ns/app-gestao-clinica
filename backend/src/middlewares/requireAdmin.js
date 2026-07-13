export function requireAdmin(req, res, next) {
  if (req.auth?.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Admin access required'
    });
  }

  return next();
}
