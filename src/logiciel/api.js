// Client de l'API Sang+. Mode démonstration : le profil choisi est envoyé dans l'en-tête x-demo-user.
const KEY = 'sangplus.demoUser'

// En local, Vite relaie « /api » vers le port 3040. En ligne (Vercel), le front est statique :
// VITE_API_URL doit pointer vers l'API hébergée ailleurs (ex. https://sang-plus-api.onrender.com).
const BASE = (import.meta.env.VITE_API_URL || '').replace(/\/$/, '') + '/api'

export function getDemoUser() {
  try { return localStorage.getItem(KEY) } catch { return null }
}
export function setDemoUser(id) {
  try { id ? localStorage.setItem(KEY, id) : localStorage.removeItem(KEY) } catch { /* stockage indisponible */ }
}

async function request(method, path, body) {
  const headers = { 'x-demo-user': getDemoUser() ?? '' }
  if (body !== undefined) headers['content-type'] = 'application/json'
  const res = await fetch(BASE + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw Object.assign(new Error(data.error || 'Erreur ' + res.status), { status: res.status })
  return data
}

export const api = {
  get: (p) => request('GET', p),
  post: (p, b = {}) => request('POST', p, b),
  put: (p, b) => request('PUT', p, b),
  patch: (p, b) => request('PATCH', p, b),
}

export const qs = (o) => {
  const e = Object.entries(o).filter(([, v]) => v != null && v !== '')
  return e.length ? '?' + new URLSearchParams(e).toString() : ''
}
