import { useState, useEffect, useCallback } from 'react'

export function useChargings() {
  const [chargings, setChargings] = useState([])
  const [loading, setLoading] = useState(true)

  const fetch_chargings = useCallback(async () => {
    try {
      const res = await fetch('https://api.vbasquin.com/vehicles/chargings')
      const json = await res.json()
      setChargings(json.sort((a, b) => new Date(b.start_at) - new Date(a.start_at)))
    } catch {
      setChargings([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetch_chargings() }, [fetch_chargings])

  return { chargings, loading, refresh: fetch_chargings }
}
