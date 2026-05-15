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
  title: "Terpeno's Fragances",
  description:
    'Catálogo exclusivo de fragancias premium. Consultá disponibilidad y precios referenciales directamente por WhatsApp.',
  icons: {
    icon: [
      { url: '/images/iconos/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/images/iconos/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/images/iconos/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/images/iconos/apple-touch-icon.png' }],
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
