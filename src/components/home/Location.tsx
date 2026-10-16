import { MapPin, MessageCircle, Navigation } from 'lucide-react'
import { business } from '../../data/seed'
import { ButtonLink } from '../ui/Button'
import Reveal from '../ui/Reveal'
import SectionTitle from '../ui/SectionTitle'

const d = 0.006
const mapSrc =
  `https://www.openstreetmap.org/export/embed.html?bbox=${business.lng - d},${business.lat - d / 2},${business.lng + d},${business.lat + d / 2}` +
  `&layer=mapnik&marker=${business.lat},${business.lng}`
const directions = `https://www.google.com/maps/dir/?api=1&destination=${business.lat},${business.lng}`

export default function Location() {
  return (
    <section id="localizacao" className="mx-auto max-w-6xl px-4 py-24 sm:px-6">
      <SectionTitle eyebrow="Localização" title="No coração da Savassi" subtitle="Fácil de chegar, com estacionamento conveniado ao lado." />

      <div className="grid gap-6 lg:grid-cols-5">
        <Reveal className="lg:col-span-3">
          <div className="overflow-hidden rounded-card border border-white/8 shadow-card">
            <iframe
              title="Mapa da Barbearia Navalha de Ouro"
              src={mapSrc}
              loading="lazy"
              className="map-dark block h-80 w-full sm:h-96"
            />
          </div>
        </Reveal>

        <Reveal delay={120} className="lg:col-span-2">
          <div className="flex h-full flex-col justify-center gap-5 rounded-card border border-white/8 bg-ink-900 p-6 shadow-card sm:p-8">
            <div className="flex gap-4">
              <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-gold-500/10 text-gold-400">
                <MapPin className="size-5" aria-hidden />
              </span>
              <div>
                <p className="font-display text-xl font-semibold">{business.address}</p>
                <p className="text-sm text-ink-300">
                  {business.city} · CEP {business.cep}
                </p>
              </div>
            </div>
            <ButtonLink to="/agendar" size="lg" className="w-full">
              Agendar horário
            </ButtonLink>
            <a
              href={directions}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-pill border border-white/15 text-sm font-semibold text-ink-100 transition-colors hover:border-gold-500/60 hover:text-gold-300"
            >
              <Navigation className="size-4" aria-hidden />
              Como chegar
            </a>
            <a
              href={`https://wa.me/${business.whatsapp}`}
              target="_blank"
              rel="noreferrer"
              className="inline-flex h-12 items-center justify-center gap-2 rounded-pill border border-white/15 text-sm font-semibold text-ink-100 transition-colors hover:border-success hover:text-success"
            >
              <MessageCircle className="size-4" aria-hidden />
              Falar no WhatsApp
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  )
}
