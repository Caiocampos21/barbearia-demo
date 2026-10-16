interface Item {
  name?: string | number
  value?: number | string | null
  color?: string
  dataKey?: string | number
  payload?: Record<string, unknown>
}

interface Props {
  active?: boolean
  payload?: readonly Item[]
  label?: string | number
  /** Formata o valor (ex.: moeda). */
  valueFormat?: (n: number) => string
  /** Escolhe o título a partir do ponto do gráfico. */
  title?: (point: Record<string, unknown> | undefined, label?: string | number) => string
  /** Rótulos legíveis por série. */
  names?: Record<string, string>
}

/** Tooltip no padrão visual do painel (card escuro, borda dourada sutil). */
export default function ChartTooltip({ active, payload, label, valueFormat = String, title, names = {} }: Props) {
  if (!active || !payload?.length) return null
  const rows = payload.filter((p) => p.value !== null && p.value !== undefined)
  if (!rows.length) return null
  return (
    <div className="min-w-40 rounded-xl border border-gold-500/30 bg-ink-950/95 px-3.5 py-3 text-sm shadow-card backdrop-blur">
      <p className="mb-1.5 text-xs font-semibold uppercase tracking-wider text-gold-400">{title ? title(payload[0]?.payload, label) : label}</p>
      <ul className="space-y-1">
        {rows.map((p, i) => (
          <li key={i} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-ink-200">
              <span className="size-2.5 rounded-sm" style={{ background: p.color }} aria-hidden />
              {names[String(p.dataKey)] ?? p.name}
            </span>
            <span className="font-semibold tabular-nums text-ink-100">{valueFormat(Number(p.value))}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
