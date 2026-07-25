// Zonas de envío y sus costos (en ARS). El costo se suma al total del pedido.
export type ShippingZone = 'CABA' | 'GBA' | 'RETIRO'

export const SHIPPING_ZONES: Record<ShippingZone, { label: string; cost: number }> = {
  CABA: { label: 'Capital Federal', cost: 7000 },
  GBA: { label: 'Gran Buenos Aires', cost: 14000 },
  RETIRO: { label: 'Retiro en persona', cost: 0 },
}

/**
 * Productos que permiten "Retiro en persona" (sin costo de envío). Se restringe a
 * esta lista para que el retiro no se pueda usar en productos reales y saltear el
 * envío. Hoy: solo el producto de prueba (id '100').
 */
export const RETIRO_PRODUCT_IDS: ReadonlySet<string> = new Set(['100'])

export function isShippingZone(value: unknown): value is ShippingZone {
  return value === 'CABA' || value === 'GBA' || value === 'RETIRO'
}

/** Zonas disponibles para un producto. RETIRO solo aparece en los habilitados. */
export function zonesForProduct(productId: string): ShippingZone[] {
  const base: ShippingZone[] = ['CABA', 'GBA']
  return RETIRO_PRODUCT_IDS.has(productId) ? [...base, 'RETIRO'] : base
}

/**
 * True si la zona es válida y está permitida para ese producto. Bloquea RETIRO en
 * productos no habilitados (validación de servidor, no confiar en el cliente).
 */
export function isZoneAllowedForProduct(productId: string, zone: unknown): zone is ShippingZone {
  return isShippingZone(zone) && zonesForProduct(productId).includes(zone)
}

/** Costo de envío de una zona. Devuelve null si la zona no es válida. */
export function getShippingCost(zone: unknown): number | null {
  return isShippingZone(zone) ? SHIPPING_ZONES[zone].cost : null
}
