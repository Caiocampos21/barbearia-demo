import { useEffect, useMemo, useState } from 'react'
import { buildDataset } from '../lib/analytics'

/**
 * Dados do painel. Recalcula quando a aba volta ao foco ou o localStorage muda
 * (ex.: um agendamento feito no site em outra aba aparece sem recarregar).
 */
export function useAdminData() {
  const [tick, setTick] = useState(0)

  useEffect(() => {
    const refresh = () => setTick((t) => t + 1)
    window.addEventListener('focus', refresh)
    window.addEventListener('storage', refresh)
    const timer = setInterval(refresh, 60_000) // mantém "agora" atualizado
    return () => {
      window.removeEventListener('focus', refresh)
      window.removeEventListener('storage', refresh)
      clearInterval(timer)
    }
  }, [])

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => buildDataset(new Date()), [tick])
}
