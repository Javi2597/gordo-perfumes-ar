// Métodos de pago disponibles y datos para los pagos manuales.
export type PaymentMethod = 'mercadopago' | 'transferencia' | 'efectivo'

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return value === 'mercadopago' || value === 'transferencia' || value === 'efectivo'
}

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  mercadopago: 'Tarjeta o Mercado Pago',
  transferencia: 'Transferencia bancaria',
  efectivo: 'Efectivo contra entrega',
}

/** Datos para la transferencia bancaria (se muestran al confirmar el pedido). */
export const BANK_TRANSFER = {
  alias: 'lexo.nx',
  titular: 'Mauricio Ezequiel Rohr',
  entidad: 'Naranja Digital NX',
}
