import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protege /admin con HTTP Basic Auth. Falla cerrado: si no hay credenciales
// configuradas (ADMIN_USER/ADMIN_PASSWORD), rechaza el acceso.
// (En Next.js 16 la convención "middleware" se renombró a "proxy".)
export const config = { matcher: ['/admin/:path*'] }

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

export function proxy(req: NextRequest) {
  const user = process.env.ADMIN_USER
  const pass = process.env.ADMIN_PASSWORD
  const auth = req.headers.get('authorization')

  if (user && pass && auth?.startsWith('Basic ')) {
    const decoded = atob(auth.slice(6))
    const sep = decoded.indexOf(':')
    const u = decoded.slice(0, sep)
    const p = decoded.slice(sep + 1)
    if (safeEqual(u, user) && safeEqual(p, pass)) {
      return NextResponse.next()
    }
  }

  return new NextResponse('Autenticación requerida', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Terpenos Admin", charset="UTF-8"' },
  })
}
