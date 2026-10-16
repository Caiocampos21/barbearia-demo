import { AlertOctagon, AlertTriangle, Boxes, CheckCircle2, PackageSearch, Search, ShoppingCart, Wallet } from 'lucide-react'
import { useMemo, useState } from 'react'
import Card from '../../components/admin/Card'
import KpiCard from '../../components/admin/KpiCard'
import PageHeader from '../../components/admin/PageHeader'
import { useAdminData } from '../../hooks/useAdminData'
import { stockLevel } from '../../lib/analytics'
import { formatBRL, formatBRL0 } from '../../lib/format'
import type { Product } from '../../lib/types'

const levelInfo = {
  critico: { label: 'Crítico', icon: AlertOctagon, text: 'text-danger', bar: 'bg-danger', chip: 'bg-danger/15 text-danger' },
  baixo: { label: 'Baixo', icon: AlertTriangle, text: 'text-gold-300', bar: 'bg-gold-500', chip: 'bg-gold-500/15 text-gold-300' },
  ok: { label: 'OK', icon: CheckCircle2, text: 'text-success', bar: 'bg-success', chip: 'bg-success/15 text-success' },
}
const order = { critico: 0, baixo: 1, ok: 2 }

/** Quantidade sugerida para voltar a 2× o mínimo. */
const refill = (p: Product) => Math.max(0, p.minQty * 2 - p.qty)

export default function Stock() {
  const ds = useAdminData()
  const [onlyAlert, setOnlyAlert] = useState(false)
  const [query, setQuery] = useState('')

  const rows = useMemo(
    () =>
      ds.products
        .map((p) => ({ p, level: stockLevel(p) }))
        .sort((a, b) => order[a.level] - order[b.level] || a.p.name.localeCompare(b.p.name)),
    [ds.products],
  )
  const alerts = rows.filter((r) => r.level !== 'ok')
  const stockValue = ds.products.reduce((a, p) => a + p.qty * p.unitCost, 0)
  const refillCost = alerts.reduce((a, r) => a + refill(r.p) * r.p.unitCost, 0)
  const shown = rows.filter((r) => (!onlyAlert || r.level !== 'ok') && (!query.trim() || r.p.name.toLowerCase().includes(query.trim().toLowerCase())))

  return (
    <>
      <PageHeader title="Estoque" subtitle="Produtos, quantidades e alertas de reposição." />

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <KpiCard label="Produtos" icon={Boxes} value={ds.products.length} format={(n) => Math.round(n).toString()} hint="itens cadastrados" />
        <KpiCard label="Estoque baixo" icon={AlertTriangle} value={alerts.length} format={(n) => Math.round(n).toString()} hint={`${rows.filter((r) => r.level === 'critico').length} em nível crítico`} delay={80} />
        <KpiCard label="Valor em estoque" icon={Wallet} value={stockValue} format={formatBRL0} hint="a preço de custo" delay={160} />
        <KpiCard label="Reposição sugerida" icon={ShoppingCart} value={refillCost} format={formatBRL0} hint="para sair do alerta" delay={240} />
      </div>

      {alerts.length > 0 && (
        <section aria-label="Alertas de estoque" className="mt-6 rounded-card border border-danger/40 bg-danger/8 p-5">
          <h2 className="flex items-center gap-2 font-display text-xl font-semibold text-ink-100">
            <AlertTriangle className="size-5 text-danger" aria-hidden />
            {alerts.length} {alerts.length === 1 ? 'produto precisa' : 'produtos precisam'} de reposição
          </h2>
          <ul className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {alerts.map(({ p, level }) => {
              const L = levelInfo[level]
              return (
                <li key={p.id} className="flex items-center justify-between gap-3 rounded-xl bg-ink-900/80 px-4 py-3 text-sm">
                  <span className="min-w-0">
                    <strong className="block truncate text-ink-100">{p.name}</strong>
                    <span className="text-xs text-ink-400">
                      {p.qty} em estoque · mínimo {p.minQty} · comprar ~{refill(p)}
                    </span>
                  </span>
                  <span className={`flex shrink-0 items-center gap-1 rounded-pill px-2 py-0.5 text-[0.65rem] font-bold uppercase tracking-wider ${L.chip}`}>
                    <L.icon className="size-3" aria-hidden />
                    {L.label}
                  </span>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <Card title="Todos os produtos" subtitle={`${shown.length} de ${rows.length}`} className="mt-6">
        <div className="mb-5 flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Buscar produto</span>
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-gold-500" aria-hidden />
            <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Buscar produto" className="h-11 w-full rounded-pill border border-white/12 bg-ink-950 pl-11 pr-4 text-sm text-ink-100 placeholder:text-ink-500 focus:border-gold-400 focus:outline-none" />
          </label>
          <button type="button" aria-pressed={onlyAlert} onClick={() => setOnlyAlert((v) => !v)} className={`h-11 rounded-pill border px-5 text-sm font-semibold transition-colors ${onlyAlert ? 'border-gold-400 bg-gold-500 text-ink-950' : 'border-white/12 text-ink-200 hover:border-gold-500/50'}`}>
            Só em alerta
          </button>
        </div>

        <div className="hidden grid-cols-[2.2fr_1.6fr_0.8fr_0.9fr_1fr_1fr] gap-4 px-3 pb-2 text-xs font-semibold uppercase tracking-wider text-ink-400 lg:grid">
          <span>Produto</span>
          <span>Nível</span>
          <span className="text-right">Mínimo</span>
          <span className="text-right">Custo un.</span>
          <span className="text-right">Valor em estoque</span>
          <span>Fornecedor</span>
        </div>

        {shown.length === 0 ? (
          <div className="flex flex-col items-center gap-2 p-10 text-center text-sm text-ink-300">
            <PackageSearch className="size-8 text-ink-400" aria-hidden />
            Nenhum produto encontrado.
          </div>
        ) : (
          <ul className="divide-y divide-white/6">
            {shown.map(({ p, level }) => {
              const L = levelInfo[level]
              const pct = Math.min(100, (p.qty / (p.minQty * 2)) * 100)
              return (
                <li key={p.id} className="grid items-center gap-x-4 gap-y-2 rounded-xl px-3 py-3 hover:bg-white/4 lg:grid-cols-[2.2fr_1.6fr_0.8fr_0.9fr_1fr_1fr]">
                  <span className="min-w-0">
                    <strong className="block truncate text-ink-100">{p.name}</strong>
                    <span className="text-xs text-ink-400">{p.category}</span>
                  </span>
                  <span>
                    <span className="mb-1.5 flex items-center justify-between gap-2 text-sm">
                      <span className="font-semibold tabular-nums text-ink-100">
                        {p.qty} <span className="text-xs font-normal text-ink-400">{p.unit}{p.qty === 1 ? '' : 's'}</span>
                      </span>
                      <span className={`flex items-center gap-1 text-xs font-bold ${L.text}`}>
                        <L.icon className="size-3.5" aria-hidden />
                        {L.label}
                      </span>
                    </span>
                    <span className="block h-2 overflow-hidden rounded-full bg-ink-800" role="presentation">
                      <span className={`block h-full rounded-full transition-[width] duration-700 ${L.bar}`} style={{ width: `${pct}%` }} />
                    </span>
                  </span>
                  <span className="text-sm tabular-nums text-ink-300 lg:text-right">
                    <span className="mr-1 text-xs text-ink-500 lg:hidden">mín.</span>
                    {p.minQty}
                  </span>
                  <span className="text-sm tabular-nums text-ink-300 lg:text-right">{formatBRL(p.unitCost)}</span>
                  <span className="text-sm font-semibold tabular-nums text-ink-100 lg:text-right">{formatBRL(p.qty * p.unitCost)}</span>
                  <span className="truncate text-xs text-ink-400">{p.supplier}</span>
                </li>
              )
            })}
          </ul>
        )}
      </Card>
    </>
  )
}
