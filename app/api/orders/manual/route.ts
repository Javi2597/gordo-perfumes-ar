import { NextResponse } from 'next/server'
import { createOrder, getOrderById, type Shipping } from '@/lib/orders'
import { sendOrderEmails } from '@/lib/email'
import { products } from '@/constants/products'
import { getShippingCost, isZoneAllowedForProduct } from '@/constants/shipping'
import { isValidEmail, parseShipping } from '@/lib/validation'
import { enforceRateLimit, LIMITS } from '@/lib/rate-limit'

export const runtime = 'nodejs'

/**
 * Crea una orden para pagos manuales (transferencia bancaria o efectivo contra
 * entrega). No pasa por MercadoPago: la orden nace pendiente y la dueña la
 * confirma desde el panel. El total (producto + envío) se calcula en el server.
 */
interface ManualOrderBody {
  productId?: string
  method?: string // transferencia | efectivo
  zone?: string
  email?: string
  shipping?: Partial<Shipping>
}

export async function POST(request: Request) {
  // Crea órdenes y dispara correos: primero el cupo, antes de tocar nada.
  const limited = enforceRateLimit(request, 'orders/manual', LIMITS.orders)
  if (limited) return limited

  let body: ManualOrderBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  if (body.method !== 'transferencia' && body.method !== 'efectivo') {
    return NextResponse.json({ error: 'Método de pago inválido.' }, { status: 400 })
  }

  // El email es el destinatario real del correo de confirmación: si no se valida acá,
  // cualquiera puede hacer que el dominio verificado le mande un mail a quien quiera.
  const email = body.email?.trim()
  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Ingresá un email válido.' }, { status: 400 })
  }

  const product = products.find((p) => p.id === body.productId)
  if (!product) {
    return NextResponse.json({ error: 'Producto inexistente.' }, { status: 400 })
  }

  // Envío: normalizado y validado (obligatorios + topes de largo) en un solo lugar.
  const parsed = parseShipping(body.shipping)
  if ('error' in parsed) {
    return NextResponse.json({ error: parsed.error }, { status: 400 })
  }
  const { shipping } = parsed

  // Zona/costo de envío resueltos en el server. RETIRO solo se acepta en los
  // productos habilitados (no confiar en el cliente).
  if (!isZoneAllowedForProduct(product.id, body.zone)) {
    return NextResponse.json({ error: 'Elegí una zona de envío válida.' }, { status: 400 })
  }
  const shippingCost = getShippingCost(body.zone) ?? 0
  const total = product.precio_referencial + shippingCost

  try {
    const id = await createOrder({
      productId: product.id,
      productName: `${product.nombre} — ${product.marca}`,
      productSlug: product.slug,
      amount: total,
      status: 'pending',
      payerEmail: email,
      shipping,
      paymentMethod: body.method,
      shippingZone: body.zone,
      shippingCost,
    })

    // Correos del nuevo pedido (aviso interno + confirmación al cliente).
    // Aislado en su propio try/catch: nunca debe afectar la respuesta del pedido.
    if (id) {
      try {
        const order = await getOrderById(id)
        if (order) await sendOrderEmails(order)
      } catch (mailErr) {
        console.error('[orders/manual] no se pudieron enviar los correos:', mailErr)
      }
    }

    return NextResponse.json({ id })
  } catch (err) {
    console.error('[orders/manual] error:', err)
    return NextResponse.json({ error: 'No se pudo registrar el pedido.' }, { status: 500 })
  }
}
