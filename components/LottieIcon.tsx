'use client'

import { useEffect, useRef } from 'react'
import lottie, { AnimationItem } from 'lottie-web'

interface Props {
  src: string
  className?: string
  autoplay?: boolean
  loop?: boolean
  loopDelay?: number
}

export default function LottieIcon({ src, className = '', autoplay = false, loop = false, loopDelay }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const animRef = useRef<AnimationItem | null>(null)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!containerRef.current) return

    animRef.current = lottie.loadAnimation({
      container: containerRef.current,
      renderer: 'svg',
      loop: loopDelay ? false : loop,
      autoplay,
      path: src,
    })

    if (loopDelay) {
      const scheduleLoop = () => {
        timerRef.current = setTimeout(() => {
          animRef.current?.goToAndPlay(0, true)
        }, loopDelay)
      }
      animRef.current.addEventListener('complete', scheduleLoop)
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
      animRef.current?.destroy()
      animRef.current = null
    }
  }, [src, autoplay, loop, loopDelay])

  const play = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
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
