import { format, parseISO } from 'date-fns'
import { Cake, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import Card from '../../components/admin/Card'
import PageHeader from '../../components/admin/PageHeader'
import { useAdminData } from '../../hooks/useAdminData'
import { useBarberContext } from '../../hooks/useBarber'
import { barberClients } from '../../lib/barberAnalytics'
import { formatBRL0 } from '../../lib/format'

const filters = [
  { id: 'todos', label: 'Todos' },
  { id: 'agendados', label: 'Voltam em breve' },
  { id: 'sumidos', label: 'Sumidos (+30 dias)' },
] as const
type FilterId = (typeof filters)[number]['id']

const PAGE = 40
const dm = (key: string) => format(parseISO(key), 'dd/MM')

export default function BarberClients() {
  const { barber } = useBarberContext()
  const ds = useAdminData()
  const [filter, setFilter] = useState<FilterId>('todos')
  const [query, setQuery] = useState('')
  const [shown, setShown] = useState(PAGE)

  const clients = useMemo(() => barberClients(ds, barber.id), [ds, barber.id])
  const month = format(ds.now, 'MM')
  const birthdays = clients.filter((c) => c.birthday?.startsWith(month)).sort((a, b) => (a.birthday ?? '').localeCompare(b.birthday ?? ''))

  const list = clients.filter((c) => {
    if (query && !`${c.name} ${c.phone}`.toLowerCase().includes(query.toLowerCase())) return false
    if (filter === 'agendados') return Boolean(c.nextVisit)
    if (filter === 'sumidos') return !c.nextVisit && (c.daysSince ?? 0) > 30
    return true
  })

  return (
    <>
      <PageHeader title="Meus clientes" subtitle={`${clients.length} clientes já passaram pela sua cadeira.`} />

      {birthdays.length > 0 && (
        <Card title="Aniversariantes do mês" subtitle="Uma mensagem de parabéns fideliza" className="mb-6">
          <ul className="no-scrollbar -mx-1 flex gap-3 overflow-x-auto px-1 pb-1">
            {birthdays.slice(0, 12).map((c) => (
              <li key={c.id} className="flex w-48 shrink-0 items-center gap-3 rounded-xl border border-white/8 bg-ink-800/60 p-3">
                <span className="grid size-10 shrink-0 place-items-center rounded-full bg-gold-500/15 text-gold-400">
                  <Cake className="size-5" aria-hidden />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold">{c.name}</span>
                  <span className="block text-xs text-ink-400">dia {c.birthday?.slice(3)}</span>
                </span>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Buscar cliente</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gold-400" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value)
                setShown(PAGE)
              }}
              placeholder="Buscar por nome ou telefone"
              className="h-11 w-full rounded-pill border border-white/12 bg-ink-950 pl-11 pr-4 text-sm placeholder:text-ink-400 focus:border-gold-500/60 focus:outline-none"
            />
          </label>
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
            {filters.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => {
                  setFilter(f.id)
                  setShown(PAGE)
                }}
                aria-pressed={filter === f.id}
                className={`h-11 shrink-0 rounded-pill border px-4 text-sm font-semibold transition-colors ${filter === f.id ? 'border-gold-400 bg-gold-500 text-ink-950' : 'border-white/12 text-ink-200 hover:border-gold-500/50'}`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <p className="mb-3 mt-5 text-xs uppercase tracking-widest text-ink-400">{list.length} resultados</p>
        {list.length ? (
          <ul className="divide-y divide-white/8">
            {list.slice(0, shown).map((c) => (
              <li key={c.id} className="flex items-center gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold">{c.name}</p>
                  <p className="truncate text-xs text-ink-400">
                    {c.visits} {c.visits === 1 ? 'visita' : 'visitas'}
                    {c.lastVisit && ` · último corte ${dm(c.lastVisit)}`}
                    {c.nextVisit && <span className="text-gold-300"> · volta dia {dm(c.nextVisit)}</span>}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-semibold tabular-nums">{formatBRL0(c.spent)}</p>
                  <p className="text-[0.65rem] uppercase tracking-wider text-ink-400">gastos</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-white/12 px-4 py-8 text-center text-sm text-ink-300">Nenhum cliente encontrado com esse filtro.</p>
        )}
        {list.length > shown && (
          <button type="button" onClick={() => setShown((s) => s + PAGE)} className="mt-4 h-11 w-full rounded-pill border border-white/12 text-sm font-semibold text-gold-300 hover:border-gold-500/50">
            Ver mais ({list.length - shown})
          </button>
        )}
      </Card>
    </>
  )
}
