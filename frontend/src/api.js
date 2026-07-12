const BASE = import.meta.env.VITE_API_URL || '/api'
export async function apiFetch(path, options = {}, token = '') {
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  const cleanBase = BASE.endsWith('/') ? BASE.slice(0, -1) : BASE;
  const res = await fetch(`${cleanBase}${cleanPath}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}