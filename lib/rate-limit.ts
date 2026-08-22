import { NextResponse } from 'next/server'

/**
 * Rate limiting simple, en memoria, por ventana fija.
 *
 * Es una SEGUNDA capa a propósito. En Vercel cada instancia serverless tiene su
 * propio proceso, así que este Map no se comparte ni sobrevive a un reciclado: no
 * frena a alguien que distribuya los reintentos. El límite que de verdad cuenta lo
 * pone el WAF de Vercel a nivel plataforma.
 *
 * Lo que sí aporta: corta ráfagas y scripts ingenuos dentro de una misma instancia,
 * funciona en local (donde no hay WAF) y deja la protección versionada en el repo si
 * algún día esto se despliega en otro lado.
 */

interface Bucket {
  count: number
  resetAt: number
}

const buckets = new Map<string, Bucket>()

const CLEANUP_EVERY_MS = 60_000
let lastCleanup = Date.now()

/** Saca las ventanas vencidas para que el Map no crezca sin límite. */
function cleanup(now: number) {
  if (now - lastCleanup < CLEANUP_EVERY_MS) return
  lastCleanup = now
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key)
  }
}

/**
 * IP del cliente. Detrás de Vercel viene en `x-forwarded-for`; se toma el PRIMER
 * valor de la lista (los siguientes los puede inyectar el cliente). Si no hay
 * header, cae en 'unknown': todos comparten cupo, que es el lado seguro.
 */
export function clientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

/** Límites por familia de endpoint. */
export const LIMITS = {
  /** Crea órdenes y dispara correos: el más caro de abusar. */
  orders: { limit: 5, windowMs: 60_000 },
  /** Rutas de pago de Mercado Pago. */
  payments: { limit: 10, windowMs: 60_000 },
} as const

/**
 * Consume una unidad del cupo. Devuelve la respuesta 429 lista para retornar, o
 * `null` si la request puede seguir.
 */
export function enforceRateLimit(
  request: Request,
  route: string,
  { limit, windowMs }: { limit: number; windowMs: number }
): NextResponse | null {
  const now = Date.now()
  cleanup(now)

  const key = `${clientIp(request)}|${route}`
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return null
  }

  bucket.count++
  if (bucket.count <= limit) return null

  const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000))
  return NextResponse.json(
    { error: 'Demasiados intentos. Esperá un momento y probá de nuevo.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  )
}
