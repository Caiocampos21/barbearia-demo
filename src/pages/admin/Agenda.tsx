import { addDays, format, parseISO, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarOff, ChevronLeft, ChevronRight, Globe, Phone, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import BarberAvatar from '../../components/admin/BarberAvatar'
import Card from '../../components/admin/Card'
import PageHeader from '../../components/admin/PageHeader'
import { barbers, services } from '../../data/seed'
import { useAdminData } from '../../hooks/useAdminData'
import { isActive, isRealized, visitsOnDay, type Dataset } from '../../lib/analytics'
import { formatBRL, formatBRL0, formatDuration, longDate, toDateKey } from '../../lib/format'
import { buildDayGrid, slotsNeeded } from '../../lib/grid'
import type { Visit } from '../../lib/types'

const ROW = 52 // altura de cada meia hora, em px
const statusLabel: Record<string, string> = { concluido: 'Concluído', confirmado: 'Confirmado', pendente: 'Aguardando pagamento', cancelado: 'Cancelado' }

function blockStyle(v: Visit) {
  if (v.status === 'concluido') return 'border-white/10 bg-ink-700/70 text-ink-200'
  if (v.status === 'pendente') return 'border-dashed border-gold-500/70 bg-gold-500/5 text-gold-200'
  return 'border-gold-500/50 bg-gold-500/15 text-ink-100'
}

function VisitDetail({ visit, onClose }: { visit: Visit; onClose: () => void }) {
  const svc = services.find((s) => s.id === visit.serviceId)
  const barber = barbers.find((b) => b.id === visit.barberId)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const rows: [string, string][] = [
    ['Serviço', `${svc?.name} · ${formatDuration(svc?.duration ?? 30)}`],
    ['Barbeiro', barber?.name ?? '—'],
    ['Data', `${longDate(visit.date)} às ${visit.time}`],
    ['Status', statusLabel[visit.status]],
    ['Origem', visit.source === 'site' ? 'Agendamento pelo site' : 'Balcão / WhatsApp'],
    ['Pagamento', visit.paymentMethod ? (visit.paymentMethod === 'pix' ? 'PIX' : 'Cartão') : 'Pendente'],
  ]
  return (
    <div role="dialog" aria-modal="true" aria-label="Detalhes do agendamento" className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-0 sm:items-center sm:p-4" onClick={onClose}>
      <div className="animate-page-in w-full max-w-md rounded-t-[1.5rem] border border-white/10 bg-ink-900 p-6 shadow-card sm:rounded-card" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-semibold">{visit.customerName}</h2>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-300">
              <Phone className="size-3.5 text-gold-500" aria-hidden />
              {visit.customerPhone}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="grid size-9 place-items-center rounded-full bg-white/8 text-ink-200 hover:bg-white/15">
            <X className="size-4" />
          </button>
        </div>
        <dl className="mt-5 divide-y divide-white/8 text-sm">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2.5">
              <dt className="text-ink-400">{k}</dt>
              <dd className="text-right font-medium text-ink-100">{v}</dd>
            </div>
          ))}
        </dl>
        <div className="mt-4 flex items-center justify-between rounded-xl bg-gold-500/10 px-4 py-3">
          <span className="text-sm font-semibold text-gold-300">Valor</span>
          <span className="font-display text-2xl font-bold text-gold-400">{formatBRL(visit.price)}</span>
        </div>
      </div>
    </div>
  )
}

function DayView({ ds, date, onSelect }: { ds: Dataset; date: Date; onSelect: (v: Visit) => void }) {
  const grid = buildDayGrid(date)
  const key = toDateKey(date)
  const visits = visitsOnDay(ds, key)
  const isToday = key === toDateKey(ds.now)
  const nowMin = ds.now.getHours() * 60 + ds.now.getMinutes()
  const startMin = grid.length ? Number(grid[0].slice(0, 2)) * 60 + Number(grid[0].slice(3)) : 0
  const nowTop = ((nowMin - startMin) / 30) * ROW

  if (!grid.length)
    return (
      <div className="flex flex-col items-center gap-2 rounded-card border border-dashed border-white/15 p-12 text-center">
        <CalendarOff className="size-8 text-ink-400" aria-hidden />
        <p className="text-ink-300">A barbearia está fechada neste dia.</p>
      </div>
    )

  return (
    <div className="no-scrollbar overflow-x-auto rounded-card border border-white/8 bg-ink-900">
      <div className="min-w-[44rem]">
        {/* cabeçalho dos barbeiros */}
        <div className="sticky top-0 z-20 grid grid-cols-[3.5rem_repeat(4,1fr)] border-b border-white/8 bg-ink-900">
          <span />
          {barbers.map((b) => {
            const count = visits.filter((v) => v.barberId === b.id).length
            const off = b.daysOff.includes(date.getDay())
            return (
              <div key={b.id} className="flex items-center gap-2 border-l border-white/6 px-3 py-3">
                <BarberAvatar initials={b.initials} gradient={b.gradient} size="sm" />
                <span className="min-w-0 text-sm leading-tight">
                  <strong className="block truncate text-ink-100">{b.name.split(' ')[0]}</strong>
                  <span className="text-xs text-ink-400">{off ? 'Folga' : `${count} agend.`}</span>
                </span>
              </div>
            )
          })}
        </div>

        <div className="relative grid grid-cols-[3.5rem_repeat(4,1fr)]" style={{ height: grid.length * ROW }}>
          {/* horas */}
          <div className="relative">
            {grid.map((t, i) => (
              <span key={t} className="absolute right-2 -translate-y-1/2 text-[0.7rem] tabular-nums text-ink-400" style={{ top: i * ROW + (i === 0 ? 8 : 0) }}>
                {t.endsWith(':00') ? t : ''}
              </span>
            ))}
          </div>

          {barbers.map((b) => {
            const off = b.daysOff.includes(date.getDay())
            return (
              <div key={b.id} className={`relative border-l border-white/6 ${off ? 'bg-[repeating-linear-gradient(135deg,transparent,transparent_8px,rgba(255,255,255,0.025)_8px,rgba(255,255,255,0.025)_16px)]' : ''}`}>
                {grid.map((t, i) => (
                  <div key={t} className={`absolute inset-x-0 border-t ${t.endsWith(':00') ? 'border-white/8' : 'border-white/[0.03]'}`} style={{ top: i * ROW }} />
                ))}
                {visits
                  .filter((v) => v.barberId === b.id)
                  .map((v) => {
                    const svc = services.find((s) => s.id === v.serviceId)
                    const idx = grid.indexOf(v.time)
                    if (idx === -1) return null
                    const h = slotsNeeded(svc?.duration ?? 30) * ROW - 4
                    return (
                      <button
                        key={v.id}
                        type="button"
                        onClick={() => onSelect(v)}
                        className={`absolute inset-x-1 overflow-hidden rounded-lg border px-2 py-1 text-left text-xs transition-transform hover:z-10 hover:scale-[1.02] ${blockStyle(v)} ${v.source === 'site' ? 'ring-2 ring-gold-400' : ''}`}
                        style={{ top: idx * ROW + 2, height: h }}
                        aria-label={`${v.time} ${v.customerName}, ${svc?.name}`}
                      >
                        <span className="flex items-center justify-between gap-1">
                          <strong className="truncate">{v.customerName}</strong>
                          {v.source === 'site' && <Globe className="size-3 shrink-0 text-gold-300" aria-label="Agendado pelo site" />}
                        </span>
                        <span className="block truncate opacity-80">
                          {v.time} · {svc?.name}
                        </span>
                      </button>
                    )
                  })}
              </div>
            )
          })}

          {isToday && nowMin >= startMin && nowTop <= grid.length * ROW && (
            <div className="pointer-events-none absolute inset-x-0 z-10 flex items-center" style={{ top: nowTop }} aria-hidden>
              <span className="ml-1 rounded bg-danger px-1 text-[0.6rem] font-bold text-white">{format(ds.now, 'HH:mm')}</span>
              <span className="h-px flex-1 bg-danger" />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function WeekView({ ds, date, onPick }: { ds: Dataset; date: Date; onPick: (d: Date) => void }) {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(start, i))
  const todayKey = toDateKey(ds.now)

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
      {days.map((d) => {
        const key = toDateKey(d)
        const grid = buildDayGrid(d)
        const visits = visitsOnDay(ds, key)
        const revenue = visits.reduce((a, v) => a + v.price, 0)
        const site = visits.filter((v) => v.source === 'site').length
        const working = barbers.filter((b) => !b.daysOff.includes(d.getDay())).length
        const capacity = grid.length * working
        const used = visits.reduce((a, v) => a + slotsNeeded(services.find((s) => s.id === v.serviceId)?.duration ?? 30), 0)
        const occ = capacity ? Math.min(1, used / capacity) : 0
        const closed = !grid.length
        return (
          <button
            key={key}
            type="button"
            disabled={closed}
            onClick={() => onPick(d)}
            className={`rounded-card border p-4 text-left transition-all enabled:hover:-translate-y-1 enabled:hover:border-gold-500/50 ${key === todayKey ? 'border-gold-500/60 bg-gold-500/8' : 'border-white/8 bg-ink-900'} ${closed ? 'opacity-50' : ''}`}
          >
            <span className="text-xs font-semibold uppercase tracking-widest text-ink-400">{format(d, 'EEE', { locale: ptBR }).replace('.', '')}</span>
            <span className="mt-0.5 flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold">{format(d, 'd')}</span>
              <span className="text-xs uppercase text-ink-400">{format(d, 'MMM', { locale: ptBR }).replace('.', '')}</span>
              {key === todayKey && <span className="rounded-pill bg-gold-500 px-2 py-0.5 text-[0.6rem] font-bold uppercase text-ink-950">hoje</span>}
            </span>
            {closed ? (
              <p className="mt-4 text-sm text-ink-400">Fechado</p>
            ) : (
              <>
                <p className="mt-4 text-sm text-ink-200">
                  <strong className="tabular-nums text-ink-100">{visits.length}</strong> atendimentos
                </p>
                <p className="text-sm font-semibold tabular-nums text-gold-400">{formatBRL0(revenue)}</p>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-ink-800" role="presentation">
                  <div className="h-full rounded-full bg-gold-500" style={{ width: `${occ * 100}%` }} />
                </div>
                <p className="mt-1 text-xs text-ink-400">{Math.round(occ * 100)}% ocupado</p>
                {site > 0 && (
                  <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-gold-300">
                    <Globe className="size-3" aria-hidden />
                    {site} pelo site
                  </p>
                )}
              </>
            )}
          </button>
        )
      })}
    </div>
  )
}

export default function Agenda() {
  const ds = useAdminData()
  const [view, setView] = useState<'dia' | 'semana'>('dia')
  const [date, setDate] = useState(() => new Date())
  const [selected, setSelected] = useState<Visit | null>(null)

  const step = view === 'dia' ? 1 : 7
  const key = toDateKey(date)
  const dayVisits = useMemo(() => visitsOnDay(ds, key), [ds, key])
  const dayRevenue = dayVisits.reduce((a, v) => a + v.price, 0)
  const done = dayVisits.filter(isRealized).length
  const siteCount = ds.visits.filter((v) => v.source === 'site' && isActive(v)).length

  const nav = 'grid size-11 place-items-center rounded-full border border-white/12 text-ink-200 transition-colors hover:border-gold-500/50 hover:text-gold-300'

  return (
    <>
      <PageHeader
        title="Agenda"
        subtitle={siteCount ? `Inclui ${siteCount} ${siteCount === 1 ? 'agendamento feito' : 'agendamentos feitos'} pelo site do cliente.` : 'Horários de todos os barbeiros.'}
        right={
          <div role="group" aria-label="Visualização" className="flex rounded-pill border border-white/12 p-1">
            {(['dia', 'semana'] as const).map((v) => (
              <button key={v} type="button" aria-pressed={view === v} onClick={() => setView(v)} className={`h-9 rounded-pill px-5 text-sm font-semibold capitalize transition-colors ${view === v ? 'bg-gold-500 text-ink-950' : 'text-ink-300 hover:text-ink-100'}`}>
                {v}
              </button>
            ))}
          </div>
        }
      />

      <div className="mb-5 flex flex-wrap items-center gap-3">
        <button type="button" className={nav} aria-label={view === 'dia' ? 'Dia anterior' : 'Semana anterior'} onClick={() => setDate((d) => addDays(d, -step))}>
          <ChevronLeft className="size-5" />
        </button>
        <button type="button" className={nav} aria-label={view === 'dia' ? 'Próximo dia' : 'Próxima semana'} onClick={() => setDate((d) => addDays(d, step))}>
          <ChevronRight className="size-5" />
        </button>
        <button type="button" onClick={() => setDate(new Date())} className="h-11 rounded-pill border border-white/12 px-5 text-sm font-semibold text-gold-300 hover:border-gold-500/50">
          Hoje
        </button>
        <label className="ml-auto">
          <span className="sr-only">Ir para a data</span>
          <input type="date" value={key} onChange={(e) => e.target.value && setDate(parseISO(e.target.value))} className="h-11 rounded-pill border border-white/12 bg-ink-900 px-4 text-sm text-ink-100 [color-scheme:dark] focus:border-gold-400 focus:outline-none" />
        </label>
      </div>

      {view === 'dia' ? (
        <>
          <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="font-display text-2xl font-semibold">{longDate(key)}</h2>
            <p className="text-sm text-ink-300">
              <strong className="text-ink-100">{dayVisits.length}</strong> atendimentos · <strong className="text-ink-100">{done}</strong> concluídos · <strong className="text-gold-300">{formatBRL0(dayRevenue)}</strong>
            </p>
          </div>
          <DayView ds={ds} date={date} onSelect={setSelected} />
          <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-300">
            <li className="flex items-center gap-2"><span className="size-3 rounded border border-white/10 bg-ink-700" />Concluído</li>
            <li className="flex items-center gap-2"><span className="size-3 rounded border border-gold-500/50 bg-gold-500/15" />Confirmado</li>
            <li className="flex items-center gap-2"><span className="size-3 rounded border border-dashed border-gold-500/70" />Aguardando pagamento</li>
            <li className="flex items-center gap-2"><span className="size-3 rounded ring-2 ring-gold-400" /><Globe className="size-3 text-gold-300" aria-hidden />Veio pelo site</li>
          </ul>
        </>
      ) : (
        <Card title={`Semana de ${format(startOfWeek(date, { weekStartsOn: 1 }), "d 'de' MMMM", { locale: ptBR })}`} subtitle="Toque em um dia para ver o detalhe">
          <WeekView
            ds={ds}
            date={date}
            onPick={(d) => {
              setDate(d)
              setView('dia')
            }}
          />
        </Card>
      )}

      {selected && <VisitDetail visit={selected} onClose={() => setSelected(null)} />}
    </>
  )
}
