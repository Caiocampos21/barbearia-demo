import { CalendarClock, Receipt, Scissors, Star, Wallet } from 'lucide-react'
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import Card from '../../components/admin/Card'
import ChartTooltip from '../../components/admin/ChartTooltip'
import { axisProps, chartColors } from '../../components/admin/chartTheme'
import KpiCard from '../../components/admin/KpiCard'
import PageHeader from '../../components/admin/PageHeader'
import { HISTORY_MONTHS } from '../../data/adminSeed'
import { useAdminData } from '../../hooks/useAdminData'
import { useBarberContext } from '../../hooks/useBarber'
import { monthLabel } from '../../lib/analytics'
import { barberHistory, barberMonth, monthlyGoal } from '../../lib/barberAnalytics'
import { axisMoney, formatBRL, formatBRL0, formatPercent } from '../../lib/format'

export default function BarberEarnings() {
  const { barber } = useBarberContext()
  const ds = useAdminData()
  const m = barberMonth(ds, barber.id, ds.now)
  const history = barberHistory(ds, barber.id, HISTORY_MONTHS)
  const goal = monthlyGoal(history)
  const doneShare = goal ? Math.min(1, m.revenue / goal) : 0
  const bookedShare = goal ? Math.min(1 - doneShare, m.scheduled / goal) : 0
  const reached = goal > 0 && m.revenue >= goal
  const projected = m.revenue + m.scheduled
  const prev = history.at(-2)

  return (
    <>
      <PageHeader title="Meus ganhos" subtitle={`Como você está em ${monthLabel(ds.now)}. Comissão de ${formatPercent(m.rate)} sobre cada atendimento concluído.`} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
        <KpiCard label="Comissão do mês" value={m.commission} format={formatBRL0} icon={Wallet} hint={prev ? `set: ${formatBRL0(prev.commission)}` : undefined} />
        <KpiCard label="Atendimentos" value={m.count} format={(n) => String(Math.round(n))} icon={Scissors} delay={80} hint="concluídos no mês" />
        <KpiCard label="Ticket médio" value={m.ticket} format={formatBRL} icon={Receipt} delay={160} />
        <KpiCard label="Sua nota" value={barber.rating} format={(n) => n.toFixed(1).replace('.', ',')} icon={Star} delay={240} hint="média dos clientes" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <Card title="Meta do mês" subtitle={`Faturamento gerado: média dos meses fechados + 6% = ${formatBRL0(goal)}`} className="lg:col-span-2">
          <p className="font-display text-4xl font-bold text-gold-400 tabular-nums">{formatPercent(goal ? m.revenue / goal : 0)}</p>
          <p className="mt-1 text-sm text-ink-300">
            {formatBRL0(m.revenue)} de {formatBRL0(goal)}
          </p>
          <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-ink-800" role="img" aria-label={`${Math.round(doneShare * 100)}% da meta já concluído`}>
            <div className="h-full bg-gold-500 transition-[width] duration-700" style={{ width: `${doneShare * 100}%` }} />
            <div className="h-full bg-gold-500/30 transition-[width] duration-700" style={{ width: `${bookedShare * 100}%` }} />
          </div>
          <ul className="mt-2 flex gap-4 text-xs text-ink-400">
            <li className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-gold-500" />Feito</li>
            <li className="flex items-center gap-1.5"><span className="size-2 rounded-full bg-gold-500/30" />Agendado</li>
          </ul>
          <p className="mt-4 rounded-xl bg-ink-800/70 p-3 text-sm text-ink-200">
            {reached ? 'Meta batida! Tudo daqui para frente é bônus.' : projected >= goal ? 'Com o que já está agendado, você bate a meta.' : `Faltam ${formatBRL0(Math.max(0, goal - projected))} em agendamentos para bater a meta.`}
          </p>
        </Card>

        <Card title="Evolução" subtitle="Faturamento gerado e comissão por mês (o último está em andamento)" className="lg:col-span-3">
          <ul className="mb-3 flex gap-5 text-xs text-ink-300">
            <li className="flex items-center gap-2"><span className="size-2.5 rounded-sm" style={{ background: chartColors.gold }} />Faturamento</li>
            <li className="flex items-center gap-2"><span className="size-2.5 rounded-sm" style={{ background: chartColors.categorical[1] }} />Comissão</li>
          </ul>
          <div className="h-60" role="img" aria-label="Gráfico de barras com seu faturamento e sua comissão por mês">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={4}>
                <CartesianGrid stroke={chartColors.grid} vertical={false} />
                <XAxis dataKey="label" {...axisProps} />
                <YAxis {...axisProps} tickFormatter={axisMoney} width={44} />
                <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTooltip valueFormat={formatBRL0} names={{ revenue: 'Faturamento', commission: 'Comissão' }} />} />
                <Bar dataKey="revenue" fill={chartColors.gold} radius={[4, 4, 0, 0]} maxBarSize={36} />
                <Bar dataKey="commission" fill={chartColors.categorical[1]} radius={[4, 4, 0, 0]} maxBarSize={36} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      <Card title="A caminho" subtitle="O que já está agendado até o fim do mês" className="mt-6">
        <div className="flex items-center gap-4">
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-gold-500/15 text-gold-400">
            <CalendarClock className="size-6" aria-hidden />
          </span>
          <p className="text-ink-200">
            <strong className="font-display text-2xl text-gold-400">{formatBRL0(m.scheduledCommission)}</strong> de comissão em <strong>{m.scheduledCount}</strong> atendimentos marcados ({formatBRL0(m.scheduled)} em serviços).
          </p>
        </div>
      </Card>
    </>
  )
}
