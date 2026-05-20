import type { Metadata } from 'next'
import { Inter, Playfair_Display } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://www.terpenosfragances.com.ar'),
  title: "Terpeno's Fragances",
  description:
    'Catálogo exclusivo de fragancias premium. Consultá disponibilidad y precios referenciales directamente por WhatsApp.',
  openGraph: {
    type: 'website',
    url: 'https://www.terpenosfragances.com.ar',
    siteName: "Terpeno's Fragances",
    title: "Terpeno's Fragances | Perfumes Árabes, de Nicho y de Diseñador",
    description:
      'Catálogo exclusivo de fragancias premium. Consultá disponibilidad y precios referenciales directamente por WhatsApp.',
    locale: 'es_AR',
    images: [
      {
        url: '/images/products/terpenos-fragances.jpeg',
        width: 1200,
        height: 630,
        alt: "Terpeno's Fragances — Perfumes Árabes, de Nicho y de Diseñador",
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Terpeno's Fragances | Perfumes Árabes, de Nicho y de Diseñador",
    description:
      'Catálogo exclusivo de fragancias premium. Consultá disponibilidad y precios referenciales directamente por WhatsApp.',
    images: ['/images/products/terpenos-fragances.jpeg'],
  },
  icons: {
    icon: [
      { url: '/images/iconos/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/iconos/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/iconos/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/images/products/ts-icon.png' }],
    shortcut: [{ url: '/images/products/ts-icon.png' }],
    other: [
      { rel: 'icon', url: '/images/iconos/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/images/iconos/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-white text-ink">{children}</body>
    </html>
  )
}
