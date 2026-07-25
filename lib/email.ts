import { Resend } from 'resend'
import type { Order } from '@/lib/orders'
import { PAYMENT_LABELS, isPaymentMethod } from '@/constants/payment'
import { SITE_NAME } from '@/constants/site'

/**
 * Notificación por correo de órdenes (vía Resend).
 *
 * RESEND_API_KEY es secreto: solo backend, nunca NEXT_PUBLIC_.
 * El envío nunca debe romper el flujo de la orden: sendOrderNotification atrapa
 * cualquier error internamente y solo loguea (mismo criterio que el resto de los
 * handlers al guardar la orden).
 */

const DEFAULT_RECIPIENTS = 'lexozk.33@gmail.com, javi.bellido25@gmail.com'
const DEFAULT_FROM = `${SITE_NAME} <pedidos@terpenosfragances.com.ar>`

let cached: Resend | null = null

function getResend(): Resend {
  if (!cached) {
    cached = new Resend(process.env.RESEND_API_KEY ?? '')
  }
  return cached
}

/** True si hay API key de Resend configurada. */
export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY)
}

/** Destinatarios del aviso, desde ORDER_NOTIFY_EMAILS (coma-separado) o el default. */
function recipients(): string[] {
  return (process.env.ORDER_NOTIFY_EMAILS ?? DEFAULT_RECIPIENTS)
    .split(',')
    .map((e) => e.trim())
    .filter(Boolean)
}

const priceFmt = new Intl.NumberFormat('es-AR', {
  style: 'currency',
  currency: 'ARS',
  maximumFractionDigits: 0,
})

function formatPrice(n: number | null | undefined): string {
  return typeof n === 'number' ? priceFmt.format(n) : '—'
}

function methodLabel(method: string | null): string {
  return method && isPaymentMethod(method) ? PAYMENT_LABELS[method] : (method ?? '—')
}

const STATUS_LABELS: Record<string, string> = {
  approved: 'Aprobado',
  in_process: 'En proceso',
  pending: 'Pendiente',
  rejected: 'Rechazado',
  cancelled: 'Cancelado',
  refunded: 'Reintegrado',
}

function statusLabel(status: string): string {
  return STATUS_LABELS[status] ?? status
}

/** Escapa texto para interpolarlo con seguridad en el HTML del correo. */
function esc(v: string | null | undefined): string {
  if (!v) return '—'
  return v
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function shippingLines(o: Order): string[] {
  const cityLine = [o.ship_city, o.ship_province, o.ship_zip].filter(Boolean).join(', ')
  const zoneLine =
    o.shipping_zone != null
      ? `Envío ${o.shipping_zone}${o.shipping_cost != null ? ` · ${formatPrice(o.shipping_cost)}` : ''}`
      : null
  return [
    o.ship_name,
    o.ship_phone,
    o.ship_address,
    cityLine || null,
    zoneLine,
    o.ship_notes ? `Notas: ${o.ship_notes}` : null,
  ].filter((l): l is string => Boolean(l))
}

function buildHtml(o: Order): string {
  const row = (label: string, value: string) =>
    `<tr><td style="padding:6px 12px;color:#8a8a8a;font-size:12px;text-transform:uppercase;letter-spacing:.08em;white-space:nowrap;vertical-align:top">${label}</td><td style="padding:6px 12px;color:#1a1a1a;font-size:14px">${value}</td></tr>`

  const shipping = shippingLines(o)
    .map((l) => esc(l))
    .join('<br>')

  return `
<div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#1a1a1a">
  <h2 style="font-size:18px;margin:0 0 4px">Nuevo pedido — ${esc(SITE_NAME)}</h2>
  <p style="color:#8a8a8a;font-size:13px;margin:0 0 16px">${esc(o.product_name)}</p>
  <table style="width:100%;border-collapse:collapse;border:1px solid #eee">
    ${row('Producto', esc(o.product_name))}
    ${row('Monto', formatPrice(o.amount))}
    ${row('Método', esc(methodLabel(o.payment_method)))}
    ${row('Estado', esc(statusLabel(o.status)))}
    ${row('Comprador', esc(o.payer_email))}
    ${o.payer_dni ? row('DNI', esc(o.payer_dni)) : ''}
    ${row('Envío', shipping || '—')}
    ${row('Orden', esc(o.id))}
    ${o.payment_id ? row('Pago', esc(o.payment_id)) : ''}
  </table>
</div>`.trim()
}

function buildText(o: Order): string {
  const lines = [
    `Nuevo pedido — ${SITE_NAME}`,
    '',
    `Producto: ${o.product_name}`,
    `Monto: ${formatPrice(o.amount)}`,
    `Método: ${methodLabel(o.payment_method)}`,
    `Estado: ${statusLabel(o.status)}`,
    `Comprador: ${o.payer_email ?? '—'}`,
  ]
  if (o.payer_dni) lines.push(`DNI: ${o.payer_dni}`)
  lines.push('', 'Envío:', ...shippingLines(o).map((l) => `  ${l}`))
  lines.push('', `Orden: ${o.id}`)
  if (o.payment_id) lines.push(`Pago: ${o.payment_id}`)
  return lines.join('\n')
}

/**
 * Envía el aviso de una orden a las casillas configuradas. Nunca lanza: si no hay
 * API key o el envío falla, loguea y retorna sin afectar el flujo del pago.
 */
export async function sendOrderNotification(o: Order): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn('[email] RESEND_API_KEY no configurado — no se envía el aviso de la orden.')
    return
  }
  const to = recipients()
  if (to.length === 0) {
    console.warn('[email] ORDER_NOTIFY_EMAILS vacío — no hay destinatarios.')
    return
  }

  try {
    const { error } = await getResend().emails.send({
      from: process.env.ORDER_FROM_EMAIL ?? DEFAULT_FROM,
      to,
      subject: `Nuevo pedido · ${o.product_name} · ${formatPrice(o.amount)} (${statusLabel(o.status)})`,
      html: buildHtml(o),
      text: buildText(o),
    })
    if (error) {
      console.error('[email] Resend devolvió error al enviar el aviso:', error)
    }
  } catch (err) {
    console.error('[email] error enviando el aviso de la orden:', err)
  }
}
