'use client'

import { motion } from 'framer-motion'

export type FilterCategory = 'Todos' | 'Hombre' | 'Mujer' | 'Unisex'

const CATEGORIES: FilterCategory[] = ['Todos', 'Hombre', 'Mujer', 'Unisex']

interface FilterBarProps {
  active: FilterCategory
  onChange: (cat: FilterCategory) => void
}

export default function FilterBar({ active, onChange }: FilterBarProps) {
  return (
    <nav aria-label="Filtrar por categoría" className="flex gap-1 flex-wrap">
      {CATEGORIES.map((cat) => (
        <button
          key={cat}
          onClick={() => onChange(cat)}
          className="relative px-5 py-2 text-xs font-sans uppercase tracking-widest transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
        >
          {active === cat && (
            <motion.span
              layoutId="filter-pill"
              className="absolute inset-0 bg-ink"
              transition={{ type: 'spring', stiffness: 500, damping: 40 }}
            />
          )}
          <span
            className={`relative z-10 transition-colors duration-200 ${
              active === cat
                ? 'text-white'
                : 'text-ink/40 hover:text-ink'
            }`}
          >
            {cat}
          </span>
        </button>
      ))}
    </nav>
  )
}
