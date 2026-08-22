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

/**
 * Métodos que hoy se ofrecen en el checkout. Tarjeta (`mercadopago`) y Mercado Pago
 * dinero en cuenta (`wallet`) están DESACTIVADOS: el código sigue entero (SDK, webhook,
 * conciliación, columnas de la DB) para poder volver atrás agregándolos a esta lista.
 * Las órdenes históricas con esos métodos se siguen mostrando en el panel.
 */
export const ENABLED_PAYMENT_METHODS = ['transferencia', 'efectivo'] as const satisfies
  readonly PaymentMethod[]

export type EnabledPaymentMethod = (typeof ENABLED_PAYMENT_METHODS)[number]

export function isPaymentEnabled(value: unknown): value is EnabledPaymentMethod {
  return (ENABLED_PAYMENT_METHODS as readonly unknown[]).includes(value)
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
