import { NextResponse } from 'next/server'
import { Preference } from 'mercadopago'
import { mpClient, isMpConfigured, isMpTestMode } from '@/lib/mercadopago'
import { createOrder, type Shipping } from '@/lib/orders'
import { products } from '@/constants/products'
import { getShippingCost, isZoneAllowedForProduct } from '@/constants/shipping'
import { SITE_URL } from '@/constants/site'
import { isPaymentEnabled } from '@/constants/payment'
import { isValidEmail, parseShipping } from '@/lib/validation'
import { enforceRateLimit, LIMITS } from '@/lib/rate-limit'

export const runtime = 'nodejs'

/**
 * Crea una preferencia de pago para el flujo "dinero en cuenta de Mercado Pago"
 * (wallet_purchase, por redirección). Antes crea la orden `pending` y usa su id como
 * external_reference para que el webhook la concilie al confirmarse el pago.
 */
interface PreferenceBody {
  productId?: string
  zone?: string
  email?: string
  shipping?: Partial<Shipping>
}

export async function POST(request: Request) {
  // Medio de pago desactivado en el checkout: el endpoint queda cerrado aunque
  // alguien lo llame directo. Se reabre solo al volver a habilitarlo en ENABLED_PAYMENT_METHODS.
  if (!isPaymentEnabled('wallet')) {
    return NextResponse.json(
      { error: 'Este medio de pago no está disponible.' },
      { status: 410 }
    )
  }

  const limited = enforceRateLimit(request, 'mp/preference', LIMITS.payments)
  if (limited) return limited

  if (!isMpConfigured()) {
    return NextResponse.json(
      { error: 'Pagos no configurados. Falta MP_ACCESS_TOKEN.' },
      { status: 500 }
    )
  }

  let body: PreferenceBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const product = products.find((p) => p.id === body.productId)
  if (!product) {
    return NextResponse.json({ error: 'Producto inexistente.' }, { status: 400 })
  }

  // El email es el destinatario real del correo de confirmación: validarlo o cualquiera
  // puede hacer que el dominio verificado le mande un mail a quien quiera.
  const email = body.email?.trim()
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Ingresá un email válido.' }, { status: 400 })
  }

  // Envío: normalizado y validado (obligatorios + topes de largo) en un solo lugar.
  const parsed = parseShipping(body.shipping)
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }
  const { shipping } = parsed

  // Total (producto + envío) resuelto en el server. RETIRO solo en productos habilitados.
  if (!isZoneAllowedForProduct(product.id, body.zone)) {
    return NextResponse.json({ error: 'Elegí una zona de envío válida.' }, { status: 400 })
  }
  const shippingCost = getShippingCost(body.zone) ?? 0
  const total = product.precio_referencial + shippingCost

  // 1) Orden pendiente. Su id va como external_reference de la preferencia.
  let orderId: string | null
  try {
    orderId = await createOrder({
      productId: product.id,
      productName: `${product.nombre} — ${product.marca}`,
      productSlug: product.slug,
      amount: total,
      status: 'pending',
      payerEmail: email,
      shipping,
      paymentMethod: 'wallet',
      shippingZone: body.zone,
      shippingCost,
    })
  } catch (dbErr) {
    console.error('[mp/preference] no se pudo crear la orden:', dbErr)
    return NextResponse.json({ error: 'No se pudo registrar el pedido.' }, { status: 500 })
  }
  if (!orderId) {
    return NextResponse.json({ error: 'No se pudo registrar el pedido.' }, { status: 500 })
  }

  // 2) Preferencia de MP (wallet_purchase → paga logueado con su saldo/tarjetas).
  const backUrl = `${SITE_URL}/checkout/resultado?slug=${encodeURIComponent(product.slug)}`
  try {
    const pref = await new Preference(mpClient).create({
      body: {
        items: [
          {
            id: product.id,
            title: `${product.nombre} — ${product.marca} (${product.ml}ml)`,
            quantity: 1,
            unit_price: total,
            currency_id: 'ARS',
          },
        ],
        purpose: 'wallet_purchase',
        external_reference: orderId,
        payer: { email },
        back_urls: { success: backUrl, pending: backUrl, failure: backUrl },
        auto_return: 'approved',
        metadata: { order_id: orderId, product_id: product.id },
      },
    })

    // En pruebas (access token TEST-...) se prefiere el sandbox_init_point, pero
    // MP lo está discontinuando y a veces no lo devuelve: caemos al init_point.
    const redirectUrl = isMpTestMode()
      ? (pref.sandbox_init_point ?? pref.init_point)
      : pref.init_point

    if (!redirectUrl) {
      return NextResponse.json({ error: 'No se pudo iniciar el pago.' }, { status: 502 })
    }
    return NextResponse.json({ init_point: redirectUrl, orderId })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al crear la preferencia.'
    console.error('[mp/preference] error:', err)
    return NextResponse.json({ error: message }, { status: 502 })
  }
}
