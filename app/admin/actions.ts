'use server'

import { revalidatePath } from 'next/cache'
import { updateOrderStatus } from '@/lib/orders'

// Cambia el estado de una orden desde el panel (marcar pagada / cancelar).
// Se invoca vía <form action={...}> con id y status en el FormData.
export async function setOrderStatusAction(formData: FormData) {
  const id = String(formData.get('id') ?? '')
  const status = String(formData.get('status') ?? '')
  if (!id || !['approved', 'rejected'].includes(status)) return

  await updateOrderStatus(id, status)
  revalidatePath('/admin/ordenes')
  revalidatePath('/admin')
}
