import type { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'Tarjetas y Placas NFC para Reseñas de Google | starTAP Panamá',
  description:
    'Aumenta tus clientes y valoraciones en Google Maps con placas y tarjetas NFC contactless. Envío en Panamá. Sin pagos mensuales ni suscripciones. ¡Compra hoy!',
  alternates: {
    canonical: 'https://startap.com.pa/',
  },
  openGraph: {
    title: 'Tarjetas y Placas NFC para Reseñas de Google | starTAP Panamá',
    description:
      'Aumenta tus clientes y valoraciones en Google Maps con placas y tarjetas NFC contactless. Envío en Panamá. Sin pagos mensuales ni suscripciones. ¡Compra hoy!',
    url: 'https://startap.com.pa/',
    siteName: 'starTAP Panamá',
    locale: 'es_PA',
    type: 'website',
  },
};

export default function Page() {
  const jsonLdSchema = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'LocalBusiness',
        '@id': 'https://startap.com.pa/#organization',
        'name': 'starTAP Panamá',
        'alternateName': ['starTAP', 'StarTAP', 'Star TAP'],
        'url': 'https://startap.com.pa/',
        'logo': 'https://startap.com.pa/logos/Logo.webp',
        'image': 'https://startap.com.pa/images/posicionamiento-seo-google-maps-panama-startap.webp',
        'description': 'Dispositivos NFC y códigos QR para que negocios en Panamá multipliquen sus reseñas de Google Maps, sin mensualidades.',
        'telephone': '+507 6713-4341',
        'email': 'info@datakorex.com',
        'priceRange': '$20.00 - $50.00',
        'currenciesAccepted': 'USD',
        'paymentAccepted': 'Yappy, Visa, Mastercard',
        'areaServed': {
          '@type': 'Country',
          'name': 'Panamá'
        },
        'address': {
          '@type': 'PostalAddress',
          'addressLocality': 'Arraiján',
          'addressRegion': 'Panamá Oeste',
          'addressCountry': 'PA'
        },
        'sameAs': [
          'https://www.datakorex.com',
          'https://www.facebook.com/profile.php?id=61594455868652'
        ],
        'parentOrganization': {
          '@type': 'Organization',
          'name': 'DataKorex',
          'url': 'https://www.datakorex.com'
        }
      },
      {
        '@type': 'Product',
        'name': 'Tarjeta NFC de Bolsillo',
        'description': 'Tarjeta PVC ultrarresistente tamaño tarjeta de crédito. Llévala en tu billetera o portacredencial para solicitar valoraciones en entregas, visitas técnicas o eventos.',
        'image': 'https://startap.com.pa/products/tarjeta-nfc/tarjeta-nfc-bolsillo-resenas-google-panama.webp',
        'brand': { '@type': 'Brand', 'name': 'starTAP Panamá' },
        'sku': 'STP-NFC-CARD-01',
        'mpn': 'STP-CRD-01',
        'gtin13': '0745301294801',
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': '4.9',
          'reviewCount': '128',
          'bestRating': '5',
          'worstRating': '1'
        },
        'offers': {
          '@type': 'Offer',
          'price': '20.00',
          'priceCurrency': 'USD',
          'availability': 'https://schema.org/InStock',
          'itemCondition': 'https://schema.org/NewCondition',
          'url': 'https://startap.com.pa/catalogo/tarjeta-nfc-bolsillo',
          'seller': { '@id': 'https://startap.com.pa/#organization' },
          'hasMerchantReturnPolicy': {
            '@type': 'MerchantReturnPolicy',
            'applicableCountry': 'PA',
            'returnPolicyCategory': 'https://schema.org/MerchantReturnFiniteReturnWindow',
            'merchantReturnDays': 90,
            'returnMethod': 'https://schema.org/ReturnByMail',
            'returnFees': 'https://schema.org/FreeReturn'
          },
          'shippingDetails': {
            '@type': 'OfferShippingDetails',
            'shippingRate': {
              '@type': 'MonetaryAmount',
              'value': '3.50',
              'currency': 'USD'
            },
            'shippingDestination': {
              '@type': 'DefinedRegion',
              'addressCountry': 'PA'
            }
          }
        }
      },
      {
        '@type': 'Product',
        'name': 'Placa NFC para Reseñas de Google',
        'description': 'Acrílico blanco pulido de 3mm con adhesivo 3M. Colócala en la caja registradora o recepción para que los clientes califiquen antes de salir de tu negocio.',
        'image': 'https://startap.com.pa/products/NFC_10001/NFC_10001_Placa.webp',
        'brand': { '@type': 'Brand', 'name': 'starTAP Panamá' },
        'sku': 'STP-NFC-PLACA-01',
        'mpn': 'STP-PLC-01',
        'gtin13': '0745301294818',
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': '5.0',
          'reviewCount': '184',
          'bestRating': '5',
          'worstRating': '1'
        },
        'offers': {
          '@type': 'Offer',
          'price': '30.00',
          'priceCurrency': 'USD',
          'availability': 'https://schema.org/InStock',
          'itemCondition': 'https://schema.org/NewCondition',
          'url': 'https://startap.com.pa/catalogo/placa-nfc-mostrador',
          'seller': { '@id': 'https://startap.com.pa/#organization' },
          'hasMerchantReturnPolicy': {
            '@type': 'MerchantReturnPolicy',
            'applicableCountry': 'PA',
            'returnPolicyCategory': 'https://schema.org/MerchantReturnFiniteReturnWindow',
            'merchantReturnDays': 90,
            'returnMethod': 'https://schema.org/ReturnByMail',
            'returnFees': 'https://schema.org/FreeReturn'
          },
          'shippingDetails': {
            '@type': 'OfferShippingDetails',
            'shippingRate': {
              '@type': 'MonetaryAmount',
              'value': '3.50',
              'currency': 'USD'
            },
            'shippingDestination': {
              '@type': 'DefinedRegion',
              'addressCountry': 'PA'
            }
          }
        }
      },
      {
        '@type': 'Product',
        'name': 'Stand NFC para Reseñas de Google',
        'description': 'Estructura rígida autoportante con ángulo de lectura optimizado para mesas y escritorios. Permite al cliente escanear o acercar el teléfono cómodamente.',
        'image': 'https://startap.com.pa/products/NFC10002/NFC_10002_Stan.webp',
        'brand': { '@type': 'Brand', 'name': 'starTAP Panamá' },
        'sku': 'STP-NFC-STAND-01',
        'mpn': 'STP-STD-01',
        'gtin13': '0745301294825',
        'aggregateRating': {
          '@type': 'AggregateRating',
          'ratingValue': '4.9',
          'reviewCount': '96',
          'bestRating': '5',
          'worstRating': '1'
        },
        'offers': {
          '@type': 'Offer',
          'price': '35.00',
          'priceCurrency': 'USD',
          'availability': 'https://schema.org/InStock',
          'itemCondition': 'https://schema.org/NewCondition',
          'url': 'https://startap.com.pa/catalogo/stand-nfc-mesa',
          'seller': { '@id': 'https://startap.com.pa/#organization' },
          'hasMerchantReturnPolicy': {
            '@type': 'MerchantReturnPolicy',
            'applicableCountry': 'PA',
            'returnPolicyCategory': 'https://schema.org/MerchantReturnFiniteReturnWindow',
            'merchantReturnDays': 90,
            'returnMethod': 'https://schema.org/ReturnByMail',
            'returnFees': 'https://schema.org/FreeReturn'
          },
          'shippingDetails': {
            '@type': 'OfferShippingDetails',
            'shippingRate': {
              '@type': 'MonetaryAmount',
              'value': '3.50',
              'currency': 'USD'
            },
            'shippingDestination': {
              '@type': 'DefinedRegion',
              'addressCountry': 'PA'
            }
          }
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
              'text': 'Enviamos a todas las provincias de Panamá por Uno Express y mensajería local. Las entregas en Ciudad de Panamá toman de 24 a 48 horas. Al finalizar la compra puedes seleccionar pago con tarjeta Visa, Mastercard o directamente por Yappy.'
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
