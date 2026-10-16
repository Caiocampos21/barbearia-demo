import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })

export const formatBRL = (value: number) => brl.format(value)

export const formatDuration = (min: number) => {
  if (min < 60) return `${min} min`
  const h = Math.floor(min / 60)
  const m = min % 60
  return m ? `${h}h${String(m).padStart(2, '0')}` : `${h}h`
}

export const toDateKey = (d: Date) => format(d, 'yyyy-MM-dd')

export const longDate = (key: string) => {
  const text = format(parseISO(key), "EEEE, d 'de' MMMM", { locale: ptBR })
  return text.charAt(0).toUpperCase() + text.slice(1)
}

export const shortDate = (key: string) => format(parseISO(key), 'dd/MM/yyyy')

export const dateTime = (iso: string) => format(parseISO(iso), "dd/MM/yyyy 'às' HH:mm")

/** Máscara de telefone BR: (31) 99999-9999 */
export const maskPhone = (value: string) => {
  const d = value.replace(/\D/g, '').slice(0, 11)
  if (d.length <= 2) return d.length ? `(${d}` : ''
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`
}

export const isValidPhone = (value: string) => {
  const d = value.replace(/\D/g, '')
  return d.length === 10 || d.length === 11
}

export const firstName = (name: string) => name.trim().split(/\s+/)[0] ?? ''
