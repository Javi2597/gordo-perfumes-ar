import { Resend } from 'resend'
import type { Order } from '@/lib/orders'
import { PAYMENT_LABELS, isPaymentMethod, BANK_TRANSFER } from '@/constants/payment'
import { SITE_NAME, SITE_URL } from '@/constants/site'
import { WHATSAPP_NUMBER } from '@/constants/products'

/**
 * Correos de órdenes (vía Resend).
 *
 * Dos destinatarios por orden:
 *  - Interno: aviso de venta a las casillas de ORDER_NOTIFY_EMAILS.
 *  - Cliente: confirmación con número de pedido y diseño de marca, al email que
 *    dejó al comprar (order.payer_email).
 *
 * RESEND_API_KEY es secreto: solo backend, nunca NEXT_PUBLIC_.
 * Ningún envío debe romper el flujo de la orden: todo va envuelto en try/catch y,
 * si falta la API key, es un no-op con advertencia (mismo criterio que el resto
 * de los handlers al guardar la orden).
 */

const DEFAULT_RECIPIENTS = 'lexozk.33@gmail.com, javi.bellido25@gmail.com'
const DEFAULT_FROM = `${SITE_NAME} <pedidos@terpenosfragances.com.ar>`

// Paleta de marca (para el correo del cliente).
const C = {
  cream: '#f4f1ea',
  card: '#ffffff',
  ink: '#1a1a1a',
  gold: '#c5a059',
  goldDark: '#a68840',
  muted: '#8a8a8a',
  border: '#ece7dd',
}

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

function fromAddress(): string {
  return process.env.ORDER_FROM_EMAIL ?? DEFAULT_FROM
}

/** Destinatarios internos, desde ORDER_NOTIFY_EMAILS (coma-separado) o el default. */
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

/** Número de pedido legible para el cliente (mismos 8 chars que la página de confirmación). */
function orderNumber(o: Order): string {
  return o.id.slice(0, 8).toUpperCase()
}

/**
 * Envuelve el cuerpo en un documento HTML completo con charset UTF-8 declarado.
 * Sin esto, algunos clientes (Gmail) interpretan los acentos como Latin-1 y se ven
 * como "portugués" (mojibake: transferí → transferÃ­).
 */
function htmlDoc(title: string, body: string): string {
  return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta http-equiv="Content-Type" content="text/html; charset=utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
</head>
<body style="margin:0;padding:0">
${body}
</body>
</html>`
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

/* ─────────────────────────── Aviso interno (a la tienda) ─────────────────── */

const STATUS_COLORS: Record<string, [string, string]> = {
  approved: ['#e7f4ec', '#1a7a43'],
  in_process: ['#fdf3e0', '#9a6600'],
  pending: ['#fdf3e0', '#9a6600'],
  rejected: ['#fbeaea', '#a52222'],
  cancelled: ['#fbeaea', '#a52222'],
  refunded: ['#eef0f4', '#4a5568'],
}

function buildHtml(o: Order): string {
  const localidad = [o.ship_city, o.ship_province, o.ship_zip].filter(Boolean).join(', ')
  const zona =
    o.shipping_zone != null
      ? `${o.shipping_zone}${o.shipping_cost != null ? ` · ${formatPrice(o.shipping_cost)}` : ''}`
      : null

  const [badgeBg, badgeFg] = STATUS_COLORS[o.status] ?? ['#eef0f4', '#4a5568']
  const badge = `<span style="display:inline-block;background:${badgeBg};color:${badgeFg};font-size:12px;font-weight:bold;padding:4px 12px;border-radius:999px">${esc(statusLabel(o.status))}</span>`

  const dataRow = (label: string, value: string) =>
    `<tr>
       <td style="padding:7px 0;color:${C.muted};font-size:12px;text-transform:uppercase;letter-spacing:.05em;white-space:nowrap;vertical-align:top;width:34%">${esc(label)}</td>
       <td style="padding:7px 0;color:${C.ink};font-size:14px">${value}</td>
     </tr>`

  // value ya viene como HTML seguro (texto escapado o marcado propio).
  const section = (title: string, rows: [string, string | null][]) => {
    const inner = rows
      .filter(([, v]) => v)
      .map(([l, v]) => dataRow(l, v as string))
      .join('')
    if (!inner) return ''
    return `
    <tr><td style="padding:22px 32px 0">
      <div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${C.goldDark};font-weight:bold;margin:0 0 6px">${esc(title)}</div>
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border-top:1px solid ${C.border}">${inner}</table>
    </td></tr>`
  }

  const body = `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream};padding:24px 12px">
<tr><td align="center">
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:${C.card};border:1px solid ${C.border};border-radius:12px;overflow:hidden">

    <!-- Header -->
    <tr><td style="padding:28px 32px 0;text-align:center">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:20px;color:${C.ink}">${esc(SITE_NAME)}</div>
      <div style="font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:${C.gold};margin-top:6px">Aviso de venta</div>
      <div style="height:2px;width:40px;background:${C.gold};margin:16px auto 0"></div>
    </td></tr>

    <!-- Monto + estado -->
    <tr><td style="padding:20px 32px 4px;text-align:center">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;color:${C.ink};margin-bottom:6px">Nuevo pedido</div>
      <div style="font-size:26px;font-weight:bold;color:${C.goldDark};margin-bottom:12px">${formatPrice(o.amount)}</div>
      ${badge}
    </td></tr>

    <!-- Nº pedido -->
    <tr><td style="padding:16px 32px 0;text-align:center">
      <span style="display:inline-block;border:1px solid ${C.border};border-radius:999px;padding:7px 16px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:${C.ink}">Pedido Nº <strong style="color:${C.goldDark}">${orderNumber(o)}</strong></span>
    </td></tr>

    ${section('Pedido', [
      ['Producto', esc(o.product_name)],
      ['Total', `<strong>${formatPrice(o.amount)}</strong>`],
      ['Método', esc(methodLabel(o.payment_method))],
    ])}

    ${section('Cliente', [
      ['Nombre', o.ship_name ? esc(o.ship_name) : null],
      ['Email', o.payer_email ? esc(o.payer_email) : null],
      ['Teléfono', o.ship_phone ? esc(o.ship_phone) : null],
      ['DNI', o.payer_dni ? esc(o.payer_dni) : null],
    ])}

    ${section('Envío', [
      ['Dirección', o.ship_address ? esc(o.ship_address) : null],
      ['Localidad', localidad ? esc(localidad) : null],
      ['Zona', zona ? esc(zona) : null],
      ['Notas', o.ship_notes ? esc(o.ship_notes) : null],
    ])}

    ${section('Referencias', [
      ['ID orden', `<span style="color:${C.muted};font-size:13px">${esc(o.id)}</span>`],
      ['ID pago', o.payment_id ? `<span style="color:${C.muted};font-size:13px">${esc(o.payment_id)}</span>` : null],
    ])}

    <tr><td style="padding:28px 32px 30px"></td></tr>
  </table>
</td></tr>
</table>`.trim()
  return htmlDoc(`Nuevo pedido Nº ${orderNumber(o)} · ${formatPrice(o.amount)}`, body)
}

function buildText(o: Order): string {
  const localidad = [o.ship_city, o.ship_province, o.ship_zip].filter(Boolean).join(', ')
  const zona =
    o.shipping_zone != null
      ? `${o.shipping_zone}${o.shipping_cost != null ? ` · ${formatPrice(o.shipping_cost)}` : ''}`
      : null

  const L: string[] = [
    `${SITE_NAME} — Aviso de venta`,
    '',
    `NUEVO PEDIDO · ${formatPrice(o.amount)} · ${statusLabel(o.status)}`,
    `Pedido Nº ${orderNumber(o)}`,
    '',
    'PEDIDO',
    `  Producto: ${o.product_name}`,
    `  Total: ${formatPrice(o.amount)}`,
    `  Método: ${methodLabel(o.payment_method)}`,
    '',
    'CLIENTE',
    `  Nombre: ${o.ship_name ?? '—'}`,
    `  Email: ${o.payer_email ?? '—'}`,
    `  Teléfono: ${o.ship_phone ?? '—'}`,
  ]
  if (o.payer_dni) L.push(`  DNI: ${o.payer_dni}`)
  L.push('', 'ENVÍO', `  Dirección: ${o.ship_address ?? '—'}`)
  if (localidad) L.push(`  Localidad: ${localidad}`)
  if (zona) L.push(`  Zona: ${zona}`)
  if (o.ship_notes) L.push(`  Notas: ${o.ship_notes}`)
  L.push('', 'REFERENCIAS', `  ID orden: ${o.id}`)
  if (o.payment_id) L.push(`  ID pago: ${o.payment_id}`)
  return L.join('\n')
}

/**
 * Envía el aviso de una orden a las casillas internas. Nunca lanza.
 */
export async function sendOrderNotification(o: Order): Promise<void> {
  if (!isEmailConfigured()) {
    console.warn('[email] RESEND_API_KEY no configurado — no se envía el aviso interno.')
    return
  }
  const to = recipients()
  if (to.length === 0) {
    console.warn('[email] ORDER_NOTIFY_EMAILS vacío — no hay destinatarios internos.')
    return
  }

  try {
    const { error } = await getResend().emails.send({
      from: fromAddress(),
      to,
      subject: `Nuevo pedido Nº ${orderNumber(o)} · ${o.product_name} · ${formatPrice(o.amount)} (${statusLabel(o.status)})`,
      html: buildHtml(o),
      text: buildText(o),
    })
    if (error) {
      console.error('[email] Resend devolvió error al enviar el aviso interno:', error)
    }
  } catch (err) {
    console.error('[email] error enviando el aviso interno:', err)
  }
}

/* ────────────────────────── Confirmación al cliente ──────────────────────── */

/** Título y mensaje de intro según método y estado del pago. */
function customerIntro(o: Order): { title: string; message: string } {
  const method = o.payment_method
  if (method === 'transferencia') {
    return {
      title: '¡Recibimos tu pedido!',
      message:
        'Para completar tu compra, transferí el total al alias que figura abajo. ' +
        'Apenas verifiquemos el pago te contactamos por WhatsApp para coordinar el envío.',
    }
  }
  if (method === 'efectivo') {
    return {
      title: '¡Recibimos tu pedido!',
      message:
        'Coordinaremos la entrega por WhatsApp. Pagás en efectivo al recibir el paquete.',
    }
  }
  // mercadopago / wallet
  if (o.status === 'approved') {
    return {
      title: '¡Gracias por tu compra!',
      message: 'Tu pago fue aprobado y ya estamos preparando tu pedido. Te contactamos por WhatsApp para coordinar el envío.',
    }
  }
  return {
    title: '¡Recibimos tu pedido!',
    message: 'Tu pago está en proceso. Te avisamos apenas se acredite para coordinar el envío.',
  }
}

/** Caja de "pasos a seguir" (varía por método). Devuelve '' si no aplica. */
function nextStepsBox(o: Order): string {
  const boxOpen = `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid ${C.border};border-radius:8px;background:${C.cream};margin:0 0 24px"><tr><td style="padding:18px 20px">`
  const boxClose = `</td></tr></table>`
  const heading = (t: string) =>
    `<div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${C.goldDark};font-weight:bold;margin:0 0 12px">${t}</div>`
  const dataRow = (label: string, value: string) =>
    `<tr><td style="padding:5px 0;color:${C.muted};font-size:12px;text-transform:uppercase;letter-spacing:.06em">${label}</td><td style="padding:5px 0;color:${C.ink};font-size:14px;font-weight:bold;text-align:right">${value}</td></tr>`

  if (o.payment_method === 'transferencia') {
    return (
      boxOpen +
      heading('Datos para transferir') +
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${dataRow('Alias', esc(BANK_TRANSFER.alias))}
        ${dataRow('Titular', esc(BANK_TRANSFER.titular))}
        ${dataRow('Entidad', esc(BANK_TRANSFER.entidad))}
        ${dataRow('Total a transferir', formatPrice(o.amount))}
      </table>` +
      boxClose
    )
  }
  if (o.payment_method === 'efectivo') {
    return (
      boxOpen +
      heading('Pago contra entrega') +
      `<table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${dataRow('Total a pagar al recibir', formatPrice(o.amount))}
      </table>` +
      boxClose
    )
  }
  if (o.status === 'approved') {
    return (
      boxOpen +
      heading('Pago confirmado') +
      `<div style="color:${C.ink};font-size:14px">Registramos tu pago de <strong>${formatPrice(o.amount)}</strong>. ¡Gracias!</div>` +
      boxClose
    )
  }
  return ''
}

function buildCustomerHtml(o: Order): string {
  const { title, message } = customerIntro(o)
  const shippingCost = o.shipping_cost ?? 0
  const productSubtotal = o.amount - shippingCost

  const summaryRow = (label: string, value: string, strong = false) =>
    `<tr>
       <td style="padding:8px 0;border-bottom:1px solid ${C.border};color:${strong ? C.ink : C.muted};font-size:${strong ? '15px' : '14px'};font-weight:${strong ? 'bold' : 'normal'}">${label}</td>
       <td style="padding:8px 0;border-bottom:1px solid ${C.border};color:${C.ink};font-size:${strong ? '16px' : '14px'};font-weight:bold;text-align:right">${value}</td>
     </tr>`

  const totalRow = `<tr>
       <td style="padding:12px 0 0;color:${C.ink};font-size:15px;font-weight:bold">Total</td>
       <td style="padding:12px 0 0;color:${C.goldDark};font-size:18px;font-weight:bold;text-align:right">${formatPrice(o.amount)}</td>
     </tr>`

  const shippingBlock = shippingLines(o)
    .map((l) => esc(l))
    .join('<br>')

  const body = `
<div style="margin:0;padding:0;background:${C.cream}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.cream};padding:24px 12px">
<tr><td align="center">
  <table role="presentation" width="560" cellpadding="0" cellspacing="0" style="max-width:560px;width:100%;background:${C.card};border:1px solid ${C.border};border-radius:12px;overflow:hidden">

    <!-- Header -->
    <tr><td style="padding:32px 32px 0;text-align:center">
      <div style="font-family:Georgia,'Times New Roman',serif;font-size:24px;color:${C.ink};letter-spacing:.02em">${esc(SITE_NAME)}</div>
      <div style="font-size:10px;letter-spacing:.28em;text-transform:uppercase;color:${C.gold};margin-top:6px">Perfumería</div>
      <div style="height:2px;width:48px;background:${C.gold};margin:20px auto 0"></div>
    </td></tr>

    <!-- Title + message -->
    <tr><td style="padding:24px 32px 8px;text-align:center">
      <h1 style="font-family:Georgia,'Times New Roman',serif;font-size:26px;color:${C.ink};margin:0 0 10px">${esc(title)}</h1>
      <p style="font-size:14px;line-height:1.6;color:#555;margin:0">${esc(message)}</p>
    </td></tr>

    <!-- Order number -->
    <tr><td style="padding:8px 32px 24px;text-align:center">
      <span style="display:inline-block;border:1px solid ${C.border};border-radius:999px;padding:8px 18px;font-size:12px;letter-spacing:.12em;text-transform:uppercase;color:${C.ink}">
        Pedido Nº <strong style="color:${C.goldDark}">${orderNumber(o)}</strong>
      </span>
    </td></tr>

    <!-- Summary -->
    <tr><td style="padding:0 32px">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
        ${summaryRow(esc(o.product_name), formatPrice(productSubtotal))}
        ${o.shipping_cost != null ? summaryRow(`Envío${o.shipping_zone ? ` (${esc(o.shipping_zone)})` : ''}`, formatPrice(o.shipping_cost)) : ''}
        ${totalRow}
      </table>
    </td></tr>

    <!-- Next steps -->
    <tr><td style="padding:28px 32px 0">${nextStepsBox(o)}</td></tr>

    <!-- Shipping address -->
    <tr><td style="padding:0 32px 8px">
      <div style="font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:${C.goldDark};font-weight:bold;margin:0 0 8px">Enviaremos a</div>
      <div style="font-size:14px;line-height:1.6;color:${C.ink}">${shippingBlock || '—'}</div>
    </td></tr>

    <!-- Footer -->
    <tr><td style="padding:28px 32px 32px;text-align:center;border-top:1px solid ${C.border};margin-top:24px">
      <p style="font-size:13px;color:#666;margin:0 0 10px">¿Dudas con tu pedido? Escribinos por WhatsApp.</p>
      <a href="https://wa.me/${WHATSAPP_NUMBER}" style="display:inline-block;background:${C.ink};color:#fff;text-decoration:none;font-size:11px;letter-spacing:.12em;text-transform:uppercase;padding:12px 24px;border-radius:4px">Contactar por WhatsApp</a>
      <p style="font-size:11px;color:${C.muted};margin:18px 0 0">${esc(SITE_NAME)} · <a href="${SITE_URL}" style="color:${C.muted}">${SITE_URL.replace('https://', '')}</a></p>
    </td></tr>

  </table>
</td></tr>
</table>
</div>`.trim()
  return htmlDoc(customerSubject(o), body)
}

function buildCustomerText(o: Order): string {
  const { title, message } = customerIntro(o)
  const shippingCost = o.shipping_cost ?? 0
  const productSubtotal = o.amount - shippingCost

  const lines = [
    SITE_NAME,
    '',
    title,
    message,
    '',
    `Pedido Nº ${orderNumber(o)}`,
    '',
    `${o.product_name}: ${formatPrice(productSubtotal)}`,
  ]
  if (o.shipping_cost != null) {
    lines.push(`Envío${o.shipping_zone ? ` (${o.shipping_zone})` : ''}: ${formatPrice(o.shipping_cost)}`)
  }
  lines.push(`Total: ${formatPrice(o.amount)}`)

  if (o.payment_method === 'transferencia') {
    lines.push('', 'Datos para transferir:', `  Alias: ${BANK_TRANSFER.alias}`, `  Titular: ${BANK_TRANSFER.titular}`, `  Entidad: ${BANK_TRANSFER.entidad}`, `  Total a transferir: ${formatPrice(o.amount)}`)
  } else if (o.payment_method === 'efectivo') {
    lines.push('', `Pago contra entrega — total a pagar al recibir: ${formatPrice(o.amount)}`)
  }

  lines.push('', 'Enviaremos a:', ...shippingLines(o).map((l) => `  ${l}`))
  lines.push('', `Contacto: https://wa.me/${WHATSAPP_NUMBER}`, SITE_URL)
  return lines.join('\n')
}

/** Asunto del correo al cliente, según método/estado. */
function customerSubject(o: Order): string {
  const n = orderNumber(o)
  if (o.payment_method === 'transferencia') {
    return `Tu pedido Nº ${n} — datos para transferir · ${SITE_NAME}`
  }
  if (o.payment_method === 'efectivo') {
    return `Pedido Nº ${n} registrado · ${SITE_NAME}`
  }
  if (o.status === 'approved') {
    return `Pedido Nº ${n} confirmado ✓ · ${SITE_NAME}`
  }
  return `Pedido Nº ${n} recibido · ${SITE_NAME}`
}

/** Renderiza el correo del cliente (asunto/HTML/texto). Útil para previews y tests. */
export function renderCustomerEmail(o: Order): { subject: string; html: string; text: string } {
  return { subject: customerSubject(o), html: buildCustomerHtml(o), text: buildCustomerText(o) }
}

/** Renderiza el aviso interno (asunto/HTML/texto). Útil para previews y tests. */
export function renderInternalEmail(o: Order): { subject: string; html: string; text: string } {
  return {
    subject: `Nuevo pedido Nº ${orderNumber(o)} · ${o.product_name} · ${formatPrice(o.amount)} (${statusLabel(o.status)})`,
    html: buildHtml(o),
    text: buildText(o),
  }
}

/**
 * Envía la confirmación al cliente (al email que dejó al comprar). Nunca lanza:
 * si no hay API key o no hay email del comprador, es un no-op.
 */
export async function sendOrderConfirmationToCustomer(o: Order): Promise<void> {
  if (!isEmailConfigured()) return
  const to = o.payer_email?.trim()
  if (!to) {
    console.warn(`[email] Orden ${orderNumber(o)} sin email del comprador — no se envía confirmación.`)
    return
  }

  try {
    const { error } = await getResend().emails.send({
      from: fromAddress(),
      to,
      subject: customerSubject(o),
      html: buildCustomerHtml(o),
      text: buildCustomerText(o),
    })
    if (error) {
      console.error('[email] Resend devolvió error al enviar la confirmación al cliente:', error)
    }
  } catch (err) {
    console.error('[email] error enviando la confirmación al cliente:', err)
  }
}

/**
 * Dispara los dos correos de una orden (aviso interno + confirmación al cliente).
 * Cada envío está aislado: un fallo no bloquea al otro ni al flujo del pago.
 */
export async function sendOrderEmails(o: Order): Promise<void> {
  await Promise.allSettled([sendOrderNotification(o), sendOrderConfirmationToCustomer(o)])
}
