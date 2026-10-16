import { format } from 'date-fns'
import { CalendarClock, Clock, Globe, Percent, Receipt, Scissors, TrendingUp, Users } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { barbers, services } from '../../data/seed'
import { useAdminData } from '../../hooks/useAdminData'
import { isRealized, monthLabel, monthToDate, monthlyFinance, revenueByDay, shortMonth, topServices, upcomingToday } from '../../lib/analytics'
import { axisMoney, formatBRL, formatBRL0, formatPercent, shortDate } from '../../lib/format'
import Card from '../../components/admin/Card'
import ChartTooltip from '../../components/admin/ChartTooltip'
import { axisProps, chartColors } from '../../components/admin/chartTheme'
import KpiCard from '../../components/admin/KpiCard'
import PageHeader from '../../components/admin/PageHeader'
import { subMonths } from 'date-fns'

const colorOfService = (id: string) => chartColors.categorical[Math.max(0, services.findIndex((s) => s.id === id)) % chartColors.categorical.length]

const Legend = ({ items }: { items: { label: string; color: string; dashed?: boolean }[] }) => (
  <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-300">
    {items.map((i) => (
      <li key={i.label} className="flex items-center gap-2">
        <span className="h-0.5 w-4 rounded" style={{ background: i.dashed ? 'transparent' : i.color, borderTop: i.dashed ? `2px dashed ${i.color}` : undefined }} aria-hidden />
        {i.label}
      </li>
    ))}
  </ul>
)

export default function Dashboard() {
  const ds = useAdminData()
  const { current, prev, deltas } = monthToDate(ds)
  const prevLabel = shortMonth(subMonths(ds.now, 1))
  const byDay = revenueByDay(ds, ds.now)
  const byMonth = monthlyFinance(ds, 6)
  const services$ = topServices(ds, ds.now)
  const upcoming = upcomingToday(ds)
  const todayKey = format(ds.now, 'yyyy-MM-dd')
  const todayDone = ds.visits.filter((v) => v.date === todayKey && isRealized(v))
  const siteVisits = ds.visits.filter((v) => v.source === 'site' && v.status !== 'cancelado').sort((a, b) => b.date.localeCompare(a.date) || b.time.localeCompare(a.time)).slice(0, 4)
  const totalServiceCount = services$.reduce((a, s) => a + s.count, 0)

  return (
    <>
      <PageHeader title="Visão geral" subtitle={`Como o negócio está girando em ${monthLabel(ds.now)}.`} />

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard
          label="Faturamento do mês"
          icon={TrendingUp}
          value={current.revenue}
          format={formatBRL0}
          delta={deltas.revenue}
          hint={`vs. ${prevLabel} (${formatBRL0(prev.revenue)})`}
        />
        <KpiCard
          label="Atendimentos"
          icon={Scissors}
          value={current.count}
          format={(n) => Math.round(n).toLocaleString('pt-BR')}
          delta={deltas.count}
          hint={`vs. ${prevLabel} (${prev.count})`}
          delay={80}
        />
        <KpiCard label="Ticket médio" icon={Receipt} value={current.ticket} format={formatBRL} delta={deltas.ticket} hint={`vs. ${prevLabel} (${formatBRL(prev.ticket)})`} delay={160} />
        <KpiCard
          label="Ocupação da agenda"
          icon={Percent}
          value={current.occupancy * 100}
          format={(n) => `${n.toFixed(0)}%`}
          delta={deltas.occupancy}
          deltaUnit="pp"
          hint="das horas de cadeira"
          delay={240}
        />
      </div>

      <p className="mt-3 flex items-center gap-2 text-sm text-ink-300">
        <CalendarClock className="size-4 text-gold-500" aria-hidden />
        Já tem <strong className="text-gold-300">{formatBRL0(current.booked)}</strong> agendados até o fim do mês ({current.bookedCount} atendimentos).
      </p>

      {/* Faturamento por dia + próximos */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card
          title="Faturamento por dia"
          subtitle="Realizado e agendado no mês"
          className="xl:col-span-2"
          action={<Legend items={[{ label: 'Realizado', color: chartColors.gold }, { label: 'Agendado', color: chartColors.categorical[1], dashed: true }]} />}
        >
          <div className="h-72 sm:h-80" role="img" aria-label="Gráfico de área do faturamento diário no mês atual">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={byDay} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                <defs>
                  <linearGradient id="goldFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColors.gold} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={chartColors.gold} stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="blueFill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={chartColors.categorical[1]} stopOpacity={0.25} />
                    <stop offset="100%" stopColor={chartColors.categorical[1]} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke={chartColors.grid} vertical={false} />
                <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={14} />
                <YAxis {...axisProps} tickFormatter={axisMoney} width={48} />
                <Tooltip
                  cursor={{ stroke: chartColors.gold, strokeOpacity: 0.4 }}
                  content={<ChartTooltip valueFormat={formatBRL0} title={(p) => String(p?.full ?? '')} names={{ receita: 'Realizado', agendado: 'Agendado' }} />}
                />
                <Area type="monotone" dataKey="receita" stroke={chartColors.gold} strokeWidth={2} fill="url(#goldFill)" connectNulls dot={false} activeDot={{ r: 5, stroke: chartColors.surface, strokeWidth: 2 }} />
                <Area type="monotone" dataKey="agendado" stroke={chartColors.categorical[1]} strokeWidth={2} strokeDasharray="5 4" fill="url(#blueFill)" connectNulls dot={false} activeDot={{ r: 5, stroke: chartColors.surface, strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <div className="min-w-0 space-y-6">
        <Card title="Próximos de hoje" subtitle={upcoming.length ? `${upcoming.length} na fila` : 'Agenda do dia'} action={<Link to="/painel/agenda" className="text-sm font-semibold text-gold-400 hover:text-gold-300">Ver agenda →</Link>}>
          {upcoming.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/12 p-6 text-center text-sm text-ink-300">Sem mais atendimentos hoje. Bom descanso!</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((v) => {
                const svc = services.find((s) => s.id === v.serviceId)
                const barber = barbers.find((b) => b.id === v.barberId)
                return (
                  <li key={v.id} className="flex items-center gap-3 rounded-xl bg-ink-800/60 p-3">
                    <span className="flex w-14 shrink-0 items-center gap-1 font-display text-lg font-bold tabular-nums text-gold-400">
                      <Clock className="size-3.5 text-ink-400" aria-hidden />
                      {v.time}
                    </span>
                    <span className="min-w-0 flex-1 text-sm leading-tight">
                      <strong className="flex items-center gap-1.5 truncate text-ink-100">
                        {v.customerName}
                        {v.source === 'site' && (
                          <span className="inline-flex shrink-0 items-center gap-1 rounded-pill bg-gold-500/15 px-1.5 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-gold-300">
                            <Globe className="size-3" aria-hidden />
                            site
                          </span>
                        )}
                      </strong>
                      <span className="block truncate text-xs text-ink-400">
                        {svc?.name} · {barber?.name.split(' ')[0]}
                      </span>
                    </span>
                    <span className="shrink-0 text-sm font-semibold tabular-nums text-ink-200">{formatBRL0(v.price)}</span>
                  </li>
                )
              })}
            </ul>
          )}
          <p className="mt-4 border-t border-white/8 pt-4 text-sm text-ink-300">
            Hoje já foram <strong className="text-ink-100">{todayDone.length}</strong> atendimentos · <strong className="text-gold-300">{formatBRL0(todayDone.reduce((a, v) => a + v.price, 0))}</strong>
          </p>
        </Card>

        <Card title="Chegando pelo site" subtitle="Agendamentos feitos pelos clientes online">
          {siteVisits.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/12 p-5 text-center text-sm text-ink-300">
              <Globe className="mx-auto mb-2 size-6 text-gold-500" aria-hidden />
              Nenhum ainda. Faça um agendamento no{' '}
              <Link to="/agendar" className="font-semibold text-gold-300 hover:text-gold-200">
                site do cliente
              </Link>{' '}
              e veja aparecer aqui na hora.
            </div>
          ) : (
            <ul className="space-y-2">
              {siteVisits.map((v) => (
                <li key={v.id} className="flex items-center gap-3 rounded-xl bg-ink-800/60 p-3 text-sm">
                  <Globe className="size-4 shrink-0 text-gold-400" aria-hidden />
                  <span className="min-w-0 flex-1 leading-tight">
                    <strong className="block truncate text-ink-100">{v.customerName}</strong>
                    <span className="text-xs text-ink-400">
                      {services.find((s) => s.id === v.serviceId)?.name} · {shortDate(v.date)} {v.time}
                    </span>
                  </span>
                  <span className="shrink-0 font-semibold tabular-nums text-ink-200">{formatBRL0(v.price)}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
        </div>
      </div>

      {/* Mês a mês + serviços */}
      <div className="mt-6 grid gap-6 xl:grid-cols-3">
        <Card title="Faturamento por mês" subtitle="Últimos 6 meses · o mês atual está em andamento" className="xl:col-span-2">
          <div className="h-72" role="img" aria-label="Gráfico de barras do faturamento mensal">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={byMonth} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="28%">
                <CartesianGrid stroke={chartColors.grid} vertical={false} />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis {...axisProps} tickFormatter={axisMoney} width={44} domain={[0, (max: number) => Math.ceil(max / 10000) * 10000]} tickCount={5} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTooltip valueFormat={formatBRL0} names={{ receita: 'Faturamento' }} />} />
                <Bar dataKey="receita" radius={[4, 4, 0, 0]} maxBarSize={56}>
                  {byMonth.map((m, i) => (
                    <Cell key={m.key} fill={chartColors.gold} fillOpacity={i === byMonth.length - 1 ? 1 : 0.55} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Serviços mais vendidos" subtitle={`${totalServiceCount} atendimentos no mês`}>
          <div className="mx-auto h-44 w-44" role="img" aria-label="Gráfico de pizza com a participação de cada serviço no faturamento">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Tooltip content={<ChartTooltip valueFormat={formatBRL0} />} />
                <Pie data={services$} dataKey="revenue" nameKey="name" innerRadius={52} outerRadius={80} paddingAngle={2} stroke={chartColors.surface} strokeWidth={2}>
                  {services$.map((s) => (
                    <Cell key={s.id} fill={colorOfService(s.id)} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ol className="mt-4 space-y-2.5">
            {services$.map((s, i) => (
              <li key={s.id} className="flex items-center gap-3 text-sm">
                <span className="w-4 text-xs font-bold text-ink-400">{i + 1}</span>
                <span className="size-2.5 shrink-0 rounded-sm" style={{ background: colorOfService(s.id) }} aria-hidden />
                <span className="min-w-0 flex-1 truncate text-ink-100">{s.name}</span>
                <span className="text-xs tabular-nums text-ink-400">{s.count}×</span>
                <span className="w-12 text-right font-semibold tabular-nums text-ink-200">{formatPercent(s.share)}</span>
              </li>
            ))}
          </ol>
        </Card>
      </div>

      <p className="mt-6 flex items-center gap-2 text-xs text-ink-400">
        <Users className="size-3.5" aria-hidden />
        Atualizado às {format(ds.now, 'HH:mm')} · inclui os agendamentos feitos no site do cliente.
      </p>
    </>
  )
}
