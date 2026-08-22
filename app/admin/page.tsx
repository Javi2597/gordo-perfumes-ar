import type { Metadata } from 'next'
import Link from 'next/link'
import { listOrders, type Order } from '@/lib/orders'
import { isMpTestMode, MP_WEBHOOK_SECRET } from '@/lib/mercadopago'
import { isPaymentEnabled } from '@/constants/payment'
import { formatPrice, OrderCard } from './_shared'

export const metadata: Metadata = { title: 'Resumen' }
export const dynamic = 'force-dynamic'

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="border border-ink/[0.08] bg-white p-4">
      <p className="text-[10px] font-sans uppercase tracking-widest text-ink/40 mb-1">{label}</p>
      <p className="font-serif text-xl sm:text-2xl text-ink tabular-nums">{value}</p>
    </div>
  )
}

export default async function AdminHome() {
  let orders: Order[] = []
  let error: string | null = null
  try {
    orders = await listOrders(500)
  } catch (e) {
    console.error('[admin]', e)
    error = 'No se pudieron cargar las órdenes. Revisá la conexión con la base de datos.'
  }

  const aprobadas = orders.filter((o) => o.status === 'approved')
  const ingresos = aprobadas.reduce((acc, o) => acc + o.amount, 0)
  const pendientes = orders.filter(
    (o) => o.status === 'in_process' || o.status === 'pending'
  ).length
  const recientes = orders.slice(0, 6)

  // Avisos de configuración de cobros. Sin esto los problemas son invisibles:
  // con credenciales TEST el checkout funciona pero no acredita plata, y sin
  // webhook las órdenes de Mercado Pago quedan pendientes para siempre.
  // Solo tienen sentido si Mercado Pago está habilitado como medio de pago.
  const mpHabilitado = isPaymentEnabled('mercadopago') || isPaymentEnabled('wallet')
  const avisos = (
    !mpHabilitado
      ? []
      : [
          isMpTestMode() &&
            'MODO PRUEBA: Mercado Pago está con credenciales TEST. Los pagos se simulan y NO acreditan plata real. Cargá las credenciales APP_USR- en Vercel.',
          !MP_WEBHOOK_SECRET &&
            'Falta MP_WEBHOOK_SECRET: las notificaciones de Mercado Pago se rechazan, así que las órdenes no pasan solas a "aprobada" ni se envían los correos.',
        ]
  ).filter((a): a is string => Boolean(a))

  return (
    <div>
      <h1 className="font-serif text-2xl sm:text-3xl text-ink mb-6">Resumen</h1>

      {avisos.map((aviso) => (
        <div
          key={aviso}
          className="border border-red-300 bg-red-50 text-red-800 text-sm p-4 mb-4"
        >
          {aviso}
        </div>
      ))}

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 text-sm p-4 mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-10">
        <StatTile label="Órdenes" value={orders.length} />
        <StatTile label="Aprobadas" value={aprobadas.length} />
        <StatTile label="Ingresos aprobados" value={formatPrice(ingresos)} />
        <StatTile label="Pendientes" value={pendientes} />
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-sans text-[11px] uppercase tracking-widest text-ink/50">
          Últimas órdenes
        </h2>
        <Link
          href="/admin/ordenes"
          className="text-[11px] font-sans uppercase tracking-widest text-gold-dark hover:text-ink transition-colors"
        >
          Ver todas →
        </Link>
      </div>

      {!error && recientes.length === 0 ? (
        <div className="border border-ink/10 text-ink/50 text-sm p-8 text-center">
          Todavía no hay órdenes registradas.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {recientes.map((o) => (
            <OrderCard key={o.id} order={o} />
          ))}
        </div>
      )}
    </div>
  )
}
