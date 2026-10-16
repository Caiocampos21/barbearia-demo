// Dados MOCK do painel do dono. Tudo é gerado de forma determinística e relativa a "hoje",
// então o mês atual nunca fica vazio. Para usar dados reais, substitua as funções deste arquivo.
import { addDays, addMonths, format, parseISO, startOfDay, startOfMonth, subDays } from 'date-fns'
import { buildDayGrid, hash01, slotsNeeded } from '../lib/grid'
import type { Customer, Expense, Product, Purchase, Visit } from '../lib/types'
import { barbers, services } from './seed'

/** Comissão paga a cada barbeiro sobre o faturamento gerado. */
export const commissionRates: Record<string, number> = { rafael: 0.5, thiago: 0.45, bruno: 0.4, leo: 0.4 }

const HISTORY_DAYS = 420 // > 1 ano de histórico: assim "novo × recorrente" não é distorcido pelo início dos dados
const FUTURE_DAYS = 30

// Peso de cada serviço no mix de vendas (soma = 1).
const serviceWeights: [string, number][] = [
  ['corte', 0.33],
  ['combo', 0.2],
  ['barba', 0.17],
  ['hidratacao', 0.11],
  ['pezinho', 0.1],
  ['sobrancelha', 0.09],
]

const firstNames = ['Lucas', 'Gabriel', 'Mateus', 'Pedro', 'João', 'Rafael', 'Bruno', 'Felipe', 'Gustavo', 'Henrique', 'Rodrigo', 'Thiago', 'André', 'Leonardo', 'Daniel', 'Vinícius', 'Eduardo', 'Marcelo', 'Fernando', 'Ricardo', 'Diego', 'Samuel', 'Caio', 'Arthur', 'Davi', 'Renato', 'Alexandre', 'Matheus', 'Otávio', 'Luiz', 'Igor', 'Murilo', 'Victor', 'Paulo', 'Sérgio']
const lastNames = ['Silva', 'Souza', 'Oliveira', 'Santos', 'Pereira', 'Costa', 'Rodrigues', 'Almeida', 'Nascimento', 'Lima', 'Araújo', 'Fernandes', 'Carvalho', 'Gomes', 'Martins', 'Rocha', 'Ribeiro', 'Alves', 'Monteiro', 'Mendes', 'Barros', 'Freitas', 'Barbosa', 'Pinto', 'Moreira', 'Cavalcanti', 'Dias', 'Castro', 'Campos', 'Cardoso', 'Teixeira', 'Machado']

const CUSTOMER_COUNT = 900 // ~1.200 atendimentos/mês ≈ 1,3 visita por cliente ao mês

export const customers: Customer[] = Array.from({ length: CUSTOMER_COUNT }, (_, i) => {
  // pares (nome, sobrenome) únicos: 35 × 32 combinações
  const first = firstNames[(i * 13) % firstNames.length]
  const last = lastNames[(Math.floor(i / firstNames.length) * 5) % lastNames.length]
  const month = 1 + Math.floor(hash01(`bm${i}`) * 12)
  const day = 1 + Math.floor(hash01(`bd${i}`) * 28)
  const n = Math.floor(10000000 + hash01(`ph${i}`) * 89999999)
  return {
    id: `c${String(i + 1).padStart(4, '0')}`,
    name: `${first} ${last}`,
    phone: `(31) 9${String(n).slice(0, 4)}-${String(n).slice(4, 8)}`,
    birthday: `${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
  }
})

/** Dia (relativo a hoje) em que cada cliente passou a frequentar. Metade já era da casa antes do histórico. */
const joinedOffset = customers.map((_, i) => (hash01(`jn${i}`) < 0.5 ? -HISTORY_DAYS - 1 : -Math.floor(hash01(`jd${i}`) * HISTORY_DAYS)))
const permute = (i: number) => (i * 377) % CUSTOMER_COUNT // embaralha, mas mantém o viés de "clientes frequentes"

/** Escolhe quem foi atendido, só entre clientes que já frequentavam a barbearia naquele dia. */
function pickCustomer(key: string, offset: number) {
  for (let attempt = 0; attempt < 8; attempt++) {
    const idx = permute(Math.floor(Math.pow(hash01(`${key}|cust${attempt}`), 1.35) * CUSTOMER_COUNT))
    if (joinedOffset[idx] <= offset) return customers[idx]
  }
  return customers[permute(Math.floor(hash01(`${key}|fb`) * CUSTOMER_COUNT * 0.1))] // clientes antigos
}

const pickService = (key: string) => {
  let r = hash01(key)
  for (const [id, w] of serviceWeights) {
    if ((r -= w) < 0) return services.find((s) => s.id === id)!
  }
  return services[0]
}

// ───────────── Atendimentos (mock) ─────────────
let visitsCache: { key: string; visits: Visit[] } | null = null

/**
 * Gera a agenda de todos os barbeiros. É a ÚNICA fonte de horários ocupados:
 * o site do cliente e o painel enxergam exatamente a mesma agenda.
 */
export function getMockVisits(now: Date = new Date()): Visit[] {
  const todayKey = format(now, 'yyyy-MM-dd')
  if (visitsCache?.key === todayKey) return visitsCache.visits

  const today = startOfDay(now)
  const visits: Visit[] = []

  for (let offset = -HISTORY_DAYS; offset <= FUTURE_DAYS; offset++) {
    const date = addDays(today, offset)
    const dateKey = format(date, 'yyyy-MM-dd')
    const grid = buildDayGrid(date)
    if (!grid.length) continue

    for (const barber of barbers) {
      if (barber.daysOff.includes(date.getDay())) continue
      const taken = new Set<number>()

      grid.forEach((time, i) => {
        if (taken.has(i)) return
        const hour = Number(time.slice(0, 2))
        const peak = hour === 12 || hour === 13 || hour >= 17 ? 0.2 : 0
        const weekend = date.getDay() === 6 ? 0.1 : 0
        const key = `${barber.id}|${dateKey}|${time}`
        if (hash01(key) >= 0.42 + peak + weekend) return

        const service = pickService(`${key}|svc`)
        const need = slotsNeeded(service.duration)
        if (i + need > grid.length) return
        for (let k = 0; k < need; k++) taken.add(i + k)

        const cust = pickCustomer(key, offset)
        const startMs = new Date(`${dateKey}T${time}:00`).getTime()
        const endMs = startMs + service.duration * 60_000

        let status: Visit['status'] = 'confirmado'
        if (endMs <= now.getTime()) status = hash01(`${key}|cx`) < 0.04 ? 'cancelado' : 'concluido'

        // ~40% dos atendimentos concluídos têm avaliação; a média acompanha a nota do barbeiro
        let rating: number | undefined
        if (status === 'concluido' && hash01(`${key}|rt`) < 0.4) {
          const r = hash01(`${key}|rv`)
          rating = r < barber.rating - 4 ? 5 : r < barber.rating - 4 + 0.07 ? 3 : 4
        }

        visits.push({
          id: `m-${barber.id}-${dateKey}-${time}`,
          date: dateKey,
          time,
          serviceId: service.id,
          barberId: barber.id,
          customerId: cust.id,
          customerName: cust.name,
          customerPhone: cust.phone,
          price: service.price,
          status,
          source: 'balcao',
          rating,
          paymentMethod: hash01(`${key}|pay`) < 0.55 ? 'pix' : 'cartao',
        })
      })
    }
  }

  visitsCache = { key: todayKey, visits }
  return visits
}

let busyCache: { key: string; map: Map<string, Set<string>> } | null = null

/** Horários (HH:mm) ocupados por barbeiro e dia, a partir da agenda mock. */
export function getMockBusy(barberId: string, dateKey: string): Set<string> {
  const todayKey = format(new Date(), 'yyyy-MM-dd')
  if (busyCache?.key !== todayKey) {
    const map = new Map<string, Set<string>>()
    for (const v of getMockVisits()) {
      const svc = services.find((s) => s.id === v.serviceId)!
      const grid = buildDayGrid(parseISO(v.date))
      const start = grid.indexOf(v.time)
      const k = `${v.barberId}|${v.date}`
      const set = map.get(k) ?? new Set<string>()
      for (let i = 0; i < slotsNeeded(svc.duration); i++) if (grid[start + i]) set.add(grid[start + i])
      map.set(k, set)
    }
    busyCache = { key: todayKey, map }
  }
  return busyCache.map.get(`${barberId}|${dateKey}`) ?? new Set()
}

// ───────────── Produtos e compras ─────────────
export const products: Product[] = [
  { id: 'p01', name: 'Pomada Modeladora Matte', category: 'Finalização', unit: 'pote', qty: 14, minQty: 8, unitCost: 26.9, supplier: 'Barber Brasil' },
  { id: 'p02', name: 'Pomada Efeito Brilho', category: 'Finalização', unit: 'pote', qty: 6, minQty: 8, unitCost: 29.5, supplier: 'Barber Brasil' },
  { id: 'p03', name: 'Cera Modeladora', category: 'Finalização', unit: 'pote', qty: 11, minQty: 6, unitCost: 24.0, supplier: 'Barber Brasil' },
  { id: 'p04', name: 'Óleo para Barba (30 ml)', category: 'Barba', unit: 'frasco', qty: 3, minQty: 6, unitCost: 21.8, supplier: 'Don Alcides' },
  { id: 'p05', name: 'Balm Pós-barba', category: 'Barba', unit: 'pote', qty: 9, minQty: 5, unitCost: 19.9, supplier: 'Don Alcides' },
  { id: 'p06', name: 'Creme de Barbear', category: 'Barba', unit: 'tubo', qty: 12, minQty: 6, unitCost: 15.5, supplier: 'Don Alcides' },
  { id: 'p07', name: 'Shampoo Profissional (1 L)', category: 'Cabelo', unit: 'galão', qty: 5, minQty: 3, unitCost: 48.0, supplier: 'Distribuidora Minas Hair' },
  { id: 'p08', name: 'Máscara de Hidratação (500 g)', category: 'Cabelo', unit: 'pote', qty: 4, minQty: 4, unitCost: 62.0, supplier: 'Distribuidora Minas Hair' },
  { id: 'p09', name: 'Lâminas Descartáveis (cx 100)', category: 'Descartáveis', unit: 'caixa', qty: 2, minQty: 5, unitCost: 38.0, supplier: 'Distribuidora Minas Hair' },
  { id: 'p10', name: 'Toalhas Descartáveis (pct 100)', category: 'Descartáveis', unit: 'pacote', qty: 7, minQty: 4, unitCost: 22.0, supplier: 'Distribuidora Minas Hair' },
  { id: 'p11', name: 'Talco Pós-corte', category: 'Finalização', unit: 'pote', qty: 4, minQty: 5, unitCost: 12.9, supplier: 'Barber Brasil' },
  { id: 'p12', name: 'Spray Fixador', category: 'Finalização', unit: 'frasco', qty: 10, minQty: 5, unitCost: 17.5, supplier: 'Barber Brasil' },
  { id: 'p13', name: 'Cerveja Cortesia (cx 12)', category: 'Cortesia', unit: 'caixa', qty: 5, minQty: 8, unitCost: 54.0, supplier: 'Atacadão BH' },
  { id: 'p14', name: 'Café em Cápsulas (cx 50)', category: 'Cortesia', unit: 'caixa', qty: 6, minQty: 3, unitCost: 46.0, supplier: 'Atacadão BH' },
]

/** Compras de produtos dos últimos 6 meses (alimentam o "gasto por produto"). */
export function getPurchases(now: Date = new Date()): Purchase[] {
  const out: Purchase[] = []
  const thisMonth = startOfMonth(now)
  products.forEach((p, idx) => {
    const every = idx % 3 === 0 ? 1 : 2 // alguns produtos giram mais rápido
    for (let m = 0; m < 6; m++) {
      if ((m + (idx % 2)) % every !== 0 && m !== 0) continue
      const monthStart = addMonths(thisMonth, -m)
      const day = 2 + Math.floor(hash01(`pd${p.id}${m}`) * 24)
      const date = addDays(monthStart, day - 1)
      if (date > now) continue
      const qty = Math.max(2, Math.round((p.minQty + 2) * (0.8 + hash01(`pq${p.id}${m}`) * 0.8)))
      const total = qty * p.unitCost * (0.95 + hash01(`pt${p.id}${m}`) * 0.1)
      out.push({ id: `pu-${p.id}-${m}`, date: format(date, 'yyyy-MM-dd'), productId: p.id, qty, total: Math.round(total * 100) / 100 })
    }
  })
  return out
}

// ───────────── Despesas fixas e variáveis ─────────────
const fixedExpenses: { category: string; description: string; day: number; base: number; vary: number }[] = [
  { category: 'Aluguel', description: 'Aluguel do ponto — Savassi', day: 5, base: 4800, vary: 0 },
  { category: 'Energia e água', description: 'Conta de luz', day: 10, base: 640, vary: 0.18 },
  { category: 'Energia e água', description: 'Conta de água', day: 12, base: 190, vary: 0.12 },
  { category: 'Internet e sistemas', description: 'Internet fibra + telefonia', day: 8, base: 169, vary: 0 },
  { category: 'Contabilidade', description: 'Honorários contábeis', day: 15, base: 480, vary: 0 },
  { category: 'Marketing', description: 'Anúncios Instagram e Google', day: 14, base: 700, vary: 0.25 },
  { category: 'Limpeza e higiene', description: 'Faxina e materiais de limpeza', day: 6, base: 420, vary: 0.1 },
  { category: 'Manutenção', description: 'Manutenção de equipamentos e cadeiras', day: 20, base: 260, vary: 0.6 },
]

export function getExpenses(now: Date = new Date()): Expense[] {
  const out: Expense[] = []
  const thisMonth = startOfMonth(now)
  for (let m = 0; m < 6; m++) {
    const monthStart = addMonths(thisMonth, -m)
    fixedExpenses.forEach((e, i) => {
      const date = addDays(monthStart, e.day - 1)
      if (date > now) return
      const amount = e.base * (1 + (hash01(`ex${i}${m}`) - 0.5) * 2 * e.vary)
      out.push({ id: `ex-${i}-${m}`, date: format(date, 'yyyy-MM-dd'), category: e.category, description: e.description, amount: Math.round(amount * 100) / 100 })
    })
  }
  return out
}

export const daysAgo = (n: number, now: Date = new Date()) => format(subDays(now, n), 'yyyy-MM-dd')
