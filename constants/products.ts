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

const WHATSAPP_NUMBER = '541160461248'

const wa = (nombre: string) =>
  `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
    `Hola, me interesa obtener información sobre el perfume ${nombre}`
  )}`

export const products: Product[] = [
  { id: '1', nombre: 'Tharwah Gold', marca: 'LATTAFA', categoria: 'Unisex', notas_olfativas: ['Oud', 'Amaderado', 'Ámbar'], precio_referencial: 115000, imagen: '/perfumes/tharwah-gold.webp', link_whatsapp: wa('Tharwah Gold') },
  { id: '2', nombre: 'Asad Bourbon', marca: 'LATTAFA', categoria: 'Hombre', notas_olfativas: ['Especiado', 'Vainilla', 'Almizcado'], precio_referencial: 80000, imagen: '/perfumes/asad-bourbon.webp', link_whatsapp: wa('Asad Bourbon') },
  { id: '3', nombre: 'The Kingdom', marca: 'LATTAFA', categoria: 'Hombre', notas_olfativas: ['Cítrico', 'Especiado', 'Amaderado'], precio_referencial: 80000, imagen: '/perfumes/the-kingdom.webp', link_whatsapp: wa('The Kingdom') },
  { id: '4', nombre: 'Vintage Radio', marca: 'LATTAFA', categoria: 'Unisex', notas_olfativas: ['Amaderado', 'Almizcado', 'Ámbar'], precio_referencial: 80000, imagen: '/perfumes/vintage-radio.webp', link_whatsapp: wa('Vintage Radio') },
  { id: '5', nombre: 'Her Confession', marca: 'LATTAFA', categoria: 'Mujer', notas_olfativas: ['Floral', 'Vainilla', 'Almizcado'], precio_referencial: 78000, imagen: '/perfumes/her-confession.webp', link_whatsapp: wa('Her Confession') },
  { id: '7', nombre: 'Asad Black', marca: 'LATTAFA', categoria: 'Hombre', notas_olfativas: ['Oud', 'Especiado', 'Almizcado'], precio_referencial: 75000, imagen: '/perfumes/asad-black.webp', link_whatsapp: wa('Asad Black') },
  { id: '8', nombre: 'Fakhar Black', marca: 'LATTAFA', categoria: 'Hombre', notas_olfativas: ['Oud', 'Amaderado', 'Especiado'], precio_referencial: 71000, imagen: '/perfumes/fakhar-black.webp', link_whatsapp: wa('Fakhar Black') },
  { id: '9', nombre: 'Eclaire', marca: 'LATTAFA', categoria: 'Mujer', notas_olfativas: ['Floral', 'Cítrico', 'Almizcado'], precio_referencial: 71000, imagen: '/perfumes/eclaire.webp', link_whatsapp: wa('Eclaire') },
  { id: '10', nombre: 'Fakhar Rose', marca: 'LATTAFA', categoria: 'Mujer', notas_olfativas: ['Rosa', 'Almizcado', 'Amaderado'], precio_referencial: 65000, imagen: '/perfumes/fakhar-rose.webp', link_whatsapp: wa('Fakhar Rose') },
  { id: '11', nombre: 'Fakhar Platin', marca: 'LATTAFA', categoria: 'Unisex', notas_olfativas: ['Amaderado', 'Almizcado', 'Ámbar'], precio_referencial: 65000, imagen: '/perfumes/fakhar-platin.webp', link_whatsapp: wa('Fakhar Platin') },
  { id: '12', nombre: 'Khamrah Qahwa', marca: 'LATTAFA', categoria: 'Hombre', notas_olfativas: ['Café', 'Oud', 'Amaderado'], precio_referencial: 65000, imagen: '/perfumes/khamrah-qahwa.webp', link_whatsapp: wa('Khamrah Qahwa') },
  { id: '13', nombre: 'Khamrah', marca: 'LATTAFA', categoria: 'Unisex', notas_olfativas: ['Vainilla', 'Almizcado', 'Amaderado'], precio_referencial: 65000, imagen: '/perfumes/khamrah.webp', link_whatsapp: wa('Khamrah') },
  { id: '14', nombre: 'Fakhar Gold', marca: 'LATTAFA', categoria: 'Mujer', notas_olfativas: ['Floral', 'Frutal', 'Almizcado'], precio_referencial: 60000, imagen: '/perfumes/fakhar-gold.webp', link_whatsapp: wa('Fakhar Gold') },
  { id: '15', nombre: 'Yara Moi', marca: 'LATTAFA', categoria: 'Mujer', notas_olfativas: ['Floral', 'Vainilla', 'Almizcado'], precio_referencial: 60000, imagen: '/perfumes/yara-moi.webp', link_whatsapp: wa('Yara Moi') },
  { id: '16', nombre: 'Yara Rosa', marca: 'LATTAFA', categoria: 'Mujer', notas_olfativas: ['Rosa', 'Floral', 'Almizcado'], precio_referencial: 60000, imagen: '/perfumes/yara-rosa.webp', link_whatsapp: wa('Yara Rosa') },
  { id: '17', nombre: 'Yara Tous', marca: 'LATTAFA', categoria: 'Mujer', notas_olfativas: ['Frutal', 'Floral', 'Almizcado'], precio_referencial: 60000, imagen: '/perfumes/yara-tous.webp', link_whatsapp: wa('Yara Tous') },
  { id: '18', nombre: 'Yara Candy', marca: 'LATTAFA', categoria: 'Mujer', notas_olfativas: ['Dulce', 'Frutal', 'Almizcado'], precio_referencial: 60000, imagen: '/perfumes/yara-candy.webp', link_whatsapp: wa('Yara Candy') },
  { id: '19', nombre: 'Honor & Glory', marca: 'LATTAFA', categoria: 'Hombre', notas_olfativas: ['Amaderado', 'Especiado', 'Almizcado'], precio_referencial: 55000, imagen: '/perfumes/honor-and-glory.webp', link_whatsapp: wa('Honor & Glory') },
  { id: '20', nombre: 'Badee Al Oud Amethyst', marca: 'LATTAFA', categoria: 'Unisex', notas_olfativas: ['Oud', 'Amaderado', 'Almizcado'], precio_referencial: 55000, imagen: '/perfumes/badee-al-oud-amethyst.webp', link_whatsapp: wa('Badee Al Oud Amethyst') },
  { id: '21', nombre: 'Badee Al Oud Sublime', marca: 'LATTAFA', categoria: 'Unisex', notas_olfativas: ['Oud', 'Ámbar', 'Almizcado'], precio_referencial: 55000, imagen: '/perfumes/badee-al-oud-sublime.webp', link_whatsapp: wa('Badee Al Oud Sublime') },
  { id: '22', nombre: 'Delilah', marca: 'MAISON ALHAMBRA', categoria: 'Mujer', notas_olfativas: ['Floral', 'Frutal', 'Almizcado'], precio_referencial: 60000, imagen: '/perfumes/delilah.webp', link_whatsapp: wa('Delilah') },
  { id: '23', nombre: 'Sceptre Malachite', marca: 'MAISON ALHAMBRA', categoria: 'Unisex', notas_olfativas: ['Herbáceo', 'Amaderado', 'Almizcado'], precio_referencial: 68000, imagen: '/perfumes/sceptre-malachite.webp', link_whatsapp: wa('Sceptre Malachite') },
  { id: '24', nombre: 'Philos Pura', marca: 'MAISON ALHAMBRA', categoria: 'Unisex', notas_olfativas: ['Floral', 'Amaderado', 'Almizcado'], precio_referencial: 65000, imagen: '/perfumes/philos-pura.webp', link_whatsapp: wa('Philos Pura') },
  { id: '26', nombre: 'Salvo Elixir', marca: 'MAISON ALHAMBRA', categoria: 'Hombre', notas_olfativas: ['Especiado', 'Vainilla', 'Amaderado'], precio_referencial: 55000, imagen: '/perfumes/salvo-elixir.webp', link_whatsapp: wa('Salvo Elixir') },
  { id: '27', nombre: 'Glacier pour Homme', marca: 'MAISON ALHAMBRA', categoria: 'Hombre', notas_olfativas: ['Cítrico', 'Acuático', 'Almizcado'], precio_referencial: 50000, imagen: '/perfumes/glacier-pour-homme.webp', link_whatsapp: wa('Glacier pour Homme') },
  { id: '28', nombre: 'Watani Noir Al Wataniah', marca: 'AL WATANIAH', categoria: 'Hombre', notas_olfativas: ['Oud', 'Amaderado', 'Almizcado'], precio_referencial: 55000, imagen: '/perfumes/watani-noir-al-wataniah.webp', link_whatsapp: wa('Watani Noir Al Wataniah') },
  { id: '29', nombre: 'Durrat al Araoos', marca: 'AL WATANIAH', categoria: 'Mujer', notas_olfativas: ['Floral', 'Frutal', 'Almizcado'], precio_referencial: 54000, imagen: '/perfumes/durrat-al-araoos.webp', link_whatsapp: wa('Durrat al Araoos') },
  { id: '30', nombre: 'Ameerati Al Wataniah', marca: 'AL WATANIAH', categoria: 'Mujer', notas_olfativas: ['Floral', 'Vainilla', 'Almizcado'], precio_referencial: 50000, imagen: '/perfumes/ameerati-al-wataniah.webp', link_whatsapp: wa('Ameerati Al Wataniah') },
  { id: '31', nombre: 'Ghala Al Wataniah', marca: 'AL WATANIAH', categoria: 'Mujer', notas_olfativas: ['Floral', 'Frutal', 'Almizcado'], precio_referencial: 49000, imagen: '/perfumes/ghala-al-wataniah.webp', link_whatsapp: wa('Ghala Al Wataniah') },
  { id: '32', nombre: 'Club De Nuit Iconic', marca: 'ARMAF', categoria: 'Hombre', notas_olfativas: ['Amaderado', 'Almizcado', 'Ámbar'], precio_referencial: 85000, imagen: '/perfumes/club-de-nuit-iconic.webp', link_whatsapp: wa('Club De Nuit Iconic') },
  { id: '33', nombre: 'Club the Nuit Intense Man', marca: 'ARMAF', categoria: 'Hombre', notas_olfativas: ['Especiado', 'Amaderado', 'Almizcado'], precio_referencial: 81000, imagen: '/perfumes/club-the-nuit-intense-man.webp', link_whatsapp: wa('Club the Nuit Intense Man') },
  { id: '34', nombre: 'Club De Nuit Urban Elixir', marca: 'ARMAF', categoria: 'Hombre', notas_olfativas: ['Especiado', 'Vainilla', 'Amaderado'], precio_referencial: 75000, imagen: '/perfumes/club-de-nuit-urban-elixir.webp', link_whatsapp: wa('Club De Nuit Urban Elixir') },
  { id: '35', nombre: 'Odyssey Mandarin Sky', marca: 'ARMAF', categoria: 'Unisex', notas_olfativas: ['Cítrico', 'Frutal', 'Almizcado'], precio_referencial: 69000, imagen: '/perfumes/odyssey-mandarin-sky.webp', link_whatsapp: wa('Odyssey Mandarin Sky') },
  { id: '36', nombre: 'Hawas Ice', marca: 'RASASI', categoria: 'Hombre', notas_olfativas: ['Cítrico', 'Acuático', 'Almizcado'], precio_referencial: 99000, imagen: '/perfumes/hawas-ice.webp', link_whatsapp: wa('Hawas Ice') },
  { id: '37', nombre: 'Hawas Black', marca: 'RASASI', categoria: 'Hombre', notas_olfativas: ['Oud', 'Amaderado', 'Almizcado'], precio_referencial: 79000, imagen: '/perfumes/hawas-black.webp', link_whatsapp: wa('Hawas Black') },
  { id: '38', nombre: 'Rasasi Hawas for Him', marca: 'RASASI', categoria: 'Hombre', notas_olfativas: ['Especiado', 'Amaderado', 'Almizcado'], precio_referencial: 65000, imagen: '/perfumes/rasasi-hawas-for-him.webp', link_whatsapp: wa('Rasasi Hawas for Him') },
  { id: '39', nombre: '9PM Elixir', marca: 'AFNAN', categoria: 'Hombre', notas_olfativas: ['Oud', 'Especiado', 'Almizcado'], precio_referencial: 92000, imagen: '/perfumes/9pm-elixir.webp', link_whatsapp: wa('9PM Elixir') },
  { id: '40', nombre: '9PM', marca: 'AFNAN', categoria: 'Hombre', notas_olfativas: ['Especiado', 'Vainilla', 'Amaderado'], precio_referencial: 70000, imagen: '/perfumes/9pm.webp', link_whatsapp: wa('9PM') },
  { id: '42', nombre: 'Al Haramain Gold Edition 120ml', marca: 'AL HARAMAIN', categoria: 'Unisex', notas_olfativas: ['Oud', 'Amaderado', 'Almizcado'], precio_referencial: 125000, imagen: '/perfumes/al-haramain-gold-edition-120ml.webp', link_whatsapp: wa('Al Haramain Gold Edition 120ml') },
  { id: '45', nombre: 'Ameerat al Arab', marca: 'ASDAAF', categoria: 'Mujer', notas_olfativas: ['Floral', 'Vainilla', 'Almizcado'], precio_referencial: 50000, imagen: '/perfumes/ameerat-al-arab.webp', link_whatsapp: wa('Ameerat al Arab') },
  { id: '46', nombre: 'Bharara King EDP 100ml', marca: 'BHARARA', categoria: 'Hombre', notas_olfativas: ['Oud', 'Especiado', 'Almizcado'], precio_referencial: 130000, imagen: '/perfumes/bharara-king-edp-100ml.webp', link_whatsapp: wa('Bharara King EDP 100ml') },
  { id: '47', nombre: 'Liquid Brun', marca: 'FRENCH AVENUE', categoria: 'Hombre', notas_olfativas: ['Especiado', 'Amaderado', 'Vainilla'], precio_referencial: 96000, imagen: '/perfumes/liquid-brun.webp', link_whatsapp: wa('Liquid Brun') },
]
