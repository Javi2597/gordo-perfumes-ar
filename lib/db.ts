import { neon, type NeonQueryFunction } from '@neondatabase/serverless'

/**
 * Cliente SQL de Neon (Postgres serverless por HTTP), inicializado de forma
 * perezosa: neon() se crea recién en la primera consulta, no al importar el
 * módulo. Así el build no falla si DATABASE_URL todavía no está cargada.
 *
 * DATABASE_URL es secreto: solo backend, nunca NEXT_PUBLIC_.
 *
 * Uso con tagged template (siempre parametrizado → sin inyección):
 *   const rows = await getSql()`SELECT * FROM orders WHERE id = ${id}`
 */

let cached: NeonQueryFunction<false, false> | null = null

export function getSql(): NeonQueryFunction<false, false> {
  if (!cached) {
    const url = process.env.DATABASE_URL
    if (!url) throw new Error('Falta DATABASE_URL en el entorno.')
    cached = neon(url)
  }
  return cached
}

/** True si hay conexión configurada. Los handlers lo usan para fallar temprano. */
export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL)
}
