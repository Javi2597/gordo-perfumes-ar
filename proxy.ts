import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { BASIC_AUTH_CHALLENGE, checkBasicAuth } from '@/lib/admin-auth'

// Protege /admin con HTTP Basic Auth. Falla cerrado: si no hay credenciales
// configuradas (ADMIN_USER/ADMIN_PASSWORD), rechaza el acceso.
// (En Next.js 16 la convención "middleware" se renombró a "proxy".)
//
// OJO: esto cubre las páginas, no alcanza como única defensa. Las server actions
// son endpoints POST públicos y su id viaja en chunks de /_next/static/, que este
// matcher no toca: por eso `app/admin/actions.ts` vuelve a autorizar por su cuenta.
export const config = { matcher: ['/admin/:path*'] }

export function proxy(req: NextRequest) {
  if (checkBasicAuth(req.headers.get('authorization'))) {
    return NextResponse.next()
  }

  return new NextResponse('Autenticación requerida', {
    status: 401,
    headers: BASIC_AUTH_CHALLENGE,
  })
}
