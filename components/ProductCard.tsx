'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { MessageCircle } from 'lucide-react'
import type { Product } from '@/constants/products'

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

export default function ProductCard({ product, onOpen }: { product: Product; onOpen?: () => void }) {
  const { nombre, marca, categoria, notas_olfativas, ml, precio_referencial, imagen, link_whatsapp } =
    product

  return (
    <motion.article
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -5 }}
      onClick={onOpen}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen?.()
        }
      }}
      aria-label={`Ver ficha de ${nombre} de ${marca}`}
      className="group relative flex flex-col h-full bg-white border border-ink/[0.07] hover:border-gold/50 transition-all duration-400 hover:shadow-[0_8px_32px_rgba(197,160,89,0.12)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-white" style={{ aspectRatio: '4/5' }}>
        <Image
          src={imagen}
          alt={`${nombre} — ${marca}`}
          fill
          sizes="(min-width: 1280px) 25vw, (min-width: 1024px) 33vw, 50vw"
          className="object-contain p-4 transition-transform duration-700 group-hover:scale-[1.04]"
        />

        {/* Category badge */}
        <span
          className={`absolute top-3 left-3 text-[9px] font-sans uppercase tracking-[0.15em] px-2.5 py-1 ${CATEGORY_STYLE[categoria]}`}
        >
          {categoria}
        </span>
      </div>

      {/* Content */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-5 gap-2.5 sm:gap-3.5">
        {/* Brand + Name */}
        <div>
          <p className="text-gold text-[9px] sm:text-[10px] font-sans uppercase tracking-[0.2em] mb-1 sm:mb-1.5">
            {marca}
          </p>
          <h3 className="font-serif text-base sm:text-[1.2rem] leading-snug text-ink">{nombre}</h3>
        </div>

        {/* Olfactory notes */}
        <div className="flex flex-wrap gap-1 sm:gap-1.5">
          {notas_olfativas.map((nota) => (
            <span
              key={nota}
              className="text-[9px] font-sans uppercase tracking-wider text-ink/40 border border-ink/10 px-1.5 sm:px-2 py-0.5"
            >
              {nota}
            </span>
          ))}
        </div>

        {/* Price */}
        <div className="mt-auto pt-3 sm:pt-3.5 border-t border-ink/[0.06]">
          <p className="text-[9px] font-sans uppercase tracking-widest text-ink/35 mb-1">
            Precio referencial · {ml}ml
          </p>
          <p className="font-serif text-lg sm:text-xl text-ink">{formatPrice(precio_referencial)}</p>
        </div>

        {/* CTA */}
        <motion.a
          href={link_whatsapp}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          whileTap={{ scale: 0.97 }}
          className="
            flex items-center justify-center gap-2 mt-0.5
            bg-ink text-white text-[10px] sm:text-[11px] font-sans uppercase tracking-wider sm:tracking-widest
            py-3 sm:py-3.5 px-3 sm:px-4
            hover:bg-gold
            transition-colors duration-300
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold focus-visible:ring-offset-2
          "
        >
          <MessageCircle className="w-3.5 h-3.5 shrink-0" />
          <span className="sm:hidden">Consultar</span>
          <span className="hidden sm:inline">Consultar disponibilidad</span>
        </motion.a>
      </div>
    </motion.article>
  )
}
