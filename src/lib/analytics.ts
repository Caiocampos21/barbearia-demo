import { eachDayOfInterval, endOfMonth, format, startOfMonth, subMonths } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { commissionRates, customers as seedCustomers, getExpenses, getMockVisits, getPurchases, products } from '../data/adminSeed'
import { barbers, services, weekHours } from '../data/seed'
import { buildDayGrid } from './grid'
import { loadAppointments } from './storage'
import type { Appointment, Customer, Expense, Product, Purchase, Visit } from './types'

// ───────────── Conjunto de dados do painel ─────────────
export interface Dataset {
  now: Date
  visits: Visit[]
  customers: Customer[]
  expenses: Expense[]
  purchases: Purchase[]
  products: Product[]
}

const startMs = (v: Visit) => new Date(`${v.date}T${v.time}:00`).getTime()
const serviceOf = (id: string) => services.find((s) => s.id === id)
const endMs = (v: Visit) => startMs(v) + (serviceOf(v.serviceId)?.duration ?? 30) * 60_000

/** Converte um agendamento do site (localStorage) em atendimento do painel. */
function visitFromAppointment(a: Appointment, now: Date): Visit {
  const digits = a.customerPhone.replace(/\D/g, '')
  const v: Visit = {
    id: a.id,
    date: a.date,
    time: a.time,
    serviceId: a.serviceId,
    barberId: a.barberId,
    customerId: `site-${digits}`,
    customerName: a.customerName,
    customerPhone: a.customerPhone,
    price: a.price,
    status: a.status === 'cancelado' ? 'cancelado' : a.paidAt ? 'confirmado' : 'pendente',
    source: 'site',
    paymentMethod: a.paymentMethod,
  }
  if (v.status === 'confirmado' && endMs(v) <= now.getTime()) v.status = 'concluido'
  return v
}

/** Junta a agenda mock com os agendamentos feitos no site. */
export function buildDataset(now: Date = new Date()): Dataset {
  const siteVisits = loadAppointments().map((a) => visitFromAppointment(a, now))
  const siteCustomers = new Map<string, Customer>()
  for (const v of siteVisits)
    if (!siteCustomers.has(v.customerId)) siteCustomers.set(v.customerId, { id: v.customerId, name: v.customerName, phone: v.customerPhone, birthday: '01-01' })

  return {
    now,
    visits: [...getMockVisits(now), ...siteVisits],
    customers: [...seedCustomers, ...siteCustomers.values()],
    expenses: getExpenses(now),
    purchases: getPurchases(now),
    products,
  }
}

// ───────────── Helpers ─────────────
export const monthKey = (d: Date) => format(d, 'yyyy-MM')
export const inMonth = (dateKey: string, month: Date) => dateKey.startsWith(monthKey(month))
export const monthLabel = (d: Date) => {
  const t = format(d, "MMMM 'de' yyyy", { locale: ptBR })
  return t.charAt(0).toUpperCase() + t.slice(1)
}
const sum = <T,>(list: T[], fn: (x: T) => number) => list.reduce((acc, x) => acc + fn(x), 0)
const round2 = (n: number) => Math.round(n * 100) / 100

export const isRealized = (v: Visit) => v.status === 'concluido'
export const isBooked = (v: Visit) => v.status === 'confirmado' || v.status === 'pendente'
export const isActive = (v: Visit) => v.status !== 'cancelado'

// ───────────── KPIs do período ─────────────
export interface PeriodSummary {
  revenue: number
  count: number
  ticket: number
  occupancy: number // 0..1
  booked: number // faturamento já agendado (ainda não realizado)
  bookedCount: number
}

/** Capacidade (minutos de cadeira disponíveis) entre dois instantes. */
function capacityMinutes(from: Date, to: Date) {
  let total = 0
  for (const day of eachDayOfInterval({ start: from, end: to })) {
    const hours = weekHours[day.getDay()]
    if (!hours) continue
    const grid = buildDayGrid(day)
    if (!grid.length) continue
    const open = new Date(`${format(day, 'yyyy-MM-dd')}T${hours.open}:00`).getTime()
    const close = new Date(`${format(day, 'yyyy-MM-dd')}T${hours.close}:00`).getTime()
    const lo = Math.max(open, from.getTime())
    const hi = Math.min(close, to.getTime())
    if (hi <= lo) continue
    const working = barbers.filter((b) => !b.daysOff.includes(day.getDay())).length
    total += ((hi - lo) / 60_000) * working
  }
  return total
}

export function periodSummary(ds: Dataset, from: Date, to: Date): PeriodSummary {
  const inRange = ds.visits.filter((v) => startMs(v) >= from.getTime() && startMs(v) <= to.getTime())
  const done = inRange.filter(isRealized)
  const revenue = sum(done, (v) => v.price)
  const occupiedMin = sum(done, (v) => serviceOf(v.serviceId)?.duration ?? 30)
  const capacity = capacityMinutes(from, to)
  const futureBooked = ds.visits.filter((v) => isBooked(v) && startMs(v) >= from.getTime() && startMs(v) <= endOfMonth(from).getTime())
  return {
    revenue,
    count: done.length,
    ticket: done.length ? revenue / done.length : 0,
    occupancy: capacity ? Math.min(1, occupiedMin / capacity) : 0,
    booked: sum(futureBooked, (v) => v.price),
    bookedCount: futureBooked.length,
  }
}

/** Mês atual até agora × mesmo período do mês anterior. */
export function monthToDate(ds: Dataset) {
  const from = startOfMonth(ds.now)
  const current = periodSummary(ds, from, ds.now)
  const prev = periodSummary(ds, subMonths(from, 1), subMonths(ds.now, 1))
  const delta = (a: number, b: number) => (b ? ((a - b) / b) * 100 : 0)
  return {
    current,
    prev,
    deltas: {
      revenue: delta(current.revenue, prev.revenue),
      count: delta(current.count, prev.count),
      ticket: delta(current.ticket, prev.ticket),
      occupancy: (current.occupancy - prev.occupancy) * 100, // em pontos percentuais
    },
  }
}

// ───────────── Séries para gráficos ─────────────
export function revenueByDay(ds: Dataset, month: Date) {
  const days = eachDayOfInterval({ start: startOfMonth(month), end: endOfMonth(month) })
  const todayKey = format(ds.now, 'yyyy-MM-dd')
  return days.map((d) => {
    const key = format(d, 'yyyy-MM-dd')
    const day = ds.visits.filter((v) => v.date === key)
    if (!weekHours[d.getDay()]) return { key, label: format(d, 'd'), full: format(d, "EEE, d 'de' MMM", { locale: ptBR }), receita: null, agendado: null }
    const realized = sum(day.filter(isRealized), (v) => v.price)
    const booked = sum(day.filter(isBooked), (v) => v.price)
    return {
      key,
      label: format(d, 'd'),
      full: format(d, "EEE, d 'de' MMM", { locale: ptBR }),
      receita: key <= todayKey ? realized : null,
      agendado: key >= todayKey ? booked + (key === todayKey ? realized : 0) : null,
    }
  })
}

export function lastMonths(now: Date, n: number) {
  return Array.from({ length: n }, (_, i) => startOfMonth(subMonths(now, n - 1 - i)))
}

export const shortMonth = (d: Date) => format(d, 'MMM', { locale: ptBR }).replace('.', '')

export function commissionOf(visits: Visit[]) {
  return sum(visits.filter(isRealized), (v) => v.price * (commissionRates[v.barberId] ?? 0.4))
}

export function monthlyFinance(ds: Dataset, n = 6) {
  return lastMonths(ds.now, n).map((m) => {
    const visits = ds.visits.filter((v) => inMonth(v.date, m))
    const receita = sum(visits.filter(isRealized), (v) => v.price)
    const fixas = sum(ds.expenses.filter((e) => inMonth(e.date, m)), (e) => e.amount)
    const produtos = sum(ds.purchases.filter((p) => inMonth(p.date, m)), (p) => p.total)
    const comissoes = commissionOf(visits)
    const despesas = fixas + produtos + comissoes
    return {
      key: monthKey(m),
      label: shortMonth(m),
      receita: round2(receita),
      despesas: round2(despesas),
      lucro: round2(receita - despesas),
      atendimentos: visits.filter(isRealized).length,
    }
  })
}

export function topServices(ds: Dataset, month: Date) {
  const done = ds.visits.filter((v) => inMonth(v.date, month) && isRealized(v))
  const total = sum(done, (v) => v.price) || 1
  return services
    .map((s) => {
      const list = done.filter((v) => v.serviceId === s.id)
      const revenue = sum(list, (v) => v.price)
      return { id: s.id, name: s.name, count: list.length, revenue, share: revenue / total }
    })
    .filter((s) => s.count > 0)
    .sort((a, b) => b.revenue - a.revenue)
}

// ───────────── Financeiro ─────────────
export function expensesByCategory(ds: Dataset, month: Date) {
  const map = new Map<string, number>()
  for (const e of ds.expenses.filter((e) => inMonth(e.date, month))) map.set(e.category, (map.get(e.category) ?? 0) + e.amount)
  map.set('Produtos e estoque', sum(ds.purchases.filter((p) => inMonth(p.date, month)), (p) => p.total))
  map.set('Comissões da equipe', commissionOf(ds.visits.filter((v) => inMonth(v.date, month))))
  return [...map.entries()]
    .map(([name, value]) => ({ name, value: round2(value) }))
    .filter((x) => x.value > 0)
    .sort((a, b) => b.value - a.value)
}

export function productSpend(ds: Dataset, month: Date) {
  const list = ds.purchases.filter((p) => inMonth(p.date, month))
  return ds.products
    .map((p) => {
      const mine = list.filter((x) => x.productId === p.id)
      return { id: p.id, name: p.name, category: p.category, qty: sum(mine, (x) => x.qty), total: round2(sum(mine, (x) => x.total)) }
    })
    .filter((p) => p.total > 0)
    .sort((a, b) => b.total - a.total)
}

// ───────────── Barbeiros ─────────────
export function barberStats(ds: Dataset, month: Date) {
  const monthVisits = ds.visits.filter((v) => inMonth(v.date, month))
  const total = sum(monthVisits.filter(isRealized), (v) => v.price) || 1
  return barbers
    .map((b) => {
      const mine = monthVisits.filter((v) => v.barberId === b.id)
      const done = mine.filter(isRealized)
      const revenue = sum(done, (v) => v.price)
      const rated = ds.visits.filter((v) => v.barberId === b.id && v.rating)
      const rating = rated.length ? sum(rated, (v) => v.rating ?? 0) / rated.length : b.rating
      const rate = commissionRates[b.id] ?? 0.4
      return {
        id: b.id,
        name: b.name,
        initials: b.initials,
        role: b.role,
        gradient: b.gradient,
        count: done.length,
        revenue,
        ticket: done.length ? revenue / done.length : 0,
        rate,
        commission: revenue * rate,
        rating,
        ratings: rated.length,
        share: revenue / total,
        upcoming: mine.filter(isBooked).length,
      }
    })
    .sort((a, b) => b.revenue - a.revenue)
}

/** Faturamento mensal de cada barbeiro (para o gráfico de evolução). */
export function barberMonthly(ds: Dataset, n = 6) {
  return lastMonths(ds.now, n).map((m) => {
    const row: Record<string, string | number> = { key: monthKey(m), label: shortMonth(m) }
    for (const b of barbers) row[b.id] = sum(ds.visits.filter((v) => v.barberId === b.id && inMonth(v.date, m) && isRealized(v)), (v) => v.price)
    return row
  })
}

// ───────────── Clientes ─────────────
export interface CustomerStat {
  id: string
  name: string
  phone: string
  birthday: string
  visits: number
  spent: number
  ticket: number
  firstVisit?: string
  lastVisit?: string
  nextVisit?: string
  favoriteService?: string
  history: Visit[]
  source: 'site' | 'balcao'
}

export function customerStats(ds: Dataset): CustomerStat[] {
  const byCustomer = new Map<string, Visit[]>()
  for (const v of ds.visits) {
    if (!isActive(v)) continue
    const list = byCustomer.get(v.customerId) ?? []
    list.push(v)
    byCustomer.set(v.customerId, list)
  }
  return ds.customers
    .map((c) => {
      const all = (byCustomer.get(c.id) ?? []).sort((a, b) => startMs(a) - startMs(b))
      const done = all.filter(isRealized)
      const spent = sum(done, (v) => v.price)
      const counts = new Map<string, number>()
      done.forEach((v) => counts.set(v.serviceId, (counts.get(v.serviceId) ?? 0) + 1))
      const fav = [...counts.entries()].sort((a, b) => b[1] - a[1])[0]?.[0]
      return {
        ...c,
        visits: done.length,
        spent,
        ticket: done.length ? spent / done.length : 0,
        firstVisit: done[0]?.date,
        lastVisit: done.at(-1)?.date,
        nextVisit: all.find((v) => isBooked(v))?.date,
        favoriteService: fav ? serviceOf(fav)?.name : undefined,
        history: [...all].reverse(),
        source: all.some((v) => v.source === 'site') ? ('site' as const) : ('balcao' as const),
      }
    })
    .filter((c) => c.history.length > 0)
}

export function customerMonthSplit(ds: Dataset, stats: CustomerStat[], month: Date) {
  const active = stats.filter((c) => ds.visits.some((v) => v.customerId === c.id && isRealized(v) && inMonth(v.date, month)))
  const novos = active.filter((c) => c.firstVisit && inMonth(c.firstVisit, month))
  return { active: active.length, novos: novos.length, recorrentes: active.length - novos.length }
}

export function birthdaysOfMonth(stats: CustomerStat[], month: Date) {
  const mm = format(month, 'MM')
  return stats
    .filter((c) => c.birthday.startsWith(mm) && !c.id.startsWith('site-'))
    .sort((a, b) => a.birthday.localeCompare(b.birthday))
}

// ───────────── Estoque ─────────────
export const stockLevel = (p: Product) => (p.qty <= p.minQty * 0.5 ? 'critico' : p.qty < p.minQty ? 'baixo' : 'ok')

// ───────────── Agenda ─────────────
export const visitsOnDay = (ds: Dataset, dateKey: string) => ds.visits.filter((v) => v.date === dateKey && isActive(v)).sort((a, b) => a.time.localeCompare(b.time))

export function upcomingToday(ds: Dataset, limit = 6) {
  const todayKey = format(ds.now, 'yyyy-MM-dd')
  return visitsOnDay(ds, todayKey)
    .filter((v) => endMs(v) > ds.now.getTime())
    .slice(0, limit)
}
