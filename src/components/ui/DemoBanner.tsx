import { FlaskConical } from 'lucide-react'

/** Aviso de que o fluxo é uma demonstração. */
export default function DemoBanner({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 rounded-card border border-gold-500/40 bg-gold-500/10 p-4 text-sm text-gold-200">
      <FlaskConical className="mt-0.5 size-5 shrink-0 text-gold-400" aria-hidden />
      <p className="text-gold-300">{children}</p>
    </div>
  )
}
