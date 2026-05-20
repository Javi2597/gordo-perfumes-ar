'use client'

import { motion } from 'framer-motion'

const fadeUp = (delay: number) => ({
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.25 },
  transition: { duration: 0.85, delay, ease: [0.25, 0.1, 0.25, 1] as const },
})

export default function NosotrosSection() {
  return (
    <section className="relative w-full bg-ink text-white overflow-hidden py-24 px-6">

      {/* Grain texture */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='256' height='256'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: '180px',
        }}
      />

      {/* Gold glow */}
      <div
        aria-hidden
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, rgba(197,160,89,0.07) 0%, transparent 70%)' }}
      />

      <div className="relative max-w-3xl mx-auto">

        {/* Eyebrow */}
        <motion.p
          {...fadeUp(0)}
          className="text-gold text-[10px] uppercase tracking-[0.4em] mb-6 font-sans"
        >
          Sobre Nosotros
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.9, delay: 0.1, ease: 'easeOut' }}
          className="w-14 h-px mb-10 origin-left"
          style={{ background: 'linear-gradient(to right, #C5A059, transparent)' }}
        />

        {/* Main text */}
        <motion.p
          {...fadeUp(0.2)}
          className="text-white/60 text-base md:text-lg leading-relaxed font-sans mb-6"
        >
          Somos un emprendimiento apasionado por el mundo de las fragancias.
          Buscamos acercarte perfumes con personalidad, calidad y excelente duración,
          seleccionando aromas que transmitan estilo, presencia y esencia propia.
        </motion.p>

        <motion.p
          {...fadeUp(0.35)}
          className="text-white/60 text-base md:text-lg leading-relaxed font-sans mb-6"
        >
          Creemos que un perfume no es solo un aroma, sino una forma de expresarse.
          Por eso ofrecemos una experiencia personalizada para ayudarte a encontrar
          la fragancia ideal según tus gustos, estilo y ocasión.
        </motion.p>

        <motion.p
          {...fadeUp(0.5)}
          className="text-white/60 text-base md:text-lg leading-relaxed font-sans mb-14"
        >
          Trabajamos con perfumes árabes, de diseñador y decants para que puedas
          descubrir nuevas experiencias olfativas de una manera accesible y auténtica.
        </motion.p>

        {/* CTA */}
        <motion.div
          {...fadeUp(0.65)}
          className="border border-gold/20 rounded-sm p-8 bg-white/[0.02]"
        >
          <p className="text-white/80 text-sm md:text-base leading-relaxed font-sans mb-6">
            Explorá el catálogo, elegí tu fragancia ideal y escribinos por WhatsApp
            para finalizar tu pedido. Brindamos atención personalizada para coordinar
            pago, envío o entrega.
          </p>
          <a
            href="https://wa.me/5491160461248"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 text-[11px] uppercase tracking-[0.25em] text-gold font-sans border border-gold/30 px-6 py-3 hover:bg-gold/10 transition-colors duration-300"
          >
            Escribinos por WhatsApp
            <span aria-hidden>→</span>
          </a>
        </motion.div>

      </div>
    </section>
  )
}
