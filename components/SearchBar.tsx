'use client'

import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
}

export default function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className="relative w-full max-w-xs">
      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink/30 pointer-events-none" />
      <input
        type="text"
        placeholder="Buscar por nombre o marca…"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full pl-10 pr-9 py-2.5
          bg-white border border-ink/10
          text-sm text-ink placeholder-ink/30
          outline-none focus:border-gold
          transition-colors duration-200
          font-sans
        "
      />
      {value && (
        <button
          onClick={() => onChange('')}
          aria-label="Limpiar búsqueda"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/30 hover:text-ink transition-colors"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  )
}
