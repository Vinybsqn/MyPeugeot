const CF_HEADERS = {
  'CF-Access-Client-Id': import.meta.env.VITE_CF_CLIENT_ID,
  'CF-Access-Client-Secret': import.meta.env.VITE_CF_CLIENT_SECRET,
}

export async function apiFetch(path) {
  const res = await fetch(`https://api.vbasquin.com${path}`, {
    headers: CF_HEADERS,
  })
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  return res.json()
}
