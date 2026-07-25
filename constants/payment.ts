// Métodos de pago disponibles y datos para los pagos manuales.
export type PaymentMethod = 'mercadopago' | 'wallet' | 'transferencia' | 'efectivo'

export function isPaymentMethod(value: unknown): value is PaymentMethod {
  return (
    value === 'mercadopago' ||
    value === 'wallet' ||
    value === 'transferencia' ||
    value === 'efectivo'
  )
}

// El orden acá define el orden del selector en el checkout.
export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  mercadopago: 'Tarjeta de crédito o débito',
  wallet: 'Mercado Pago (dinero en cuenta)',
  transferencia: 'Transferencia bancaria',
  efectivo: 'Efectivo contra entrega',
}

/** Datos para la transferencia bancaria (se muestran al confirmar el pedido). */
export const BANK_TRANSFER = {
  alias: 'terpenos.ok',
  titular: 'Mauricio Ezequiel Rohr',
  entidad: 'Naranja Digital NX',
}
