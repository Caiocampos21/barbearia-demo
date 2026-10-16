import type { Appointment } from './types'

// Persistência leve (modo demonstração): tudo fica no navegador do visitante.
const KEY = 'navalha:appointments:v1'

export function loadAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Appointment[]) : []
  } catch {
    return []
  }
}

function persist(list: Appointment[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list))
  } catch {
    // modo privado ou storage cheio: a demo continua funcionando em memória
  }
}

export function getAppointment(id: string): Appointment | undefined {
  return loadAppointments().find((a) => a.id === id)
}

export function saveAppointment(appt: Appointment) {
  const list = loadAppointments().filter((a) => a.id !== appt.id)
  persist([...list, appt])
}

export function updateAppointment(id: string, patch: Partial<Appointment>): Appointment | undefined {
  const list = loadAppointments()
  const idx = list.findIndex((a) => a.id === id)
  if (idx === -1) return undefined
  const updated = { ...list[idx], ...patch }
  list[idx] = updated
  persist(list)
  return updated
}

export function newId(prefix = 'ag') {
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase()
  return `${prefix}-${Date.now().toString(36).toUpperCase().slice(-5)}${rand}`
}
