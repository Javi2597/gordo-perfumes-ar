import { NextResponse } from 'next/server'
import { createOrder, type Shipping } from '@/lib/orders'
import { products } from '@/constants/products'
import { getShippingCost, isShippingZone } from '@/constants/shipping'

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
  let body: ManualOrderBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'JSON inválido.' }, { status: 400 })
  }

  if (body.method !== 'transferencia' && body.method !== 'efectivo') {
    return NextResponse.json({ error: 'Método de pago inválido.' }, { status: 400 })
  }

  const product = products.find((p) => p.id === body.productId)
  if (!product) {
    return NextResponse.json({ error: 'Producto inexistente.' }, { status: 400 })
  }

  // Envío obligatorio.
  const sp = body.shipping ?? {}
  const required: (keyof Shipping)[] = ['name', 'phone', 'address', 'city', 'province', 'zip']
  const missing = required.filter((k) => !String(sp[k] ?? '').trim())
  if (missing.length > 0) {
    return NextResponse.json({ error: 'Faltan datos de envío obligatorios.' }, { status: 400 })
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

  // Zona/costo de envío resueltos en el server.
  const shippingCost = getShippingCost(body.zone)
  if (!isShippingZone(body.zone) || shippingCost === null) {
    return NextResponse.json({ error: 'Elegí una zona de envío válida.' }, { status: 400 })
  }
  const total = product.precio_referencial + shippingCost

  try {
    const id = await createOrder({
      productId: product.id,
      productName: `${product.nombre} — ${product.marca}`,
      productSlug: product.slug,
      amount: total,
      status: 'pending',
      payerEmail: body.email?.trim() || null,
      shipping,
      paymentMethod: body.method,
      shippingZone: body.zone,
      shippingCost,
    })

    return NextResponse.json({ id })
  } catch (err) {
    console.error('[orders/manual] error:', err)
    return NextResponse.json({ error: 'No se pudo registrar el pedido.' }, { status: 500 })
  }
}
