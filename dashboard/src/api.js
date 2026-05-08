const BASE = 'https://api.vbasquin.com'

export async function apiFetch(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
