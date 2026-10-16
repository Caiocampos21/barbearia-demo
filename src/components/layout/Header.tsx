import { Menu, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ButtonLink } from '../ui/Button'
import Logo from './Logo'

const links = [
  { to: '/#servicos', label: 'Serviços' },
  { to: '/#galeria', label: 'Galeria' },
  { to: '/#equipe', label: 'Equipe' },
  { to: '/#horarios', label: 'Horários' },
  { to: '/#avaliacoes', label: 'Avaliações' },
]

export default function Header() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  const isBooking = pathname.startsWith('/agendar')

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // fecha o menu ao navegar
  useEffect(() => setOpen(false), [pathname])

  // trava a rolagem do fundo com o menu aberto
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={`no-print fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open || pathname !== '/'
          ? 'border-b border-white/5 bg-ink-950/85 backdrop-blur-xl'
          : 'border-b border-transparent bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:h-20">
        <Logo />

        <nav aria-label="Principal" className="hidden items-center gap-8 lg:flex">
          {links.map((l) => (
            <Link key={l.to} to={l.to} className="text-sm font-medium text-ink-200 transition-colors hover:text-gold-300">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {!isBooking && (
            <ButtonLink to="/agendar" className="h-10 px-4 text-sm sm:px-5">
              Agendar
            </ButtonLink>
          )}
          <button
            type="button"
            className="grid size-10 place-items-center rounded-full text-ink-100 hover:bg-white/5 lg:hidden"
            aria-label={open ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={open}
            onClick={() => setOpen((v) => !v)}
          >
            {open ? <X className="size-6" /> : <Menu className="size-6" />}
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Menu móvel" className="animate-page-in h-[calc(100dvh-4rem)] bg-ink-950 px-4 pt-6 lg:hidden">
          <ul className="flex flex-col">
            {links.map((l, i) => (
              <li key={l.to} className="animate-slide-in border-b border-white/5" style={{ animationDelay: `${i * 50}ms` }}>
                <Link to={l.to} className="block py-5 font-display text-3xl text-ink-100 hover:text-gold-300">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <ButtonLink to="/agendar" size="lg" className="mt-8 w-full">
            Agendar horário
          </ButtonLink>
        </nav>
      )}
    </header>
  )
}
