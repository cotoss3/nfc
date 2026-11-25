const BASE_URL = 'https://startap.com.pa';

// Negocio con ZONA DE SERVICIO: con cobertura en Ciudad de Panamá y envíos a todo Panamá.
const organizationSchema = {
  '@type': 'Organization',
  '@id': `${BASE_URL}/#organization`,
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
    'https://maps.app.goo.gl/MG3YyRykfUTvL4B79',
    'https://www.datakorex.com',
    'https://www.facebook.com/startap507',
    'https://www.tiktok.com/@startap507',
    'https://www.instagram.com/startap507',
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Ciudad de Panamá',
    addressRegion: 'Panamá',
    addressCountry: 'PA',
  },
  parentOrganization: {
    '@type': 'Organization',
    name: 'DataKorex',
    url: 'https://www.datakorex.com',
  },
};

const serviceSchema = {
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
    addressLocality: 'Ciudad de Panamá',
    addressRegion: 'Panamá',
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
  hasMap: 'https://maps.app.goo.gl/MG3YyRykfUTvL4B79',
  parentOrganization: { '@id': `${BASE_URL}/#organization` },
};

const websiteSchema = {
  '@type': 'WebSite',
  '@id': `${BASE_URL}/#website`,
  url: BASE_URL,
  name: 'starTAP Panamá',
  inLanguage: 'es-PA',
  publisher: { '@id': `${BASE_URL}/#organization` },
};

const storeSchema = {
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
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '5.0',
    reviewCount: '6',
    bestRating: '5',
    worstRating: '1',
  },
  areaServed: {
    '@type': 'Country',
    name: 'Panamá',
  },
  hasMap: 'https://maps.app.goo.gl/MG3YyRykfUTvL4B79',
  sameAs: [
    'https://maps.app.goo.gl/MG3YyRykfUTvL4B79',
    'https://www.datakorex.com',
    'https://www.facebook.com/startap507',
    'https://www.tiktok.com/@startap507',
    'https://www.instagram.com/startap507',
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Ciudad de Panamá',
    addressRegion: 'Panamá',
    addressCountry: 'PA',
  },
};

const unifiedGraphSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    organizationSchema,
    serviceSchema,
    websiteSchema,
    storeSchema,
  ],
};

export default function StructuredData() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(unifiedGraphSchema) }}
    />
  );
}

