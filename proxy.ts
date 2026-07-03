import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Protege /admin con HTTP Basic Auth. Falla cerrado: si no hay credenciales
// configuradas (ADMIN_USER/ADMIN_PASSWORD), rechaza el acceso.
// (En Next.js 16 la convención "middleware" se renombró a "proxy".)
export const config = { matcher: ['/admin/:path*'] }

export function proxy(req: NextRequest) {
  const user = process.env.ADMIN_USER
  const pass = process.env.ADMIN_PASSWORD
  const auth = req.headers.get('authorization')

  if (user && pass && auth?.startsWith('Basic ')) {
    const decoded = atob(auth.slice(6))
    const sep = decoded.indexOf(':')
    const u = decoded.slice(0, sep)
    const p = decoded.slice(sep + 1)
    if (u === user && p === pass) {
      return NextResponse.next()
    }
  }

  return new NextResponse('Autenticación requerida', {
    status: 401,
    headers: { 'WWW-Authenticate': 'Basic realm="Terpenos Admin", charset="UTF-8"' },
  })
}
