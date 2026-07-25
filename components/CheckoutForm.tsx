'use client'

import { useEffect, useRef, useState } from 'react'
import { CreditCard, Landmark, Banknote, Wallet } from 'lucide-react'
import { SHIPPING_ZONES, zonesForProduct, type ShippingZone } from '@/constants/shipping'
import { PAYMENT_LABELS, type PaymentMethod } from '@/constants/payment'
import CheckoutBrick from './CheckoutBrick'
import ManualPayment from './ManualPayment'
import WalletCheckout from './WalletCheckout'
import {
  EMPTY_SHIPPING,
  REQUIRED_SHIPPING,
  type CheckoutData,
  type ShippingForm,
} from './checkout-types'

interface CheckoutFormProps {
  productId: string
  slug: string
  productPrice: number
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(price)
}

const METHOD_ICON = {
  mercadopago: CreditCard,
  wallet: Wallet,
  transferencia: Landmark,
  efectivo: Banknote,
} as const

const METHOD_HINT: Record<PaymentMethod, string> = {
  mercadopago: 'Pagá con tu tarjeta sin salir del sitio',
  wallet: 'Pagá con el saldo o medios de tu cuenta de Mercado Pago',
  transferencia: 'Transferí a nuestro alias y confirmá',
  efectivo: 'Pagás al recibir el paquete',
}

export default function CheckoutForm({ productId, slug, productPrice }: CheckoutFormProps) {
  const [shipping, setShipping] = useState<ShippingForm>(EMPTY_SHIPPING)
  const [email, setEmail] = useState('')
  const [zone, setZone] = useState<'' | ShippingZone>('')
  const [method, setMethod] = useState<'' | PaymentMethod>('')

  // Ref con los datos actuales para que el Brick / pago manual los lea al enviar.
  const dataRef = useRef<CheckoutData>({ shipping, zone, email })
  useEffect(() => {
    dataRef.current = { shipping, zone, email }
  }, [shipping, zone, email])

  const setField =
    (k: keyof ShippingForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
      setShipping((prev) => ({ ...prev, [k]: e.target.value }))

  const shippingCost = zone ? SHIPPING_ZONES[zone].cost : null
  const total = productPrice + (shippingCost ?? 0)

  const shippingComplete = REQUIRED_SHIPPING.every((k) => shipping[k].trim())
  const emailValid = /\S+@\S+\.\S+/.test(email)
  const contactComplete = shippingComplete && emailValid && Boolean(zone)

  const inputClass =
    'w-full border border-ink/15 bg-white text-sm font-sans text-ink px-3 py-2.5 placeholder:text-ink/30 focus:outline-none focus:border-ink/40 focus:ring-1 focus:ring-gold transition-colors'
  const labelClass = 'block text-[10px] font-sans uppercase tracking-widest text-ink/40 mb-1.5'

  return (
    <div>
      {/* 1 · Contacto y envío */}
      <section className="mb-8">
        <h3 className="font-sans text-[11px] uppercase tracking-widest text-ink/50 mb-4">
          Contacto y envío
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="sm:col-span-2">
            <label className={labelClass}>Nombre y apellido</label>
            <input className={inputClass} value={shipping.name} onChange={setField('name')} placeholder="Juan Pérez" autoComplete="name" />
          </div>
          <div>
            <label className={labelClass}>Email</label>
            <input className={inputClass} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tucorreo@email.com" inputMode="email" autoComplete="email" />
          </div>
          <div>
            <label className={labelClass}>Teléfono</label>
            <input className={inputClass} value={shipping.phone} onChange={setField('phone')} placeholder="11 2345 6789" inputMode="tel" autoComplete="tel" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Dirección (calle y número)</label>
            <input className={inputClass} value={shipping.address} onChange={setField('address')} placeholder="Av. Corrientes 1234, Piso 5 B" autoComplete="street-address" />
          </div>
          <div>
            <label className={labelClass}>Ciudad / Localidad</label>
            <input className={inputClass} value={shipping.city} onChange={setField('city')} placeholder="CABA" autoComplete="address-level2" />
          </div>
          <div>
            <label className={labelClass}>Provincia</label>
            <input className={inputClass} value={shipping.province} onChange={setField('province')} placeholder="Buenos Aires" autoComplete="address-level1" />
          </div>
          <div>
            <label className={labelClass}>Código postal</label>
            <input className={inputClass} value={shipping.zip} onChange={setField('zip')} placeholder="1425" inputMode="numeric" autoComplete="postal-code" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelClass}>Notas / referencia <span className="text-ink/25">(opcional)</span></label>
            <input className={inputClass} value={shipping.notes} onChange={setField('notes')} placeholder="Entre calles, timbre, horario de entrega…" />
          </div>
        </div>
      </section>

      {/* 2 · Zona de envío */}
      <section className="mb-8">
        <h3 className="font-sans text-[11px] uppercase tracking-widest text-ink/50 mb-4">
          Zona de envío
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {zonesForProduct(productId).map((z) => {
            const active = zone === z
            const cost = SHIPPING_ZONES[z].cost
            return (
              <button
                key={z}
                type="button"
                onClick={() => setZone(z)}
                className={`flex items-center justify-between gap-3 border px-4 py-3 text-left transition-colors ${
                  active ? 'border-gold bg-gold/5' : 'border-ink/15 hover:border-ink/30'
                }`}
              >
                <span className="text-sm font-sans text-ink">{SHIPPING_ZONES[z].label}</span>
                <span className="text-sm font-sans text-ink/60 tabular-nums">
                  {cost === 0 ? 'Gratis' : formatPrice(cost)}
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Resumen */}
      <section className="mb-8 border border-ink/10 bg-neutral-50 p-4">
        <div className="flex items-center justify-between py-1 text-sm font-sans text-ink/70">
          <span>Producto</span>
          <span className="tabular-nums">{formatPrice(productPrice)}</span>
        </div>
        <div className="flex items-center justify-between py-1 text-sm font-sans text-ink/70">
          <span>Envío {zone ? `· ${SHIPPING_ZONES[zone].label}` : ''}</span>
          <span className="tabular-nums">
            {shippingCost === null ? '—' : shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}
          </span>
        </div>
        <div className="flex items-center justify-between pt-3 mt-2 border-t border-ink/10">
          <span className="font-sans text-[11px] uppercase tracking-widest text-ink/50">Total</span>
          <span className="font-serif text-2xl text-ink tabular-nums">{formatPrice(total)}</span>
        </div>
      </section>

      {/* 3 · Método de pago */}
      <section className="mb-6">
        <h3 className="font-sans text-[11px] uppercase tracking-widest text-ink/50 mb-4">
          Método de pago
        </h3>
        <div className="grid grid-cols-1 gap-3">
          {(Object.keys(PAYMENT_LABELS) as PaymentMethod[]).map((m) => {
            const active = method === m
            const IconComp = METHOD_ICON[m]
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMethod(m)}
                className={`flex items-center gap-3 border px-4 py-3.5 text-left transition-colors ${
                  active ? 'border-gold bg-gold/5' : 'border-ink/15 hover:border-ink/30'
                }`}
              >
                <IconComp className="w-5 h-5 text-ink/60 shrink-0" strokeWidth={1.8} />
                <span>
                  <span className="block text-sm font-sans text-ink">{PAYMENT_LABELS[m]}</span>
                  <span className="block text-[11px] font-sans text-ink/45">{METHOD_HINT[m]}</span>
                </span>
              </button>
            )
          })}
        </div>
      </section>

      {/* Área de pago */}
      {!contactComplete ? (
        <div className="border border-ink/10 text-ink/50 text-sm font-sans p-4 text-center">
          Completá tus datos de contacto, envío y la zona para continuar.
        </div>
      ) : !method ? (
        <div className="border border-ink/10 text-ink/50 text-sm font-sans p-4 text-center">
          Elegí un método de pago para continuar.
        </div>
      ) : method === 'mercadopago' ? (
        <CheckoutBrick
          productId={productId}
          slug={slug}
          amount={total}
          payerEmail={email}
          dataRef={dataRef}
        />
      ) : method === 'wallet' ? (
        <WalletCheckout productId={productId} dataRef={dataRef} />
      ) : (
        <ManualPayment method={method} productId={productId} dataRef={dataRef} />
      )}
    </div>
  )
}
