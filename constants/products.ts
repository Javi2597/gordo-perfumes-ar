export type Category = 'Hombre' | 'Mujer' | 'Unisex'

export interface Product {
  id: string
  nombre: string
  marca: string
  categoria: Category
  notas_olfativas: string[]
  precio_referencial: number
  imagen: string
  link_whatsapp: string
}

// Replace with your actual WhatsApp number (country code + number, no +)
const WHATSAPP_NUMBER = '5491144095094'

const wa = (nombre: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola, me interesa obtener información sobre el perfume ${nombre}`
  )}`

export const products: Product[] = [
  {
    id: '1',
    nombre: 'Baccarat Rouge 540',
    marca: 'Maison Francis Kurkdjian',
    categoria: 'Unisex',
    notas_olfativas: ['Azafrán', 'Jazmín', 'Amaderado', 'Ámbar'],
    precio_referencial: 320000,
    imagen: 'https://picsum.photos/seed/br540/400/500',
    link_whatsapp: wa('Baccarat Rouge 540'),
  },
  {
    id: '2',
    nombre: 'Bleu de Chanel',
    marca: 'Chanel',
    categoria: 'Hombre',
    notas_olfativas: ['Cítrico', 'Cedro', 'Sándalo', 'Incienso'],
    precio_referencial: 185000,
    imagen: 'https://picsum.photos/seed/bleuchanel/400/500',
    link_whatsapp: wa('Bleu de Chanel'),
  },
  {
    id: '3',
    nombre: 'Coco Mademoiselle',
    marca: 'Chanel',
    categoria: 'Mujer',
    notas_olfativas: ['Rosa', 'Bergamota', 'Pachulí', 'Vetiver'],
    precio_referencial: 175000,
    imagen: 'https://picsum.photos/seed/cocomad/400/500',
    link_whatsapp: wa('Coco Mademoiselle'),
  },
  {
    id: '4',
    nombre: 'Oud Wood',
    marca: 'Tom Ford',
    categoria: 'Unisex',
    notas_olfativas: ['Oud', 'Roble', 'Cardamomo', 'Sándalo'],
    precio_referencial: 290000,
    imagen: 'https://picsum.photos/seed/oudwood/400/500',
    link_whatsapp: wa('Oud Wood'),
  },
  {
    id: '5',
    nombre: 'La Vie Est Belle',
    marca: 'Lancôme',
    categoria: 'Mujer',
    notas_olfativas: ['Iris', 'Pralinée', 'Vainilla', 'Pera'],
    precio_referencial: 145000,
    imagen: 'https://picsum.photos/seed/laviebell/400/500',
    link_whatsapp: wa('La Vie Est Belle'),
  },
  {
    id: '6',
    nombre: 'Sauvage',
    marca: 'Dior',
    categoria: 'Hombre',
    notas_olfativas: ['Pimienta', 'Bergamota', 'Lavanda', 'Ambroxan'],
    precio_referencial: 155000,
    imagen: 'https://picsum.photos/seed/sauvage/400/500',
    link_whatsapp: wa('Sauvage'),
  },
]
