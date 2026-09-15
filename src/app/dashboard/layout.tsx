import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Administrador de Tarjetas NFC | starTAP Panamá',
  description: 'Panel de administración privada para tarjetas, placas NFC y ruteo dinámico de enlaces de starTAP Panamá.',
  robots: {
    index: false,
    follow: false,
    nocache: true,
    googleBot: {
      index: false,
      follow: false,
      noimageindex: true,
      'max-video-preview': -1,
      'max-image-preview': 'none',
      'max-snippet': -1,
    },
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dashboard-root min-h-screen bg-brand-50">
      {children}
    </div>
  );
}
