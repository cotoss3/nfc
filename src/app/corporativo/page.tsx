import type { Metadata } from 'next';
import CorporativoClient from './CorporativoClient';

const BASE_URL = 'https://startap.com.pa';

export const metadata: Metadata = {
  title: 'Servicio de SEO Local & Planes Corporativos en Panamá | starTAP',
  description:
    'Servicio de SEO Local, posicionamiento móvil y soluciones B2B multi-sucursal en Panamá. Convierte tus locales en Top Local Business en Google Maps y potencia tu tienda online.',
  keywords: [
    'servicio seo local panama',
    'top local business panama',
    'posicionamiento movil en panama',
    'posicionamiento tienda online en panama',
    'planes corporativos nfc panama',
    'seo local panama',
    'marketing nfc empresas panama',
  ],
  alternates: { canonical: `${BASE_URL}/corporativo` },
  openGraph: {
    title: 'Servicio de SEO Local & Planes Corporativos en Panamá | starTAP',
    description:
      'Servicio de SEO Local, posicionamiento móvil y soluciones B2B multi-sucursal en Panamá. Convierte tus locales en Top Local Business en Google Maps.',
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
