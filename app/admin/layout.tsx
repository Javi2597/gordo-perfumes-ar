import type { Metadata } from 'next'
import Link from 'next/link'
import AdminNav from './_nav'

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · Admin' },
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-50">
      <header className="sticky top-0 z-20 bg-ink text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <Link href="/admin" className="flex items-baseline gap-2 shrink-0">
            <span className="font-serif text-lg text-gold">Terpeno&apos;s</span>
            <span className="text-[10px] font-sans uppercase tracking-[0.2em] text-white/50">
              Admin
            </span>
          </Link>
          <AdminNav />
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">{children}</main>
    </div>
  )
}
