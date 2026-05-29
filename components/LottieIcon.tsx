'use client'

import { useEffect, useRef } from 'react'
import lottie, { AnimationItem } from 'lottie-web'

interface Props {
  src: string
  className?: string
  /** Si true, reproduce al montar; si false, solo en hover */
  autoplay?: boolean
  loop?: boolean
}

export default function LottieIcon({ src, className = '', autoplay = false, loop = false }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<AnimationItem | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    animRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop,
      autoplay,
      path: src,
    })

    return () => {
      animRef.current?.destroy()
      animRef.current = null
    }
  }, [src, autoplay, loop])

  const play = () => {
    animRef.current?.goToAndPlay(0, true)
  }

  return (
    <div
      ref={containerRef}
      className={className}
      onMouseEnter={play}
      onFocus={play}
    />
  )
}
