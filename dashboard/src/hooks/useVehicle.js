import { useState, useEffect, useCallback, useRef } from 'react'
import { apiFetch, VIN } from '../api'

const SSE_URL = import.meta.env.DEV
  ? `${import.meta.env.VITE_API_URL}/events`
  : '/proxy/events'

export function useVehicle() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)
  const [fresh, setFresh] = useState(false)
  const freshTimer = useRef(null)
  const pollInterval = useRef(null)
  const sseRef = useRef(null)

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
    // Tente SSE en premier
    let sse
    try {
      sse = new EventSource(SSE_URL)
      sseRef.current = sse

      sse.onopen = () => {
        // SSE connecté — pas besoin du polling
        clearInterval(pollInterval.current)
      }

      sse.onmessage = (e) => {
        try {
          onData(JSON.parse(e.data))
        } catch {}
      }

      sse.onerror = () => {
        sse.close()
        // Fallback : polling toutes les 10s
        fetchOnce()
        pollInterval.current = setInterval(fetchOnce, 10000)
      }
    } catch {
      // SSE non supporté : polling
      fetchOnce()
      pollInterval.current = setInterval(fetchOnce, 60000)
    }

    return () => {
      sse?.close()
      clearInterval(pollInterval.current)
      clearTimeout(freshTimer.current)
    }
  }, [fetchOnce, onData])

  const refresh = useCallback(async () => {
    setLoading(true)
    try { await apiFetch(`/charge_now/${VIN}/1`) } catch (_) {}
    await new Promise(r => setTimeout(r, 3000))
    await fetchOnce()
  }, [fetchOnce])

  return { data, loading, error, lastUpdate, fresh, refresh }
}
