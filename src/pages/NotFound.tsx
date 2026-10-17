import { Scissors } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ButtonLink } from '../components/ui/Button'
import { usePageTitle } from '../hooks/usePageTitle'

const quick = [
  { to: '/#servicos', label: 'Serviços e preços' },
  { to: '/#equipe', label: 'Conheça a equipe' },
  { to: '/#horarios', label: 'Horários de funcionamento' },
]

export default function NotFound() {
  usePageTitle('Página não encontrada')
  return (
    <section className="relative mx-auto flex min-h-[80dvh] max-w-xl flex-col items-center justify-center px-4 pb-16 pt-28 text-center">
      <div className="pointer-events-none absolute left-1/2 top-1/3 size-72 -translate-x-1/2 rounded-full bg-gold-500/10 blur-3xl" aria-hidden />
      <span className="relative grid size-16 place-items-center rounded-full border border-gold-500/60 bg-ink-900 text-gold-400">
        <Scissors className="size-7 animate-snip" aria-hidden />
      </span>
      <p className="relative mt-6 font-display text-8xl font-extrabold leading-none text-gold-gradient sm:text-9xl">404</p>
      <h1 className="relative mt-4 text-3xl font-bold">Esse corte não existe</h1>
      <p className="relative mt-3 text-ink-300">A página que você procura foi aparada, mudou de endereço ou nunca existiu. Que tal voltar para o que importa?</p>
      <div className="relative mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink to="/" size="lg">
          Ir para o início
        </ButtonLink>
        <ButtonLink to="/agendar" size="lg" variant="outline">
          Agendar horário
        </ButtonLink>
      </div>
      <ul className="relative mt-10 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
        {quick.map((q) => (
          <li key={q.to}>
            <Link to={q.to} className="text-ink-300 underline-offset-4 hover:text-gold-300 hover:underline">
              {q.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}
