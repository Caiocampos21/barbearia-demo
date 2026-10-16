import { weekHours, weekdayNames } from '../data/seed'

const toMinutes = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number)
  return h * 60 + m
}

/** Diz se a barbearia está aberta agora e quando muda de estado. */
export function getOpenStatus(now: Date = new Date()) {
  const today = weekHours[now.getDay()]
  const minutes = now.getHours() * 60 + now.getMinutes()

  if (today && minutes >= toMinutes(today.open) && minutes < toMinutes(today.close)) {
    return { open: true, label: `Aberto agora · fecha às ${today.close}` }
  }
  if (today && minutes < toMinutes(today.open)) {
    return { open: false, label: `Fechado · abre hoje às ${today.open}` }
  }
  for (let i = 1; i <= 7; i++) {
    const idx = (now.getDay() + i) % 7
    const h = weekHours[idx]
    if (h) {
      const when = i === 1 ? 'amanhã' : weekdayNames[idx].toLowerCase()
      return { open: false, label: `Fechado · abre ${when} às ${h.open}` }
    }
  }
  return { open: false, label: 'Fechado' }
}
