import { RotateCcw } from 'lucide-react'
import { useEffect, useState } from 'react'
import { resetDemo } from '../../lib/storage'

interface Props {
  className?: string
  children?: React.ReactNode
}

/** Botão "resetar dados" com confirmação. Limpa o que a demo salvou e recarrega a página. */
export default function ResetDemo({ className = '', children }: Props) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  const confirm = () => {
    resetDemo()
    window.location.reload()
  }

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className={className}>
        <RotateCcw className="size-3.5" aria-hidden />
        {children ?? 'Resetar dados'}
      </button>

      {open && (
        <div role="dialog" aria-modal="true" aria-labelledby="reset-title" className="fixed inset-0 z-[70] grid place-items-center bg-black/70 p-4" onClick={() => setOpen(false)}>
          <div className="animate-pop w-full max-w-sm rounded-card border border-white/10 bg-ink-900 p-6 shadow-card" onClick={(e) => e.stopPropagation()}>
            <h2 id="reset-title" className="font-display text-2xl font-semibold">
              Resetar a demonstração?
            </h2>
            <p className="mt-2 text-sm text-ink-300">Isso apaga os agendamentos feitos nesta demo e volta tudo aos dados originais.</p>
            <div className="mt-6 flex gap-3">
              <button type="button" onClick={() => setOpen(false)} className="h-11 flex-1 rounded-pill border border-white/15 text-sm font-semibold text-ink-200 hover:border-gold-500/50">
                Cancelar
              </button>
              <button type="button" onClick={confirm} className="h-11 flex-1 rounded-pill bg-gradient-to-b from-gold-400 to-gold-600 text-sm font-semibold text-ink-950 hover:from-gold-300 hover:to-gold-500">
                Resetar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
