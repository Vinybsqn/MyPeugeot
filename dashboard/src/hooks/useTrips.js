import { useState, useEffect, useCallback } from 'react'

export function useTrips() {
  const [trips, setTrips] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch_trips = useCallback(async () => {
    try {
      const res = await fetch('https://api.vbasquin.com/vehicles/trips')
      const json = await res.json()
      // sort newest first
      setTrips(json.sort((a, b) => new Date(b.start_at) - new Date(a.start_at)))
    } catch {
      setTrips([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch_trips() }, [fetch_trips])

  return { trips, loading, refresh: fetch_trips }
}
