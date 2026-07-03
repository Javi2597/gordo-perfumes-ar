import type { Metadata } from 'next'
import { listOrders, type Order } from '@/lib/orders'
import {
  formatPrice,
  formatDate,
  StatusBadge,
  OrderCard,
  methodLabel,
  isManualPending,
  OrderActions,
} from '../_shared'

export const metadata: Metadata = { title: 'Órdenes' }

// Siempre datos frescos: nunca cachear el listado de ventas.
export const dynamic = 'force-dynamic'

export default async function OrdenesPage() {
  let orders: Order[] = []
  let error: string | null = null
  try {
    orders = await listOrders()
  } catch (e) {
    console.error('[admin/ordenes]', e)
    error = 'No se pudieron cargar las órdenes. Revisá la conexión con la base de datos.'
  }

  const totalAprobado = orders
    .filter((o) => o.status === 'approved')
    .reduce((acc, o) => acc + o.amount, 0)

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl sm:text-3xl text-ink">Órdenes</h1>
          <p className="text-[11px] font-sans uppercase tracking-widest text-ink/35 mt-1">
            {orders.length} {orders.length === 1 ? 'orden' : 'órdenes'}
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-sans uppercase tracking-widest text-ink/35">
            Total aprobado
          </p>
          <p className="font-serif text-xl sm:text-2xl text-ink tabular-nums">
            {formatPrice(totalAprobado)}
          </p>
        </div>
      </div>

      {error && (
        <div className="border border-red-200 bg-red-50 text-red-700 text-sm p-4">{error}</div>
      )}

      {!error && orders.length === 0 && (
        <div className="border border-ink/10 text-ink/50 text-sm p-8 text-center">
          Todavía no hay órdenes registradas.
        </div>
      )}

      {orders.length > 0 && (
        <>
          {/* Mobile: tarjetas */}
          <div className="grid gap-3 md:hidden">
            {orders.map((o) => (
              <OrderCard key={o.id} order={o} />
            ))}
          </div>

          {/* Desktop: tabla */}
          <div className="hidden md:block overflow-x-auto border border-ink/[0.08] bg-white">
            <table className="w-full text-sm font-sans">
              <thead>
                <tr className="border-b border-ink/[0.08] text-left text-[10px] uppercase tracking-widest text-ink/40">
                  <th className="py-3 px-4 font-medium">Fecha</th>
                  <th className="py-3 px-4 font-medium">Producto</th>
                  <th className="py-3 px-4 font-medium">Monto</th>
                  <th className="py-3 px-4 font-medium">Método</th>
                  <th className="py-3 px-4 font-medium">Estado</th>
                  <th className="py-3 px-4 font-medium">Envío</th>
                  <th className="py-3 px-4 font-medium">Contacto</th>
                  <th className="py-3 px-4 font-medium">Acción</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-ink/[0.05] last:border-0">
                    <td className="py-3 px-4 text-ink/60 whitespace-nowrap tabular-nums">
                      {formatDate(o.created_at)}
                    </td>
                    <td className="py-3 px-4 text-ink">{o.product_name}</td>
                    <td className="py-3 px-4 text-ink tabular-nums whitespace-nowrap">
                      {formatPrice(o.amount)}
                    </td>
                    <td className="py-3 px-4 text-ink/70 whitespace-nowrap">
                      {methodLabel(o.payment_method)}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={o.status} />
                    </td>
                    <td className="py-3 px-4 text-ink/70 min-w-[200px]">
                      {o.ship_name ? (
                        <div className="leading-tight">
                          <div className="text-ink">{o.ship_name}</div>
                          <div className="text-ink/55 text-[13px]">{o.ship_address}</div>
                          <div className="text-ink/45 text-[12px]">
                            {[o.ship_city, o.ship_province, o.ship_zip].filter(Boolean).join(', ')}
                          </div>
                          {o.shipping_zone && (
                            <div className="text-ink/45 text-[12px]">
                              Envío {o.shipping_zone}
                              {o.shipping_cost != null ? ` · ${formatPrice(o.shipping_cost)}` : ''}
                            </div>
                          )}
                          {o.ship_notes && (
                            <div className="text-ink/40 text-[11px] italic mt-0.5">
                              {o.ship_notes}
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-ink/30">—</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-ink/60 whitespace-nowrap">
                      <div className="leading-tight">
                        <div>{o.ship_phone ?? '—'}</div>
                        <div className="text-ink/45 text-[12px]">{o.payer_email ?? ''}</div>
                      </div>
                    </td>
                    <td className="py-3 px-4 min-w-[180px]">
                      {isManualPending(o) ? (
                        <OrderActions id={o.id} />
                      ) : o.payment_id ? (
                        <span className="text-ink/40 text-[12px] tabular-nums">#{o.payment_id}</span>
                      ) : (
                        <span className="text-ink/30">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
