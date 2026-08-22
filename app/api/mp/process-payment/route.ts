import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { Payment } from 'mercadopago'
import { mpClient, isMpConfigured } from '@/lib/mercadopago'
import { createOrder, getOrderById, type Shipping } from '@/lib/orders'
import { sendOrderEmails } from '@/lib/email'
import { products } from '@/constants/products'
import { getShippingCost, isZoneAllowedForProduct } from '@/constants/shipping'
import { isPaymentEnabled } from '@/constants/payment'
import { isValidEmail, parseShipping } from '@/lib/validation'
import { enforceRateLimit, LIMITS } from '@/lib/rate-limit'

// Este handler usa el SDK de Node (crypto, access token secreto): runtime Node.
/** Forma de UUID v4: no le pasamos a MP cualquier cosa que mande el cliente. */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export const runtime = 'nodejs'

/**
 * Body que envía el Payment Brick en su callback onSubmit, más el productId
 * que agregamos nosotros para validar el monto en el server.
 */
interface ProcessPaymentBody {
  productId?: string
  /** Id estable del intento de compra que genera el cliente (ver CheckoutBrick). */
  paymentIntentId?: string
  token?: string
  issuer_id?: string
  payment_method_id?: string
  installments?: number
  payer?: {
    email?: string
    identification?: { type?: string; number?: string }
  }
  shipping?: Partial<Shipping>
  zone?: string
}

export async function POST(request: Request) {
  // Medio de pago desactivado en el checkout: el endpoint queda cerrado aunque
  // alguien lo llame directo. Se reabre solo al volver a habilitarlo en ENABLED_PAYMENT_METHODS.
  if (!isPaymentEnabled('mercadopago')) {
    return NextResponse.json(
      { error: 'Este medio de pago no está disponible.' },
      { status: 410 }
    )
  }

  const limited = enforceRateLimit(request, 'mp/process-payment', LIMITS.payments)
  if (limited) return limited

  if (!isMpConfigured()) {
    return NextResponse.json(
      { error: 'Pagos no configurados. Falta MP_ACCESS_TOKEN.' },
      { status: 500 }
    )
  }

  let body: ProcessPaymentBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  const { productId, token, payment_method_id } = body

  if (!token || !payment_method_id) {
    return NextResponse.json(
      { error: 'Faltan datos del pago (token / payment_method_id).' },
      { status: 400 }
    )
  }

  // El monto NUNCA se confía al cliente: se resuelve desde el catálogo en el server.
  const product = products.find((p) => p.id === productId)
  if (!product) {
    return NextResponse.json({ error: 'Producto inexistente.' }, { status: 400 })
  }

  // El email es el destinatario real del correo de confirmación: validarlo o cualquiera
  // puede hacer que el dominio verificado le mande un mail a quien quiera.
  const email = body.payer?.email?.trim()
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Ingresá un email válido.' }, { status: 400 })
  }

  // Envío: normalizado y validado (obligatorios + topes de largo) en un solo lugar.
  const parsed = parseShipping(body.shipping)
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }
  const { shipping } = parsed

  // Zona de envío: obligatoria. El costo se resuelve en el server (no del cliente).
  // RETIRO solo se acepta en los productos habilitados.
  if (!isZoneAllowedForProduct(product.id, body.zone)) {
    return NextResponse.json({ error: 'Elegí una zona de envío válida.' }, { status: 400 })
  }
  const shippingCost = getShippingCost(body.zone) ?? 0
  const total = product.precio_referencial + shippingCost

  // Idempotencia real: la clave la fija el CLIENTE una vez por intento de compra, así
  // un reintento (timeout de red, doble submit) reusa la misma y Mercado Pago devuelve
  // el pago original en vez de cobrar de nuevo.
  //
  // Si no llega (cliente viejo), se cae a una clave nueva: es el comportamiento de
  // siempre. A propósito NO se deriva de los datos del pedido: una clave determinista
  // tipo hash(producto|email|total) es la misma para una recompra legítima del mismo
  // perfume, y ahí MP devolvería el pago viejo y perderíamos la segunda venta.
  const intentId = String(body.paymentIntentId ?? '').trim()
  const idempotencyKey = UUID_RE.test(intentId) ? intentId : randomUUID()

  const payment = new Payment(mpClient)

  try {
    const result = await payment.create({
      body: {
        transaction_amount: total,
        token,
        description: `${product.nombre} — ${product.marca} (${product.ml}ml)`,
        installments: Number(body.installments) || 1,
        payment_method_id,
        issuer_id: body.issuer_id ? Number(body.issuer_id) : undefined,
        payer: {
          email,
          identification: body.payer?.identification?.number
            ? {
                type: body.payer?.identification?.type,
                number: body.payer?.identification?.number,
              }
            : undefined,
        },
        metadata: { product_id: product.id, product_slug: product.slug },
      },
      requestOptions: { idempotencyKey },
    })

    // Guardamos la orden. Si el INSERT falla, NO rompemos la respuesta del pago:
    // el pago ya se procesó y el webhook puede reconciliar la orden más tarde.
    try {
      const orderId = await createOrder({
        productId: product.id,
        productName: `${product.nombre} — ${product.marca}`,
        productSlug: product.slug,
        amount: total,
        status: result.status ?? 'unknown',
        statusDetail: result.status_detail ?? null,
        paymentId: result.id ? String(result.id) : null,
        payerEmail: email,
        payerDni: body.payer?.identification?.number ?? null,
        shipping,
        paymentMethod: 'mercadopago',
        shippingZone: body.zone,
        shippingCost,
      })

      // Correos solo en pagos exitosos (approved / in_process): aviso interno +
      // confirmación al cliente. Aislado: un fallo de email no afecta el pago.
      if (orderId && (result.status === 'approved' || result.status === 'in_process')) {
        try {
          const order = await getOrderById(orderId)
          if (order) await sendOrderEmails(order)
        } catch (mailErr) {
          console.error('[mp/process-payment] no se pudieron enviar los correos:', mailErr)
        }
      }
    } catch (dbErr) {
      console.error('[mp/process-payment] no se pudo guardar la orden:', dbErr)
    }

    return NextResponse.json({
      id: result.id,
      status: result.status, // approved | in_process | rejected
      status_detail: result.status_detail,
    })
  } catch (err: unknown) {
    // Logueamos el detalle del SDK en el server, pero al cliente solo un mensaje genérico
    // (no exponemos internals de la API de pagos).
    console.error('[mp/process-payment] error:', err)
    return NextResponse.json(
      { error: 'No se pudo procesar el pago. Intentá nuevamente o probá otro medio de pago.' },
      { status: 502 }
    )
  }
}
