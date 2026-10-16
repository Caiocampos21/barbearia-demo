import { Scissors } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function Logo({ className = '' }: { className?: string }) {
  return (
    <Link to="/" aria-label="Barbearia Navalha de Ouro — início" className={`group flex items-center gap-2.5 sm:gap-3 ${className}`}>
      <span className="grid size-9 shrink-0 place-items-center sm:size-10 rounded-full border border-gold-500/70 bg-ink-900 text-gold-400 transition-transform duration-500 group-hover:rotate-[-18deg]">
        <Scissors className="size-5" aria-hidden />
      </span>
      <span className="font-display leading-none">
        <span className="block text-[0.55rem] font-semibold uppercase tracking-[0.35em] text-ink-300">Barbearia</span>
        <span className="block whitespace-nowrap text-[0.95rem] font-bold sm:tracking-wide sm:text-xl text-gold-gradient">Navalha de Ouro</span>
      </span>
    </Link>
  )
}
