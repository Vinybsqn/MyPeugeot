import { useEffect, useRef } from 'react'

export function useChargingNotification(energy) {
  const wasCharging = useRef(null)

  useEffect(() => {
    if (!energy) return

    const isCharging = energy?.charging?.status === 'InProgress'

    // Request permission on first use
    if (wasCharging.current === null) {
      wasCharging.current = isCharging
      if ('Notification' in window && Notification.permission === 'default') {
        Notification.requestPermission()
      }
      return
    }

    // Charging just finished
    if (wasCharging.current === true && !isCharging) {
      if (Notification.permission === 'granted') {
        new Notification('e-208 — Charge terminée', {
          body: `Batterie à ${energy?.level ?? '?'}% · ${energy?.autonomy ?? '?'} km d'autonomie`,
          icon: '/icon-192.png',
          badge: '/icon-192.png',
        })
      }
    }

    wasCharging.current = isCharging
  }, [energy?.charging?.status])
}
