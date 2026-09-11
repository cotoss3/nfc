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

export const TESTIMONIOS: {
  texto: string;
  autor: string;
  negocio: string;
  ciudad: string;
}[] = [];

export const LANDINGS: LandingCopy[] = [
  {
    ids: ['stand-nfc-mesa', 'stand-nfc', 'NFC10002'],
    etiqueta: 'El más usado en mostradores',
    h1: 'Multiplica tus reseñas en Google.',
    h1Destacado: 'Sin esfuerzo.',
    subtitulo:
      'El Stand NFC en PVC Técnico Autoportante es tu vendedor silencioso. Colócalo en tu mostrador o mesa y tus clientes satisfechos te dejan reseñas de 5 estrellas en segundos.',
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
        titulo: 'PVC técnico autoportante de alta resistencia',
        texto:
          'Diseñado para el tráfico constante de comercios, restaurantes y clínicas. Soporta rayones, líquidos y caídas ligeras con estructura rígida y estable.',
        icono: 'shield',
        imagenAlt: 'Detalle del acabado en PVC técnico del stand NFC starTAP',
      },
    ],
    pasos: [
      { titulo: 'Colócalo a la vista', texto: 'En tu caja registradora, recepción o mesas. Su diseño llama la atención.' },
      { titulo: 'El cliente acerca su móvil', texto: 'Le aparece un aviso en pantalla. No descarga nada.' },
      { titulo: 'Recibes tus 5 estrellas', texto: 'Llega directo a la pantalla de reseña de tu ficha de Google.' },
    ],
    faqs: [
      { q: '¿Necesito pagar alguna mensualidad o suscripción?', a: 'No, el pago es único. Compras tu Stand NFC una vez y te funciona para siempre, sin cobros ocultos ni mantenimiento.' },
      { q: '¿Funciona con iPhone y Android?', a: 'Sí. Todos los smartphones modernos traen lector NFC integrado. Para modelos antiguos, el Stand incluye un código QR impreso HD.' },
      { q: '¿Cómo configuran el enlace hacia mi negocio?', a: 'Al procesar tu pedido programamos el chip para que apunte a tu perfil de Google Maps. Te llega listo para usar.' },
      { q: '¿Puedo personalizarlo con el logo de mi negocio?', a: 'Sí. Los dispositivos incluyen su diseño base y puedes solicitar la impresión de tu logo personalizado si lo deseas (+ $5.00).' },
      { q: '¿Si cambio la ubicación de mi local, debo comprar otro Stand?', a: 'No. Desde tu panel actualizas el enlace hacia donde dirige el Stand en cualquier momento, sin costo.' },
    ],
    coloresPorDefecto: ['Negro Mate', 'Blanco Brillante'],
  },
  {
    ids: ['tarjeta-nfc-bolsillo', 'tarjeta-nfc', 'placa-google'],
    etiqueta: 'Para equipos y personal de servicio',
    h1: 'Cierra tratos y recolecta reseñas',
    h1Destacado: 'donde vayas.',
    subtitulo:
      'Lleva el SEO local y el networking en el bolsillo. Tarjeta de PVC Contactless 0.76mm ideal para meseros, vendedores, ejecutivos y personal en movimiento.',
    nombreCorto: 'Tarjeta',
    heroImagenAlt:
      'Tarjeta NFC starTAP para reseñas de Google, tamaño billetera, en la mano de un vendedor',
    beneficios: [
      {
        titulo: 'Ideal para equipos de ventas y personal de servicio',
        texto:
          'Del tamaño estándar de una tarjeta de crédito (8.5 × 5.4 cm) en PVC rígido 0.76mm. Cabe en la billetera o se cuelga con un lanyard para solicitar valoraciones al instante.',
        icono: 'zap',
        imagenAlt: 'Mesero mostrando una tarjeta NFC starTAP a un cliente en un restaurante de Panamá',
      },
      {
        titulo: 'PVC Contactless técnico impermeable',
        texto:
          'El chip va sellado dentro de la tarjeta de PVC, así que aguanta el uso diario, el roce del bolsillo y la humedad sin dañarse.',
        icono: 'shield',
        imagenAlt: 'Tarjeta NFC de PVC técnico starTAP',
      },
    ],
    pasos: [
      { titulo: 'Entrégala o acércala', texto: 'En la mesa, en la silla o al cerrar la venta. No hay que moverse del puesto.' },
      { titulo: 'El cliente acerca su móvil', texto: 'Un toque y se abre el enlace que tú configuraste.' },
      { titulo: 'Reseña o contacto guardado', texto: 'Puede apuntar a tu ficha de Google, a WhatsApp o a tu perfil.' },
    ],
    faqs: [
      { q: '¿Puedo llevar la tarjeta en la billetera o colgarla al cuello?', a: 'Sí. Tiene el tamaño estándar de una tarjeta de crédito (8.5 × 5.4 cm), fabricada en PVC técnico 0.76mm fino y resistente.' },
      { q: '¿Necesito pagar alguna suscripción mensual?', a: 'No. La tarjeta NFC starTAP es de pago único. No cobramos mensualidades por usarla ni por acceder a tu panel.' },
      { q: '¿Puedo agregar el logo de mi negocio?', a: 'Sí. Si lo deseas, puedes solicitar la impresión de tu logo personalizado en la tarjeta (+ $5.00).' },
      { q: '¿Funciona con cualquier teléfono inteligente?', a: 'Sí, con iPhone y Android mediante el chip NFC, o con el código QR impreso en el reverso.' },
      { q: '¿Puedo saber qué vendedor genera más reseñas?', a: 'Sí. Cada tarjeta tiene su propio código y su propio contador de escaneos en el panel.' },
    ],
    coloresPorDefecto: ['Negro Premium', 'Blanco Premium'],
  },
  {
    ids: ['placa-nfc-mostrador', 'placa-acrilica-nfc', 'NFC_10001'],
    etiqueta: 'Se instala sin taladrar',
    h1: 'Transforma cada rincón en',
    h1Destacado: 'reseñas de 5 estrellas.',
    subtitulo:
      'Placa de Acrílico Premium de 3mm con adhesivo 3M industrial. La solución ideal para mostradores, cajas de cobro, puertas de cristal y paredes de atención en Panamá.',
    nombreCorto: 'Placa',
    heroImagenAlt:
      'Placa acrílica NFC starTAP adherida al mostrador de un local comercial en Panamá',
    beneficios: [
      {
        titulo: 'Fácil instalación en Acrílico Premium 3mm',
        texto:
          'Todas las placas de acrílico de 3mm incluyen adhesivo 3M de grado industrial en el reverso. Despegas la cinta protectora y la fijas en cristal, madera, azulejo o metal sin taladrar.',
        icono: 'zap',
        imagenAlt: 'Instalación de una placa NFC adhesiva sobre una puerta de cristal',
      },
      {
        titulo: 'Impermeable y resistente al tráfico constante',
        texto:
          'El chip NFC va sellado dentro de la placa de acrílico de 3 mm. Aguanta el calor de Panamá, las salpicaduras y la limpieza diaria sin dañarse.',
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
      { q: '¿De qué material está hecha la placa?', a: 'Está fabricada en Acrílico Premium pulido de 3 mm de grosor con adhesivo 3M ultrarresistente de grado industrial en el reverso.' },
      { q: '¿Soporta la intemperie o salpicaduras de agua?', a: 'Sí. El chip NFC está sellado dentro del cuerpo de acrílico de 3 mm. Es impermeable y resiste el calor de Panamá.' },
      { q: '¿Puedo solicitar el logo de mi negocio en la placa?', a: 'Sí. La placa viene con el diseño estándar y puedes añadir la impresión de tu logo si lo requieres (+ $5.00).' },
      { q: '¿Cobran mensualidades por usar la placa?', a: 'No. Es un pago único por el dispositivo, sin suscripciones obligatorias ni renovaciones anuales.' },
    ],
    coloresPorDefecto: ['Acrílico Negro', 'Acrílico Blanco'],
  },
  {
    ids: ['pack-trio-comercial', 'pack-trio'],
    etiqueta: 'Paquete Comercial Completo - 28% OFF',
    h1: 'Equipa tu local fijo y tu personal móvil',
    h1Destacado: 'en un solo paquete.',
    subtitulo:
      'Incluye 1 Placa NFC de Mostrador en Acrílico Premium de 3mm + 2 Tarjetas NFC de Bolsillo en PVC 0.76mm. Ahorra $20.00 con envío gratis en Ciudad de Panamá.',
    nombreCorto: 'Pack Trío',
    heroImagenAlt:
      'Pack Trío Comercial NFC starTAP con 1 placa acrílica y 2 tarjetas de PVC',
    beneficios: [
      {
        titulo: 'Cobertura total en el local y en movimiento',
        texto:
          'Captura reseñas en la caja de cobro con la placa fija en acrílico de 3mm y permite a tu equipo solicitar opiniones con las tarjetas de PVC técnico de 0.76mm.',
        icono: 'zap',
        imagenAlt: 'Pack Trío Comercial desplegado en mostrador de ventas',
      },
      {
        titulo: 'Ahorro de $20.00 en paquete empresarial',
        texto:
          'Obtén la combinación perfecta para tu negocio por solo $50.00 en pago único, con configuración previa lista para usar.',
        icono: 'sparkles',
        imagenAlt: 'Beneficio empresarial del Pack Trío starTAP Panamá',
      },
    ],
    pasos: [
      { titulo: 'Instala la placa en tu caja', texto: 'Adhiérela al mostrador de cobro con la cinta 3M industrial incluida.' },
      { titulo: 'Entrega las tarjetas a tu equipo', texto: 'Tus vendedores o repartidores las llevan en la billetera o lanyard.' },
      { titulo: 'Multiplica tus opiniones', texto: 'Captura reseñas desde múltiples puntos de contacto simultáneamente.' },
    ],
    faqs: [
      { q: '¿Qué incluye exactamente el Pack Trío Comercial?', a: 'Incluye 1 Placa NFC de Mostrador en Acrílico Premium de 3mm y 2 Tarjetas NFC de Bolsillo en PVC técnico de 0.76mm.' },
      { q: '¿Vienen todas programadas al mismo perfil de Google?', a: 'Sí, todas vienen listos y programadas hacia tu negocio. Si deseas programarlas a enlaces diferentes, puedes modificar cada una de forma independiente en tu portal.' },
      { q: '¿Incluye costo de envío?', a: 'El envío es totalmente gratuito en Ciudad de Panamá y Panamá Oeste. Para provincias enviamos por Uno Express o Servientrega.' },
    ],
    coloresPorDefecto: ['Acrílico 3mm + PVC 0.76mm'],
  }
];

export function getLandingCopy(productId: string): LandingCopy | undefined {
  const normalized = productId.trim().toLowerCase();
  return LANDINGS.find((l) => l.ids.includes(normalized));
}
