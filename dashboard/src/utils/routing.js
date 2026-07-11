const OSRM = 'https://router.project-osrm.org/route/v1/driving'

const cache = new Map()

export async function fetchRoute(positions) {
  if (!positions || positions.lat.length < 2) return null

  const coords = positions.lat
    .map((lat, i) => `${positions.long[i]},${lat}`)
    .join(';')

  if (cache.has(coords)) return cache.get(coords)

  try {
    const res = await fetch(`${OSRM}/${coords}?overview=full&geometries=geojson`)
    if (!res.ok) return null
    const data = await res.json()
    const route = data.routes?.[0]?.geometry?.coordinates?.map(([lng, lat]) => [lat, lng]) ?? null
    cache.set(coords, route)
    return route
  } catch {
    return null
  }
}
