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

const storeSchema = {
  '@context': 'https://schema.org',
  '@type': 'Store',
  '@id': `${BASE_URL}/#store`,
  name: 'StarTAP Panamá',
  alternateName: ['StarTAP', 'starTAP'],
  url: BASE_URL,
  logo: `${BASE_URL}/logos/Logo.png`,
  image: `${BASE_URL}/images/posicionamiento-seo-google-maps-panama-startap.webp`,
  description:
    'Venta de placas y tarjetas NFC contactless en Panamá para captar reseñas de Google Maps sin pagos mensuales ni suscripciones.',
  telephone: '+507 6713-4341',
  priceRange: '$$',
  currenciesAccepted: 'USD',
  paymentAccepted: 'Yappy, Tarjeta de crédito, Transferencia Bancaria',
  areaServed: {
    '@type': 'Country',
    name: 'Panamá',
  },
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'San Francisco',
    addressRegion: 'Ciudad de Panamá',
    addressCountry: 'PA',
  },
};

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cómo funcionan las placas y tarjetas NFC en Panamá?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Nuestros dispositivos contienen un microchip NFC inteligente incorporado y un código QR de alta resolución. Cuando un cliente acerca su teléfono inteligente a la placa o tarjeta, se detecta el chip electromagnéticamente y se abre de forma automática el enlace de reseñas de tu negocio. El proceso tarda solo 2 segundos y no requiere la descarga de ninguna aplicación.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Necesito pagar alguna mensualidad o suscripción recurrente?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No, el pago es único de por vida. Compras tu placa o tarjeta NFC una sola vez y funciona para siempre sin cobros ocultos ni mantenimiento.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Es compatible con cualquier teléfono móvil (iPhone y Android)?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Todos los smartphones modernos (iPhone y Android) cuentan con lector NFC integrado. Para modelos antiguos, el dispositivo incluye un código QR grabado para compatibilidad del 100%.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Cómo se manejan los envíos en Ciudad de Panamá y provincias?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Ofrecemos envíos express a residencia u oficina en 24-48 horas en Ciudad de Panamá ($3.75) o retiro directo en San Francisco ($3.00). Para el interior del país enviamos vía Uno Express ($6.50) y Servientrega ($7.50).',
      },
    },
  ],
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  );
}
