# Terpeno's Fragrances — Catálogo de Perfumes AR

Sitio web de catálogo de perfumes de alta gama para el mercado argentino. Permite explorar la colección, filtrar por aroma, y contactar directamente por WhatsApp para consultas y pedidos.

## Stack

- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Animaciones:** Framer Motion + Lottie Web
- **Iconos:** Lucide React
- **Gestor de paquetes:** pnpm

## Estructura

```
app/
  layout.tsx        # Layout raíz
  page.tsx          # Página principal (one-page)
components/
  Navbar.tsx        # Navegación con menú hamburguesa y animaciones Lottie
  HeroSection.tsx   # Hero con llamada a la acción
  NosotrosSection.tsx
  CatalogSection.tsx  # Grilla de productos con búsqueda y filtros
  FilterBar.tsx
  AromaFilter.tsx
  SearchBar.tsx
  ProductCard.tsx
  FaqSection.tsx
  LottieIcon.tsx
```

## Correr localmente

```bash
# Instalar dependencias
pnpm install

# Servidor de desarrollo
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en el navegador.

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` | Build de producción |
| `pnpm start` | Servidor de producción |
| `pnpm lint` | Linter |
