import { addDays, differenceInCalendarDays, format, parseISO, startOfWeek } from 'date-fns'
import { commissionRates } from '../data/adminSeed'
import { barbers, services, weekHours } from '../data/seed'
import { type Dataset, inMonth, isActive, isBooked, isRealized, lastMonths, monthKey, shortMonth, visitsOnDay } from './analytics'
import type { Visit } from './types'

// Visão de um barbeiro só: reaproveita o mesmo Dataset do painel do dono, então os números sempre batem.

const sum = <T,>(list: T[], pick: (item: T) => number) => list.reduce((acc, item) => acc + pick(item), 0)

export const rateOf = (barberId: string) => commissionRates[barberId] ?? 0.4
export const visitStart = (v: Visit) => new Date(`${v.date}T${v.time}:00`)
export const visitEnd = (v: Visit) => new Date(visitStart(v).getTime() + (services.find((s) => s.id === v.serviceId)?.duration ?? 30) * 60_000)

export type Phase = 'done' | 'now' | 'next'
export function phaseOf(v: Visit, now: Date): Phase {
  if (v.status === 'concluido') return 'done'
  return visitStart(v) <= now && now < visitEnd(v) ? 'now' : 'next'
}

export const barberDay = (ds: Dataset, barberId: string, dateKey: string) => visitsOnDay(ds, dateKey).filter((v) => v.barberId === barberId)

export function dayTotals(visits: Visit[], barberId: string) {
  const done = visits.filter(isRealized)
  const revenue = sum(done, (v) => v.price)
  return { done: done.length, total: visits.length, revenue, commission: revenue * rateOf(barberId) }
}

/** Atendimento em andamento ou o próximo a acontecer (hoje ou em outro dia). */
export function nextVisit(ds: Dataset, barberId: string) {
  return ds.visits
    .filter((v) => v.barberId === barberId && isBooked(v) && visitEnd(v) > ds.now)
    .sort((a, b) => visitStart(a).getTime() - visitStart(b).getTime())[0]
}

export interface WeekDay {
  date: Date
  key: string
  state: 'open' | 'off' | 'closed'
  visits: Visit[]
}

/** Segunda a domingo da semana `offset` (0 = atual). */
export function barberWeek(ds: Dataset, barberId: string, offset: number): WeekDay[] {
  const barber = barbers.find((b) => b.id === barberId)
  const monday = addDays(startOfWeek(ds.now, { weekStartsOn: 1 }), offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const date = addDays(monday, i)
    const key = format(date, 'yyyy-MM-dd')
    const state = !weekHours[date.getDay()] ? 'closed' : barber?.daysOff.includes(date.getDay()) ? 'off' : 'open'
    return { date, key, state, visits: barberDay(ds, barberId, key) }
  })
}

export function barberMonth(ds: Dataset, barberId: string, month: Date) {
  const mine = ds.visits.filter((v) => v.barberId === barberId && inMonth(v.date, month))
  const done = mine.filter(isRealized)
  const booked = mine.filter(isBooked)
  const revenue = sum(done, (v) => v.price)
  const scheduled = sum(booked, (v) => v.price)
  const rate = rateOf(barberId)
  return {
    count: done.length,
    revenue,
    commission: revenue * rate,
    ticket: done.length ? revenue / done.length : 0,
    scheduled,
    scheduledCommission: scheduled * rate,
    scheduledCount: booked.length,
    rate,
  }
}

/** Últimos meses (o último é o mês atual, parcial). */
export function barberHistory(ds: Dataset, barberId: string, n = 4) {
  return lastMonths(ds.now, n).map((m) => {
    const r = barberMonth(ds, barberId, m)
    return { key: monthKey(m), label: shortMonth(m), revenue: Math.round(r.revenue), commission: Math.round(r.commission), count: r.count }
  })
}

/** Meta do mês: média dos meses fechados + 6%, arredondada para R$ 100. */
export function monthlyGoal(history: ReturnType<typeof barberHistory>) {
  const closed = history.slice(0, -1)
  const avg = closed.length ? sum(closed, (h) => h.revenue) / closed.length : 0
  return Math.round((avg * 1.06) / 100) * 100
}

export interface BarberClient {
  id: string
  name: string
  phone: string
  birthday?: string
  visits: number
  spent: number
  lastVisit?: string
  daysSince?: number
  nextVisit?: string
}

/** Clientes que este barbeiro já atendeu (ou tem agendado), do mais recente para o mais antigo. */
export function barberClients(ds: Dataset, barberId: string): BarberClient[] {
  const info = new Map(ds.customers.map((c) => [c.id, c]))
  const byCustomer = new Map<string, Visit[]>()
  for (const v of ds.visits) {
    if (v.barberId !== barberId || !isActive(v)) continue
    byCustomer.set(v.customerId, [...(byCustomer.get(v.customerId) ?? []), v])
  }
  return [...byCustomer.entries()]
    .map(([id, list]) => {
      const done = list.filter(isRealized).sort((a, b) => a.date.localeCompare(b.date))
      const last = done.at(-1)?.date
      const next = list.filter(isBooked).sort((a, b) => a.date.localeCompare(b.date))[0]?.date
      const first = list[0]
      return {
        id,
        name: first.customerName,
        phone: first.customerPhone,
        birthday: info.get(id)?.birthday,
        visits: done.length,
        spent: sum(done, (v) => v.price),
        lastVisit: last,
        daysSince: last ? differenceInCalendarDays(ds.now, parseISO(last)) : undefined,
        nextVisit: next,
      }
    })
    .sort((a, b) => (b.lastVisit ?? '').localeCompare(a.lastVisit ?? ''))
}
