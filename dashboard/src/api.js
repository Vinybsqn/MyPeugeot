export const BASE = import.meta.env.DEV
  ? import.meta.env.VITE_API_URL
  : '/proxy'
export const VIN = import.meta.env.VITE_VIN

export async function apiFetch(path) {
  const res = await fetch(`${BASE}${path}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
