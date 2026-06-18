export const SITE_URL = 'https://www.terpenosfragances.com.ar'
export const SITE_NAME = "Terpeno's Fragances"

export function productUrl(slug: string) {
  return `${SITE_URL}/perfume/${slug}`
}
