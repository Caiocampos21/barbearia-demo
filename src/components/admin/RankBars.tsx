interface Item {
  label: string
  value: number
  sub?: string
  color?: string
}

interface Props {
  items: Item[]
  format: (n: number) => string
  /** Mostra % do total ao lado do valor. */
  showShare?: boolean
}

/** Barras horizontais ordenadas (ranking). Valor sempre escrito ao lado — nunca só cor. */
export default function RankBars({ items, format, showShare = false }: Props) {
  const max = Math.max(...items.map((i) => i.value), 1)
  const total = items.reduce((a, i) => a + i.value, 0) || 1
  return (
    <ul className="space-y-4">
      {items.map((item, idx) => (
        <li key={item.label}>
          <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate text-ink-100">
              <span className="mr-2 text-xs font-bold text-ink-400">{idx + 1}</span>
              {item.label}
              {item.sub && <span className="ml-2 text-xs text-ink-400">{item.sub}</span>}
            </span>
            <span className="shrink-0 font-semibold tabular-nums text-ink-100">
              {format(item.value)}
              {showShare && <span className="ml-2 text-xs font-medium text-ink-400">{Math.round((item.value / total) * 100)}%</span>}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-ink-800" role="presentation">
            <div className="h-full rounded-full transition-[width] duration-700" style={{ width: `${(item.value / max) * 100}%`, background: item.color ?? '#c8a24b' }} />
          </div>
        </li>
      ))}
    </ul>
  )
}
