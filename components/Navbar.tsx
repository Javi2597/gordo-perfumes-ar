'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, ChevronDown, MessageCircle } from 'lucide-react'
import LottieIcon from './LottieIcon'

const INSTAGRAM_URL = 'https://www.instagram.com/terpenosfragances.ok'
const WHATSAPP_URL = 'https://wa.me/541160461248'

const CATEGORIES = ['Hombre', 'Mujer', 'Unisex'] as const

const overlayVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.25 } },
}

const listVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.18 } },
}

const itemVariants = {
  hidden: { opacity: 0, x: -24 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.38, ease: [0.25, 0.1, 0.25, 1] as const } },
}

export default function Navbar() {
  const [visible, setVisible] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [coleccionOpen, setColeccionOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 90)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const close = () => {
    setMenuOpen(false)
    setColeccionOpen(false)
  }

  const scrollTo = (id: string) => {
    close()
    setTimeout(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
    }, 320)
  }

  const filterCategory = (cat: string) => {
    close()
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('navbar-set-category', { detail: cat }))
      document.getElementById('coleccion')?.scrollIntoView({ behavior: 'smooth' })
    }, 320)
  }

  return (
    <>
      {/* ── Barra fija ── */}
      <AnimatePresence>
        {visible && (
          <motion.nav
            initial={{ y: -64, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -64, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
            className="fixed top-0 inset-x-0 z-50 h-16 bg-ink/95 backdrop-blur-md border-b border-gold/10 flex items-center px-6"
          >
            <button
              onClick={() => { close(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
              aria-label="Ir al inicio"
              className="font-serif text-[15px] text-white/80 tracking-wide hover:text-white transition-colors duration-200"
            >
              Terpeno&apos;s <em className="not-italic text-gold">Fragances</em>
            </button>

            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
              className="ml-auto flex items-center justify-center w-9 h-9 text-white/60 hover:text-gold transition-colors duration-200"
            >
              <Menu className="w-5 h-5" />
            </button>
          </motion.nav>
        )}
      </AnimatePresence>

      {/* ── Menú overlay ── */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="fixed inset-0 z-[60] bg-ink flex flex-col"
          >
            {/* Glow sutil */}
            <div
              aria-hidden
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full pointer-events-none"
              style={{ background: 'radial-gradient(ellipse at center, rgba(197,160,89,0.06) 0%, transparent 65%)' }}
            />

            {/* Header del overlay */}
            <div className="relative flex items-center justify-between px-6 h-16 border-b border-gold/10 shrink-0">
              <button
                onClick={() => { close(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                aria-label="Ir al inicio"
                className="font-serif text-[15px] text-white/80 tracking-wide hover:text-white transition-colors duration-200"
              >
                Terpeno&apos;s <em className="not-italic text-gold">Fragances</em>
              </button>
              <button
                onClick={close}
                aria-label="Cerrar menú"
                className="flex items-center justify-center w-9 h-9 text-white/50 hover:text-gold transition-colors duration-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Items de navegación */}
            <motion.nav
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="relative flex-1 flex flex-col justify-center px-8 md:px-16 gap-0"
            >
              {/* Inicio */}
              <motion.div variants={itemVariants}>
                <button
                  onClick={() => { close(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
                  className="w-full flex items-center gap-4 py-4 font-serif text-[1.75rem] text-white/75 hover:text-white transition-colors duration-200 border-b border-white/[0.05]"
                >
                  <LottieIcon src="/anim/home.json" className="w-10 h-10 shrink-0" autoplay loopDelay={2000} />
                  Inicio
                </button>
              </motion.div>

              {/* Colección + submenú */}
              <motion.div variants={itemVariants}>
                <button
                  onClick={() => setColeccionOpen(!coleccionOpen)}
                  className="w-full flex items-center gap-4 justify-between py-4 font-serif text-[1.75rem] text-white/75 hover:text-white transition-colors duration-200 border-b border-white/[0.05]"
                >
                  <span className="flex items-center gap-4">
                    <LottieIcon src="/anim/coleccion.json" className="w-10 h-10 shrink-0" autoplay loopDelay={2000} />
                    Colección
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-gold/60 transition-transform duration-300 ${coleccionOpen ? 'rotate-180' : ''}`}
                  />
                </button>
                <AnimatePresence initial={false}>
                  {coleccionOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.26, ease: [0.25, 0.1, 0.25, 1] }}
                      className="overflow-hidden"
                    >
                      <div className="flex gap-6 pl-1 py-3 border-b border-white/[0.05]">
                        {CATEGORIES.map((cat) => (
                          <button
                            key={cat}
                            onClick={() => filterCategory(cat)}
                            className="text-[10px] font-sans uppercase tracking-[0.2em] text-white/35 hover:text-gold transition-colors duration-200 py-1"
                          >
                            {cat}
                          </button>
                        ))}
                        <button
                          onClick={() => scrollTo('coleccion')}
                          className="text-[10px] font-sans uppercase tracking-[0.2em] text-white/20 hover:text-gold/60 transition-colors duration-200 py-1"
                        >
                          Ver todos
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>

              {/* Contacto */}
              <motion.div variants={itemVariants}>
                <a
                  href={WHATSAPP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className="flex items-center gap-4 py-4 font-serif text-[1.75rem] text-white/75 hover:text-white transition-colors duration-200 border-b border-white/[0.05]"
                >
                  <LottieIcon src="/anim/contacto.json" className="w-10 h-10 shrink-0" autoplay loopDelay={2000} />
                  Contacto
                  <MessageCircle className="w-4 h-4 text-gold/40 mb-0.5 ml-auto" />
                </a>
              </motion.div>

              {/* Preguntas Frecuentes */}
              <motion.div variants={itemVariants}>
                <button
                  onClick={() => scrollTo('faq')}
                  className="w-full flex items-center gap-4 py-4 font-serif text-[1.35rem] min-[394px]:text-[1.75rem] text-white/75 hover:text-white transition-colors duration-200 border-b border-white/[0.05] text-left"
                >
                  <LottieIcon src="/anim/preguntasf.json" className="w-10 h-10 shrink-0" autoplay loopDelay={2000} />
                  Preguntas Frecuentes
                </button>
              </motion.div>

              {/* Instagram */}
              <motion.div variants={itemVariants}>
                <a
                  href={INSTAGRAM_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={close}
                  className="flex items-center gap-4 py-4 font-serif text-[1.75rem] text-white/75 hover:text-gold transition-colors duration-200"
                >
                  <LottieIcon src="/anim/iglogo.json" className="w-10 h-10 shrink-0" autoplay loopDelay={2000} />
                  Instagram
                </a>
              </motion.div>
            </motion.nav>

            {/* Pie del overlay */}
            <div className="relative px-6 pb-8 pt-5 border-t border-gold/10 shrink-0">
              <p className="text-[9px] font-sans uppercase tracking-[0.28em] text-white/15 text-center">
                Terpeno&apos;s Fragances · Buenos Aires
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
