import HeroSection from '@/components/HeroSection'
import NosotrosSection from '@/components/NosotrosSection'
import CatalogSection from '@/components/CatalogSection'
import FaqSection from '@/components/FaqSection'
import Navbar from '@/components/Navbar'
import StructuredData from '@/components/StructuredData'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white">
      <StructuredData />
      <Navbar />
      <HeroSection />
      <NosotrosSection />
      <CatalogSection />
      <FaqSection />

      <footer className="border-t border-ink/[0.07] py-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="font-serif text-sm tracking-wide text-ink/70">
            Terpeno&apos;s <em className="not-italic text-gold">Fragances</em>
          </span>
          <p className="text-[10px] font-sans uppercase tracking-widest text-ink/25 text-center">
            Los precios son referenciales y pueden variar · Consultar disponibilidad
          </p>
        </div>
        <p className="mt-6 text-center text-[10px] font-sans tracking-wide text-ink/30">
          Web por{' '}
          <a
            href="https://pixelforge.com.ar/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:opacity-70 transition-opacity"
          >
            Pixel Forge
          </a>
        </p>
      </footer>
    </main>
  )
}
