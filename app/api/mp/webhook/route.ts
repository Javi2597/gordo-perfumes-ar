import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'node:crypto'
import { isMpConfigured, MP_WEBHOOK_SECRET } from '@/lib/mercadopago'
import { reconcilePayment } from '@/lib/reconcile'

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
  } else if (process.env.NODE_ENV === 'production') {
    // En producción exigimos el secret: sin él no validamos firmas y no procesamos.
    console.error('[mp/webhook] MP_WEBHOOK_SECRET no configurado en producción — rechazado.')
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 401 })
  } else {
    console.warn('[mp/webhook] MP_WEBHOOK_SECRET no configurado (dev): firma no validada.')
  }

  // Solo nos interesan las notificaciones de pago.
  if (topic === 'payment' && dataId && isMpConfigured()) {
    try {
      // Misma conciliación que usa /checkout/resultado como red de seguridad.
      const result = await reconcilePayment(dataId)
      console.log('[mp/webhook] pago', dataId, '→', result?.status, result?.statusDetail)
    } catch (err) {
      console.error('[mp/webhook] error consultando el pago', dataId, err)
      // Devolvemos 200 igual: MP reintenta ante 5xx; el error ya quedó logueado.
    }
  }

  // Responder 200 rápido para que MercadoPago no reintente.
  return NextResponse.json({ received: true })
}
