import { CreditCard, Lock, Wifi } from 'lucide-react'

export interface CardData {
  number: string
  name: string
  expiry: string
  cvv: string
}

export const demoCard: CardData = { number: '4242 4242 4242 4242', name: '', expiry: '12/30', cvv: '123' }

const maskNumber = (v: string) => v.replace(/\D/g, '').slice(0, 16).replace(/(.{4})/g, '$1 ').trim()
const maskExpiry = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 4)
  return d.length > 2 ? `${d.slice(0, 2)}/${d.slice(2)}` : d
}

export const cardIsValid = (c: CardData) => c.number.replace(/\s/g, '').length === 16 && c.name.trim().length >= 3 && c.expiry.length === 5 && c.cvv.length >= 3

interface Props {
  value: CardData
  onChange: (c: CardData) => void
}

export default function CardForm({ value, onChange }: Props) {
  const set = (patch: Partial<CardData>) => onChange({ ...value, ...patch })
  const input =
    'h-12 w-full rounded-xl border border-white/12 bg-ink-950 px-4 text-base text-ink-100 placeholder:text-ink-500 focus:border-gold-400 focus:outline-none'
  const display = value.number.padEnd(19, '•').replace(/[^\d ]/g, '•')

  return (
    <div className="space-y-6">
      {/* Cartão ilustrativo */}
      <div className="relative mx-auto aspect-[1.586/1] w-full max-w-sm overflow-hidden rounded-2xl bg-gradient-to-br from-leather-600 via-ink-800 to-ink-950 p-5 shadow-glow">
        <div className="pointer-events-none absolute -right-10 -top-10 size-44 rounded-full bg-gold-500/20 blur-2xl" />
        <div className="relative flex items-start justify-between text-gold-300">
          <span className="font-display text-sm font-semibold tracking-widest">NAVALHA DE OURO</span>
          <Wifi className="size-6 rotate-90" aria-hidden />
        </div>
        <div className="relative mt-7 h-9 w-12 rounded-md bg-gradient-to-br from-gold-300 to-gold-600" />
        <p className="relative mt-5 font-mono text-lg tracking-[0.15em] text-ink-100 sm:text-xl">{display}</p>
        <div className="relative mt-4 flex items-end justify-between text-xs uppercase text-ink-200">
          <span className="max-w-[60%] truncate">{value.name || 'Nome no cartão'}</span>
          <span>{value.expiry || 'MM/AA'}</span>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label htmlFor="card-number" className="mb-1.5 block text-sm text-ink-200">
            Número do cartão
          </label>
          <div className="relative">
            <CreditCard className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gold-500" aria-hidden />
            <input id="card-number" inputMode="numeric" autoComplete="off" className={`${input} pl-12`} value={value.number} onChange={(e) => set({ number: maskNumber(e.target.value) })} placeholder="0000 0000 0000 0000" />
          </div>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="card-name" className="mb-1.5 block text-sm text-ink-200">
            Nome impresso no cartão
          </label>
          <input id="card-name" autoComplete="off" className={`${input} uppercase`} value={value.name} onChange={(e) => set({ name: e.target.value })} placeholder="NOME SOBRENOME" />
        </div>
        <div>
          <label htmlFor="card-exp" className="mb-1.5 block text-sm text-ink-200">
            Validade
          </label>
          <input id="card-exp" inputMode="numeric" autoComplete="off" className={input} value={value.expiry} onChange={(e) => set({ expiry: maskExpiry(e.target.value) })} placeholder="MM/AA" />
        </div>
        <div>
          <label htmlFor="card-cvv" className="mb-1.5 block text-sm text-ink-200">
            CVV
          </label>
          <input id="card-cvv" inputMode="numeric" autoComplete="off" className={input} value={value.cvv} onChange={(e) => set({ cvv: e.target.value.replace(/\D/g, '').slice(0, 4) })} placeholder="123" />
        </div>
      </div>
      <p className="flex items-center gap-2 text-xs text-ink-400">
        <Lock className="size-3.5" aria-hidden />
        Formulário de demonstração. Nenhum dado é enviado ou armazenado.
      </p>
    </div>
  )
}
