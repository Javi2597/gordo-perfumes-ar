import type { NextConfig } from 'next'

/* ────────────────────── Guardia de secretos expuestos ──────────────────────
 *
 * Todo lo que empieza con NEXT_PUBLIC_ queda EMBEBIDO EN EL BUNDLE que baja el
 * navegador: es público para siempre, aunque después se borre la variable.
 * Un access token o una API key ahí adentro es una credencial regalada.
 *
 * Este chequeo corre al arrancar `next dev` y en cada build (también en Vercel),
 * y rompe a propósito si una variable NEXT_PUBLIC_ tiene forma de secreto. Es
 * preferible un build fallado a un token publicado.
 *
 * Para agregar un servicio nuevo: sumá su formato de credencial a SECRET_SHAPES.
 */

const SECRET_SHAPES: { name: string; test: RegExp }[] = [
  // MP: APP_USR-<16 dígitos>-<fecha>-<hash 32>-<user id>. La Public Key, en
  // cambio, es APP_USR-<uuid> y NO matchea (esa sí va al navegador).
  { name: 'access token de Mercado Pago', test: /^(APP_USR|TEST)-\d{6,}-\d{6}-[0-9a-f]{32}-\d+$/i },
  { name: 'API key de Resend', test: /^re_[A-Za-z0-9_]{8,}/ },
  { name: 'connection string de base de datos', test: /^(postgres|postgresql|mysql|mongodb)(\+srv)?:\/\//i },
  { name: 'API key de OpenAI', test: /^sk-(proj-)?[A-Za-z0-9_-]{16,}/ },
  { name: 'API key de Anthropic', test: /^sk-ant-/ },
  { name: 'token de GitHub', test: /^gh[pousr]_[A-Za-z0-9]{16,}/ },
  { name: 'clave secreta de Stripe', test: /^(sk|rk)_(live|test)_[A-Za-z0-9]{16,}/ },
  { name: 'clave privada', test: /-----BEGIN [A-Z ]*PRIVATE KEY-----/ },
]

/**
 * Pista para el log: largo y primeros caracteres, sin volcar el valor entero.
 * Alcanza para ver si sobran comillas, espacios o se pegó el nombre de la
 * variable adentro del valor, sin publicar una credencial en los logs.
 */
function hint(value: string): string {
  const head = value.slice(0, 12).replace(/[\r\n\t]/g, '·')
  return `${value.length} caracteres, empieza con "${head}…"`
}

function assertNoSecretsInPublicEnv(): void {
  const leaks: string[] = []

  for (const [key, value] of Object.entries(process.env)) {
    if (!key.startsWith('NEXT_PUBLIC_') || !value?.trim()) continue
    const v = value.trim()
    for (const shape of SECRET_SHAPES) {
      if (shape.test.test(v)) leaks.push(`  · ${key} tiene forma de ${shape.name}`)
    }
  }

  // Chequeo positivo del único NEXT_PUBLIC_ sensible que usamos hoy: la Public
  // Key de MP tiene que ser <prefijo>-<uuid>. Cualquier otra cosa es sospechosa.
  const mpPublicRaw = process.env.NEXT_PUBLIC_MP_PUBLIC_KEY
  const mpPublic = mpPublicRaw?.trim()
  if (
    mpPublic &&
    !/^(APP_USR|TEST)-[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(mpPublic)
  ) {
    leaks.push(
      '  · NEXT_PUBLIC_MP_PUBLIC_KEY no tiene forma de Public Key (APP_USR-<uuid>).\n' +
        `    Valor cargado: ${hint(mpPublicRaw ?? '')}\n` +
        '    Revisá que no tenga comillas, espacios, saltos de línea, ni el nombre\n' +
        '    de la variable pegado adentro del valor.'
    )
  }

  if (leaks.length > 0) {
    throw new Error(
      '\n\n🚨 CREDENCIAL SECRETA EN UNA VARIABLE PÚBLICA\n\n' +
        leaks.join('\n') +
        '\n\nTodo lo NEXT_PUBLIC_ se publica en el JavaScript del navegador.\n' +
        'Sacale el prefijo NEXT_PUBLIC_ (usala solo en el server) y ROTÁ esa\n' +
        'credencial: si ya se buildeó y deployó, hay que darla por comprometida.\n'
    )
  }
}

assertNoSecretsInPublicEnv()

const nextConfig: NextConfig = {
  images: {
    // AVIF deshabilitado: el optimizador en dev/runtime se cuelga generando AVIF
    // para algunas imágenes (dejaba tarjetas en blanco). WebP es fiable y ligero.
    formats: ['image/webp'],
  },
}

export default nextConfig
