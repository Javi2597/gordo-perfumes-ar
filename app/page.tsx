import HeroSection from '@/components/HeroSection'
import NosotrosSection from '@/components/NosotrosSection'
import CatalogSection from '@/components/CatalogSection'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <HeroSection />
      <NosotrosSection />
      <CatalogSection />

      <footer className="border-t border-ink/[0.07] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-serif text-sm text-ink/60 tracking-wide">Perfumes AR</span>
          <p className="text-[10px] font-sans uppercase tracking-widest text-ink/25 text-center">
            Los precios son referenciales y pueden variar · Consultar disponibilidad
          </p>
        </div>
      </footer>
    </main>
  )
}
