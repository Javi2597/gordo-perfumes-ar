'use client'

import { motion } from 'framer-motion'

export default function HeroSection() {
  return (
    <section className="relative w-full bg-ink text-white overflow-hidden">
      {/* Decorative vertical lines */}
      <span className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-b from-transparent to-gold/30 pointer-events-none" />
      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-px h-20 bg-gradient-to-t from-transparent to-gold/30 pointer-events-none" />

      {/* Corner marks */}
      <span className="absolute top-6 left-6 w-8 h-px bg-gold/40" />
      <span className="absolute top-6 left-6 w-px h-8 bg-gold/40" />
      <span className="absolute top-6 right-6 w-8 h-px bg-gold/40" />
      <span className="absolute top-6 right-6 w-px h-8 bg-gold/40" />
      <span className="absolute bottom-6 left-6 w-8 h-px bg-gold/40" />
      <span className="absolute bottom-6 left-6 w-px h-8 bg-gold/40" />
      <span className="absolute bottom-6 right-6 w-8 h-px bg-gold/40" />
      <span className="absolute bottom-6 right-6 w-px h-8 bg-gold/40" />

      <div className="relative max-w-5xl mx-auto px-6 py-28 md:py-40 text-center">
        {/* Eyebrow */}
        <motion.p
          initial={{ opacity: 0, letterSpacing: '1em' }}
          animate={{ opacity: 1, letterSpacing: '0.4em' }}
          transition={{ duration: 1.2, ease: 'easeOut' }}
          className="text-gold text-[10px] md:text-xs uppercase tracking-[0.4em] mb-8 font-sans"
        >
          Catálogo Exclusivo · Argentina
        </motion.p>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.25, ease: [0.25, 0.1, 0.25, 1] }}
          className="font-serif text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-normal leading-[1.05] tracking-tight mb-6"
        >
          El Arte del
          <br />
          <em className="not-italic text-gold">Perfume</em>
        </motion.h1>

        {/* Gold divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.9, delay: 0.6, ease: 'easeOut' }}
          className="w-14 h-px bg-gold mx-auto mb-7 origin-center"
        />

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.75, ease: 'easeOut' }}
          className="text-white/50 text-sm md:text-base max-w-md mx-auto leading-relaxed font-sans"
        >
          Fragancias de autor cuidadosamente seleccionadas.
          <br />
          Consultá disponibilidad y precio directo por WhatsApp.
        </motion.p>
      </div>
    </section>
  )
}
