import { addMinutes, format, parse } from 'date-fns'
import { weekHours } from '../data/seed'

export const SLOT_MINUTES = 30

/** Hash determinístico (FNV-1a) → número em [0, 1). Base de todos os dados mock. */
export function hash01(input: string) {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) % 10000) / 10000
}

export const slotsNeeded = (durationMin: number) => Math.ceil(durationMin / SLOT_MINUTES)

/** Horários de início do dia (de 30 em 30 min). Vazio se fechado. */
export function buildDayGrid(date: Date): string[] {
  const hours = weekHours[date.getDay()]
  if (!hours) return []
  const open = parse(hours.open, 'HH:mm', date)
  const close = parse(hours.close, 'HH:mm', date)
  const grid: string[] = []
  for (let t = open; t < close; t = addMinutes(t, SLOT_MINUTES)) grid.push(format(t, 'HH:mm'))
  return grid
}
