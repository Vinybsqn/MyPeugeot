export async function apiFetch(path) {
  const res = await fetch(`/proxy${path}`)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
