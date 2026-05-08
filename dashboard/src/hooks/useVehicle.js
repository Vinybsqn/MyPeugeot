import { useState, useEffect, useCallback } from 'react'
import { apiFetch } from '../api'

const VIN = 'VR3UHZKXZPT583300'

export function useVehicle() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  const fetch_data = useCallback(async () => {
    try {
      const json = await apiFetch(`/get_vehicleinfo/${VIN}`)
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
