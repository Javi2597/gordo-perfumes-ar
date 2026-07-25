import { Payment } from 'mercadopago'
import { mpClient, isMpConfigured } from '@/lib/mercadopago'
import { applyPaymentToOrder, upsertOrderFromPayment } from '@/lib/orders'
import { sendOrderEmails } from '@/lib/email'
import { products } from '@/constants/products'

/**
 * Concilia una orden contra Mercado Pago a partir de un payment_id.
 *
 * Es la única fuente de verdad del estado de un pago: el estado NUNCA se toma de
 * lo que llega por parámetro (query string del retorno, body del webhook), siempre
 * se vuelve a consultar contra la API de MP con nuestro access token.
 *
 * La usan dos caminos, a propósito redundantes:
 *  - `/api/mp/webhook`, el camino normal (notificación de MP).
 *  - `/checkout/resultado`, red de seguridad para cuando el webhook no llega
 *    (mal configurado en el panel, caído, etc.). Sin esto las órdenes de
 *    "dinero en cuenta" quedan pendientes para siempre y no salen los correos.
 *
 * Es idempotente: los correos salen una sola vez gracias al UPDATE condicional
 * de `applyPaymentToOrder`, aunque webhook y retorno corran a la vez.
 */
export interface ReconcileResult {
  status: string
  statusDetail: string | null
}

export async function reconcilePayment(paymentId: string): Promise<ReconcileResult | null> {
  if (!isMpConfigured()) return null

  const payment = await new Payment(mpClient).get({ id: paymentId })
  const status = payment.status ?? 'unknown'
  const statusDetail = payment.status_detail ?? null

  if (payment.external_reference) {
    // Flujo wallet: la orden ya existe, se creó antes de mandar al cliente a MP.
    const { changed, order } = await applyPaymentToOrder(payment.external_reference, {
      status,
      statusDetail,
      paymentId: String(paymentId),
    })

    if (changed && status === 'approved' && order) {
      try {
        await sendOrderEmails(order)
      } catch (mailErr) {
        console.error('[reconcile] no se pudieron enviar los correos:', mailErr)
      }
    }
  } else {
    // Flujo tarjeta: reconciliamos por payment_id; si no existe la orden
    // (la notificación llegó antes del INSERT), la creamos desde el metadata.
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
      status,
      statusDetail,
      paymentId: String(paymentId),
      payerEmail: payment.payer?.email ?? null,
    })
  }

  return { status, statusDetail }
}
