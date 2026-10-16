import { subMonths } from 'date-fns'
import { Landmark, PiggyBank, Receipt, TrendingDown, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { Bar, CartesianGrid, ComposedChart, Line, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import BarberAvatar from '../../components/admin/BarberAvatar'
import Card from '../../components/admin/Card'
import ChartTooltip from '../../components/admin/ChartTooltip'
import { axisProps, chartColors } from '../../components/admin/chartTheme'
import KpiCard from '../../components/admin/KpiCard'
import MonthSelect from '../../components/admin/MonthSelect'
import PageHeader from '../../components/admin/PageHeader'
import RankBars from '../../components/admin/RankBars'
import { useAdminData } from '../../hooks/useAdminData'
import { barberStats, expensesByCategory, monthKey, monthLabel, monthlyFinance, productSpend } from '../../lib/analytics'
import { axisMoney, formatBRL, formatBRL0, formatPercent } from '../../lib/format'
import { startOfMonth } from 'date-fns'

const REV = chartColors.gold
const EXP = chartColors.categorical[2] // laranja
const PROFIT = chartColors.categorical[1] // azul

const Legend = () => (
  <ul className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-300">
    {[
      ['Receitas', REV],
      ['Despesas', EXP],
      ['Lucro', PROFIT],
    ].map(([l, c]) => (
      <li key={l} className="flex items-center gap-2">
        <span className="size-2.5 rounded-sm" style={{ background: c }} aria-hidden />
        {l}
      </li>
    ))}
  </ul>
)

export default function Finance() {
  const ds = useAdminData()
  const [month, setMonth] = useState(() => startOfMonth(new Date()))
  const isCurrent = monthKey(month) === monthKey(ds.now)

  const series7 = monthlyFinance(ds, 7)
  const series = series7.slice(1)
  // o lucro do mês em andamento não entra na linha: despesas fixas já vencidas × receita parcial enganariam
  const chartData = series.map((r) => (r.key === monthKey(ds.now) ? { ...r, lucro: null } : r))
  const row = series.find((r) => r.key === monthKey(month)) ?? series[series.length - 1]
  const prevRow = series7.find((r) => r.key === monthKey(subMonths(month, 1)))
  const delta = (a: number, b?: number) => (b ? ((a - b) / b) * 100 : undefined)
  const margin = row.receita ? row.lucro / row.receita : 0

  const categories = expensesByCategory(ds, month)
  const totalExpenses = categories.reduce((a, c) => a + c.value, 0)
  const products = productSpend(ds, month)
  const totalProducts = products.reduce((a, p) => a + p.total, 0)
  const barbers = barberStats(ds, month)
  const totalCommission = barbers.reduce((a, b) => a + b.commission, 0)

  const compareHint = isCurrent ? 'parcial, até hoje' : prevRow ? `vs. mês anterior` : undefined

  return (
    <>
      <PageHeader title="Financeiro" subtitle={`Receitas, despesas e lucro de ${monthLabel(month)}.`} right={<MonthSelect now={ds.now} value={month} onChange={setMonth} />} />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard label="Receitas" icon={TrendingUp} value={row.receita} format={formatBRL0} delta={isCurrent ? undefined : delta(row.receita, prevRow?.receita)} hint={compareHint} />
        <KpiCard label="Despesas" icon={TrendingDown} value={row.despesas} format={formatBRL0} delta={isCurrent ? undefined : delta(row.despesas, prevRow?.despesas)} deltaInvert hint={compareHint} delay={80} />
        <KpiCard label="Lucro líquido" icon={PiggyBank} value={row.lucro} format={formatBRL0} delta={isCurrent ? undefined : delta(row.lucro, prevRow?.lucro)} hint={compareHint} delay={160} />
        <KpiCard label="Margem de lucro" icon={Landmark} value={margin * 100} format={(n) => `${n.toFixed(0)}%`} hint="lucro ÷ receita" delay={240} />
      </div>

      <Card title="Receitas × despesas" subtitle="Últimos 6 meses · o mês atual está em andamento e não entra na linha de lucro" className="mt-6" action={<Legend />}>
        <div className="h-72 sm:h-80" role="img" aria-label="Gráfico de barras comparando receitas e despesas por mês, com linha de lucro">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barCategoryGap="24%" barGap={4}>
              <CartesianGrid stroke={chartColors.grid} vertical={false} />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...axisProps} tickFormatter={axisMoney} width={44} domain={[0, (max: number) => Math.ceil(max / 10000) * 10000]} tickCount={5} />
              <Tooltip cursor={{ fill: 'rgba(255,255,255,0.04)' }} content={<ChartTooltip valueFormat={formatBRL0} names={{ receita: 'Receitas', despesas: 'Despesas', lucro: 'Lucro' }} />} />
              <Bar dataKey="receita" fill={REV} radius={[4, 4, 0, 0]} maxBarSize={36} />
              <Bar dataKey="despesas" fill={EXP} radius={[4, 4, 0, 0]} maxBarSize={36} />
              <Line type="monotone" dataKey="lucro" stroke={PROFIT} strokeWidth={2} dot={{ r: 4, fill: PROFIT, stroke: chartColors.surface, strokeWidth: 2 }} activeDot={{ r: 6, stroke: chartColors.surface, strokeWidth: 2 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="mt-6 grid gap-6 xl:grid-cols-2">
        <Card title="Despesas por categoria" subtitle={`Total: ${formatBRL(totalExpenses)}`}>
          <RankBars items={categories.map((c) => ({ label: c.name, value: c.value }))} format={formatBRL0} showShare />
        </Card>

        <Card title="Gasto com produtos" subtitle={`Compras de estoque no mês: ${formatBRL(totalProducts)}`}>
          {products.length === 0 ? (
            <p className="rounded-xl border border-dashed border-white/12 p-6 text-center text-sm text-ink-300">Nenhuma compra de produto neste mês.</p>
          ) : (
            <div className="-mx-1 overflow-x-auto">
              <table className="w-full min-w-[22rem] text-left text-sm">
                <thead className="text-xs uppercase tracking-wider text-ink-400">
                  <tr>
                    <th className="px-1 pb-3 font-semibold">Produto</th>
                    <th className="px-1 pb-3 text-right font-semibold">Qtd.</th>
                    <th className="px-1 pb-3 text-right font-semibold">Gasto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/6">
                  {products.map((p) => (
                    <tr key={p.id}>
                      <td className="px-1 py-2.5">
                        <span className="block text-ink-100">{p.name}</span>
                        <span className="text-xs text-ink-400">{p.category}</span>
                      </td>
                      <td className="px-1 py-2.5 text-right tabular-nums text-ink-300">{p.qty}</td>
                      <td className="px-1 py-2.5 text-right font-semibold tabular-nums text-ink-100">{formatBRL(p.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-gold-500/30">
                    <td className="px-1 pt-3 font-semibold text-gold-300" colSpan={2}>
                      Total em produtos
                    </td>
                    <td className="px-1 pt-3 text-right font-display text-lg font-bold tabular-nums text-gold-400">{formatBRL(totalProducts)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Card title="Comissão por funcionário" subtitle={`Total pago à equipe: ${formatBRL(totalCommission)} (${formatPercent(row.receita ? totalCommission / row.receita : 0)} da receita)`} className="mt-6">
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {barbers.map((b) => (
            <li key={b.id} className="rounded-xl border border-white/8 bg-ink-800/50 p-4">
              <div className="flex items-center gap-3">
                <BarberAvatar initials={b.initials} gradient={b.gradient} />
                <div className="min-w-0 leading-tight">
                  <p className="truncate font-semibold text-ink-100">{b.name}</p>
                  <p className="text-xs text-ink-400">Comissão de {formatPercent(b.rate)}</p>
                </div>
              </div>
              <p className="mt-4 font-display text-3xl font-bold tabular-nums text-gold-400">{formatBRL(b.commission)}</p>
              <p className="mt-1 flex items-center gap-1.5 text-xs text-ink-300">
                <Receipt className="size-3.5" aria-hidden />
                gerou {formatBRL0(b.revenue)} em {b.count} atendimentos
              </p>
            </li>
          ))}
        </ul>
      </Card>
    </>
  )
}
