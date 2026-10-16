import { Phone, User } from 'lucide-react'
import { isValidPhone, maskPhone } from '../../lib/format'

interface Props {
  name: string
  phone: string
  touched: boolean
  onChange: (patch: { name?: string; phone?: string }) => void
}

export default function StepDetails({ name, phone, touched, onChange }: Props) {
  const nameError = touched && name.trim().length < 3 ? 'Informe seu nome completo.' : ''
  const phoneError = touched && !isValidPhone(phone) ? 'Informe um telefone válido com DDD.' : ''

  const field = (err: string) =>
    `h-14 w-full rounded-xl border bg-ink-900 pl-12 pr-4 text-base text-ink-100 placeholder:text-ink-500 transition-colors focus:border-gold-400 focus:outline-none ${
      err ? 'border-danger' : 'border-white/12'
    }`

  return (
    <div className="max-w-lg space-y-5">
      <div>
        <label htmlFor="name" className="mb-2 block text-sm font-medium text-ink-200">
          Seu nome
        </label>
        <div className="relative">
          <User className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gold-500" aria-hidden />
          <input
            id="name"
            autoComplete="name"
            value={name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Ex.: João da Silva"
            aria-invalid={Boolean(nameError)}
            aria-describedby={nameError ? 'name-err' : undefined}
            className={field(nameError)}
          />
        </div>
        {nameError && (
          <p id="name-err" className="mt-1.5 text-sm text-danger">
            {nameError}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="phone" className="mb-2 block text-sm font-medium text-ink-200">
          Telefone / WhatsApp
        </label>
        <div className="relative">
          <Phone className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-gold-500" aria-hidden />
          <input
            id="phone"
            type="tel"
            inputMode="numeric"
            autoComplete="tel"
            value={phone}
            onChange={(e) => onChange({ phone: maskPhone(e.target.value) })}
            placeholder="(31) 99999-9999"
            aria-invalid={Boolean(phoneError)}
            aria-describedby={phoneError ? 'phone-err' : undefined}
            className={field(phoneError)}
          />
        </div>
        {phoneError && (
          <p id="phone-err" className="mt-1.5 text-sm text-danger">
            {phoneError}
          </p>
        )}
        <p className="mt-2 text-xs text-ink-400">Usamos apenas para confirmar seu horário. Em modo demonstração, nada é enviado.</p>
      </div>
    </div>
  )
}
