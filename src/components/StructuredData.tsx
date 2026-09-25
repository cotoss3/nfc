const BASE_URL = 'https://startap.com.pa';

// Negocio con ZONA DE SERVICIO: sin local físico de atención al público.
// Base de operaciones en Villa Alegre, Arraiján (Panamá Oeste); envíos a todo Panamá.
const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  '@id': `${BASE_URL}/#organization`,
  // "starTAP" a secas choca con startap.pro, startap.com.ar, startap.lat y
  // otros homonimos. El nombre canonico de la entidad lleva Panamá; las
  // variantes quedan como alternateName para que Google las asocie igual.
  name: 'starTAP Panamá',
  alternateName: ['starTAP', 'StarTAP', 'Star TAP'],
  url: BASE_URL,
  logo: `${BASE_URL}/logos/Logo.webp`,
  description:
    'Dispositivos NFC y códigos QR para que los negocios en Panamá multipliquen sus reseñas de Google Maps, sin mensualidades.',
  telephone: '+507 6483-9004',
  email: 'info@startap.com.pa',
  areaServed: {
    '@type': 'Country',
    name: 'Panamá',
  },
  sameAs: [
    'https://www.datakorex.com',
    'https://www.facebook.com/profile.php?id=61594455868652',
  ],
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
  name: 'starTAP Panamá',
  image: `${BASE_URL}/logos/Logo.webp`,
  url: BASE_URL,
  telephone: '+507 6483-9004',
  priceRange: '$$',
  currenciesAccepted: 'USD',
  paymentAccepted: 'Yappy, Visa, Mastercard',
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

const storeSchema = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  '@id': `${BASE_URL}/#store`,
  name: 'starTAP Panamá',
  alternateName: ['StarTAP', 'starTAP'],
  url: BASE_URL,
  logo: `${BASE_URL}/logos/Logo.webp`,
  image: `${BASE_URL}/images/posicionamiento-seo-google-maps-panama-startap.webp`,
  description:
    'Venta de placas y tarjetas NFC contactless en Panamá para captar reseñas de Google Maps sin pagos mensuales ni suscripciones.',
  telephone: '+507 6483-9004',
  email: 'info@startap.com.pa',
  priceRange: '$20.00 - $50.00',
  currenciesAccepted: 'USD',
  paymentAccepted: 'Yappy, Visa, Mastercard',
  areaServed: {
    '@type': 'Country',
    name: 'Panamá',
  },
  sameAs: [
    'https://www.datakorex.com',
    'https://www.facebook.com/profile.php?id=61594455868652',
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Arraiján',
    addressRegion: 'Panamá Oeste',
    addressCountry: 'PA',
  },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(storeSchema) }}
      />
    </>
  );
}

