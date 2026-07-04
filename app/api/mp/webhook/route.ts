import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { Payment } from 'mercadopago'
import { mpClient, isMpConfigured, MP_WEBHOOK_SECRET } from '@/lib/mercadopago'
import { upsertOrderFromPayment, updateOrderById } from '@/lib/orders'
import { products } from '@/constants/products'

export const runtime = 'nodejs'

/**
 * Valida la firma x-signature de MercadoPago.
 *
 * Formato del header: `ts=<timestamp>,v1=<hmac_sha256_hex>`
 * Manifest firmado: `id:<data.id>;request-id:<x-request-id>;ts:<ts>;`
 * (data.id en minúsculas si es alfanumérico, según la doc de MP).
 */
function isValidSignature(
  dataId: string,
  xSignature: string | null,
  xRequestId: string | null
): boolean {
  if (!MP_WEBHOOK_SECRET) return false
  if (!xSignature) return false

  const parts = Object.fromEntries(
    xSignature.split(',').map((kv) => {
      const [k, v] = kv.split('=')
      return [k?.trim(), v?.trim()]
    })
  ) as { ts?: string; v1?: string }

  if (!parts.ts || !parts.v1) return false

  const manifest = `id:${dataId.toLowerCase()};request-id:${xRequestId ?? ''};ts:${parts.ts};`
  const expected = createHmac('sha256', MP_WEBHOOK_SECRET).update(manifest).digest('hex')

  const a = Buffer.from(expected)
  const b = Buffer.from(parts.v1)
  return a.length === b.length && timingSafeEqual(a, b)
}

export async function POST(request: Request) {
  const url = new URL(request.url)

  let payload: { type?: string; action?: string; data?: { id?: string } } = {}
  try {
    payload = await request.json()
  } catch {
    // MP a veces manda el id por query string; seguimos igual.
  }

  // El id del pago puede venir en el body (data.id) o en la query (?data.id= / ?id=).
  const dataId =
    payload.data?.id ??
    url.searchParams.get('data.id') ??
    url.searchParams.get('id') ??
    ''

  const topic = payload.type ?? url.searchParams.get('type') ?? url.searchParams.get('topic')

  // Validación de firma. Si todavía no hay MP_WEBHOOK_SECRET configurado,
  // logueamos una advertencia pero no rechazamos (útil en el MVP inicial).
  const xSignature = request.headers.get('x-signature')
  const xRequestId = request.headers.get('x-request-id')

  if (MP_WEBHOOK_SECRET) {
    if (!isValidSignature(dataId, xSignature, xRequestId)) {
      console.warn('[mp/webhook] Firma inválida — notificación rechazada.')
      return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    }
  } else {
    console.warn('[mp/webhook] MP_WEBHOOK_SECRET no configurado: firma no validada.')
  }

  // Solo nos interesan las notificaciones de pago.
  if (topic === 'payment' && dataId && isMpConfigured()) {
    try {
      const payment = await new Payment(mpClient).get({ id: dataId })
      console.log('[mp/webhook] pago', dataId, '→', payment.status, payment.status_detail)

      // Flujo wallet: la orden se creó antes con external_reference = id de la orden.
      // La actualizamos por ese id y le seteamos el payment_id.
      if (payment.external_reference) {
        await updateOrderById(payment.external_reference, {
          status: payment.status ?? 'unknown',
          statusDetail: payment.status_detail ?? null,
          paymentId: String(dataId),
        })
      } else {
        // Flujo tarjeta: reconciliamos por payment_id; si no existe la orden
        // (el webhook llegó antes del INSERT), la creamos desde el metadata.
        const metadata = (payment.metadata ?? {}) as {
          product_id?: string
          product_slug?: string
        }
        const product = products.find((p) => p.id === metadata.product_id)
        await upsertOrderFromPayment({
          productId: metadata.product_id ?? 'desconocido',
          productName: product ? `${product.nombre} — ${product.marca}` : 'Producto desconocido',
          productSlug: metadata.product_slug ?? product?.slug ?? null,
          amount: Math.round(payment.transaction_amount ?? product?.precio_referencial ?? 0),
          status: payment.status ?? 'unknown',
          statusDetail: payment.status_detail ?? null,
          paymentId: String(dataId),
          payerEmail: payment.payer?.email ?? null,
        })
      }
    } catch (err) {
      console.error('[mp/webhook] error consultando el pago', dataId, err)
      // Devolvemos 200 igual: MP reintenta ante 5xx; el error ya quedó logueado.
    }
  }

  // Responder 200 rápido para que MercadoPago no reintente.
  return NextResponse.json({ received: true })
}
