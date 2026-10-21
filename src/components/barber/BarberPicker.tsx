import { ArrowLeft, FlaskConical } from 'lucide-react'
import { Link } from 'react-router-dom'
import BarberAvatar from '../admin/BarberAvatar'
import Logo from '../layout/Logo'
import Reveal from '../ui/Reveal'
import { barbers } from '../../data/seed'

/** Tela de entrada da área do barbeiro. Demo sem senha: basta escolher quem você é. */
export default function BarberPicker({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="min-h-dvh bg-grain">
      <div className="mx-auto flex min-h-dvh max-w-3xl flex-col px-4 py-6 sm:px-6">
        <header className="flex items-center justify-between">
          <Logo badge="Área do barbeiro" />
          <Link to="/" className="flex items-center gap-1.5 text-sm text-ink-300 hover:text-gold-300">
            <ArrowLeft className="size-4" aria-hidden /> Voltar ao site
          </Link>
        </header>

        <main className="flex flex-1 flex-col justify-center py-10">
          <span className="mb-4 flex w-fit items-center gap-1.5 rounded-pill border border-gold-500/30 bg-gold-500/10 px-3 py-1 text-xs text-gold-300">
            <FlaskConical className="size-3.5" aria-hidden />
            Modo demonstração · sem senha
          </span>
          <h1 className="text-4xl font-bold sm:text-5xl">Quem é você?</h1>
          <p className="mt-3 max-w-lg text-ink-300">Escolha seu nome para ver a sua agenda, os seus ganhos e os seus clientes. Os números são os mesmos que o dono vê no painel.</p>

          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            {barbers.map((b, i) => (
              <li key={b.id}>
                <Reveal delay={i * 70} className="h-full">
                  <button
                    type="button"
                    onClick={() => onSelect(b.id)}
                    className="group flex h-full w-full items-center gap-4 rounded-card border border-white/10 bg-ink-900 p-4 text-left shadow-card transition-all hover:-translate-y-0.5 hover:border-gold-500/50"
                  >
                    <BarberAvatar initials={b.initials} gradient={b.gradient} size="lg" />
                    <span className="min-w-0">
                      <span className="block font-display text-xl font-semibold group-hover:text-gold-300">{b.name}</span>
                      <span className="block text-xs font-semibold uppercase tracking-wider text-gold-500">{b.role}</span>
                      <span className="mt-0.5 block truncate text-sm text-ink-300">{b.specialty}</span>
                    </span>
                  </button>
                </Reveal>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs text-ink-400">Na versão completa, cada barbeiro entra com o próprio e-mail e senha.</p>
        </main>
      </div>
    </div>
  )
}
