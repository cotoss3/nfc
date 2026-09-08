/**
 * Copy de las landings de producto.
 * Para añadir o cambiar una landing NO se toca el componente: se edita este archivo.
 *
 * ⚠️ REVISAR ANTES DE PUBLICAR: los valores de `envio` y `garantia` son los términos
 * comerciales que se le prometen al cliente. Ajustarlos a la política real.
 */

export interface LandingBeneficio {
  titulo: string;
  texto: string;
  icono: 'zap' | 'shield' | 'sparkles';
  /** Texto alt de la foto que acompaña al beneficio (importante para SEO de imágenes) */
  imagenAlt: string;
}

export interface LandingCopy {
  /** ids de producto que usan esta landing */
  ids: string[];
  etiqueta: string;
  h1: string;
  h1Destacado: string;
  subtitulo: string;
  nombreCorto: string; // "Stand", "Tarjeta", "Placa"
  heroImagenAlt: string;
  beneficios: LandingBeneficio[];
  pasos: { titulo: string; texto: string }[];
  faqs: { q: string; a: string }[];
  coloresPorDefecto: string[];
}

/** Condiciones comerciales compartidas — REVISAR */
export const CONDICIONES = {
  envio: {
    titulo: 'Envío a todo Panamá',
    texto: 'Entregamos en Ciudad de Panamá y Panamá Oeste en 24 a 48 horas. Al resto del país, de 2 a 4 días hábiles.',
  },
  garantia: {
    titulo: 'Garantía de 12 meses',
    texto: 'Si el chip NFC deja de funcionar por defecto de fábrica, te reponemos el dispositivo sin costo.',
  },
  pago: {
    titulo: 'Yappy o tarjeta',
    texto: 'Paga con Yappy desde tu banco o con tarjeta de crédito. Facturamos con RUC a nombre de tu empresa.',
  },
  soporte: {
    titulo: 'Te configuramos el enlace',
    texto: 'Te lo entregamos programado y apuntando a tu ficha de Google. Si necesitas cambiarlo, lo haces tú desde el panel.',
  },
};

export const WHATSAPP_URL = 'https://wa.me/50767134341';
export const WHATSAPP_NUMERO = '+507 6713-4341';

/**
 * Testimonios reales de clientes.
 * Se deja VACÍO a propósito: la sección solo aparece cuando hay testimonios de verdad.
 * Nunca inventar reseñas — va contra las políticas de Google y contra lo que vende starTAP.
 * Formato: { texto, autor, negocio, ciudad }
 */
export const TESTIMONIOS: {
  texto: string;
  autor: string;
  negocio: string;
  ciudad: string;
}[] = [];

export const LANDINGS: LandingCopy[] = [
  {
    ids: ['stand-nfc'],
    etiqueta: 'El más usado en mostradores',
    h1: 'Multiplica tus reseñas en Google.',
    h1Destacado: 'Sin esfuerzo.',
    subtitulo:
      'El Stand NFC es tu vendedor silencioso. Colócalo en tu mostrador o mesa y tus clientes satisfechos te dejan reseñas de 5 estrellas en segundos.',
    nombreCorto: 'Stand',
    heroImagenAlt:
      'Stand NFC starTAP para reseñas de Google sobre el mostrador de un negocio en Panamá',
    beneficios: [
      {
        titulo: 'Más rápido que un QR de papel',
        texto:
          'Olvídate de pedirle al cliente que abra la cámara y enfoque un código arrugado. Con NFC —la misma tecnología con la que pagas con el móvil— solo acerca el teléfono al Stand y le aparece la pantalla de reseña.',
        icono: 'zap',
        imagenAlt: 'Cliente acercando su celular a un stand NFC para dejar una reseña de Google',
      },
      {
        titulo: 'Acrílico de alta resistencia',
        texto:
          'Diseñado para el tráfico de comercios, restaurantes y clínicas. Soporta rayones, líquidos y caídas ligeras. Su base pesada evita que se caiga en mostradores concurridos.',
        icono: 'shield',
        imagenAlt: 'Detalle del acabado en acrílico del stand NFC starTAP',
      },
    ],
    pasos: [
      { titulo: 'Colócalo a la vista', texto: 'En tu caja registradora, recepción o mesas. Su diseño llama la atención.' },
      { titulo: 'El cliente acerca su móvil', texto: 'Le aparece un aviso en pantalla. No descarga nada.' },
      { titulo: 'Recibes tus 5 estrellas', texto: 'Llega directo a la pantalla de reseña de tu ficha de Google.' },
    ],
    faqs: [
      { q: '¿Necesito pagar alguna mensualidad o suscripción?', a: 'No, el pago es único. Compras tu Stand NFC una vez y te funciona para siempre, sin cobros ocultos ni mantenimiento.' },
      { q: '¿Funciona con iPhone y Android?', a: 'Sí. Todos los smartphones modernos traen lector NFC integrado. Para modelos antiguos, el Stand incluye un código QR grabado.' },
      { q: '¿Cómo configuran el enlace hacia mi negocio?', a: 'Al procesar tu pedido programamos el chip para que apunte a tu perfil de Google Maps. Te llega listo para usar.' },
      { q: '¿Si cambio la ubicación de mi local, debo comprar otro Stand?', a: 'No. Desde tu panel actualizas el enlace hacia donde dirige el Stand en cualquier momento, sin costo.' },
      { q: '¿Puedo pedirle la reseña solo a los clientes contentos?', a: 'No, y no conviene. Filtrar reseñas va contra las políticas de Google y puede costarte la ficha. El Stand se le ofrece a todos por igual: lo que sube tu promedio es el volumen de clientes satisfechos.' },
    ],
    coloresPorDefecto: ['Negro Mate', 'Blanco Brillante', 'Dorado Espejo', 'Plata Cepillado'],
  },
  {
    ids: ['tarjeta-nfc', 'placa-google'],
    etiqueta: 'Para equipos y personal de servicio',
    h1: 'Cierra tratos y recolecta reseñas',
    h1Destacado: 'donde vayas.',
    subtitulo:
      'Lleva el SEO local y el networking en el bolsillo. Ideal para meseros, vendedores, ejecutivos y emprendedores en Panamá que buscan impresionar al toque.',
    nombreCorto: 'Tarjeta',
    heroImagenAlt:
      'Tarjeta NFC starTAP para reseñas de Google, tamaño billetera, en la mano de un vendedor',
    beneficios: [
      {
        titulo: 'Ideal para equipos de ventas y personal de servicio',
        texto:
          'Del tamaño de una tarjeta de crédito (8.5 × 5.4 cm) y muy delgada. Cabe en la billetera o se cuelga con un lanyard. Cada miembro del equipo puede llevar la suya y ver cuántos escaneos genera.',
        icono: 'zap',
        imagenAlt: 'Mesero mostrando una tarjeta NFC starTAP a un cliente en un restaurante de Panamá',
      },
      {
        titulo: 'Materiales premium: PVC técnico y madera maciza',
        texto:
          'El chip va sellado dentro de la tarjeta, así que aguanta el uso diario, el roce del bolsillo y la humedad. Acabados en PVC técnico o en madera de bambú y nogal.',
        icono: 'shield',
        imagenAlt: 'Tarjetas NFC starTAP en acabado de madera de bambú y PVC negro',
      },
    ],
    pasos: [
      { titulo: 'Entrégala o acércala', texto: 'En la mesa, en la silla o al cerrar la venta. No hay que moverse del puesto.' },
      { titulo: 'El cliente acerca su móvil', texto: 'Un toque y se abre el enlace que tú configuraste.' },
      { titulo: 'Reseña o contacto guardado', texto: 'Puede apuntar a tu ficha de Google, a WhatsApp o a tu perfil.' },
    ],
    faqs: [
      { q: '¿Puedo llevar la tarjeta en la billetera o colgarla al cuello?', a: 'Sí. Tiene el tamaño estándar de una tarjeta de crédito (8.5 × 5.4 cm), es fina y resistente. Muchos negocios en Panamá la usan con lanyard para su personal de servicio.' },
      { q: '¿Necesito pagar alguna suscripción mensual?', a: 'No. La tarjeta NFC starTAP es de pago único. No cobramos mensualidades por usarla ni por acceder a tu panel.' },
      { q: '¿Qué pasa si cambio de empleo o de red social?', a: 'Desde tu panel gratuito cambias el enlace hacia donde dirige la tarjeta al instante, cuantas veces quieras, sin comprar otra.' },
      { q: '¿Funciona con cualquier teléfono inteligente?', a: 'Sí, con iPhone y Android mediante el chip NFC, o con el código QR grabado en el reverso.' },
      { q: '¿Puedo saber qué vendedor genera más reseñas?', a: 'Sí. Cada tarjeta tiene su propio código y su propio contador de escaneos en el panel.' },
    ],
    coloresPorDefecto: ['Negro Premium', 'Blanco Premium', 'Madera Bambú', 'Madera Nogal'],
  },
  {
    ids: ['placa-acrilica-nfc', 'NFC_10001'],
    etiqueta: 'Se instala sin taladrar',
    h1: 'Transforma cada rincón en',
    h1Destacado: 'reseñas de 5 estrellas.',
    subtitulo:
      'La placa acrílica adhesiva NFC es la solución para mesas de restaurantes, puertas de cristal, mostradores y paredes de clínicas o locales comerciales en Panamá.',
    nombreCorto: 'Placa',
    heroImagenAlt:
      'Placa acrílica NFC starTAP adherida al mostrador de un local comercial en Panamá',
    beneficios: [
      {
        titulo: 'Fácil instalación, sin taladrar ni romper paredes',
        texto:
          'Todas las placas incluyen adhesivo 3M de grado industrial en el reverso. Despegas la cinta protectora y la fijas en cristal, madera, azulejo o acrílico. Sin perforar y sin taladro.',
        icono: 'zap',
        imagenAlt: 'Instalación de una placa NFC adhesiva sobre una puerta de cristal',
      },
      {
        titulo: 'Impermeable y resistente al tráfico constante',
        texto:
          'El chip NFC va sellado dentro del acrílico de 3 mm. Aguanta el calor de Panamá, las salpicaduras y la limpieza diaria sin dañarse.',
        icono: 'shield',
        imagenAlt: 'Placa NFC acrílica resistiendo salpicaduras de agua',
      },
    ],
    pasos: [
      { titulo: 'Pégala donde pasa el cliente', texto: 'Mesa, mostrador, puerta de cristal o pared de recepción.' },
      { titulo: 'El cliente acerca su móvil', texto: 'Sin apps y sin pedirle datos.' },
      { titulo: 'Llega tu reseña', texto: 'Directo a la pantalla de calificación de tu ficha de Google.' },
    ],
    faqs: [
      { q: '¿Cómo se instala la placa en mi local o restaurante?', a: 'Incluye adhesivo 3M ultrarresistente de grado industrial en el reverso. Despegas la cinta protectora y la fijas en cristal, madera, azulejo o acrílico, sin perforar ni usar taladro.' },
      { q: '¿Soporta la intemperie o salpicaduras de agua?', a: 'Sí. El chip NFC está sellado dentro del cuerpo de acrílico de 3 mm. Es impermeable, resiste el calor de Panamá y no sufre daños por salpicaduras.' },
      { q: '¿Puedo cambiar el enlace si cambio de ubicación?', a: 'Sí. Con el panel incluido actualizas el enlace hacia donde dirige la placa en cualquier momento, desde el celular.' },
      { q: '¿Cobran mensualidades por usar la placa?', a: 'No. Es un pago único por el dispositivo, sin suscripciones obligatorias ni renovaciones anuales.' },
      { q: '¿Puedo poner varias placas en el mismo local?', a: 'Sí, y suele rendir más. Cada placa tiene su propio código y puedes ver desde cuál llegan más escaneos.' },
    ],
    coloresPorDefecto: ['Blanco Acrílico', 'Negro Mate', 'Dorado Espejo', 'Plata Pulido'],
  },
];

export function getLandingCopy(productId: string): LandingCopy | undefined {
  return LANDINGS.find((l) => l.ids.includes(productId));
}
