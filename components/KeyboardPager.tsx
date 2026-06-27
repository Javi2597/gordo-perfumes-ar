'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

interface KeyboardPagerProps {
  prevSlug: string
  nextSlug: string
}

/**
 * Navegación por teclado entre fichas de perfume.
 * ◀ / ▶ saltan a la URL del perfume anterior / siguiente.
 * No renderiza nada visible; las flechas en pantalla son <Link> en la page.
 */
export default function KeyboardPager({ prevSlug, nextSlug }: KeyboardPagerProps) {
  const router = useRouter()

  useEffect(() => {
    router.prefetch(`/perfume/${prevSlug}`)
    router.prefetch(`/perfume/${nextSlug}`)

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') router.push(`/perfume/${prevSlug}`)
      else if (e.key === 'ArrowRight') router.push(`/perfume/${nextSlug}`)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [prevSlug, nextSlug, router])

  return null
}
