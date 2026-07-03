'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

const LINKS = [
  { href: '/admin', label: 'Resumen' },
  { href: '/admin/ordenes', label: 'Órdenes' },
]

export default function AdminNav() {
  const pathname = usePathname()
  return (
    <nav className="flex gap-1">
      {LINKS.map((l) => {
        const active = pathname === l.href
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? 'page' : undefined}
            className={`text-[11px] font-sans uppercase tracking-widest px-3 py-1.5 transition-colors ${
              active ? 'bg-gold text-ink' : 'text-white/60 hover:text-white'
            }`}
          >
            {l.label}
          </Link>
        )
      })}
    </nav>
  )
}
