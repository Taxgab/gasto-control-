import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'GastoControl',
  description: 'Registro y análisis de gastos personales y de Carpintería El Roble',
  applicationName: 'GastoControl',
  appleWebApp: {
    capable: true,
    title: 'GastoControl',
    statusBarStyle: 'default',
  },
  // iOS antiguo sólo respeta el nombre legacy del meta.
  other: { 'apple-mobile-web-app-capable': 'yes' },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: '#7a5c3d',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
