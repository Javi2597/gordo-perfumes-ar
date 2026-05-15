'use client'

import { ChevronDown } from 'lucide-react'

interface AromaFilterProps {
  aromas: string[]
  active: string | null
  onChange: (aroma: string | null) => void
}

export default function AromaFilter({ aromas, active, onChange }: AromaFilterProps) {
  return (
    <div className="relative inline-flex items-center">
      <select
        value={active ?? ''}
        onChange={(e) => onChange(e.target.value || null)}
        aria-label="Filtrar por aroma"
        className="appearance-none pl-4 pr-10 py-2 text-xs font-sans uppercase tracking-widest bg-transparent border border-ink/20 text-ink/60 hover:border-ink/40 hover:text-ink focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-colors duration-200 cursor-pointer"
      >
        <option value="">Aroma: Todos</option>
        {aromas.map((aroma) => (
          <option key={aroma} value={aroma}>
            {aroma}
          </option>
        ))}
      </select>
      <ChevronDown className="pointer-events-none absolute right-3 w-3.5 h-3.5 text-ink/40" strokeWidth={1.5} />
    </div>
  )
}
