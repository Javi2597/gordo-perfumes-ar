'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Minus, Instagram } from 'lucide-react'

const INSTAGRAM_URL = 'https://www.instagram.com/terpenosfragances.ok'
const INSTAGRAM_HANDLE = '@terpenosfragances.ok'

const faqs = [
  {
    categoria: 'El producto',
    items: [
      {
        q: '¿Los perfumes son originales?',
        a: 'Trabajamos con fragancias árabes y de diseñador reconocidas por su excelente calidad, rendimiento y relación precio-calidad. Cada perfume se entrega sellado y en perfectas condiciones.',
      },
      {
        q: '¿Los perfumes tienen buena duración?',
        a: 'Sí. La mayoría de las fragancias árabes se destacan por su excelente duración y proyección, especialmente en ropa y climas frescos.',
      },
      {
        q: '¿Qué diferencia tienen los perfumes árabes?',
        a: 'Suelen ofrecer aromas intensos, sofisticados y con gran rendimiento, inspirados muchas veces en perfumes de diseñador o nicho.',
      },
      {
        q: '¿Tienen perfumes femeninos y masculinos?',
        a: 'Sí, contamos con fragancias masculinas, femeninas y unisex.',
      },
      {
        q: '¿Cómo conservar mejor mi perfume?',
        a: 'Recomendamos guardarlo en un lugar fresco, seco y lejos de la luz solar directa para mantener intacta la fragancia.',
      },
    ],
  },
  {
    categoria: 'Asesoramiento',
    items: [
      {
        q: '¿Cómo elijo mi perfume ideal?',
        a: 'Ofrecemos asesoramiento personalizado gratuito para ayudarte a encontrar la fragancia perfecta según tus gustos, personalidad, ocasión o perfumes que ya uses.',
      },
      {
        q: '¿Qué pasa si no conozco ninguna fragancia?',
        a: 'No hay problema. Contanos qué aromas te gustan (dulces, frescos, amaderados, cítricos, etc.) y te recomendamos opciones acordes a vos.',
      },
      {
        q: '¿Puedo pedir recomendaciones según la temporada?',
        a: 'Sí. Podemos recomendarte perfumes ideales para verano, invierno, uso diario, citas, oficina o salidas nocturnas.',
      },
      {
        q: '¿Qué perfumes son ideales para regalar?',
        a: 'Tenemos opciones elegantes y versátiles para regalos, y podemos ayudarte a elegir según la edad y gustos de la persona.',
      },
    ],
  },
  {
    categoria: 'Pedidos y envíos',
    items: [
      {
        q: '¿Cómo puedo hacer un pedido?',
        a: 'Elegís tu fragancia del catálogo, nos escribís por WhatsApp o Instagram y coordinamos el medio de pago y la entrega.',
      },
      {
        q: '¿Hacen envíos?',
        a: 'Sí, realizamos envíos en Capital Federal y Provincia de Buenos Aires.',
      },
      {
        q: '¿Qué medios de pago aceptan?',
        a: 'Transferencia bancaria (te pasamos el alias al confirmar el pedido) o efectivo contra entrega, al recibir el paquete. Coordinamos todo por WhatsApp.',
      },
      {
        q: '¿Dónde puedo ver novedades y recomendaciones?',
        a: `En nuestro Instagram ${INSTAGRAM_HANDLE} compartimos ingresos, recomendaciones, comparaciones y contenido sobre perfumes.`,
      },
    ],
  },
]

function AccordionItem({ q, a, isOpen, onToggle }: { q: string; a: string; isOpen: boolean; onToggle: () => void }) {
  return (
    <div className="border-b border-ink/[0.07] last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 py-4 text-left group"
        aria-expanded={isOpen}
      >
        <span className="font-sans text-[13px] font-medium text-ink leading-snug group-hover:text-gold transition-colors duration-200">
          {q}
        </span>
        <span className="shrink-0 text-gold/70 group-hover:text-gold transition-colors duration-200">
          {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </span>
      </button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: [0.25, 0.1, 0.25, 1] }}
            className="overflow-hidden"
          >
            <p className="pb-4 text-[13px] text-ink/55 font-sans leading-relaxed">{a}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FaqSection() {
  const [openKey, setOpenKey] = useState<string | null>(null)

  const toggle = (key: string) => setOpenKey(openKey === key ? null : key)

  return (
    <section id="faq" className="py-20 px-6 bg-stone-50/50 border-t border-ink/[0.06]">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-14 text-center">
          <p className="text-gold text-[10px] font-sans uppercase tracking-[0.25em] mb-3">
            Todo lo que necesitás saber
          </p>
          <h2 className="font-serif text-3xl md:text-4xl text-ink">Preguntas Frecuentes</h2>
        </div>

        {/* FAQ grid */}
        <div className="grid md:grid-cols-3 gap-10 md:gap-8">
          {faqs.map((grupo) => (
            <div key={grupo.categoria}>
              <p className="text-[9px] font-sans uppercase tracking-[0.22em] text-gold mb-4 pb-3 border-b border-gold/30">
                {grupo.categoria}
              </p>
              {grupo.items.map((item, i) => {
                const key = `${grupo.categoria}-${i}`
                return (
                  <AccordionItem
                    key={key}
                    q={item.q}
                    a={item.a}
                    isOpen={openKey === key}
                    onToggle={() => toggle(key)}
                  />
                )
              })}
            </div>
          ))}
        </div>

        {/* Instagram CTA */}
        <div className="mt-14 pt-10 border-t border-ink/[0.07] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[12px] font-sans text-ink/45 text-center sm:text-left">
            Seguinos para novedades, comparaciones y recomendaciones de perfumes
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="
              flex items-center gap-2.5
              text-[10px] font-sans uppercase tracking-widest text-ink
              border border-ink/20 px-5 py-3
              hover:border-gold hover:text-gold
              transition-colors duration-300
              shrink-0
            "
          >
            <Instagram className="w-3.5 h-3.5" />
            {INSTAGRAM_HANDLE}
          </a>
        </div>

      </div>
    </section>
  )
}
