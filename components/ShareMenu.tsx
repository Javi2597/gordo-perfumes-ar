'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Check, Link2, Share2 } from 'lucide-react'

interface ShareMenuProps {
  url: string
  title: string
}

const networks = (url: string, title: string) => {
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)
  return [
    { name: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent(`${title} ${url}`)}` },
    { name: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}` },
    { name: 'Telegram', href: `https://t.me/share/url?url=${u}&text=${t}` },
    { name: 'X', href: `https://twitter.com/intent/tweet?url=${u}&text=${t}` },
  ]
}

export default function ShareMenu({ url, title }: ShareMenuProps) {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  const handleShare = async () => {
    // Compartir nativo en mobile (WhatsApp, Instagram, etc.)
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title, text: title, url })
        return
      } catch {
        // cancelado por el usuario → no hacemos nada
      }
    }
    setOpen((v) => !v)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleShare}
        aria-label="Compartir"
        className="flex items-center justify-center gap-2 w-full border border-ink/15 text-ink/70 text-[11px] font-sans uppercase tracking-widest py-3 px-4 hover:border-ink/40 hover:text-ink transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold"
      >
        <Share2 className="w-3.5 h-3.5 shrink-0" />
        Compartir
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.18 }}
            className="absolute left-0 right-0 bottom-full mb-2 z-30 bg-white border border-ink/10 shadow-xl p-2 flex flex-col"
          >
            {networks(url, title).map((n) => (
              <a
                key={n.name}
                href={n.href}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="px-3 py-2.5 text-[11px] font-sans uppercase tracking-widest text-ink/70 hover:bg-ink/[0.04] hover:text-ink transition-colors"
              >
                {n.name}
              </a>
            ))}
            <button
              onClick={handleCopy}
              className="flex items-center gap-2 px-3 py-2.5 text-[11px] font-sans uppercase tracking-widest text-ink/70 hover:bg-ink/[0.04] hover:text-ink transition-colors border-t border-ink/[0.06] mt-1 pt-2.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-gold" /> : <Link2 className="w-3.5 h-3.5" />}
              {copied ? 'Enlace copiado' : 'Copiar enlace'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
