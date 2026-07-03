import type { Order } from '@/lib/orders'
import { setOrderStatusAction } from './actions'

// Helpers y componentes compartidos por las páginas del admin.

const METHOD_LABEL: Record<string, string> = {
  mercadopago: 'Mercado Pago',
  transferencia: 'Transferencia',
  efectivo: 'Efectivo',
}

export function methodLabel(method: string | null): string {
  if (!method) return '—'
  return METHOD_LABEL[method] ?? method
}

/** True si es una orden manual (transferencia/efectivo) que sigue pendiente. */
export function isManualPending(order: Order): boolean {
  return (
    order.status === 'pending' &&
    (order.payment_method === 'transferencia' || order.payment_method === 'efectivo')
  )
}

/** Botones para confirmar/cancelar una orden manual pendiente (Server Actions). */
export function OrderActions({ id }: { id: string }) {
  return (
    <div className="flex gap-2">
      <form action={setOrderStatusAction} className="flex-1">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value="approved" />
        <button className="w-full text-[10px] font-sans uppercase tracking-wider border border-emerald-600 text-emerald-700 hover:bg-emerald-50 px-3 py-2 transition-colors">
          Marcar como pagada
        </button>
      </form>
      <form action={setOrderStatusAction}>
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="status" value="rejected" />
        <button className="text-[10px] font-sans uppercase tracking-wider border border-ink/15 text-ink/50 hover:border-red-300 hover:text-red-600 px-3 py-2 transition-colors">
          Cancelar
        </button>
      </form>
    </div>
  )
}

export function formatPrice(price: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(price)
}

export function formatDate(iso: string) {
  return new Intl.DateTimeFormat('es-AR', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(iso))
}

const STATUS_STYLE: Record<string, string> = {
  approved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  in_process: 'bg-amber-50 text-amber-700 border-amber-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
}

const STATUS_LABEL: Record<string, string> = {
  approved: 'Aprobado',
  in_process: 'En proceso',
  pending: 'Pendiente',
  rejected: 'Rechazado',
}

export function StatusBadge({ status }: { status: string }) {
  const style = STATUS_STYLE[status] ?? 'bg-slate-50 text-slate-600 border-slate-200'
  const label = STATUS_LABEL[status] ?? status
  return (
    <span
      className={`inline-block text-[10px] font-sans uppercase tracking-wider border px-2 py-0.5 ${style}`}
    >
      {label}
    </span>
  )
}

/** Tarjeta de una orden — vista principal en mobile (y en el resumen). */
export function OrderCard({ order }: { order: Order }) {
  const location = [order.ship_city, order.ship_province, order.ship_zip]
    .filter(Boolean)
    .join(', ')

  return (
    <div className="border border-ink/[0.08] bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-serif text-lg text-ink leading-snug">{order.product_name}</p>
        <StatusBadge status={order.status} />
      </div>
      <div className="flex items-center justify-between gap-3 mt-1 mb-3">
        <p className="font-serif text-xl text-ink">{formatPrice(order.amount)}</p>
        <span className="text-[10px] font-sans uppercase tracking-wider text-ink/50 border border-ink/10 px-2 py-0.5">
          {methodLabel(order.payment_method)}
        </span>
      </div>

      {order.ship_name && (
        <div className="mb-3">
          <p className="text-[10px] font-sans uppercase tracking-widest text-ink/35 mb-0.5">
            Envío {order.shipping_zone ? `· ${order.shipping_zone}` : ''}
            {order.shipping_cost != null ? ` · ${formatPrice(order.shipping_cost)}` : ''}
          </p>
          <p className="text-sm text-ink">{order.ship_name}</p>
          {order.ship_address && <p className="text-sm text-ink/60">{order.ship_address}</p>}
          {location && <p className="text-[13px] text-ink/50">{location}</p>}
          {order.ship_notes && (
            <p className="text-[12px] text-ink/40 italic mt-0.5">{order.ship_notes}</p>
          )}
        </div>
      )}

      <div className="mb-1">
        <p className="text-[10px] font-sans uppercase tracking-widest text-ink/35 mb-0.5">
          Contacto
        </p>
        <p className="text-sm text-ink/70">{order.ship_phone ?? '—'}</p>
        {order.payer_email && <p className="text-[13px] text-ink/50">{order.payer_email}</p>}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-ink/[0.06] text-[11px] font-sans text-ink/40 tabular-nums">
        <span>{formatDate(order.created_at)}</span>
        {order.payment_id && <span>#{order.payment_id}</span>}
      </div>

      {isManualPending(order) && (
        <div className="mt-3">
          <OrderActions id={order.id} />
        </div>
      )}
    </div>
  )
}
