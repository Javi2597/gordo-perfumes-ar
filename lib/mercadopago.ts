import { MercadoPagoConfig } from 'mercadopago'

/**
 * Cliente server de MercadoPago.
 *
 * Usa el ACCESS_TOKEN (secreto) que SOLO debe existir en el backend.
 * Nunca importar este módulo desde un Client Component.
 */

const accessToken = process.env.MP_ACCESS_TOKEN

if (!accessToken) {
  // No lanzamos en import-time para no romper el build; los route handlers
  // validan la presencia y responden 500 con un mensaje claro.
  console.warn('[mercadopago] Falta MP_ACCESS_TOKEN en el entorno.')
}

export const mpClient = new MercadoPagoConfig({
  accessToken: accessToken ?? '',
  options: { timeout: 8000 },
})

export const MP_WEBHOOK_SECRET = process.env.MP_WEBHOOK_SECRET ?? ''

/** True si hay access token configurado. Los handlers lo usan para fallar temprano. */
export function isMpConfigured(): boolean {
  return Boolean(accessToken)
}
