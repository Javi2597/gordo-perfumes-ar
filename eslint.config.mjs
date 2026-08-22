// ESLint 9 usa "flat config" y Next 16 quitó el comando `next lint`, así que
// `pnpm lint` llama a eslint directo y la config vive acá (antes: .eslintrc.json).
import coreWebVitals from 'eslint-config-next/core-web-vitals'
import typescript from 'eslint-config-next/typescript'

// Flat config no lee .gitignore: lo que se ignora hay que listarlo acá.
const config = [
  {
    ignores: [
      '.next/**',
      'out/**',
      'build/**',
      'dist/**',
      'node_modules/**',
      'next-env.d.ts',
      'temporal/**', // scratch local (backups de imágenes y scripts sueltos)
    ],
  },
  ...coreWebVitals,
  ...typescript,
]

export default config
