'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import MercadoPagoLogo from './MercadoPagoLogo'
import { REQUIRED_SHIPPING, type CheckoutData } from './checkout-types'

// El SDK de MercadoPago se carga por script y se expone en window.MercadoPago.
declare global {
  interface Window {
    MercadoPago?: new (publicKey: string, options?: { locale?: string }) => {
      bricks: () => {
        create: (
          brick: 'payment',
          containerId: string,
          settings: Record<string, unknown>
        ) => Promise<{ unmount: () => void }>
      }
    }
  }
}

const SDK_SRC = 'https://sdk.mercadopago.com/js/v2'
const PUBLIC_KEY = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY ?? ''

/** Carga el SDK de MercadoPago una sola vez y resuelve cuando está listo. */
function loadMpSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.MercadoPago) return resolve()
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${SDK_SRC}"]`)
    if (existing) {
      existing.addEventListener('load', () => resolve())
      existing.addEventListener('error', () => reject(new Error('No se pudo cargar el SDK de MercadoPago.')))
      return
    }
    const script = document.createElement('script')
    script.src = SDK_SRC
    script.async = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('No se pudo cargar el SDK de MercadoPago.'))
    document.body.appendChild(script)
  })
}

interface CheckoutBrickProps {
  productId: string
  slug: string
  amount: number
  payerEmail: string
  dataRef: React.MutableRefObject<CheckoutData>
}

export default function CheckoutBrick({
  productId,
  slug,
  amount,
  payerEmail,
  dataRef,
}: CheckoutBrickProps) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const brickRef = useRef<{ unmount: () => void } | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!PUBLIC_KEY) {
      setError('Falta configurar NEXT_PUBLIC_MP_PUBLIC_KEY.')
      return
    }

    let cancelled = false

    loadMpSdk()
      .then(async () => {
        if (cancelled || !window.MercadoPago) return
        const mp = new window.MercadoPago(PUBLIC_KEY, { locale: 'es-AR' })
        const builder = mp.bricks()

        brickRef.current = await builder.create('payment', 'paymentBrick_container', {
          initialization: {
            amount,
            payer: { email: payerEmail },
          },
          customization: {
            paymentMethods: {
              creditCard: 'all',
              debitCard: 'all',
              // El "dinero en cuenta" se ofrece como método aparte (WalletCheckout),
              // que usa una preferencia + redirección a Mercado Pago.
            },
          },
          callbacks: {
            onReady: () => setError(null),
            onError: (brickError: { type?: string; message?: string; cause?: string }) => {
              console.error('[CheckoutBrick]', brickError)
              if (brickError?.type === 'critical') {
                setError('No se pudo cargar el formulario de pago. Recargá la página.')
              }
            },
            onSubmit: ({ formData }: { formData: Record<string, unknown> }) => {
              return new Promise<void>((resolve, reject) => {
                const data = dataRef.current
                const missing = REQUIRED_SHIPPING.filter((k) => !data.shipping[k].trim())
                if (missing.length > 0 || !data.zone) {
                  setError('Completá todos los datos de envío antes de pagar.')
                  reject()
                  return
                }

                setError(null)
                fetch('/api/mp/process-payment', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    ...formData,
                    productId,
                    shipping: data.shipping,
                    zone: data.zone,
                  }),
                })
                  .then(async (res) => {
                    const resData = await res.json().catch(() => ({}))
                    if (!res.ok) {
                      setError(resData.error ?? 'No se pudo procesar el pago.')
                      reject()
                      return
                    }
                    const status: string = resData.status ?? 'error'
                    const detail: string = resData.status_detail ?? ''
                    resolve()
                    const params = new URLSearchParams({
                      status,
                      status_detail: detail,
                      payment_id: String(resData.id ?? ''),
                      slug,
                    })
                    router.push(`/checkout/resultado?${params.toString()}`)
                  })
                  .catch((e) => {
                    console.error('[CheckoutBrick] submit', e)
                    setError('No se pudo conectar con el servidor de pagos.')
                    reject()
                  })
              })
            },
          },
        })
      })
      .catch((e: Error) => {
        if (!cancelled) setError(e.message)
      })

    return () => {
      cancelled = true
      brickRef.current?.unmount()
      brickRef.current = null
    }
  }, [amount, productId, slug, payerEmail, dataRef, router])

  return (
    <div>
      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 text-sm p-4 mb-4">
          {error}
        </div>
      )}

      {/* Sello de confianza: pago autorizado por Mercado Pago */}
      <div className="flex items-center gap-4 w-full border border-ink/10 bg-neutral-50 pl-6 pr-4 py-3.5 mb-4">
        <MercadoPagoLogo className="h-9 w-auto shrink-0" />
        <div className="text-[11px] font-sans text-ink/60 leading-snug">
          <p className="flex items-center gap-1.5 font-semibold text-ink/80">
            <Lock className="w-3 h-3 shrink-0" strokeWidth={2.5} />
            Pago 100% seguro con Mercado&nbsp;Pago
          </p>
          <p className="mt-0.5">
            Tus datos de tarjeta viajan encriptados y nunca se guardan en nuestro sitio.
          </p>
        </div>
      </div>

      <div id="paymentBrick_container" ref={containerRef} />
    </div>
  )
}
