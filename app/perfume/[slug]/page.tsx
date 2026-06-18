import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { ArrowLeft, MessageCircle } from 'lucide-react'
import { getProductBySlug, products } from '@/constants/products'
import { SITE_NAME, SITE_URL, productUrl } from '@/constants/site'
import ShareMenu from '@/components/ShareMenu'

const CATEGORY_STYLE: Record<string, string> = {
  Hombre: 'bg-slate-100 text-slate-600',
  Mujer: 'bg-rose-50 text-rose-600',
  Unisex: 'bg-amber-50 text-amber-700',
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    maximumFractionDigits: 0,
  }).format(price)
}

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata(
  { params }: { params: Promise<{ slug: string }> }
): Promise<Metadata> {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) return {}

  const title = `${product.nombre} — ${product.marca}`
  const description = product.descripcion
  const image = `${SITE_URL}${product.imagen}`
  const url = productUrl(product.slug)

  return {
    title,
    description,
    alternates: { canonical: `/perfume/${product.slug}` },
    openGraph: {
      type: 'website',
      url,
      siteName: SITE_NAME,
      title,
      description,
      locale: 'es_AR',
      images: [{ url: image, width: 1000, height: 1250, alt: title }],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [image],
    },
  }
}

export default async function PerfumePage(
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params
  const product = getProductBySlug(slug)
  if (!product) notFound()

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.nombre,
    description: product.descripcion,
    image: `${SITE_URL}${product.imagen}`,
    brand: { '@type': 'Brand', name: product.marca },
    category: product.categoria,
    offers: {
      '@type': 'Offer',
      price: product.precio_referencial,
      priceCurrency: 'ARS',
      availability: 'https://schema.org/InStock',
      url: product.link_whatsapp,
    },
  }

  return (
    <main className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 md:py-12">
        <Link
          href="/#coleccion"
          className="inline-flex items-center gap-2 text-[11px] font-sans uppercase tracking-widest text-ink/50 hover:text-ink transition-colors mb-8"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Volver a la colección
        </Link>

        <div className="flex flex-col md:flex-row gap-8 md:gap-12">
          {/* Image */}
          <div
            className="relative w-full md:w-1/2 shrink-0 bg-ink/[0.03] border border-ink/[0.07]"
            style={{ aspectRatio: '4/5' }}
          >
            <Image
              src={product.imagen}
              alt={`${product.nombre} — ${product.marca}`}
              fill
              priority
              sizes="(min-width: 768px) 448px, 100vw"
              className="object-cover"
            />
            <span
              className={`absolute top-3 left-3 text-[9px] font-sans uppercase tracking-[0.15em] px-2.5 py-1 ${CATEGORY_STYLE[product.categoria]}`}
            >
              {product.categoria}
            </span>
          </div>

          {/* Details */}
          <div className="flex flex-col flex-1 gap-4">
            <div>
              <p className="text-gold text-[10px] font-sans uppercase tracking-[0.2em] mb-1.5">
                {product.marca}
              </p>
              <h1 className="font-serif text-3xl sm:text-4xl leading-snug text-ink">
                {product.nombre}
              </h1>
            </div>

            <p className="text-sm font-sans text-ink/60 leading-relaxed italic">
              {product.descripcion}
            </p>

            <div>
              <p className="text-[9px] font-sans uppercase tracking-widest text-ink/35 mb-2">
                Notas olfativas
              </p>
              <div className="flex flex-wrap gap-1.5">
                {product.notas_olfativas.map((nota) => (
                  <span
                    key={nota}
                    className="text-[10px] font-sans uppercase tracking-wider text-ink/50 border border-ink/10 px-2.5 py-1"
                  >
                    {nota}
                  </span>
                ))}
              </div>
            </div>

            <div className="mt-auto pt-4 border-t border-ink/[0.06]">
              <p className="text-[9px] font-sans uppercase tracking-widest text-ink/35 mb-1">
                Precio referencial
              </p>
              <p className="font-serif text-2xl text-ink">{formatPrice(product.precio_referencial)}</p>
            </div>

            <a
              href={product.link_whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 bg-ink text-white text-[11px] font-sans uppercase tracking-widest py-3.5 px-4 hover:bg-gold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
            >
              <MessageCircle className="w-3.5 h-3.5 shrink-0" />
              Consultar disponibilidad
            </a>

            <ShareMenu url={productUrl(product.slug)} title={`${product.nombre} — ${product.marca}`} />
          </div>
        </div>
      </div>
    </main>
  )
}
