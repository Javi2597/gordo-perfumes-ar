'use client'

import { useState } from 'react'
import { Wallet } from 'lucide-react'
import MercadoPagoLogo from './MercadoPagoLogo'
import { REQUIRED_SHIPPING, type CheckoutData } from './checkout-types'

interface WalletCheckoutProps {
  productId: string
  dataRef: React.MutableRefObject<CheckoutData>
}

export default function WalletCheckout({ productId, dataRef }: WalletCheckoutProps) {
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const pay = async () => {
    const data = dataRef.current
    const missing = REQUIRED_SHIPPING.filter((k) => !data.shipping[k].trim())
    if (missing.length > 0 || !data.zone) {
      setError('Completá todos los datos de envío antes de continuar.')
      return
    }

    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/mp/preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId,
          zone: data.zone,
          email: data.email,
          shipping: data.shipping,
        }),
      })
      const resData = await res.json().catch(() => ({}))
      if (!res.ok || !resData.init_point) {
        setError(resData.error ?? 'No se pudo iniciar el pago.')
        setLoading(false)
        return
      }
      // Redirige al checkout de Mercado Pago.
      window.location.href = resData.init_point
    } catch {
      setError('No se pudo conectar con el servidor de pagos.')
      setLoading(false)
    }
  }

  return (
    <div>
      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 text-sm p-4 mb-4">{error}</div>
      )}

      <div className="flex items-center gap-4 w-full border border-ink/10 bg-neutral-50 pl-6 pr-4 py-3.5 mb-4">
        <MercadoPagoLogo className="h-9 w-auto shrink-0" />
        <p className="text-[11px] font-sans text-ink/60 leading-snug">
          Vas a completar el pago en <span className="font-semibold text-ink/80">Mercado&nbsp;Pago</span>{' '}
          con el dinero de tu cuenta, tarjetas guardadas u otros medios. Necesitás iniciar sesión.
        </p>
      </div>

      <button
        type="button"
        onClick={pay}
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 bg-ink text-white text-[11px] font-sans uppercase tracking-widest py-4 px-4 hover:bg-gold transition-colors duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
      >
        <Wallet className="w-3.5 h-3.5 shrink-0" />
        {loading ? 'Redirigiendo…' : 'Pagar con Mercado Pago'}
      </button>
    </div>
  )
}
