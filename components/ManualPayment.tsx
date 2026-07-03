'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Banknote, Check, Landmark } from 'lucide-react'
import { BANK_TRANSFER, type PaymentMethod } from '@/constants/payment'
import { REQUIRED_SHIPPING, type CheckoutData } from './checkout-types'

interface ManualPaymentProps {
  method: Extract<PaymentMethod, 'transferencia' | 'efectivo'>
  productId: string
  dataRef: React.MutableRefObject<CheckoutData>
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-ink/[0.06] last:border-0">
      <span className="text-[10px] font-sans uppercase tracking-widest text-ink/40">{label}</span>
      <span className="text-sm font-sans text-ink font-medium">{value}</span>
    </div>
  )
}

export default function ManualPayment({ method, productId, dataRef }: ManualPaymentProps) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const confirm = async () => {
    const data = dataRef.current
    const missing = REQUIRED_SHIPPING.filter((k) => !data.shipping[k].trim())
    if (missing.length > 0 || !data.zone) {
      setError('Completá todos los datos de envío antes de confirmar.')
      return
    }

    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/orders/manual', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          method,
          zone: data.zone,
          email: data.email,
          shipping: data.shipping,
        }),
      })
      const resData = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(resData.error ?? 'No se pudo registrar el pedido.')
        setLoading(false)
        return
      }
      router.push(`/checkout/confirmacion?order=${encodeURIComponent(resData.id)}`)
    } catch {
      setError('No se pudo conectar con el servidor.')
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 text-sm p-4 mb-4">{error}</div>
      )}

      {method === 'transferencia' ? (
        <div className="border border-ink/10 bg-neutral-50 p-4 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Landmark className="w-4 h-4 text-ink/60" strokeWidth={2} />
            <p className="text-[11px] font-sans uppercase tracking-widest text-ink/60">
              Datos para la transferencia
            </p>
          </div>
          <Row label="Alias" value={BANK_TRANSFER.alias} />
          <Row label="Titular" value={BANK_TRANSFER.titular} />
          <Row label="Entidad" value={BANK_TRANSFER.entidad} />
          <p className="text-[12px] font-sans text-ink/50 leading-relaxed mt-3">
            Transferí el total a este alias y confirmá el pedido. Te contactaremos por WhatsApp
            apenas verifiquemos el pago para coordinar el envío.
          </p>
        </div>
      ) : (
        <div className="border border-ink/10 bg-neutral-50 p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Banknote className="w-4 h-4 text-ink/60" strokeWidth={2} />
            <p className="text-[11px] font-sans uppercase tracking-widest text-ink/60">
              Efectivo contra entrega
            </p>
          </div>
          <p className="text-[12px] font-sans text-ink/50 leading-relaxed">
            Pagás en <span className="font-semibold text-ink/70">efectivo al recibir</span> el
            paquete. Confirmá el pedido y te contactaremos por WhatsApp para coordinar la entrega.
          </p>
        </div>
      )}

      <button
        type="button"
        onClick={confirm}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-ink text-white text-[11px] font-sans uppercase tracking-widest py-4 px-4 hover:bg-gold transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Check className="w-3.5 h-3.5 shrink-0" />
        {loading ? 'Registrando pedido…' : 'Confirmar pedido'}
      </button>
    </div>
  )
}
