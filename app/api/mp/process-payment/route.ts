import { NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { Payment } from 'mercadopago'
import { mpClient, isMpConfigured } from '@/lib/mercadopago'
import { createOrder, getOrderById, type Shipping } from '@/lib/orders'
import { sendOrderNotification } from '@/lib/email'
import { products } from '@/constants/products'
import { getShippingCost, isShippingZone } from '@/constants/shipping'

// Este handler usa el SDK de Node (crypto, access token secreto): runtime Node.
export const runtime = 'nodejs'

/**
 * Body que envía el Payment Brick en su callback onSubmit, más el productId
 * que agregamos nosotros para validar el monto en el server.
 */
interface ProcessPaymentBody {
  productId?: string
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

  const email = body.payer?.email
  if (!email) {
    return NextResponse.json({ error: 'Falta el email del pagador.' }, { status: 400 })
  }

  // Datos de envío: obligatorios para poder despachar el producto.
  const sp = body.shipping ?? {}
  const required: (keyof Shipping)[] = ['name', 'phone', 'address', 'city', 'province', 'zip']
  const missing = required.filter((k) => !String(sp[k] ?? '').trim())
  if (missing.length > 0) {
    return NextResponse.json(
      { error: 'Faltan datos de envío obligatorios.' },
      { status: 400 }
    )
  }
  const shipping: Shipping = {
    name: String(sp.name).trim(),
    phone: String(sp.phone).trim(),
    address: String(sp.address).trim(),
    city: String(sp.city).trim(),
    province: String(sp.province).trim(),
    zip: String(sp.zip).trim(),
    notes: sp.notes ? String(sp.notes).trim() : null,
  }

  // Zona de envío: obligatoria. El costo se resuelve en el server (no del cliente).
  const shippingCost = getShippingCost(body.zone)
  if (!isShippingZone(body.zone) || shippingCost === null) {
    return NextResponse.json({ error: 'Elegí una zona de envío válida.' }, { status: 400 })
  }
  const total = product.precio_referencial + shippingCost

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
      requestOptions: {
        // Evita cobros duplicados si el cliente reintenta el mismo submit.
        idempotencyKey: randomUUID(),
      },
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

      // Aviso por correo solo en pagos exitosos (approved / in_process).
      // Aislado: un fallo de email no afecta la respuesta del pago.
      if (orderId && (result.status === 'approved' || result.status === 'in_process')) {
        try {
          const order = await getOrderById(orderId)
          if (order) await sendOrderNotification(order)
        } catch (mailErr) {
          console.error('[mp/process-payment] no se pudo enviar el aviso:', mailErr)
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
