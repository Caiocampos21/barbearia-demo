import { usePageTitle } from '../hooks/usePageTitle'
import { Check, Copy, CreditCard, Loader2, QrCode, ShieldCheck, Timer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import Summary from '../components/booking/Summary'
import CardForm, { cardIsValid, demoCard, type CardData } from '../components/payment/CardForm'
import FakeQr from '../components/payment/FakeQr'
import { Button, ButtonLink } from '../components/ui/Button'
import DemoBanner from '../components/ui/DemoBanner'
import { formatBRL } from '../lib/format'
import { getAppointment, newId, updateAppointment } from '../lib/storage'
import type { PaymentMethod } from '../lib/types'

const PIX_SECONDS = 15 * 60

export default function Payment() {
  usePageTitle('Pagamento')
  const { id = '' } = useParams()
  const navigate = useNavigate()
  const [appt] = useState(() => getAppointment(id))
  const [method, setMethod] = useState<PaymentMethod>('pix')
  const [card, setCard] = useState<CardData>(demoCard)
  const [copied, setCopied] = useState(false)
  const [paying, setPaying] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(PIX_SECONDS)

  useEffect(() => {
    const t = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(t)
  }, [])

  if (!appt) {
    return (
      <section className="mx-auto flex min-h-[70dvh] max-w-md flex-col items-center justify-center px-4 pt-24 text-center">
        <h1 className="text-3xl font-bold">Agendamento não encontrado</h1>
        <p className="mt-3 text-ink-300">Esse link expirou ou foi aberto em outro navegador. Faça um novo agendamento.</p>
        <ButtonLink to="/agendar" className="mt-6">
          Agendar horário
        </ButtonLink>
      </section>
    )
  }
  if (appt.paidAt) return <Navigate to={`/comprovante/${appt.id}`} replace />

  const pixCode = `00020126DEMO0014br.gov.bcb.pix-DEMONSTRACAO-NAO-PAGUE-${appt.id}-VALOR-${appt.price.toFixed(2)}5204000053039865802BR5920NAVALHA DE OURO DEMO6014BELO HORIZONTE63041A2B`
  const mm = String(Math.floor(secondsLeft / 60)).padStart(2, '0')
  const ss = String(secondsLeft % 60).padStart(2, '0')
  const canPay = method === 'pix' || cardIsValid(card)

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(pixCode)
    } catch {
      // clipboard indisponível (http/permissão): mantém o feedback visual da demo
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 2200)
  }

  const pay = () => {
    if (!canPay || paying) return
    setPaying(true)
    // simula o tempo de aprovação do banco
    setTimeout(() => {
      updateAppointment(appt.id, {
        status: 'confirmado',
        paymentMethod: method,
        transactionId: newId('TX'),
        paidAt: new Date().toISOString(),
      })
      navigate(`/comprovante/${appt.id}`, { replace: true })
    }, 1800)
  }

  const tab = (m: PaymentMethod, label: string, icon: React.ReactNode) => (
    <button
      type="button"
      role="tab"
      aria-selected={method === m}
      onClick={() => setMethod(m)}
      className={`flex h-14 flex-1 items-center justify-center gap-2 rounded-xl border text-sm font-semibold transition-all ${
        method === m ? 'border-gold-400 bg-gold-500/10 text-gold-300 shadow-glow' : 'border-white/10 bg-ink-900 text-ink-300 hover:border-gold-500/40'
      }`}
    >
      {icon}
      {label}
    </button>
  )

  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 pt-24 sm:px-6 lg:pt-32">
      <h1 className="text-3xl font-bold sm:text-4xl">Pagamento</h1>
      <p className="mb-6 mt-2 text-ink-300">Escolha como pagar. Seu horário fica reservado enquanto você finaliza.</p>
      <DemoBanner>
        <strong>Ambiente de demonstração.</strong> Este pagamento é simulado — nenhum valor será cobrado e nenhum dado é enviado a operadoras.
      </DemoBanner>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_20rem]">
        <div className="rounded-card border border-white/10 bg-ink-900 p-5 shadow-card sm:p-8">
          <div role="tablist" aria-label="Forma de pagamento" className="flex gap-3">
            {tab('pix', 'PIX', <QrCode className="size-5" aria-hidden />)}
            {tab('cartao', 'Cartão', <CreditCard className="size-5" aria-hidden />)}
          </div>

          <div key={method} className="animate-page-in mt-8">
            {method === 'pix' ? (
              <div className="flex flex-col items-center gap-6 md:flex-row md:items-start">
                <div className="shrink-0 rounded-2xl border border-gold-500/40 bg-white p-3 shadow-glow">
                  <FakeQr seed={appt.id} />
                </div>
                <div className="w-full min-w-0 space-y-4">
                  <p className="text-sm text-ink-200">Abra o app do seu banco, escolha pagar com PIX e escaneie o QR Code, ou use o código copia e cola.</p>
                  <p className="flex items-center gap-2 text-sm text-gold-300">
                    <Timer className="size-4" aria-hidden />
                    Código válido por <strong className="tabular-nums">{mm}:{ss}</strong>
                  </p>
                  <label htmlFor="pix-code" className="block text-xs uppercase tracking-widest text-ink-400">
                    PIX copia e cola
                  </label>
                  <textarea id="pix-code" readOnly rows={3} value={pixCode} className="w-full resize-none rounded-xl border border-white/12 bg-ink-950 p-3 font-mono text-xs text-ink-300" onFocus={(e) => e.currentTarget.select()} />
                  <Button variant="outline" onClick={copy} className="w-full sm:w-auto">
                    {copied ? (
                      <>
                        <Check className="size-4" /> Código copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="size-4" /> Copiar código
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              <CardForm value={card} onChange={setCard} />
            )}
          </div>

          <Button size="lg" onClick={pay} disabled={!canPay || paying} className="mt-8 w-full">
            {paying ? (
              <>
                <Loader2 className="size-5 animate-spin" /> Processando pagamento…
              </>
            ) : (
              <>
                <ShieldCheck className="size-5" /> Simular pagamento · {formatBRL(appt.price)}
              </>
            )}
          </Button>
          {!canPay && <p className="mt-3 text-center text-xs text-ink-400">Preencha o nome no cartão para continuar.</p>}
        </div>

        <Summary serviceId={appt.serviceId} barberId={appt.barberId} date={appt.date} time={appt.time} className="h-fit lg:sticky lg:top-28" />
      </div>
    </section>
  )
}
