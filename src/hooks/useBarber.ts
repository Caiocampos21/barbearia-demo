import { useCallback, useEffect, useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { barbers } from '../data/seed'
import type { Barber } from '../lib/types'

// Prefixo `navalha:` para o botão "Resetar dados" também limpar quem estava logado.
const KEY = 'navalha:barber:v1'

const read = () => {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null
  }
}

/** Quem está usando a área do barbeiro. Demo sem senha: a escolha fica só neste navegador. */
export function useBarber() {
  const [id, setId] = useState(read)

  useEffect(() => {
    const sync = () => setId(read())
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const select = useCallback((barberId: string) => {
    try {
      localStorage.setItem(KEY, barberId)
    } catch {
      // armazenamento bloqueado: a escolha vale só até recarregar
    }
    setId(barberId)
  }, [])

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(KEY)
    } catch {
      // idem
    }
    setId(null)
  }, [])

  return { barber: barbers.find((b) => b.id === id), select, clear }
}

/** Para as telas filhas: o barbeiro escolhido no layout. */
export const useBarberContext = () => useOutletContext<{ barber: Barber }>()
