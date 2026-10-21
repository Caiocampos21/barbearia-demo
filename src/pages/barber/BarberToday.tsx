import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, Coffee, Globe, Phone, Scissors, Wallet } from 'lucide-react'
import Card from '../../components/admin/Card'
import KpiCard from '../../components/admin/KpiCard'
import PageHeader from '../../components/admin/PageHeader'
import VisitRow from '../../components/barber/VisitRow'
import { services } from '../../data/seed'
import { useAdminData } from '../../hooks/useAdminData'
import { useBarberContext } from '../../hooks/useBarber'
import { barberDay, dayTotals, nextVisit, phaseOf, visitStart } from '../../lib/barberAnalytics'
import { formatBRL, formatBRL0 } from '../../lib/format'

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

export default function BarberToday() {
  const { barber } = useBarberContext()
  const ds = useAdminData()
  const todayKey = format(ds.now, 'yyyy-MM-dd')
  const day = barberDay(ds, barber.id, todayKey)
  const totals = dayTotals(day, barber.id)
  const next = nextVisit(ds, barber.id)
  const isOff = barber.daysOff.includes(ds.now.getDay())

  const hour = ds.now.getHours()
  const greeting = hour < 12 ? 'Bom dia' : hour < 18 ? 'Boa tarde' : 'Boa noite'

  const nextService = next && services.find((s) => s.id === next.serviceId)
  const nextIsToday = next?.date === todayKey
  const inProgress = next ? phaseOf(next, ds.now) === 'now' : false
  const nextWhen = next ? (nextIsToday ? `hoje às ${next.time}` : `${format(visitStart(next), "EEEE, d/MM", { locale: ptBR })} às ${next.time}`) : ''

  return (
    <>
      <PageHeader title={`${greeting}, ${barber.name.split(' ')[0]}`} subtitle={capitalize(format(ds.now, "EEEE, d 'de' MMMM", { locale: ptBR }))} />

      {/* Próximo cliente */}
      <section className="relative overflow-hidden rounded-card border border-gold-500/40 bg-gradient-to-br from-gold-500/15 via-ink-900 to-ink-900 p-5 shadow-card sm:p-7" aria-label="Próximo cliente">
        <div className="pointer-events-none absolute -right-10 -top-10 size-44 rounded-full bg-gold-500/15 blur-3xl" aria-hidden />
        {next ? (
          <div className="relative">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold-300">
              {inProgress ? (
                <>
                  <span className="relative flex size-2">
                    <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-70" />
                    <span className="relative inline-flex size-2 rounded-full bg-success" />
                  </span>
                  Em atendimento agora
                </>
              ) : (
                <>
                  <Clock className="size-3.5" aria-hidden /> Próximo cliente · {nextWhen}
                </>
              )}
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{next.customerName}</h2>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-200">
              <span className="flex items-center gap-1.5">
                <Scissors className="size-4 text-gold-400" aria-hidden /> {nextService?.name} · {nextService?.duration} min
              </span>
              <span className="flex items-center gap-1.5">
                <Phone className="size-4 text-gold-400" aria-hidden /> {next.customerPhone}
              </span>
              <span className="font-display text-lg font-semibold text-gold-400">{formatBRL(next.price)}</span>
              {next.source === 'site' && (
                <span className="inline-flex items-center gap-1 rounded-pill bg-gold-500/15 px-2.5 py-1 text-xs font-semibold text-gold-300">
                  <Globe className="size-3.5" aria-hidden /> agendou pelo site
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="relative flex items-center gap-4">
            <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gold-500/15 text-gold-400">
              <Coffee className="size-6" aria-hidden />
            </span>
            <div>
              <h2 className="text-2xl font-bold">Agenda livre</h2>
              <p className="text-sm text-ink-300">Nenhum cliente marcado pela frente. Aproveite o descanso!</p>
            </div>
          </div>
        )}
      </section>

      {/* Números do dia */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <KpiCard label="Atendimentos hoje" value={totals.done} format={(n) => String(Math.round(n))} icon={Scissors} hint={`de ${totals.total} marcados`} />
        <KpiCard label="Faturado hoje" value={totals.revenue} format={formatBRL0} icon={Wallet} delay={80} />
        <div className="col-span-2 sm:col-span-1">
          <KpiCard label="Sua comissão hoje" value={totals.commission} format={formatBRL0} icon={Wallet} delay={160} hint={`${Math.round((totals.commission / (totals.revenue || 1)) * 100)}% do faturado`} />
        </div>
      </div>

      {/* Fila do dia */}
      <Card title="Agenda de hoje" subtitle={day.length ? `${day.length} atendimentos · ${day.length - totals.done} a fazer` : undefined} className="mt-6">
        {day.length ? (
          <ul className="space-y-2">
            {day.map((v) => (
              <VisitRow key={v.id} visit={v} phase={phaseOf(v, ds.now)} />
            ))}
          </ul>
        ) : (
          <p className="rounded-xl border border-dashed border-white/12 px-4 py-8 text-center text-sm text-ink-300">
            {isOff ? 'Hoje é a sua folga. Descanse e volte com tudo!' : 'Sem atendimentos marcados para hoje.'}
          </p>
        )}
      </Card>
    </>
  )
}
