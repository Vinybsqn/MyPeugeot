import { useState, useEffect, useCallback, useRef } from 'react'
import { apiFetch, VIN } from '../api'

export function useVehicle() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [fresh, setFresh] = useState(false)
  const freshTimer = useRef(null)

  const onData = useCallback((json) => {
    setData(json)
    setLastUpdate(new Date())
    setError(null)
    setFresh(true)
    setLoading(false)
    clearTimeout(freshTimer.current)
    freshTimer.current = setTimeout(() => setFresh(false), 2500)
  }, [])

  const fetchOnce = useCallback(async () => {
    try {
      const json = await apiFetch(`/get_vehicleinfo/${VIN}`)
      onData(json)
    } catch (e) {
      setError(e.message)
      setLoading(false)
    }
  }, [onData])

  useEffect(() => {
    fetchOnce()
    return () => clearTimeout(freshTimer.current)
  }, [fetchOnce])

  const refresh = useCallback(async () => {
    setLoading(true)
    try { await apiFetch(`/charge_now/${VIN}/1`) } catch (_) {}
    await new Promise(r => setTimeout(r, 3000))
    await fetchOnce()
  }, [fetchOnce])

  return { data, loading, error, lastUpdate, fresh, refresh }
}
