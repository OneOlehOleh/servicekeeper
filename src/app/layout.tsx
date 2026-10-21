import type { Metadata, Viewport } from 'next';
import './globals.css';
import { GarageProvider } from '@/context/GarageContext';

export const metadata: Metadata = {
  title: 'МотоЖурнал — Сервисный учет гаража',
  description: 'Офлайн-журнал ТО моточасов и пробега: мотоциклы, лодочные моторы, питбайки, авто и техника',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'МотоЖурнал',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#020617',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" className="dark">
      <head>
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen selection:bg-amber-500 selection:text-slate-950">
        <GarageProvider>{children}</GarageProvider>
      </body>
    </html>
  );
}
