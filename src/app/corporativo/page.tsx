import type { Metadata } from 'next';
import CorporativoClient from './CorporativoClient';

const BASE_URL = 'https://startap.com.pa';

export const metadata: Metadata = {
  title: 'Planes Corporativos y Multi-Sucursal para Reseñas NFC en Panamá',
  description:
    'Gestiona y multiplica las reseñas de Google Maps de todas tus sucursales en Panamá desde un solo panel. Dispositivos NFC en volumen, logo impreso y facturación B2B.',
  alternates: { canonical: `${BASE_URL}/corporativo` },
  openGraph: {
    title: 'Planes Corporativos y Multi-Sucursal para Reseñas NFC en Panamá | starTAP',
    description:
      'Gestiona las reseñas de Google de todas tus sucursales en Panamá desde un solo panel. Dispositivos NFC personalizados en volumen.',
    url: `${BASE_URL}/corporativo`,
    siteName: 'starTAP Panamá',
  },
};

export default function Page() {
  const corporateSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: 'Planes Corporativos y Multi-Sucursal starTAP Panamá',
    provider: { '@id': `${BASE_URL}/#organization` },
    areaServed: { '@type': 'Country', name: 'Panamá' },
    description:
      'Solución empresarial para cadenas, franquicias y grupos comerciales en Panamá que buscan centralizar y escalar la captura de reseñas de Google Maps en múltiples sucursales.',
    serviceType: 'Marketing SEO Local y Hardware NFC',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(corporateSchema) }}
      />
      <CorporativoClient />
    </>
  );
}
