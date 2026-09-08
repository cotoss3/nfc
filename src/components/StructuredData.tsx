const BASE_URL = 'https://startap.com.pa';

// Negocio con ZONA DE SERVICIO: sin local físico de atención al público.
// Base de operaciones en Villa Alegre, Arraiján (Panamá Oeste); envíos a todo Panamá.
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE_URL}/#organization`,
  name: 'starTAP',
  alternateName: 'starTAP Panamá',
  url: BASE_URL,
  logo: `${BASE_URL}/logos/Logo.webp`,
  description:
    'Dispositivos NFC y códigos QR para que los negocios en Panamá multipliquen sus reseñas de Google Maps, sin mensualidades.',
  telephone: '+507 6713-4341',
  areaServed: {
    '@type': 'Country',
    name: 'Panamá',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Arraiján',
    addressRegion: 'Panamá Oeste',
    addressCountry: 'PA',
  },
  parentOrganization: {
    '@type': 'Organization',
    name: 'DataKorex',
    url: 'https://www.datakorex.com',
  },
};

const serviceSchema = {
  '@context': 'https://schema.org',
  '@type': 'ProfessionalService',
  '@id': `${BASE_URL}/#service`,
  name: 'starTAP',
  image: `${BASE_URL}/logos/Logo.webp`,
  url: BASE_URL,
  telephone: '+507 6713-4341',
  priceRange: '$$',
  currenciesAccepted: 'USD',
  paymentAccepted: 'Yappy, Tarjeta de crédito, Transferencia',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Arraiján',
    addressRegion: 'Panamá Oeste',
    addressCountry: 'PA',
  },
  areaServed: [
    { '@type': 'AdministrativeArea', name: 'Panamá' },
    { '@type': 'AdministrativeArea', name: 'Panamá Oeste' },
    { '@type': 'City', name: 'Ciudad de Panamá' },
    { '@type': 'City', name: 'Arraiján' },
    { '@type': 'City', name: 'La Chorrera' },
    { '@type': 'City', name: 'San Miguelito' },
    { '@type': 'City', name: 'Colón' },
    { '@type': 'City', name: 'David' },
  ],
  parentOrganization: { '@id': `${BASE_URL}/#organization` },
};

const websiteSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  url: BASE_URL,
  name: 'starTAP Panamá',
  inLanguage: 'es-PA',
  publisher: { '@id': `${BASE_URL}/#organization` },
};

export default function StructuredData() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
