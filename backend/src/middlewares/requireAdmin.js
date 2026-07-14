export function requireAdmin(req, res, next) {
  if (req.auth?.role !== 'ADMIN') {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Acesso de administrador obrigatório'
    });
  }

  return next();
}
