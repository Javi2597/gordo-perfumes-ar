import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, Landmark, Banknote } from 'lucide-react'
import { getOrderById } from '@/lib/orders'
import { BANK_TRANSFER } from '@/constants/payment'

export const metadata: Metadata = {
  title: 'Pedido registrado',
  robots: { index: false, follow: false },
}

export const dynamic = 'force-dynamic'

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(price)
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 py-2 border-b border-ink/[0.06] last:border-0">
      <span className="text-[10px] font-sans uppercase tracking-widest text-ink/40">{label}</span>
      <span className="text-sm font-sans text-ink font-medium text-right">{value}</span>
    </div>
  )
}

export default async function ConfirmacionPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>
}) {
  const { order: orderId } = await searchParams
  const order = orderId ? await getOrderById(orderId) : null

  return (
    <main className="min-h-screen bg-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center py-16">
        <div className="flex justify-center mb-6">
          <CheckCircle2 className="w-14 h-14 text-emerald-500" strokeWidth={1.5} />
        </div>
        <h1 className="font-serif text-3xl text-ink mb-3">¡Pedido registrado!</h1>

        {!order ? (
          <p className="text-sm font-sans text-ink/60 leading-relaxed mb-8">
            Tu pedido quedó registrado. Te contactaremos por WhatsApp para coordinar.
          </p>
        ) : (
          <>
            <p className="text-sm font-sans text-ink/60 leading-relaxed mb-6">
              {order.payment_method === 'transferencia'
                ? 'Transferí el total al siguiente alias y te contactaremos apenas verifiquemos el pago.'
                : 'Coordinaremos la entrega por WhatsApp. Pagás en efectivo al recibir el paquete.'}
            </p>

            <div className="border border-ink/10 bg-neutral-50 p-4 text-left mb-6">
              {order.payment_method === 'transferencia' ? (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Landmark className="w-4 h-4 text-ink/60" strokeWidth={2} />
                    <p className="text-[11px] font-sans uppercase tracking-widest text-ink/60">
                      Datos para transferir
                    </p>
                  </div>
                  <Row label="Alias" value={BANK_TRANSFER.alias} />
                  <Row label="Titular" value={BANK_TRANSFER.titular} />
                  <Row label="Entidad" value={BANK_TRANSFER.entidad} />
                  <Row label="Total a transferir" value={formatPrice(order.amount)} />
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-2">
                    <Banknote className="w-4 h-4 text-ink/60" strokeWidth={2} />
                    <p className="text-[11px] font-sans uppercase tracking-widest text-ink/60">
                      Efectivo contra entrega
                    </p>
                  </div>
                  <Row label="Total a pagar al recibir" value={formatPrice(order.amount)} />
                </>
              )}
            </div>

            <p className="text-[11px] font-sans uppercase tracking-widest text-ink/35 mb-8">
              N° de pedido: {order.id.slice(0, 8).toUpperCase()}
            </p>
          </>
        )}

        <Link
          href="/#coleccion"
          className="inline-flex items-center justify-center gap-2 bg-ink text-white text-[11px] font-sans uppercase tracking-widest py-3.5 px-8 hover:bg-gold transition-colors duration-300"
        >
          Volver a la colección
        </Link>
      </div>
    </main>
  )
}
