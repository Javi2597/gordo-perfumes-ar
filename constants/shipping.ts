// Zonas de envío y sus costos (en ARS). El costo se suma al total del pedido.
export type ShippingZone = 'CABA' | 'GBA'

export const SHIPPING_ZONES: Record<ShippingZone, { label: string; cost: number }> = {
  CABA: { label: 'Capital Federal', cost: 7000 },
  GBA: { label: 'Gran Buenos Aires', cost: 14000 },
}

export function isShippingZone(value: unknown): value is ShippingZone {
  return value === 'CABA' || value === 'GBA'
}

/** Costo de envío de una zona. Devuelve null si la zona no es válida. */
export function getShippingCost(zone: unknown): number | null {
  return isShippingZone(zone) ? SHIPPING_ZONES[zone].cost : null
}
