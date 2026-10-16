import { addDays, addMinutes, isSameDay, parse, startOfDay } from 'date-fns'
import { getMockBusy } from '../data/adminSeed'
import { services, weekHours } from '../data/seed'
import { SLOT_MINUTES, buildDayGrid, slotsNeeded } from './grid'
import type { Appointment, Barber, Service, Slot } from './types'
import { toDateKey } from './format'

export { SLOT_MINUTES }
export const BOOKING_WINDOW_DAYS = 21

const slotsFor = (service: Service) => slotsNeeded(service.duration)

/** Horários ocupados por agendamentos reais salvos no navegador (site do cliente). */
function bookedSet(barberId: string, dateKey: string, grid: string[], appts: Appointment[]) {
  const busy = new Set<string>()
  for (const a of appts) {
    if (a.barberId !== barberId || a.date !== dateKey || a.status === 'cancelado') continue
    const svc = services.find((s) => s.id === a.serviceId)
    const start = grid.indexOf(a.time)
    if (start === -1) continue
    const n = svc ? slotsFor(svc) : 1
    for (let i = 0; i < n; i++) if (grid[start + i]) busy.add(grid[start + i])
  }
  return busy
}

export function isBarberOff(barber: Barber, date: Date) {
  return barber.daysOff.includes(date.getDay())
}

/**
 * Horários do dia para um conjunto de barbeiros.
 * Um horário só está disponível se pelo menos um barbeiro tiver todos os
 * blocos consecutivos livres para a duração do serviço.
 */
export function getDaySlots(
  date: Date,
  barbers: Barber[],
  service: Service,
  appts: Appointment[],
  now: Date = new Date(),
): Slot[] {
  const grid = buildDayGrid(date)
  if (!grid.length) return []
  const dateKey = toDateKey(date)
  const need = slotsFor(service)

  const perBarber = barbers
    .filter((b) => !isBarberOff(b, date))
    .map((b) => {
      const booked = bookedSet(b.id, dateKey, grid, appts)
      const mock = getMockBusy(b.id, dateKey)
      return { id: b.id, busy: (t: string) => booked.has(t) || mock.has(t) }
    })

  return grid.map((time, i) => {
    const start = parse(time, 'HH:mm', date)
    const isPast = isSameDay(date, now) && start.getTime() < addMinutes(now, 30).getTime()
    const fits = i + need <= grid.length
    const barberIds =
      isPast || !fits
        ? []
        : perBarber
            .filter((b) => Array.from({ length: need }, (_, k) => grid[i + k]).every((t) => !b.busy(t)))
            .map((b) => b.id)
    return { time, available: barberIds.length > 0, barberIds }
  })
}

export interface DayOption {
  date: Date
  key: string
  closed: boolean
}

/** Próximos dias reservaveis (marca como fechado domingo e dias de folga de todos). */
export function getBookableDays(barbers: Barber[], now: Date = new Date()): DayOption[] {
  const today = startOfDay(now)
  return Array.from({ length: BOOKING_WINDOW_DAYS }, (_, i) => {
    const date = addDays(today, i)
    const open = Boolean(weekHours[date.getDay()])
    const someoneWorks = barbers.some((b) => !isBarberOff(b, date))
    return { date, key: toDateKey(date), closed: !open || !someoneWorks }
  })
}
