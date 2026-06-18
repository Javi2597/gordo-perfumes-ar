import type { MetadataRoute } from 'next'
import { products } from '@/constants/products'
import { SITE_URL, productUrl } from '@/constants/site'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    ...products.map((p) => ({
      url: productUrl(p.slug),
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
  ]
}
