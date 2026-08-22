import { getSql } from '@/lib/db'

export interface Order {
  id: string
  created_at: string
  updated_at: string
  product_id: string
  product_name: string
  product_slug: string | null
  amount: number
  status: string
  status_detail: string | null
  payment_id: string | null
  payer_email: string | null
  payer_dni: string | null
  ship_name: string | null
  ship_phone: string | null
  ship_address: string | null
  ship_city: string | null
  ship_province: string | null
  ship_zip: string | null
  ship_notes: string | null
  payment_method: string | null
  shipping_zone: string | null
  shipping_cost: number | null
}

export interface Shipping {
  name: string
  phone: string
  address: string
  city: string
  province: string
  zip: string
  notes?: string | null
}

export interface NewOrder {
  productId: string
  productName: string
  productSlug?: string | null
  amount: number
  status: string
  statusDetail?: string | null
  paymentId?: string | null
  payerEmail?: string | null
  payerDni?: string | null
  shipping?: Shipping | null
  paymentMethod?: string | null
  shippingZone?: string | null
  shippingCost?: number | null
}

/**
 * Inserta una orden. Idempotente por payment_id: si ya existe una orden con ese
 * payment_id, no la duplica (ON CONFLICT DO NOTHING).
 */
export async function createOrder(data: NewOrder): Promise<string | null> {
  const sql = getSql()
  const s = data.shipping
  const rows = await sql`
    INSERT INTO orders (
      product_id, product_name, product_slug, amount,
      status, status_detail, payment_id, payer_email, payer_dni,
      ship_name, ship_phone, ship_address, ship_city, ship_province, ship_zip, ship_notes,
      payment_method, shipping_zone, shipping_cost
    ) VALUES (
      ${data.productId}, ${data.productName}, ${data.productSlug ?? null}, ${data.amount},
      ${data.status}, ${data.statusDetail ?? null}, ${data.paymentId ?? null},
      ${data.payerEmail ?? null}, ${data.payerDni ?? null},
      ${s?.name ?? null}, ${s?.phone ?? null}, ${s?.address ?? null}, ${s?.city ?? null},
      ${s?.province ?? null}, ${s?.zip ?? null}, ${s?.notes ?? null},
      ${data.paymentMethod ?? null}, ${data.shippingZone ?? null}, ${data.shippingCost ?? null}
    )
    ON CONFLICT (payment_id) DO NOTHING
    RETURNING id
  `
  return rows[0]?.id ?? null
}

/** Trae una orden por su id (uuid). Null si no existe. */
export async function getOrderById(id: string): Promise<Order | null> {
  const sql = getSql()
  const rows = await sql`SELECT * FROM orders WHERE id = ${id} LIMIT 1`
  return (rows[0] as Order) ?? null
}

/** True si es una orden manual (transferencia/efectivo) que sigue pendiente. */
export function isManualPending(order: Order): boolean {
  return (
    order.status === 'pending' &&
    (order.payment_method === 'transferencia' || order.payment_method === 'efectivo')
  )
}

/** Actualiza el estado de una orden por su id (uuid). Usado desde el panel. */
export async function updateOrderStatus(id: string, status: string): Promise<void> {
  const sql = getSql()
  await sql`UPDATE orders SET status = ${status}, updated_at = now() WHERE id = ${id}`
}

/**
 * Actualiza una orden por su id (uuid) con el resultado del pago. Lo usa el webhook
 * para conciliar el flujo wallet, donde la orden se creó antes del pago (sin payment_id).
 */
export async function updateOrderById(
  id: string,
  data: { status: string; statusDetail?: string | null; paymentId?: string | null }
): Promise<number> {
  const sql = getSql()
  const rows = await sql`
    UPDATE orders
    SET status = ${data.status},
        status_detail = ${data.statusDetail ?? null},
        payment_id = COALESCE(${data.paymentId ?? null}, payment_id),
        updated_at = now()
    WHERE id = ${id}
    RETURNING id
  `
  return rows.length
}

/**
 * Aplica el resultado de un pago a una orden (flujo wallet, donde la orden se creó
 * antes del pago). El UPDATE es condicional — solo toca la fila si el estado cambia —
 * así que `changed` es verdadero en UNA sola de las llamadas concurrentes.
 *
 * Eso es lo que evita mails duplicados: el webhook de MP se reintenta y, además,
 * la página de resultado concilia por su cuenta. Postgres serializa los UPDATE
 * sobre la misma fila, así que el segundo ya la ve en el estado nuevo y no devuelve
 * nada.
 */
export async function applyPaymentToOrder(
  id: string,
  data: { status: string; statusDetail?: string | null; paymentId?: string | null }
): Promise<{ changed: boolean; order: Order | null }> {
  const sql = getSql()
  const rows = await sql`
    UPDATE orders
    SET status = ${data.status},
        status_detail = ${data.statusDetail ?? null},
        payment_id = COALESCE(${data.paymentId ?? null}, payment_id),
        updated_at = now()
    WHERE id = ${id} AND status IS DISTINCT FROM ${data.status}
    RETURNING *
  `
  if (rows.length > 0) return { changed: true, order: rows[0] as Order }
  // Sin cambios: la orden ya estaba en ese estado (o no existe).
  return { changed: false, order: await getOrderById(id) }
}

/** Actualiza el estado de una orden existente a partir del payment_id. Devuelve cuántas filas tocó. */
export async function updateOrderStatusByPaymentId(
  paymentId: string,
  status: string,
  statusDetail?: string | null
): Promise<number> {
  const sql = getSql()
  const rows = await sql`
    UPDATE orders
    SET status = ${status}, status_detail = ${statusDetail ?? null}, updated_at = now()
    WHERE payment_id = ${paymentId}
    RETURNING id
  `
  return rows.length
}

/**
 * Para el webhook: actualiza la orden si existe; si no, la crea con lo que sepamos
 * del pago (útil cuando el webhook llega antes de que se haya guardado la orden).
 */
export async function upsertOrderFromPayment(data: NewOrder): Promise<void> {
  if (data.paymentId) {
    const touched = await updateOrderStatusByPaymentId(
      data.paymentId,
      data.status,
      data.statusDetail
    )
    if (touched > 0) return
  }
  await createOrder(data)
}

/** Lista las órdenes más recientes primero. */
export async function listOrders(limit = 200): Promise<Order[]> {
  const sql = getSql()
  const rows = await sql`
    SELECT * FROM orders
    ORDER BY created_at DESC
    LIMIT ${limit}
  `
  return rows as Order[]
}
