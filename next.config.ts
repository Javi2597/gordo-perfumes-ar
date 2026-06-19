import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // AVIF deshabilitado: el optimizador en dev/runtime se cuelga generando AVIF
    // para algunas imágenes (dejaba tarjetas en blanco). WebP es fiable y ligero.
    formats: ['image/webp'],
  },
}

export default nextConfig
