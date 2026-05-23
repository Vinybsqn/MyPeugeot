import { useState, useEffect, useCallback, useRef } from 'react'
import { apiFetch, VIN } from '../api'

export function useVehicle() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [fresh, setFresh] = useState(false)
  const freshTimer = useRef(null)

  const fetch_data = useCallback(async () => {
    try {
      const json = await apiFetch(`/get_vehicleinfo/${VIN}`)
      setData(json)
      setLastUpdate(new Date())
      setError(null)
      setFresh(true)
      clearTimeout(freshTimer.current)
      freshTimer.current = setTimeout(() => setFresh(false), 2500)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [])

  const refresh = useCallback(async () => {
    setLoading(true)
    try { await apiFetch(`/charge_now/${VIN}/1`) } catch (_) {}
    await new Promise(r => setTimeout(r, 3000))
    await fetch_data()
  }, [fetch_data])

  useEffect(() => {
    fetch_data()
    const interval = setInterval(fetch_data, 60000)
    return () => clearInterval(interval)
  }, [fetch_data])

  return { data, loading, error, lastUpdate, fresh, refresh }
}
