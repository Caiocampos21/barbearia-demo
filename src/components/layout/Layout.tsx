import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import Footer from './Footer'
import Header from './Header'

/** Rola para a âncora (#secao) ou para o topo a cada navegação. */
function ScrollManager() {
  const { pathname, hash } = useLocation()
  useEffect(() => {
    if (hash) {
      // espera a página montar antes de procurar o elemento
      const t = setTimeout(() => document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth' }), 60)
      return () => clearTimeout(t)
    }
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname, hash])
  return null
}

export default function Layout() {
  const { pathname } = useLocation()
  return (
    <div className="flex min-h-dvh flex-col bg-grain">
      <ScrollManager />
      <Header />
      {/* a key reinicia a animação de entrada a cada troca de página */}
      <main key={pathname} className="animate-page-in flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
