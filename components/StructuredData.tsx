import { products } from '@/constants/products'
import { SITE_URL, SITE_NAME, productUrl } from '@/constants/site'

export default function StructuredData() {
  const store = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: SITE_NAME,
    description:
      'Catálogo exclusivo de fragancias premium: perfumes árabes, de nicho y de diseñador. Consultá disponibilidad y precios por WhatsApp.',
    url: SITE_URL,
    image: `${SITE_URL}/images/products/terpenos-fragances.jpeg`,
    areaServed: 'AR',
    currenciesAccepted: 'ARS',
  }

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Colección de fragancias',
    numberOfItems: products.length,
    itemListElement: products.map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Product',
        name: p.nombre,
        description: p.descripcion,
        image: `${SITE_URL}${p.imagen}`,
        url: productUrl(p.slug),
        brand: { '@type': 'Brand', name: p.marca },
        category: p.categoria,
        offers: {
          '@type': 'Offer',
          price: p.precio_referencial,
          priceCurrency: 'ARS',
          availability: 'https://schema.org/InStock',
          url: p.link_whatsapp,
        },
      },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(store) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
      />
    </>
  )
}
