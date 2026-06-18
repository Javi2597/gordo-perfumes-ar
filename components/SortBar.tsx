'use client'

import { ChevronDown } from 'lucide-react'

export type SortOption = 'default' | 'price-asc' | 'price-desc'

const OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'default', label: 'Orden: Destacados' },
  { value: 'price-asc', label: 'Precio: menor a mayor' },
  { value: 'price-desc', label: 'Precio: mayor a menor' },
]

interface SortBarProps {
  value: SortOption
  onChange: (value: SortOption) => void
}

export default function SortBar({ value, onChange }: SortBarProps) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value as SortOption)}
        aria-label="Ordenar por"
        className="appearance-none pl-4 pr-10 py-2 text-xs font-sans uppercase tracking-widest bg-transparent border border-ink/20 text-ink/60 hover:border-ink/40 hover:text-ink focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors duration-200 cursor-pointer"
      >
        {OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 w-3.5 h-3.5 text-ink/40" strokeWidth={1.5} />
    </div>
  )
}
