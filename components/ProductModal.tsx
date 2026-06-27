'use client'

import { useCallback, useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, MessageCircle, X } from 'lucide-react'
import type { Product } from '@/constants/products'
import { productUrl } from '@/constants/site'
import ShareMenu from './ShareMenu'

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

const contentVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir > 0 ? 40 : -40 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir > 0 ? -40 : 40 }),
}

interface ProductModalProps {
  products: Product[]
  index: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export default function ProductModal({ products, index, onClose, onNavigate }: ProductModalProps) {
  const [direction, setDirection] = useState(0)
  const product = products[index]
  const total = products.length

  const goPrev = useCallback(() => {
    setDirection(-1)
    onNavigate((index - 1 + total) % total)
  }, [index, total, onNavigate])

  const goNext = useCallback(() => {
    setDirection(1)
    onNavigate((index + 1) % total)
  }, [index, total, onNavigate])

  // Keyboard navigation + body scroll lock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      else if (e.key === 'ArrowLeft') goPrev()
      else if (e.key === 'ArrowRight') goNext()
    }
    window.addEventListener('keydown', onKey)
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = prevOverflow
    }
  }, [onClose, goPrev, goNext])

  if (!product) return null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.25 }}
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-label={`Ficha de ${product.nombre}`}
    >
      {/* Close */}
      <button
        onClick={onClose}
        aria-label="Cerrar ficha"
        className="absolute top-4 right-4 sm:top-6 sm:right-6 z-20 flex items-center justify-center w-11 h-11 rounded-full bg-ink/90 hover:bg-ink text-white shadow-[0_2px_12px_rgba(0,0,0,0.45)] ring-1 ring-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        <X className="w-5 h-5" strokeWidth={2} />
      </button>

      {/* Prev / Next */}
      <button
        onClick={(e) => { e.stopPropagation(); goPrev() }}
        aria-label="Perfume anterior"
        className="absolute left-2 sm:left-6 z-20 flex items-center justify-center w-11 h-11 rounded-full bg-ink/80 hover:bg-ink text-white shadow-[0_2px_12px_rgba(0,0,0,0.45)] ring-1 ring-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        <ChevronLeft className="w-6 h-6" strokeWidth={2} />
      </button>
      <button
        onClick={(e) => { e.stopPropagation(); goNext() }}
        aria-label="Perfume siguiente"
        className="absolute right-2 sm:right-6 z-20 flex items-center justify-center w-11 h-11 rounded-full bg-ink/80 hover:bg-ink text-white shadow-[0_2px_12px_rgba(0,0,0,0.45)] ring-1 ring-white/15 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        <ChevronRight className="w-6 h-6" strokeWidth={2} />
      </button>

      {/* Panel */}
      <motion.div
        initial={{ scale: 0.96, y: 12 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 12 }}
        transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-3xl max-h-[88vh] overflow-y-auto bg-white shadow-2xl flex flex-col md:flex-row"
      >
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={product.id}
            custom={direction}
            variants={contentVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.28, ease: 'easeOut' }}
            className="flex flex-col md:flex-row w-full"
          >
            {/* Image */}
            <div className="relative w-full md:w-1/2 shrink-0 bg-white" style={{ aspectRatio: '4/5' }}>
              <Image
                src={product.imagen}
                alt={`${product.nombre} — ${product.marca}`}
                fill
                sizes="(min-width: 768px) 384px, 100vw"
                className="object-contain p-4"
              />
              <span
                className={`absolute top-3 left-3 text-[9px] font-sans uppercase tracking-[0.15em] px-2.5 py-1 ${CATEGORY_STYLE[product.categoria]}`}
              >
                {product.categoria}
              </span>
            </div>

            {/* Details */}
            <div className="flex flex-col flex-1 p-6 sm:p-8 gap-4">
              <div>
                <p className="text-gold text-[10px] font-sans uppercase tracking-[0.2em] mb-1.5">
                  {product.marca}
                </p>
                <h2 className="font-serif text-2xl sm:text-3xl leading-snug text-ink">
                  {product.nombre}
                </h2>
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
                  Precio referencial · {product.ml}ml
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

              <ShareMenu
                url={productUrl(product.slug)}
                title={`${product.nombre} — ${product.marca}`}
                price={formatPrice(product.precio_referencial)}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Counter */}
      <span className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 text-[10px] font-sans uppercase tracking-widest text-white/60">
        {index + 1} / {total}
      </span>
    </motion.div>
  )
}
