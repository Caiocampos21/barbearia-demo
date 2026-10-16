import { AtSign, Clock, MapPin, Phone } from 'lucide-react'
import { Link } from 'react-router-dom'
import { business } from '../../data/seed'
import Logo from './Logo'

export default function Footer() {
  return (
    <footer className="no-print border-t border-white/5 bg-ink-900/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-4 max-w-xs text-sm text-ink-300">{business.tagline}</p>
        </div>

        <div className="space-y-3 text-sm text-ink-200">
          <h3 className="font-display text-lg text-ink-100">Contato</h3>
          <p className="flex gap-3">
            <MapPin className="mt-0.5 size-4 shrink-0 text-gold-500" aria-hidden />
            <span>
              {business.address}
              <br />
              {business.city} · CEP {business.cep}
            </span>
          </p>
          <p className="flex gap-3">
            <Phone className="size-4 shrink-0 text-gold-500" aria-hidden />
            <a href={`https://wa.me/${business.whatsapp}`} className="hover:text-gold-300">
              {business.phone}
            </a>
          </p>
          <p className="flex gap-3">
            <AtSign className="size-4 shrink-0 text-gold-500" aria-hidden />
            <span>{business.instagram}</span>
          </p>
        </div>

        <div className="space-y-3 text-sm text-ink-200">
          <h3 className="font-display text-lg text-ink-100">Funcionamento</h3>
          <p className="flex gap-3">
            <Clock className="mt-0.5 size-4 shrink-0 text-gold-500" aria-hidden />
            <span>
              Seg a Sex · 09h às 20h
              <br />
              Sábado · 08h às 18h
              <br />
              Domingo · fechado
            </span>
          </p>
          <Link to="/agendar" className="inline-block pt-2 font-semibold text-gold-400 hover:text-gold-300">
            Agendar horário →
          </Link>
        </div>
      </div>

      <div className="border-t border-white/5 px-4 py-6 text-center text-xs text-ink-400">
        <p>
          © {new Date().getFullYear()} {business.fullName}. Site de demonstração — todos os dados, nomes e preços são fictícios.
        </p>
        <p className="mt-1">
          Desenvolvido por <span className="font-semibold text-gold-500">CAIOCAMPOS.DEV</span>
          {' · '}
          <Link to="/painel" className="hover:text-gold-300">
            Painel do dono
          </Link>
        </p>
      </div>
    </footer>
  )
}
