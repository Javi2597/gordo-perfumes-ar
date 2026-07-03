import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Clock, XCircle } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Resultado del pago',
  robots: { index: false, follow: false },
}

type Kind = 'ok' | 'wait' | 'fail'
interface Result {
  kind: Kind
  title: string
  message: string
}

// Mensajes por status_detail de MercadoPago (motivo exacto del pago).
const DETAIL: Record<string, Result> = {
  accredited: {
    kind: 'ok',
    title: '¡Pago aprobado!',
    message: 'Recibimos tu pago con éxito. Te contactaremos para coordinar el envío.',
  },
  pending_contingency: {
    kind: 'wait',
    title: 'Pago en proceso',
    message: 'Estamos procesando tu pago. Puede demorar unos minutos; te avisaremos al confirmarse.',
  },
  pending_review_manual: {
    kind: 'wait',
    title: 'Pago en revisión',
    message: 'Tu pago está en revisión. Te avisaremos apenas se apruebe.',
  },
  cc_rejected_insufficient_amount: {
    kind: 'fail',
    title: 'Fondos insuficientes',
    message: 'Tu tarjeta no tiene fondos suficientes. Probá con otra tarjeta o medio de pago.',
  },
  cc_rejected_bad_filled_security_code: {
    kind: 'fail',
    title: 'Código de seguridad inválido',
    message: 'Revisá el código de seguridad (CVV) de tu tarjeta e intentá de nuevo.',
  },
  cc_rejected_bad_filled_date: {
    kind: 'fail',
    title: 'Fecha de vencimiento inválida',
    message: 'Revisá la fecha de vencimiento de tu tarjeta e intentá de nuevo.',
  },
  cc_rejected_bad_filled_card_number: {
    kind: 'fail',
    title: 'Número de tarjeta inválido',
    message: 'Revisá el número de tu tarjeta e intentá de nuevo.',
  },
  cc_rejected_bad_filled_other: {
    kind: 'fail',
    title: 'Revisá los datos de la tarjeta',
    message: 'Alguno de los datos de la tarjeta es incorrecto. Verificalos e intentá de nuevo.',
  },
  cc_rejected_call_for_authorize: {
    kind: 'fail',
    title: 'Autorización requerida',
    message: 'Tenés que autorizar el pago con tu banco y volver a intentar.',
  },
  cc_rejected_high_risk: {
    kind: 'fail',
    title: 'Pago rechazado',
    message: 'El pago fue rechazado por seguridad. Probá con otro medio de pago.',
  },
  cc_rejected_max_attempts: {
    kind: 'fail',
    title: 'Demasiados intentos',
    message: 'Alcanzaste el máximo de intentos. Probá con otra tarjeta.',
  },
  cc_rejected_other_reason: {
    kind: 'fail',
    title: 'Pago rechazado',
    message: 'El banco rechazó el pago. Probá con otra tarjeta o medio de pago.',
  },
}

// Fallback por status cuando no hay un status_detail conocido.
const BY_STATUS: Record<string, Result> = {
  approved: DETAIL.accredited,
  in_process: DETAIL.pending_contingency,
  pending: DETAIL.pending_contingency,
  rejected: {
    kind: 'fail',
    title: 'Pago rechazado',
    message: 'No pudimos procesar el pago. Probá con otro medio de pago o revisá los datos.',
  },
  error: {
    kind: 'fail',
    title: 'Ocurrió un problema',
    message: 'No pudimos completar la operación. Intentá nuevamente en unos minutos.',
  },
}

function resolveResult(status: string, detail: string): Result {
  return DETAIL[detail] ?? BY_STATUS[status] ?? BY_STATUS.error
}

function Icon({ kind }: { kind: Kind }) {
  if (kind === 'ok') return <CheckCircle2 className="w-14 h-14 text-emerald-500" strokeWidth={1.5} />
  if (kind === 'wait') return <Clock className="w-14 h-14 text-amber-500" strokeWidth={1.5} />
  return <XCircle className="w-14 h-14 text-red-500" strokeWidth={1.5} />
}

export default async function ResultadoPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string
    status_detail?: string
    payment_id?: string
    slug?: string
  }>
}) {
  const { status = 'error', status_detail = '', payment_id, slug } = await searchParams
  const result = resolveResult(status, status_detail)

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center py-16">
        <div className="flex justify-center mb-6">
          <Icon kind={result.kind} />
        </div>
        <h1 className="font-serif text-3xl text-ink mb-3">{result.title}</h1>
        <p className="text-sm font-sans text-ink/60 leading-relaxed mb-2">{result.message}</p>
        {payment_id && (
          <p className="text-[11px] font-sans uppercase tracking-widest text-ink/35 mb-8">
            N° de operación: {payment_id}
          </p>
        )}

        <div className="flex flex-col gap-3 mt-6">
          {result.kind === 'fail' && slug && (
            <Link
              href={`/checkout/${slug}`}
              className="inline-flex items-center justify-center gap-2 bg-ink text-white text-[11px] font-sans uppercase tracking-widest py-3.5 px-8 hover:bg-gold transition-colors duration-300"
            >
              Volver a intentar
            </Link>
          )}
          <Link
            href="/#coleccion"
            className={`inline-flex items-center justify-center gap-2 text-[11px] font-sans uppercase tracking-widest py-3.5 px-8 transition-colors duration-300 ${
              result.kind === 'fail' && slug
                ? 'border border-ink/15 text-ink hover:border-ink/40'
                : 'bg-ink text-white hover:bg-gold'
            }`}
          >
            Volver a la colección
          </Link>
        </div>
      </div>
    </main>
  )
}
