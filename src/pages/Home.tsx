import { usePageTitle } from '../hooks/usePageTitle'
import FinalCta from '../components/home/FinalCta'
import Gallery from '../components/home/Gallery'
import Hero from '../components/home/Hero'
import Hours from '../components/home/Hours'
import Location from '../components/home/Location'
import Reviews from '../components/home/Reviews'
import Services from '../components/home/Services'
import Stats from '../components/home/Stats'
import Team from '../components/home/Team'

export default function Home() {
  usePageTitle()
  return (
    <>
      <Hero />
      <Stats />
      <Services />
      <Gallery />
      <Team />
      <Hours />
      <Location />
      <Reviews />
      <FinalCta />
    </>
  )
}
