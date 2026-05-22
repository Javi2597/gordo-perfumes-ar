'use client'

import { useState, useMemo, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Layers } from 'lucide-react'
import { products } from '@/constants/products'
import FilterBar, { type FilterCategory } from './FilterBar'
import AromaFilter from './AromaFilter'
import SearchBar from './SearchBar'
import ProductCard from './ProductCard'

export default function CatalogSection() {
  const [activeFilter, setActiveFilter] = useState<FilterCategory>('Todos')
  const [searchQuery, setSearchQuery] = useState('')
  const [aromaFilter, setAromaFilter] = useState<string | null>(null)

  useEffect(() => {
    const handler = (e: Event) => {
      const cat = (e as CustomEvent<string>).detail as FilterCategory
      setActiveFilter(cat)
      setSearchQuery('')
      setAromaFilter(null)
    }
    window.addEventListener('navbar-set-category', handler)
    return () => window.removeEventListener('navbar-set-category', handler)
  }, [])

  const allAromas = useMemo(
    () => [...new Set(products.flatMap((p) => p.notas_olfativas))].sort(),
    []
  )

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    return products.filter((p) => {
      const matchesCategory = activeFilter === 'Todos' || p.categoria === activeFilter
      const matchesSearch =
        !q || p.nombre.toLowerCase().includes(q) || p.marca.toLowerCase().includes(q)
      const matchesAroma = !aromaFilter || p.notas_olfativas.includes(aromaFilter)
      return matchesCategory && matchesSearch && matchesAroma
    })
  }, [activeFilter, searchQuery, aromaFilter])

  return (
    <section id="coleccion" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 md:py-24">
      {/* Section header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <h2 className="font-serif text-3xl md:text-4xl text-ink mb-1">Colección</h2>
        <p className="text-ink/40 text-xs font-sans uppercase tracking-widest">
          {filtered.length} {filtered.length === 1 ? 'fragancia encontrada' : 'fragancias'}
        </p>
      </motion.div>

      {/* Controls: Filter + Search */}
      <div className="flex flex-col gap-4 mb-10 pb-6 border-b border-ink/[0.07]">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <FilterBar active={activeFilter} onChange={setActiveFilter} />
          <SearchBar value={searchQuery} onChange={setSearchQuery} />
        </div>
        <AromaFilter aromas={allAromas} active={aromaFilter} onChange={setAromaFilter} />
      </div>

      {/* Product grid or empty state */}
      <AnimatePresence mode="wait">
        {filtered.length === 0 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col items-center justify-center py-28 gap-4 text-ink/25"
          >
            <Layers className="w-9 h-9" strokeWidth={1} />
            <p className="font-sans text-sm tracking-wide">No se encontraron fragancias</p>
          </motion.div>
        ) : (
          <motion.div
            key="grid"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 md:gap-6"
          >
            {filtered.map((product, i) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: i * 0.06, ease: 'easeOut' }}
              >
                <ProductCard product={product} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
