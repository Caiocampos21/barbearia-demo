import { useEffect } from 'react'

const BASE = 'Barbearia Navalha de Ouro'

/** Define o título da aba. Sem argumento, usa só o nome da barbearia. */
export function usePageTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE}` : `${BASE} · Belo Horizonte`
  }, [title])
}
