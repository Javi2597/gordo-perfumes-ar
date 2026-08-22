'use server'

import { headers } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { getOrderById, isManualPending, updateOrderStatus } from '@/lib/orders'
import { checkBasicAuth } from '@/lib/admin-auth'

// Cambia el estado de una orden desde el panel (marcar pagada / cancelar).
// Se invoca vía <form action={...}> con id y status en el FormData.
export async function setOrderStatusAction(formData: FormData) {
  // Una server action es un endpoint POST público: su id viaja en un chunk servido
  // desde /_next/static/, que NO cae bajo el matcher de proxy.ts. Por eso la
  // autorización se repite acá y no se delega solo al proxy.
  if (!checkBasicAuth((await headers()).get('authorization'))) {
    throw new Error('No autorizado.')
  }

  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '')
  if (!id || !['approved', 'rejected'].includes(status)) return

  // Solo órdenes manuales pendientes: es lo único para lo que el panel muestra
  // botones, y evita pisar a mano una orden ya conciliada contra Mercado Pago.
  const order = await getOrderById(id)
  if (!order || !isManualPending(order)) return

  await updateOrderStatus(id, status)
  revalidatePath('/admin/ordenes')
  revalidatePath('/admin')
}
