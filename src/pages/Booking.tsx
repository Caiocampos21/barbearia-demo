import { usePageTitle } from '../hooks/usePageTitle'
import { ArrowLeft, ArrowRight, Loader2, ShieldCheck } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { parseISO } from 'date-fns'
import Stepper from '../components/booking/Stepper'
import StepBarber from '../components/booking/StepBarber'
import StepDateTime from '../components/booking/StepDateTime'
import StepDetails from '../components/booking/StepDetails'
import StepService from '../components/booking/StepService'
import Summary from '../components/booking/Summary'
import { Button } from '../components/ui/Button'
import DemoBanner from '../components/ui/DemoBanner'
import { barbers, services } from '../data/seed'
import { formatBRL, isValidPhone } from '../lib/format'
import { getDaySlots } from '../lib/schedule'
import { loadAppointments, newId, saveAppointment } from '../lib/storage'
import type { Appointment } from '../lib/types'

const STEPS = ['Serviço', 'Barbeiro', 'Horário', 'Seus dados', 'Revisão']

const TITLES = [
  ['Qual serviço você quer?', 'Toque em um serviço para continuar.'],
  ['Com quem prefere cortar?', 'Escolha seu barbeiro ou deixe a gente decidir.'],
  ['Quando fica bom para você?', 'Horários riscados já estão ocupados.'],
  ['Quase lá! Seus dados', 'Só o necessário para confirmar o horário.'],
  ['Revise e confirme', 'Confira tudo antes de seguir para o pagamento.'],
]

interface Draft {
  serviceId?: string
  barberId?: string
  date?: string
  time?: string
  name: string
  phone: string
}

export default function Booking() {
  usePageTitle('Agendar horário')
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const presetService = services.find((s) => s.id === params.get('servico'))?.id

  const [step, setStep] = useState(presetService ? 1 : 0)
  const [draft, setDraft] = useState<Draft>({ serviceId: presetService, name: '', phone: '' })
  const [touched, setTouched] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const topRef = useRef<HTMLDivElement>(null)

  // agenda real salva no navegador (entra no cálculo de horários ocupados)
  const [appts] = useState(loadAppointments)

  const service = services.find((s) => s.id === draft.serviceId)
  const pool = useMemo(() => (draft.barberId === 'any' ? barbers : barbers.filter((b) => b.id === draft.barberId)), [draft.barberId])

  const resolvedBarberId = useMemo(() => {
    if (!service || !draft.date || !draft.time || !draft.barberId) return undefined
    if (draft.barberId !== 'any') return draft.barberId
    const slot = getDaySlots(parseISO(draft.date), pool, service, appts).find((s) => s.time === draft.time)
    return slot?.barberIds[0]
  }, [service, draft.date, draft.time, draft.barberId, pool, appts])

  const goTo = (n: number) => {
    setStep(n)
    setError('')
    topRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const canContinue = [
    Boolean(draft.serviceId),
    Boolean(draft.barberId),
    Boolean(draft.date && draft.time),
    draft.name.trim().length >= 3 && isValidPhone(draft.phone),
    true,
  ][step]

  const next = () => {
    if (step === 3 && !canContinue) {
      setTouched(true)
      return
    }
    if (!canContinue) return
    if (step < STEPS.length - 1) goTo(step + 1)
    else confirm()
  }

  const confirm = () => {
    if (!service || !draft.date || !draft.time || !resolvedBarberId) return
    setSaving(true)
    // revalida: o horário pode ter sido ocupado por outro agendamento salvo
    const fresh = loadAppointments()
    const slot = getDaySlots(parseISO(draft.date), barbers.filter((b) => b.id === resolvedBarberId), service, fresh).find((s) => s.time === draft.time)
    if (!slot?.available) {
      setSaving(false)
      setError('Ops! Esse horário acabou de ser ocupado. Escolha outro horário.')
      setDraft((d) => ({ ...d, time: undefined }))
      goTo(2)
      return
    }
    const appt: Appointment = {
      id: newId(),
      serviceId: service.id,
      barberId: resolvedBarberId,
      date: draft.date,
      time: draft.time,
      customerName: draft.name.trim(),
      customerPhone: draft.phone,
      price: service.price,
      status: 'pendente',
      createdAt: new Date().toISOString(),
    }
    saveAppointment(appt)
    // pequena pausa só para dar sensação de processamento
    setTimeout(() => navigate(`/pagamento/${appt.id}`), 600)
  }

  const [title, hint] = TITLES[step]

  return (
    <section className="mx-auto max-w-6xl px-4 pb-40 pt-24 sm:px-6 lg:pb-20 lg:pt-32">
      <div ref={topRef} className="scroll-mt-24" />
      <Stepper steps={STEPS} current={step} onJump={goTo} />

      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem]">
        <div className="min-w-0">
          <div key={step} className="animate-slide-in">
            <h1 className="text-3xl font-bold sm:text-4xl">{title}</h1>
            <p className="mb-8 mt-2 text-ink-300">{hint}</p>

            {error && (
              <p role="alert" className="mb-6 rounded-card border border-danger/50 bg-danger/10 p-4 text-sm text-danger">
                {error}
              </p>
            )}

            {step === 0 && (
              <StepService
                value={draft.serviceId}
                onSelect={(id) => {
                  setDraft((d) => ({ ...d, serviceId: id, time: undefined }))
                  goTo(1)
                }}
              />
            )}
            {step === 1 && (
              <StepBarber
                value={draft.barberId}
                onSelect={(id) => {
                  setDraft((d) => ({ ...d, barberId: id, date: undefined, time: undefined }))
                  goTo(2)
                }}
              />
            )}
            {step === 2 && service && draft.barberId && (
              <StepDateTime
                service={service}
                barberId={draft.barberId}
                appts={appts}
                date={draft.date}
                time={draft.time}
                onChange={(date, time) => setDraft((d) => ({ ...d, date, time }))}
              />
            )}
            {step === 3 && (
              <StepDetails name={draft.name} phone={draft.phone} touched={touched} onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))} />
            )}
            {step === 4 && (
              <div className="space-y-6">
                <Summary serviceId={draft.serviceId} barberId={draft.barberId} resolvedBarberId={resolvedBarberId} date={draft.date} time={draft.time} />
                <div className="rounded-card border border-white/10 bg-ink-900 p-5 text-sm">
                  <h2 className="mb-3 font-display text-xl font-semibold">Seus dados</h2>
                  <p className="text-ink-100">{draft.name}</p>
                  <p className="text-ink-300">{draft.phone}</p>
                </div>
                <DemoBanner>Modo demonstração: ao confirmar, você verá o pagamento simulado. Nenhum valor real será cobrado.</DemoBanner>
              </div>
            )}
          </div>
        </div>

        {/* Resumo lateral (desktop) */}
        {step < 4 && <Summary serviceId={draft.serviceId} barberId={draft.barberId} resolvedBarberId={resolvedBarberId} date={draft.date} time={draft.time} className="hidden h-fit lg:sticky lg:top-28 lg:block" />}
      </div>

      {/* Barra fixa de ações (mobile e desktop) */}
      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-ink-950/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
          <Button variant="ghost" onClick={() => (step > 0 ? goTo(step - 1) : navigate('/'))} className="px-4" aria-label="Voltar">
            <ArrowLeft className="size-4" />
            <span className="hidden sm:inline">Voltar</span>
          </Button>
          <div className="min-w-0 flex-1 text-right">
            <p className="text-[0.65rem] uppercase tracking-widest text-ink-400">Total</p>
            <p className="font-display text-xl font-bold leading-none text-gold-400">{service ? formatBRL(service.price) : '—'}</p>
          </div>
          {(step > 0 || draft.serviceId) && (
            <Button size="lg" onClick={next} disabled={(!canContinue && step !== 3) || saving} className="px-5 sm:min-w-44 sm:px-8">
              {saving ? (
                <>
                  <Loader2 className="size-5 animate-spin" /> Reservando…
                </>
              ) : step === 4 ? (
                <>
                  <ShieldCheck className="size-5" /> Confirmar
                </>
              ) : (
                <>
                  Continuar <ArrowRight className="size-5" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
