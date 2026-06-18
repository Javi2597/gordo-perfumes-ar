'use client'

import { ChevronDown } from 'lucide-react'

interface BrandFilterProps {
  brands: string[]
  active: string | null
  onChange: (brand: string | null) => void
}

export default function BrandFilter({ brands, active, onChange }: BrandFilterProps) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={active ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        aria-label="Filtrar por marca"
        className="appearance-none pl-4 pr-10 py-2 text-xs font-sans uppercase tracking-widest bg-transparent border border-ink/20 text-ink/60 hover:border-ink/40 hover:text-ink focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors duration-200 cursor-pointer"
      >
        <option value="">Marca: Todas</option>
        {brands.map((brand) => (
          <option key={brand} value={brand}>
            {brand}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 w-3.5 h-3.5 text-ink/40" strokeWidth={1.5} />
    </div>
  )
}
