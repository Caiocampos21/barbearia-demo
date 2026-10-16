import { Check } from 'lucide-react'

interface Props {
  steps: string[]
  current: number
  onJump: (index: number) => void
}

/** Indicador de progresso. Passos já concluídos são clicáveis para voltar. */
export default function Stepper({ steps, current, onJump }: Props) {
  return (
    <ol className="flex items-center" aria-label="Etapas do agendamento">
      {steps.map((label, i) => {
        const done = i < current
        const active = i === current
        return (
          <li key={label} className="flex flex-1 items-center last:flex-none" aria-current={active ? 'step' : undefined}>
            <button
              type="button"
              disabled={!done}
              onClick={() => onJump(i)}
              className="group flex flex-col items-center gap-1.5 disabled:cursor-default"
              aria-label={`${label}${done ? ' (concluída — voltar)' : ''}`}
            >
              <span
                className={`grid size-9 place-items-center rounded-full border text-sm font-bold transition-all duration-300 ${
                  done
                    ? 'border-gold-500 bg-gold-500 text-ink-950 group-hover:bg-gold-400'
                    : active
                      ? 'border-gold-400 bg-gold-500/10 text-gold-300 shadow-glow'
                      : 'border-white/15 text-ink-400'
                }`}
              >
                {done ? <Check className="size-4" strokeWidth={3} /> : i + 1}
              </span>
              <span className={`hidden text-[0.7rem] font-medium sm:block ${active ? 'text-gold-300' : done ? 'text-ink-200' : 'text-ink-400'}`}>{label}</span>
            </button>
            {i < steps.length - 1 && (
              <span className="relative mx-2 mb-0 h-px flex-1 bg-white/10 sm:mb-5">
                <span className={`absolute inset-y-0 left-0 bg-gold-500 transition-all duration-500 ${done ? 'w-full' : 'w-0'}`} />
              </span>
            )}
          </li>
        )
      })}
    </ol>
  )
}
