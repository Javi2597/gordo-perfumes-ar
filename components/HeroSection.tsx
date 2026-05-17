'use client'

import { motion } from 'framer-motion'
import { ChevronDown } from 'lucide-react'

const BRANDS = [
  'LATTAFA', 'ARMAF', 'RASASI', 'MAISON ALHAMBRA',
  'AFNAN', 'AL HARAMAIN', 'AL WATANIAH', 'BHARARA', 'ASDAAF', 'FRENCH AVENUE',
]

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.9, delay, ease: [0.25, 0.1, 0.25, 1] as const },
})

export default function HeroSection() {
  return (
    <section className="relative w-full min-h-screen bg-ink text-white overflow-hidden flex flex-col">

      {/* Grain texture */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px',
        }}
      />

      {/* Radial gold glow */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[700px] h-[700px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(197,160,89,0.11) 0%, transparent 68%)' }}
      />

      {/* Vertical accent lines */}
      <span aria-hidden className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent to-gold/25 pointer-events-none" />
      <span aria-hidden className="absolute bottom-[56px] left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-t from-transparent to-gold/20 pointer-events-none" />

      {/* Corner marks */}
      <span aria-hidden className="absolute top-7 left-7 w-10 h-px bg-gold/35" />
      <span aria-hidden className="absolute top-7 left-7 w-px h-10 bg-gold/35" />
      <span aria-hidden className="absolute top-7 right-7 w-10 h-px bg-gold/35" />
      <span aria-hidden className="absolute top-7 right-7 w-px h-10 bg-gold/35" />
      <span aria-hidden className="absolute bottom-[57px] left-7 w-10 h-px bg-gold/35" />
      <span aria-hidden className="absolute bottom-[57px] left-7 w-px h-10 bg-gold/35" />
      <span aria-hidden className="absolute bottom-[57px] right-7 w-10 h-px bg-gold/35" />
      <span aria-hidden className="absolute bottom-[57px] right-7 w-px h-10 bg-gold/35" />

      {/* ── Main content ── */}
      <div className="relative flex-1 flex flex-col items-center justify-center px-6 pt-24 pb-16 text-center max-w-5xl mx-auto w-full">

        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, letterSpacing: '1em' }}
          animate={{ opacity: 1, letterSpacing: '0.4em' }}
          transition={{ duration: 1.3, ease: 'easeOut' }}
          className="text-gold text-[10px] md:text-xs uppercase tracking-[0.4em] mb-10 font-sans"
        >
          Catálogo Exclusivo · Argentina
        </motion.p>

        {/* Headline */}
        <motion.h1
          {...fadeUp(0.3)}
          className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-normal leading-[1.05] tracking-tight mb-7"
        >
          Terpeno&apos;s
          <br />
          <em className="not-italic text-gold">Fragances</em>
        </motion.h1>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 1, delay: 0.65, ease: 'easeOut' }}
          className="w-20 h-px mx-auto mb-8 origin-center"
          style={{ background: 'linear-gradient(to right, transparent, #C5A059, transparent)' }}
        />

        {/* Subtitle */}
        <motion.p
          {...fadeUp(0.8)}
          className="text-white/45 text-sm md:text-base max-w-[22rem] mx-auto leading-loose font-sans tracking-wide"
        >
          Fragancias de autor seleccionadas con criterio.
          <br />
          100% originales · Consultá por WhatsApp.
        </motion.p>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.05, ease: 'easeOut' }}
          className="flex items-center gap-6 sm:gap-10 mt-14"
        >
          {[
            { value: '+42', label: 'Fragancias' },
            { value: '10', label: 'Marcas' },
            { value: '100%', label: 'Originales' },
          ].map(({ value, label }, i, arr) => (
            <div key={label} className="flex items-center gap-6 sm:gap-10">
              <div className="text-center">
                <p className="font-serif text-2xl sm:text-3xl text-gold font-normal leading-none">{value}</p>
                <p className="text-[9px] sm:text-[10px] uppercase tracking-widest text-white/30 mt-2 font-sans">{label}</p>
              </div>
              {i < arr.length - 1 && (
                <div className="w-px h-9 bg-gold/15" />
              )}
            </div>
          ))}
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 1.5 }}
          className="flex flex-col items-center gap-2 mt-16"
        >
          <span className="text-[9px] uppercase tracking-[0.35em] text-white/20 font-sans">Ver catálogo</span>
          <motion.div
            animate={{ y: [0, 5, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          >
            <ChevronDown className="w-4 h-4 text-gold/35" />
          </motion.div>
        </motion.div>
      </div>

      {/* ── Brand strip ── */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.7 }}
        className="relative border-t border-gold/10"
      >
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 px-6 py-3.5">
          {BRANDS.map((brand, i) => (
            <span key={brand} className="flex items-center gap-6">
              <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.25em] text-white/20 font-sans whitespace-nowrap">
                {brand}
              </span>
              {i < BRANDS.length - 1 && (
                <span aria-hidden className="w-[3px] h-[3px] rounded-full bg-gold/25 hidden sm:inline-block" />
              )}
            </span>
          ))}
        </div>
      </motion.div>

    </section>
  )
}
