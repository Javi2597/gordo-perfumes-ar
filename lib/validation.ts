import type { Shipping } from '@/lib/orders'

/**
 * Validaciones compartidas entre el checkout (cliente) y las rutas que crean órdenes.
 * El cliente valida para dar feedback; el server valida porque es lo único que un
 * atacante no puede saltear mandando un POST a mano.
 *
 * (`import type` se borra en compilación: este módulo lo importa el cliente y no
 * arrastra nada de lib/orders ni del driver de la base.)
 */

/**
 * Topes de largo. Estos datos van a la base y, sobre todo, al cuerpo de los correos:
 * sin tope son texto libre ilimitado mandado por cualquiera.
 */
export const MAX_LENGTHS = {
  email: 254, // RFC 5321
  name: 120,
  phone: 40,
  address: 200,
  city: 120,
  province: 120,
  zip: 20,
  notes: 500,
} as const

/** Nombre lindo de cada campo, para el mensaje de error. */
const FIELD_LABELS: Record<keyof Shipping, string> = {
  name: 'nombre',
  phone: 'teléfono',
  address: 'dirección',
  city: 'ciudad',
  province: 'provincia',
  zip: 'código postal',
  notes: 'notas',
}

/**
 * Criterio único de email para cliente y server. Anclado a propósito: sin las anclas
 * `/\S+@\S+\.\S+/` acepta "hola a@b.c", y esa cadena termina siendo el destinatario
 * real del correo de confirmación.
 */
export function isValidEmail(value: unknown): boolean {
  const v = typeof value === 'string' ? value.trim() : ''
  return v.length <= MAX_LENGTHS.email && /^\S+@\S+\.\S+$/.test(v)
}

const REQUIRED: (keyof Shipping)[] = ['name', 'phone', 'address', 'city', 'province', 'zip']

/**
 * Normaliza y valida los datos de envío que manda el cliente. Devuelve el objeto listo
 * para `createOrder`, o el mensaje con el que responder 400.
 *
 * Lo usan las 3 rutas que crean órdenes (orders/manual, mp/preference,
 * mp/process-payment); antes cada una repetía este mismo bloque.
 */
export function parseShipping(
  input: Partial<Shipping> | undefined
): { shipping: Shipping } | { error: string } {
  const sp = input ?? {}

  const missing = REQUIRED.filter((k) => !String(sp[k] ?? '').trim())
  if (missing.length > 0) {
    return { error: 'Faltan datos de envío obligatorios.' }
  }

  const shipping: Shipping = {
    name: String(sp.name).trim(),
    phone: String(sp.phone).trim(),
    address: String(sp.address).trim(),
    city: String(sp.city).trim(),
    province: String(sp.province).trim(),
    zip: String(sp.zip).trim(),
    notes: sp.notes ? String(sp.notes).trim() : null,
  }

  const overlong = (Object.keys(FIELD_LABELS) as (keyof Shipping)[]).find((k) => {
    const value = shipping[k]
    return typeof value === 'string' && value.length > MAX_LENGTHS[k]
  })
  if (overlong) {
    return {
      error: `El campo "${FIELD_LABELS[overlong]}" supera los ${MAX_LENGTHS[overlong]} caracteres.`,
    }
  }

  return { shipping }
}
