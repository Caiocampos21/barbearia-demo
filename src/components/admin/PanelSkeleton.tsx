/** Esqueleto exibido enquanto a página do painel (com os gráficos) carrega. */
export default function PanelSkeleton() {
  const block = 'animate-pulse rounded-card bg-ink-800/70'
  return (
    <div role="status" aria-label="Carregando painel" className="space-y-6">
      <div className="space-y-2">
        <div className={`${block} h-10 w-56`} />
        <div className={`${block} h-4 w-72 max-w-full`} />
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className={`${block} h-32 sm:h-40`} />
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-3">
        <div className={`${block} h-80 xl:col-span-2`} />
        <div className={`${block} h-80`} />
      </div>
      <span className="sr-only">Carregando…</span>
    </div>
  )
}
