import { useState, useEffect, useCallback } from 'react'

const VIN = 'VR3UHZKXZPT583300'

export function useVehicle() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  const fetch_data = useCallback(async () => {
    try {
      const res = await fetch(`https://api.vbasquin.com/get_vehicleinfo/${VIN}`)
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
      setLastUpdate(new Date())
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetch_data()
    const interval = setInterval(fetch_data, 60000) // refresh every minute
    return () => clearInterval(interval)
  }, [fetch_data])

  return { data, loading, error, lastUpdate, refresh: fetch_data }
}
