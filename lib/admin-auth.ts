/**
 * Autenticación Basic del panel, en un solo lugar.
 *
 * Vive acá y no dentro de `proxy.ts` porque tiene dos llamadores con contextos muy
 * distintos: el proxy (que ve el `NextRequest`) y las server actions del admin (que
 * leen el header con `next/headers`).
 *
 * Es una función PURA a propósito: recibe el header ya leído en vez de ir a buscarlo.
 * `proxy.ts` corre en el contexto de proxy y ahí `next/headers` no existe, así que si
 * esto leyera el header por su cuenta dejaría de ser reusable y volveríamos a tener
 * dos implementaciones de lo mismo.
 */

/** Comparación de strings en tiempo constante (evita side-channel de timing). */
function safeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder()
  const ab = enc.encode(a)
  const bb = enc.encode(b)
  if (ab.length !== bb.length) return false
  let diff = 0
  for (let i = 0; i < ab.length; i++) diff |= ab[i] ^ bb[i]
  return diff === 0
}

/**
 * True solo si el header `Authorization` trae credenciales Basic válidas.
 * Falla cerrado: sin `ADMIN_USER`/`ADMIN_PASSWORD` configurados, nadie entra.
 */
export function checkBasicAuth(authHeader: string | null | undefined): boolean {
  const user = process.env.ADMIN_USER
  const pass = process.env.ADMIN_PASSWORD
  if (!user || !pass) return false
  if (!authHeader?.startsWith('Basic ')) return false

  let decoded: string
  try {
    decoded = atob(authHeader.slice(6))
  } catch {
    // Base64 mal formado: credencial inválida, no un error del server.
    return false
  }

  const sep = decoded.indexOf(':')
  if (sep < 0) return false

  return safeEqual(decoded.slice(0, sep), user) && safeEqual(decoded.slice(sep + 1), pass)
}

/** Respuesta 401 con el desafío Basic. La usa el proxy para pedir credenciales. */
export const BASIC_AUTH_CHALLENGE = {
  'WWW-Authenticate': 'Basic realm="Terpenos Admin", charset="UTF-8"',
} as const
