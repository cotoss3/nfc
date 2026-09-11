import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Placas NFC para Reseñas de Google en Panamá | StarTAP',
  description:
    'Aumenta tus clientes y valoraciones en Google Maps con placas y tarjetas NFC contactless. Envío en Panamá. Sin pagos mensuales ni suscripciones. ¡Compra hoy!',
  alternates: {
    canonical: 'https://startap.com.pa/',
  },
  openGraph: {
    title: 'Placas NFC para Reseñas de Google en Panamá | StarTAP',
    description:
      'Aumenta tus clientes y valoraciones en Google Maps con placas y tarjetas NFC contactless. Envío en Panamá. Sin pagos mensuales ni suscripciones. ¡Compra hoy!',
    url: 'https://startap.com.pa/',
    siteName: 'StarTAP Panamá',
    locale: 'es_PA',
    type: 'website',
  },
};

export default function Page() {
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Store',
        '@id': 'https://startap.com.pa/#store',
        'name': 'StarTAP Panamá',
        'url': 'https://startap.com.pa/',
        'logo': 'https://startap.com.pa/images/logo.png',
        'image': 'https://startap.com.pa/images/startap_negocio_resenas.webp',
        'description': 'Placas y tarjetas NFC contactless para captar opiniones de Google Maps en comercios y restaurantes de Panamá.',
        'priceRange': '$20.00 - $50.00',
        'telephone': '+50765239821',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': 'San Francisco, Vía Porras',
          'addressLocality': 'Ciudad de Panamá',
          'addressRegion': 'Panamá',
          'addressCountry': 'PA'
        }
      },
      {
        '@type': 'Product',
        'name': 'Tarjeta NFC de Bolsillo',
        'description': 'Tarjeta PVC ultrarresistente tamaño tarjeta de crédito. Llévala en tu billetera o portacredencial para solicitar valoraciones en entregas, visitas técnicas o eventos.',
        'image': 'https://startap.com.pa/products/tarjeta-nfc/tarjeta-nfc-bolsillo-resenas-google-panama.webp',
        'offers': {
          '@type': 'Offer',
          'price': '20.00',
          'priceCurrency': 'USD',
          'availability': 'https://schema.org/InStock',
          'url': 'https://startap.com.pa/catalogo'
        }
      },
      {
        '@type': 'Product',
        'name': 'Placa NFC para Reseñas de Google',
        'description': 'Acrílico blanco pulido de 3mm con adhesivo 3M. Colócala en la caja registradora o recepción para que los clientes califiquen antes de salir de tu negocio.',
        'image': 'https://startap.com.pa/products/NFC_10001/NFC_10001_Placa.webp',
        'offers': {
          '@type': 'Offer',
          'price': '30.00',
          'priceCurrency': 'USD',
          'availability': 'https://schema.org/InStock',
          'url': 'https://startap.com.pa/catalogo'
        }
      },
      {
        '@type': 'Product',
        'name': 'Stand NFC para Reseñas de Google',
        'description': 'Estructura rígida autoportante con ángulo de lectura optimizado para mesas y escritorios. Permite al cliente escanear o acercar el teléfono cómodamente.',
        'image': 'https://startap.com.pa/products/NFC10002/NFC_10002_Stan.webp',
        'offers': {
          '@type': 'Offer',
          'price': '35.00',
          'priceCurrency': 'USD',
          'availability': 'https://schema.org/InStock',
          'url': 'https://startap.com.pa/catalogo'
        }
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          {
            '@type': 'Question',
            'name': '¿Requiere alguna aplicación para el cliente?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'No. El cliente no necesita descargar ni instalar nada en su celular. Al acercar su smartphone a la placa o escanear el código QR impreso, el navegador del teléfono abre de inmediato la ventana de 5 estrellas de tu negocio en Google Maps.'
            }
          },
          {
            '@type': 'Question',
            'name': '¿Cómo se configura con mi negocio?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Nosotros nos encargamos de la programación. Al hacer tu pedido ingresas el nombre de tu establecimiento tal como figura en Google Maps. Programamos el chip NFC y el código QR antes del despacho para que recibas el producto listo para usar en tu mostrador.'
            }
          },
          {
            '@type': 'Question',
            'name': '¿Tengo que pagar mensualidades o suscripciones?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'No. Haces un solo pago por el equipo físico. El chip NFC, el código QR y el acceso al portal de gestión de enlaces están incluidos de por vida sin cuotas ni pagos recurrentes.'
            }
          },
          {
            '@type': 'Question',
            'name': '¿Hacen envíos al interior del país y cómo se paga por Yappy?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Enviamos a todas las provincias de Panamá por Uno Express y mensajería local. Las entregas en Ciudad de Panamá toman de 24 a 48 horas. Al finalizar la compra puedes seleccionar pago por Yappy, tarjeta de crédito o transferencia ACH.'
            }
          },
          {
            '@type': 'Question',
            'name': '¿Qué pasa si el teléfono del cliente no tiene NFC?',
            'acceptedAnswer': {
              '@type': 'Answer',
              'text': 'Todos los productos StarTAP incluyen un código QR vectorizado impreso en la superficie. Si un cliente utiliza un celular sin lector NFC, solo abre la cámara de su teléfono, enfoca el código QR y accede exactamente al mismo formulario de calificación.'
            }
          }
        ]
      }
    ]
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSchema) }}
      />
      <HomeClient />
    </>
  );
}
