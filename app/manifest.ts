import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'GastoControl',
    short_name: 'GastoControl',
    description:
      'Registro y análisis de gastos personales y de Carpintería El Roble',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    background_color: '#f5f1eb',
    theme_color: '#7a5c3d',
    lang: 'es-AR',
    icons: [
      { src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}
