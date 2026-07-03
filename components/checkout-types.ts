// Tipos compartidos entre CheckoutForm, CheckoutBrick y ManualPayment.

export interface ShippingForm {
  name: string
  phone: string
  address: string
  city: string
  province: string
  zip: string
  notes: string
}

export const EMPTY_SHIPPING: ShippingForm = {
  name: '',
  phone: '',
  address: '',
  city: '',
  province: '',
  zip: '',
  notes: '',
}

export const REQUIRED_SHIPPING: (keyof ShippingForm)[] = [
  'name',
  'phone',
  'address',
  'city',
  'province',
  'zip',
]

/** Datos que el checkout comparte con el Brick / pago manual al enviar. */
export interface CheckoutData {
  shipping: ShippingForm
  zone: string
  email: string
}
