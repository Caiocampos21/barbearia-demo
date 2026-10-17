import { FlaskConical } from 'lucide-react'
import ResetDemo from './ResetDemo'

/** Selo discreto no canto da tela: avisa que é uma demonstração e permite resetar. */
export default function DemoPill() {
  return (
    <div className="no-print fixed bottom-3 left-3 z-40 flex items-center gap-2 rounded-pill border border-white/10 bg-ink-950/80 py-1 pl-3 pr-1 text-[0.7rem] text-ink-300 shadow-card backdrop-blur-md">
      <FlaskConical className="size-3.5 text-gold-500" aria-hidden />
      <span>Ambiente de demonstração</span>
      <ResetDemo className="flex h-6 items-center gap-1 rounded-pill bg-white/8 px-2.5 font-semibold text-gold-300 hover:bg-white/15">Resetar</ResetDemo>
    </div>
  )
}
