import { format, parseISO } from 'date-fns'
import { Cake, ChevronDown, Globe, Repeat, Search, UserPlus, Users, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Card from '../../components/admin/Card'
import ChartTooltip from '../../components/admin/ChartTooltip'
import { axisProps, chartColors } from '../../components/admin/chartTheme'
import KpiCard from '../../components/admin/KpiCard'
import PageHeader from '../../components/admin/PageHeader'
import { HISTORY_MONTHS } from '../../data/adminSeed'
import { barbers, services } from '../../data/seed'
import { useAdminData } from '../../hooks/useAdminData'
import { birthdaysOfMonth, customerMonthSplit, customerStats, inMonth, isRealized, lastMonths, monthKey, monthLabel, shortMonth, type CustomerStat } from '../../lib/analytics'
import { formatBRL, formatBRL0, shortDate } from '../../lib/format'

type Filter = 'todos' | 'novos' | 'recorrentes' | 'ocasionais' | 'site'
type Sort = 'recentes' | 'gasto' | 'visitas'

const filters: { id: Filter; label: string }[] = [
  { id: 'todos', label: 'Todos' },
  { id: 'novos', label: 'Novos' },
  { id: 'recorrentes', label: 'Recorrentes' },
  { id: 'ocasionais', label: 'Ocasionais' },
  { id: 'site', label: 'Pelo site' },
]

const statusLabel: Record<string, string> = { concluido: 'Concluído', confirmado: 'Agendado', pendente: 'Aguardando pgto.', cancelado: 'Cancelado' }

function kind(c: CustomerStat, now: Date): 'novo' | 'recorrente' | 'ocasional' {
  if (c.firstVisit && inMonth(c.firstVisit, now)) return 'novo'
  return c.visits >= 3 ? 'recorrente' : 'ocasional'
}

const Badge = ({ k }: { k: 'novo' | 'recorrente' | 'ocasional' }) => {
  const style = { novo: 'bg-gold-500/15 text-gold-300', recorrente: 'bg-success/15 text-success', ocasional: 'bg-white/8 text-ink-300' }[k]
  const label = { novo: 'Novo', recorrente: 'Recorrente', ocasional: 'Ocasional' }[k]
  return <span className={`rounded-pill px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${style}`}>{label}</span>
}

export default function Customers() {
  const ds = useAdminData()
  const stats = useMemo(() => customerStats(ds), [ds])
  const [filter, setFilter] = useState<Filter>('todos')
  const [sort, setSort] = useState<Sort>('recentes')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [limit, setLimit] = useState(12)

  const split = customerMonthSplit(ds, stats, ds.now)
  const monthRevenue = ds.visits.filter((v) => inMonth(v.date, ds.now) && isRealized(v)).reduce((a, v) => a + v.price, 0)
  const returnRate = split.active ? split.recorrentes / split.active : 0
  const history = lastMonths(ds.now, HISTORY_MONTHS).map((m) => {
    const s = customerMonthSplit(ds, stats, m)
    return { key: monthKey(m), label: shortMonth(m), novos: s.novos, recorrentes: s.recorrentes }
  })
  const birthdays = birthdaysOfMonth(stats, ds.now)
  const todayMD = format(ds.now, 'MM-dd')
  const top = [...stats].sort((a, b) => b.spent - a.spent).slice(0, 5)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return stats
      .filter((c) => {
        if (q && !c.name.toLowerCase().includes(q) && !c.phone.includes(q)) return false
        if (filter === 'site') return c.source === 'site'
        if (filter === 'todos') return true
        return kind(c, ds.now) === { novos: 'novo', recorrentes: 'recorrente', ocasionais: 'ocasional' }[filter]
      })
      .sort((a, b) => (sort === 'gasto' ? b.spent - a.spent : sort === 'visitas' ? b.visits - a.visits : (b.lastVisit ?? '').localeCompare(a.lastVisit ?? '')))
  }, [stats, filter, sort, query, ds.now])

  return (
    <>
      <PageHeader title="Clientes" subtitle={`${stats.length} clientes na base · movimento de ${monthLabel(ds.now)}.`} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard label="Clientes atendidos" icon={Users} value={split.active} format={(n) => Math.round(n).toString()} hint="neste mês" />
        <KpiCard label="Novos clientes" icon={UserPlus} value={split.novos} format={(n) => Math.round(n).toString()} hint="primeira visita no mês" delay={80} />
        <KpiCard label="Taxa de retorno" icon={Repeat} value={returnRate * 100} format={(n) => `${n.toFixed(0)}%`} hint={`${split.recorrentes} já eram clientes`} delay={160} />
        <KpiCard label="Gasto médio / cliente" icon={Wallet} value={split.active ? monthRevenue / split.active : 0} format={formatBRL} hint="no mês" delay={240} />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card title="Novos × recorrentes" subtitle="Clientes atendidos por mês" className="xl:col-span-2">
          <ul className="mb-3 flex gap-5 text-xs text-ink-300">
            <li className="flex items-center gap-2"><span className="size-2.5 rounded-sm" style={{ background: chartColors.categorical[0] }} />Recorrentes</li>
            <li className="flex items-center gap-2"><span className="size-2.5 rounded-sm" style={{ background: chartColors.categorical[1] }} />Novos</li>
          </ul>
          <div className="h-64" role="img" aria-label="Gráfico de barras empilhadas de clientes recorrentes e novos por mês">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="30%">
                <CartesianGrid stroke={chartColors.grid} vertical={false} />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis {...axisProps} width={36} allowDecimals={false} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTooltip names={{ recorrentes: 'Recorrentes', novos: 'Novos' }} />} />
                <Bar dataKey="recorrentes" stackId="c" fill={chartColors.categorical[0]} stroke={chartColors.surface} strokeWidth={2} />
                <Bar dataKey="novos" stackId="c" fill={chartColors.categorical[1]} stroke={chartColors.surface} strokeWidth={2} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Aniversariantes do mês" subtitle={birthdays.length ? `${birthdays.length} clientes fazem aniversário` : undefined}>
          {birthdays.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/12 p-6 text-center text-sm text-ink-300">Nenhum aniversariante neste mês.</p>
          ) : (
            <ul className="max-h-72 space-y-2 overflow-y-auto pr-1">
              {birthdays.map((c) => (
                <li key={c.id} className="flex items-center gap-3 rounded-xl bg-ink-800/60 p-3">
                  <span className={`grid size-10 shrink-0 place-items-center rounded-xl text-center font-display text-lg font-bold leading-none ${c.birthday === todayMD ? 'bg-gold-500 text-ink-950' : 'bg-gold-500/10 text-gold-400'}`}>
                    {c.birthday.slice(3)}
                  </span>
                  <span className="min-w-0 flex-1 text-sm leading-tight">
                    <strong className="block truncate text-ink-100">{c.name}</strong>
                    <span className="text-xs text-ink-400">{c.phone}</span>
                  </span>
                  {c.birthday === todayMD && (
                    <span className="flex shrink-0 items-center gap-1 text-xs font-bold text-gold-300">
                      <Cake className="size-4" aria-hidden />
                      hoje!
                    </span>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      <Card title="Melhores clientes" subtitle="Quem mais gastou na barbearia" className="mt-6">
        <ol className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          {top.map((c, i) => (
            <li key={c.id} className="rounded-xl border border-white/8 bg-ink-800/50 p-4">
              <p className="text-xs font-bold text-gold-500">#{i + 1}</p>
              <p className="mt-1 truncate font-semibold text-ink-100">{c.name}</p>
              <p className="mt-2 font-display text-2xl font-bold tabular-nums text-gold-400">{formatBRL0(c.spent)}</p>
              <p className="text-xs text-ink-400">
                {c.visits} visitas · ticket {formatBRL(c.ticket)}
              </p>
            </li>
          ))}
        </ol>
      </Card>

      {/* Lista com busca */}
      <Card title="Base de clientes" subtitle={`${list.length} resultados`} className="mt-6">
        <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Buscar cliente</span>
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gold-500" aria-hidden />
            <input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setLimit(12)
              }}
              placeholder="Buscar por nome ou telefone"
              className="h-11 w-full rounded-pill border border-white/12 bg-ink-950 pl-11 pr-4 text-sm text-ink-100 placeholder:text-ink-500 focus:border-gold-400 focus:outline-none"
            />
          </label>
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                aria-pressed={filter === f.id}
                onClick={() => {
                  setFilter(f.id)
                  setLimit(12)
                }}
                className={`h-11 shrink-0 rounded-pill border px-4 text-sm font-semibold transition-colors ${filter === f.id ? 'border-gold-400 bg-gold-500 text-ink-950' : 'border-white/12 text-ink-200 hover:border-gold-500/50'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} aria-label="Ordenar por" className="h-11 rounded-pill border border-white/12 bg-ink-950 px-4 text-sm font-semibold text-ink-100 focus:border-gold-400 focus:outline-none">
            <option value="recentes">Mais recentes</option>
            <option value="gasto">Maior gasto</option>
            <option value="visitas">Mais visitas</option>
          </select>
        </div>

        <div className="hidden grid-cols-[2fr_0.7fr_1fr_1fr_1fr_2rem] gap-3 px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-ink-400 md:grid">
          <span>Cliente</span>
          <span className="text-right">Visitas</span>
          <span className="text-right">Ticket</span>
          <span className="text-right">Total gasto</span>
          <span className="text-right">Última visita</span>
          <span />
        </div>

        <ul className="divide-y divide-white/6">
          {list.slice(0, limit).map((c) => {
            const isOpen = open === c.id
            const k = kind(c, ds.now)
            return (
              <li key={c.id}>
                <button type="button" onClick={() => setOpen(isOpen ? null : c.id)} aria-expanded={isOpen} className="grid w-full grid-cols-[1fr_auto] items-center gap-3 rounded-xl px-3 py-3 text-left hover:bg-white/4 md:grid-cols-[2fr_0.7fr_1fr_1fr_1fr_2rem]">
                  <span className="min-w-0">
                    <span className="flex flex-wrap items-center gap-2">
                      <strong className="truncate text-ink-100">{c.name}</strong>
                      <Badge k={k} />
                      {c.source === 'site' && (
                        <span className="inline-flex items-center gap-1 rounded-pill bg-gold-500/15 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-gold-300">
                          <Globe className="size-3" aria-hidden />
                          site
                        </span>
                      )}
                    </span>
                    <span className="text-xs text-ink-400">
                      {c.phone}
                      <span className="md:hidden"> · {c.visits} visitas · {formatBRL0(c.spent)}</span>
                    </span>
                  </span>
                  <span className="hidden text-right tabular-nums text-ink-200 md:block">{c.visits}</span>
                  <span className="hidden text-right tabular-nums text-ink-200 md:block">{c.visits ? formatBRL(c.ticket) : '—'}</span>
                  <span className="hidden text-right font-semibold tabular-nums text-ink-100 md:block">{formatBRL0(c.spent)}</span>
                  <span className="hidden text-right text-sm tabular-nums text-ink-300 md:block">{c.lastVisit ? shortDate(c.lastVisit) : c.nextVisit ? `Agendado ${shortDate(c.nextVisit)}` : '—'}</span>
                  <ChevronDown className={`size-4 justify-self-end text-gold-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} aria-hidden />
                </button>

                {isOpen && (
                  <div className="animate-page-in mx-3 mb-3 rounded-xl bg-ink-800/60 p-4">
                    <div className="mb-3 flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-300">
                      {c.favoriteService && <span>Favorito: <strong className="text-ink-100">{c.favoriteService}</strong></span>}
                      {c.firstVisit && <span>Cliente desde <strong className="text-ink-100">{shortDate(c.firstVisit)}</strong></span>}
                      {c.nextVisit && <span>Próxima visita: <strong className="text-gold-300">{shortDate(c.nextVisit)}</strong></span>}
                    </div>
                    <ul className="divide-y divide-white/6 text-sm">
                      {c.history.slice(0, 8).map((v) => (
                        <li key={v.id} className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 py-2">
                          <span className="text-ink-100">
                            {format(parseISO(v.date), 'dd/MM/yy')} · {v.time}
                            <span className="ml-2 text-ink-300">{services.find((s) => s.id === v.serviceId)?.name}</span>
                          </span>
                          <span className="flex items-center gap-3 text-xs text-ink-400">
                            {barbers.find((b) => b.id === v.barberId)?.name.split(' ')[0]}
                            <span className={v.status === 'concluido' ? 'text-success' : 'text-gold-300'}>{statusLabel[v.status]}</span>
                            <span className="w-16 text-right font-semibold tabular-nums text-ink-100">{formatBRL0(v.price)}</span>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            )
          })}
        </ul>

        {list.length === 0 && <p className="p-8 text-center text-sm text-ink-300">Nenhum cliente encontrado.</p>}
        {list.length > limit && (
          <button type="button" onClick={() => setLimit((l) => l + 12)} className="mt-4 h-11 w-full rounded-pill border border-white/12 text-sm font-semibold text-gold-300 hover:border-gold-500/50">
            Mostrar mais ({list.length - limit} restantes)
          </button>
        )}
      </Card>

    </>
  )
}
