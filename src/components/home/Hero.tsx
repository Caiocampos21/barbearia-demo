import { ChevronDown, Star, Zap } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { barbers, business, services } from '../../data/seed'
import { getOpenStatus } from '../../lib/hours'
import { heroImage } from '../../lib/images'
import { nextFreeSlot } from '../../lib/schedule'
import { loadAppointments } from '../../lib/storage'
import { ButtonLink } from '../ui/Button'
import Photo from '../ui/Photo'

export default function Hero() {
  const [status, setStatus] = useState(getOpenStatus())
  const next = useMemo(() => nextFreeSlot(barbers, services[0], loadAppointments()), [])

  useEffect(() => {
    const t = setInterval(() => setStatus(getOpenStatus()), 60_000)
    return () => clearInterval(t)
  }, [])

  return (
    <section className="relative flex min-h-dvh items-center overflow-hidden">
      <div className="absolute inset-0 animate-kenburns" aria-hidden>
        <Photo id={heroImage} alt="" width={1600} eager className="size-full" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-ink-950/55 via-ink-950/30 to-ink-950" />
      <div className="absolute inset-0 bg-gradient-to-r from-ink-950/85 via-ink-950/25 to-transparent" />

      <div className="relative mx-auto w-full max-w-6xl px-4 pb-24 pt-32 sm:px-6">
        <div className="animate-fade-up inline-flex items-center gap-2 rounded-pill border border-white/10 bg-ink-950/60 px-4 py-2 text-xs backdrop-blur">
          <span className="relative flex size-2">
            <span className={`absolute inline-flex size-full animate-ping rounded-full ${status.open ? 'bg-success' : 'bg-danger'} opacity-70`} />
            <span className={`relative inline-flex size-2 rounded-full ${status.open ? 'bg-success' : 'bg-danger'}`} />
          </span>
          <span className="text-ink-100">{status.label}</span>
        </div>

        <h1 className="animate-fade-up mt-6 max-w-3xl text-5xl font-extrabold leading-[1.05] sm:text-7xl lg:text-8xl" style={{ animationDelay: '120ms' }}>
          O corte certo.
          <br />
          <span className="text-gold-gradient italic">A navalha de ouro.</span>
        </h1>

        <p className="animate-fade-up mt-6 max-w-xl text-lg text-ink-200 sm:text-xl" style={{ animationDelay: '240ms' }}>
          {business.tagline} Cortes clássicos, barba com toalha quente e uma experiência feita para quem leva o visual a sério.
        </p>

        <div className="animate-fade-up mt-10 flex flex-col gap-3 sm:flex-row" style={{ animationDelay: '360ms' }}>
          <ButtonLink to="/agendar" size="lg">
            Agendar horário
          </ButtonLink>
          <ButtonLink to="/#servicos" size="lg" variant="outline">
            Ver serviços e preços
          </ButtonLink>
        </div>

        {next && (
          <Link
            to={`/agendar?servico=${services[0].id}`}
            className="animate-fade-up mt-6 inline-flex items-center gap-2 rounded-pill border border-gold-500/40 bg-gold-500/10 px-4 py-2 text-sm text-gold-200 transition-colors hover:bg-gold-500/20"
            style={{ animationDelay: '420ms' }}
          >
            <Zap className="size-4 text-gold-400" aria-hidden />
            Próximo horário livre: <strong className="text-gold-300">{next.isToday ? 'hoje' : next.isTomorrow ? 'amanhã' : next.key.split('-').reverse().slice(0, 2).join('/')} às {next.time}</strong>
          </Link>
        )}

        <div className="animate-fade-up mt-8 flex items-center gap-3 text-sm text-ink-200" style={{ animationDelay: '480ms' }}>
          <div className="flex text-gold-400" aria-hidden>
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-4 fill-current" />
            ))}
          </div>
          <span>
            <strong className="text-ink-100">4,9</strong> · mais de 1.200 avaliações no Google
          </span>
        </div>
      </div>

      <a href="#servicos" aria-label="Rolar para os serviços" className="absolute bottom-6 left-1/2 hidden -translate-x-1/2 text-gold-400 sm:block">
        <ChevronDown className="size-7 animate-bounce" />
      </a>
    </section>
  )
}
