import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Pari Megarama — Coupe du Monde 2026',
  description: 'Pariez sur le match Brésil vs Maroc — Coupe du Monde 2026 au Megarama',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className="dark">
      <body className="bg-[#0a0a0a] text-white antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
