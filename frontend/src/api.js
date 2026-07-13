export const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const unsafeMethods = new Set(['POST', 'PUT', 'PATCH', 'DELETE']);
let csrfToken = null;

function resetCsrfToken() {
  csrfToken = null;
}

async function ensureCsrfToken() {
  if (csrfToken) {
    return csrfToken;
  }

  const response = await fetch(`${apiBaseUrl}/auth/csrf`, {
    credentials: 'include'
  });
  const data = await response.json();

  if (!response.ok || !data.csrfToken) {
    throw new Error('Nao foi possivel iniciar a protecao CSRF.');
  }

  csrfToken = data.csrfToken;
  return csrfToken;
}

export async function api(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();

  async function send() {
    const csrfHeader = unsafeMethods.has(method)
      ? { 'x-csrf-token': await ensureCsrfToken() }
      : {};

    const response = await fetch(`${apiBaseUrl}${path}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...csrfHeader,
        ...(options.headers || {})
      },
      ...options
    });

    if (response.status === 204) {
      return { response, data: null };
    }

    const data = await response.json().catch(() => ({}));
    return { response, data };
  }

  let result = await send();

  if (
    result.response.status === 403 &&
    result.data?.error === 'INVALID_CSRF_TOKEN' &&
    unsafeMethods.has(method)
  ) {
    resetCsrfToken();
    result = await send();
  }

  if (!result.response.ok) {
    throw new Error(result.data?.message || 'Nao foi possivel concluir a operacao.');
  }

  if (path === '/auth/login' || path === '/auth/register' || path === '/auth/logout') {
    resetCsrfToken();
  }

  return result.data;
}
