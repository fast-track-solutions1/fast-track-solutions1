import 'leaflet/dist/leaflet.css';
import type { Metadata } from 'next';
import 'leaflet/dist/leaflet.css';  // ← Ajoute ceci
import './globals.css';

export const metadata: Metadata = {
  title: 'MSI TeamHub',
  description: 'HR Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
