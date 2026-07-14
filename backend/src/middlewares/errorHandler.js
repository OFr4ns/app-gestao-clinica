export function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: 'NOT_FOUND',
    message: 'Recurso não encontrado'
  });
}

export function errorHandler(err, req, res, next) {
  const status = err.status || 500;

  if (status >= 500) {
    console.error(err);
  }

  res.status(status).json({
    error: err.code || 'INTERNAL_ERROR',
    message: status >= 500 ? 'Erro inesperado no servidor' : err.message
  });
}
