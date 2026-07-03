import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getProductBySlug } from '@/constants/products'
import CheckoutForm from '@/components/CheckoutForm'

export const metadata: Metadata = {
  title: 'Checkout',
  robots: { index: false, follow: false },
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(price)
}

export default async function CheckoutPage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) notFound()

  return (
    <main className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <Link
          href={`/perfume/${product.slug}`}
          className="inline-flex items-center gap-2 text-[11px] font-sans uppercase tracking-widest text-ink/50 hover:text-ink transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver al producto
        </Link>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Resumen del producto */}
          <div className="w-full md:w-2/5 shrink-0">
            <div
              className="relative w-full bg-white border border-ink/[0.07]"
              style={{ aspectRatio: '4/5' }}
            >
              <Image
                src={product.imagen}
                alt={`${product.nombre} — ${product.marca}`}
                fill
                sizes="(min-width: 768px) 320px, 100vw"
                className="object-contain p-6"
              />
            </div>
            <div className="mt-4">
              <p className="text-gold text-[10px] font-sans uppercase tracking-[0.2em] mb-1">
                {product.marca}
              </p>
              <h1 className="font-serif text-2xl leading-snug text-ink">{product.nombre}</h1>
              <p className="text-[10px] font-sans uppercase tracking-widest text-ink/35 mt-2">
                {product.ml}ml
              </p>
              <p className="font-serif text-2xl text-ink mt-3">
                {formatPrice(product.precio_referencial)}
              </p>
            </div>
          </div>

          {/* Contacto + envío + método de pago */}
          <div className="flex-1">
            <CheckoutForm
              productId={product.id}
              slug={product.slug}
              productPrice={product.precio_referencial}
            />
          </div>
        </div>
      </div>
    </main>
  )
}
