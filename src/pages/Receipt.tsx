import { Check, Printer } from 'lucide-react'
import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { Button, ButtonLink } from '../components/ui/Button'
import DemoBanner from '../components/ui/DemoBanner'
import { barbers, business, services } from '../data/seed'
import { dateTime, firstName, formatBRL, longDate } from '../lib/format'
import { getAppointment } from '../lib/storage'

const Line = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-baseline justify-between gap-4 py-2.5 text-sm">
    <dt className="text-ink-300">{label}</dt>
    <dd className="text-right font-medium text-ink-100">{value}</dd>
  </div>
)

export default function Receipt() {
  const { id = '' } = useParams()
  const [appt] = useState(() => getAppointment(id))

  if (!appt) return <Navigate to="/agendar" replace />
  if (!appt.paidAt) return <Navigate to={`/pagamento/${appt.id}`} replace />

  const service = services.find((s) => s.id === appt.serviceId)
  const barber = barbers.find((b) => b.id === appt.barberId)

  return (
    <section className="mx-auto max-w-xl px-4 pb-24 pt-24 sm:px-6 lg:pt-32">
      <div className="mb-8 flex flex-col items-center text-center">
        <span className="animate-pop grid size-20 place-items-center rounded-full bg-success/15 ring-8 ring-success/10">
          <Check className="size-10 text-success" strokeWidth={3} />
        </span>
        <h1 className="animate-fade-up mt-6 text-3xl font-bold sm:text-4xl" style={{ animationDelay: '150ms' }}>
          Pagamento aprovado!
        </h1>
        <p className="animate-fade-up mt-2 text-ink-300" style={{ animationDelay: '250ms' }}>
          Tudo certo, {firstName(appt.customerName)}. Seu horário está confirmado — é só chegar.
        </p>
      </div>

      {/* Comprovante estilo ticket */}
      <article className="print-area animate-fade-up relative rounded-card border border-white/10 bg-ink-900 p-6 shadow-card sm:p-8" style={{ animationDelay: '350ms' }}>
        <header className="text-center">
          <p className="font-display text-2xl font-bold text-gold-gradient">{business.fullName}</p>
          <p className="text-xs text-ink-400">
            {business.address} · {business.city}
          </p>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.3em] text-ink-300">Comprovante</p>
        </header>

        <div className="my-6 border-t-2 border-dashed border-white/15" />

        <dl className="divide-y divide-white/8">
          <Line label="Serviço" value={service?.name ?? '—'} />
          <Line label="Barbeiro" value={barber?.name ?? '—'} />
          <Line label="Data" value={longDate(appt.date)} />
          <Line label="Horário" value={appt.time} />
          <Line label="Cliente" value={appt.customerName} />
          <Line label="Telefone" value={appt.customerPhone} />
        </dl>

        <div className="my-6 border-t-2 border-dashed border-white/15" />

        <dl className="divide-y divide-white/8">
          <Line label="Forma de pagamento" value={appt.paymentMethod === 'pix' ? 'PIX' : 'Cartão de crédito'} />
          <Line label="Pago em" value={dateTime(appt.paidAt)} />
          <Line label="Transação" value={appt.transactionId ?? '—'} />
          <Line label="Agendamento" value={appt.id} />
        </dl>

        <div className="mt-4 flex items-center justify-between rounded-xl bg-gold-500/10 px-4 py-4">
          <span className="font-semibold text-gold-300">Total pago</span>
          <span className="font-display text-3xl font-bold text-gold-400">{formatBRL(appt.price)}</span>
        </div>

        <p className="mt-5 text-center text-[0.7rem] uppercase tracking-widest text-ink-400">Comprovante de demonstração · sem valor fiscal</p>
      </article>

      <div className="no-print mt-8 space-y-4">
        <DemoBanner>Este comprovante é fictício. O agendamento foi salvo neste navegador e aparecerá no painel do dono.</DemoBanner>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button variant="outline" size="lg" className="flex-1 whitespace-nowrap" onClick={() => window.print()}>
            <Printer className="size-5" /> Imprimir comprovante
          </Button>
          <ButtonLink to="/agendar" size="lg" className="flex-1">
            Novo agendamento
          </ButtonLink>
        </div>
        <ButtonLink to="/" variant="ghost" className="w-full">
          Voltar ao início
        </ButtonLink>
      </div>
    </section>
  )
}
