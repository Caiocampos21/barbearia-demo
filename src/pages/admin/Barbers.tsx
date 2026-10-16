import { Crown, Star } from 'lucide-react'
import { useState } from 'react'
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { startOfMonth } from 'date-fns'
import BarberAvatar from '../../components/admin/BarberAvatar'
import Card from '../../components/admin/Card'
import ChartTooltip from '../../components/admin/ChartTooltip'
import { axisProps, chartColors } from '../../components/admin/chartTheme'
import MonthSelect from '../../components/admin/MonthSelect'
import PageHeader from '../../components/admin/PageHeader'
import Reveal from '../../components/ui/Reveal'
import { barbers } from '../../data/seed'
import { useAdminData } from '../../hooks/useAdminData'
import { barberMonthly, barberStats, monthLabel } from '../../lib/analytics'
import { axisMoney, formatBRL, formatBRL0, formatPercent } from '../../lib/format'

// A cor segue o barbeiro (entidade), não a posição no ranking.
const colorOf = (id: string) => chartColors.categorical[barbers.findIndex((b) => b.id === id)]

const Stat = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => (
  <div>
    <dt className="text-[0.65rem] uppercase tracking-widest text-ink-400">{label}</dt>
    <dd className={`mt-0.5 font-semibold tabular-nums ${strong ? 'font-display text-2xl text-gold-400' : 'text-ink-100'}`}>{value}</dd>
  </div>
)

export default function Barbers() {
  const ds = useAdminData()
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const stats = barberStats(ds, month)
  const evolution = barberMonthly(ds, 7).slice(0, 6) // só meses fechados
  const comparison = stats.map((s) => ({ name: s.name.split(' ')[0], faturamento: Math.round(s.revenue), comissao: Math.round(s.commission) }))

  return (
    <>
      <PageHeader title="Barbeiros" subtitle={`Desempenho da equipe em ${monthLabel(month)}.`} right={<MonthSelect now={ds.now} value={month} onChange={setMonth} />} />

      {/* Ranking */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s, i) => (
          <Reveal key={s.id} delay={i * 80} className="h-full">
            <article className={`relative h-full rounded-card border p-5 shadow-card ${i === 0 ? 'border-gold-500/60 bg-gradient-to-b from-gold-500/10 to-ink-900' : 'border-white/8 bg-ink-900'}`}>
              <div className="flex items-start gap-3">
                <BarberAvatar initials={s.initials} gradient={s.gradient} size="lg" />
                <div className="min-w-0 leading-tight">
                  <h2 className="truncate font-display text-lg font-semibold">{s.name}</h2>
                  <p className="text-xs text-ink-400">{s.role}</p>
                  <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-gold-300">
                    <Star className="size-3.5 fill-current" aria-hidden />
                    {s.rating.toFixed(2).replace('.', ',')}
                    <span className="text-xs font-normal text-ink-400">({s.ratings})</span>
                  </p>
                </div>
                <span className={`ml-auto grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ${i === 0 ? 'bg-gold-500 text-ink-950' : 'bg-ink-800 text-ink-300'}`} aria-label={`${i + 1}º lugar`}>
                  {i === 0 ? <Crown className="size-4" aria-hidden /> : i + 1}
                </span>
              </div>

              <dl className="mt-5 grid grid-cols-2 gap-x-3 gap-y-4 border-t border-white/8 pt-4">
                <Stat label="Faturamento" value={formatBRL0(s.revenue)} strong />
                <Stat label="Comissão" value={formatBRL0(s.commission)} strong />
                <Stat label="Atendimentos" value={String(s.count)} />
                <Stat label="Ticket médio" value={formatBRL(s.ticket)} />
              </dl>

              <div className="mt-5">
                <div className="mb-1.5 flex justify-between text-xs text-ink-400">
                  <span>Participação no faturamento</span>
                  <span className="font-semibold text-ink-200">{formatPercent(s.share)}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-ink-800">
                  <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${s.share * 100}%`, background: colorOf(s.id) }} />
                </div>
              </div>
              <p className="mt-3 text-xs text-ink-400">{s.upcoming} agendados para frente</p>
            </article>
          </Reveal>
        ))}
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card title="Faturamento gerado × comissão" subtitle={`Por barbeiro em ${monthLabel(month)}`}>
          <ul className="mb-3 flex gap-5 text-xs text-ink-300">
            <li className="flex items-center gap-2"><span className="size-2.5 rounded-sm" style={{ background: chartColors.gold }} />Faturamento</li>
            <li className="flex items-center gap-2"><span className="size-2.5 rounded-sm" style={{ background: chartColors.categorical[1] }} />Comissão</li>
          </ul>
          <div className="h-64" role="img" aria-label="Gráfico de barras com faturamento e comissão de cada barbeiro">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparison} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
                <CartesianGrid stroke={chartColors.grid} vertical={false} />
                <XAxis dataKey="name" {...axisProps} />
                <YAxis {...axisProps} tickFormatter={axisMoney} width={44} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTooltip valueFormat={formatBRL0} names={{ faturamento: 'Faturamento', comissao: 'Comissão' }} />} />
                <Bar dataKey="faturamento" fill={chartColors.gold} radius={[4, 4, 0, 0]} maxBarSize={40} />
                <Bar dataKey="comissao" fill={chartColors.categorical[1]} radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Evolução mensal" subtitle="Faturamento de cada barbeiro nos últimos 6 meses fechados">
          <ul className="mb-3 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-300">
            {barbers.map((b) => (
              <li key={b.id} className="flex items-center gap-2">
                <span className="h-0.5 w-4 rounded" style={{ background: colorOf(b.id) }} />
                {b.name.split(' ')[0]}
              </li>
            ))}
          </ul>
          <div className="h-64" role="img" aria-label="Gráfico de linhas com a evolução mensal do faturamento de cada barbeiro">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evolution} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke={chartColors.grid} vertical={false} />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis {...axisProps} tickFormatter={axisMoney} width={44} />
                <Tooltip
                  cursor={{ stroke: chartColors.gold, strokeOpacity: 0.4 }}
                  content={<ChartTooltip valueFormat={formatBRL0} names={Object.fromEntries(barbers.map((b) => [b.id, b.name.split(' ')[0]]))} />}
                />
                {barbers.map((b) => (
                  <Line key={b.id} type="monotone" dataKey={b.id} stroke={colorOf(b.id)} strokeWidth={2} dot={false} activeDot={{ r: 5, stroke: chartColors.surface, strokeWidth: 2 }} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </>
  )
}
