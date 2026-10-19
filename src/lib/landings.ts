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
    titulo: 'Auto-configurable al llegar',
    texto: 'Te lo entregamos listo para que lo vincules tú mismo a tu ficha de Google en 30 segundos. Si luego necesitas cambiarlo, puedes hacerlo desde el panel.',
  },
};

export const WHATSAPP_URL = 'https://wa.me/50764839004';
export const WHATSAPP_NUMERO = '+507 6483-9004';

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
          'Olvídate de pedirle al cliente que abra la cámara y enfoque un código arrugado. Con NFC, la misma tecnología con la que pagas con el móvil, solo acerca el teléfono al Stand y le aparece la pantalla de reseña.',
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
      {
        titulo: 'Confianza instantánea para tus clientes',
        texto:
          'La mayoría de los clientes revisan las calificaciones en Google Maps antes de decidir dónde comprar. Mostrar tu soporte físico en el mostrador refuerza tu credibilidad y facilita que quienes salen satisfechos dejen su opinión en el acto.',
        icono: 'sparkles',
        imagenAlt: 'Infografía sobre el aumento de confianza al usar starTAP en el negocio',
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
      { q: '¿Cómo configuran el enlace hacia mi negocio?', a: 'No necesitas enviarnos ningún enlace al comprar. Es auto-configurable: lo vinculas a tu perfil de Google Maps en segundos cuando te llegue.' },
      { q: '¿Puedo personalizarlo con el logo de mi negocio?', a: 'Sí. Los dispositivos incluyen su diseño base y puedes solicitar la impresión de tu logo personalizado si lo deseas (+ $5.00).' },
      { q: '¿Si cambio la ubicación de mi local, debo comprar otro Stand?', a: 'No. Desde tu panel actualizas el enlace hacia donde dirige el Stand en cualquier momento, sin costo.' },
    ],
    coloresPorDefecto: ['Blanco Mate', 'Negro Mate'],
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
    coloresPorDefecto: ['Blanco Mate', 'Negro Mate'],
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
    coloresPorDefecto: ['Acrílico Blanco', 'Acrílico Transparente', 'Acrílico Negro'],
  },
  {
    ids: ['pack-trio-comercial', 'pack-trio'],
    etiqueta: 'Paquete Comercial Completo - 33% OFF',
    h1: 'Equipa tu local fijo y tu personal móvil',
    h1Destacado: 'en un solo paquete.',
    subtitulo:
      'Incluye 1 Placa NFC de Mostrador en Acrílico Premium de 3mm + 2 Tarjetas NFC de Bolsillo en PVC 0.76mm. Ahorra $25.00 y el envío te sale gratis a todo Panamá.',
    nombreCorto: 'Pack Trío',
    heroImagenAlt:
      'Pack Trío Comercial NFC starTAP con 1 placa acrílica de 3mm y 2 tarjetas de PVC para Reseñas de Google en Panamá',
    beneficios: [
      {
        titulo: 'Cobertura total en el local y en movimiento',
        texto:
          'Captura reseñas en la caja de cobro con la placa fija en acrílico de 3mm y permite a tu equipo solicitar opiniones en ruta con las tarjetas de PVC técnico de 0.76mm.',
        icono: 'zap',
        imagenAlt: 'Tarjetas NFC de Bolsillo starTAP para personal móvil y ventas en campo',
      },
      {
        titulo:
          'Tarjeta de Beneficios Clave y Pack Trío Comercial starTAP con ahorro de $25 en paquete empresarial para reseñas en Google Panamá',
        texto:
          'Obtén la combinación perfecta para tu negocio por solo $50.00 en pago único, auto-configurable y con envío gratis a todo Panamá.',
        icono: 'sparkles',
        imagenAlt: 'Tarjeta de Beneficios Clave y Pack Trío Comercial starTAP con ahorro de $25 en paquete empresarial para reseñas en Google Panamá',
      },
    ],
    pasos: [
      { titulo: 'Instala la placa en tu caja', texto: 'Adhiérela al mostrador de cobro con la cinta 3M industrial incluida.' },
      { titulo: 'Entrega las tarjetas a tu equipo', texto: 'Tus vendedores o repartidores las llevan en la billetera o lanyard.' },
      { titulo: 'Multiplica tus opiniones', texto: 'Captura reseñas desde varios puntos de contacto al mismo tiempo.' },
    ],
    faqs: [
      { q: '¿Qué incluye el Pack Trío Comercial?', a: 'Incluye 1 Placa NFC de Mostrador en Acrílico Premium de 3mm y 2 Tarjetas NFC de Bolsillo en PVC técnico de 0.76mm.' },
      { q: '¿Vienen todas programadas al mismo perfil de Google?', a: 'Sí, todas vienen listas y programadas hacia tu negocio. Si deseas programarlas a enlaces diferentes, puedes modificar cada una de forma independiente en tu portal.' },
      { q: '¿Incluye costo de envío?', a: 'El envío es gratuito en Ciudad de Panamá y Panamá Oeste. Para provincias enviamos por Uno Express o Servientrega.' },
    ],
    coloresPorDefecto: ['Acrílico 3mm + PVC 0.76mm'],
  },
  {
    ids: ['stand-nfc-instagram', 'stand-instagram'],
    etiqueta: 'Línea Oficial Instagram',
    h1: 'Convierte a tus clientes en seguidores de Instagram.',
    h1Destacado: 'En un solo toque.',
    subtitulo:
      'El Stand NFC de Mesa para Instagram facilita que tus clientes acerquen su celular para seguir tu cuenta oficial y compartir su experiencia antes de salir de tu local.',
    nombreCorto: 'Stand Instagram',
    heroImagenAlt:
      'Stand NFC de mesa starTAP para Instagram con código QR y chip contactless en Panamá',
    beneficios: [
      {
        titulo: 'Más rápido que buscar tu usuario',
        texto:
          'Un toque con el móvil abre tu perfil directamente en la app de Instagram del cliente. Cero errores tecleando nombres complejos o cuentas parecidas.',
        icono: 'zap',
        imagenAlt: 'Cliente acercando el celular al stand NFC de Instagram en la mesa',
      },
      {
        titulo: 'PVC autoportante resistente al uso continuo',
        texto:
          'Estructura rígida con ángulo ergonómico para mesas de restaurantes, cafeterías, escritorios y barras de atención al cliente.',
        icono: 'shield',
        imagenAlt: 'Detalle del acabado autoportante del stand NFC Instagram starTAP',
      },
      {
        titulo: 'Doble tecnología: NFC y Código QR HD',
        texto:
          'Funciona al 100% con cualquier celular inteligente: lectura por proximidad NFC o escaneo del código QR impreso en alta definición.',
        icono: 'sparkles',
        imagenAlt: 'Código QR y sensor NFC integrados en el stand Instagram starTAP',
      },
    ],
    pasos: [
      { titulo: 'Colócalo en la mesa o mostrador', texto: 'A la vista de tus clientes mientras esperan su pedido o cuenta.' },
      { titulo: 'El cliente acerca su celular', texto: 'Se abre tu perfil de Instagram al instante en su pantalla.' },
      { titulo: 'Ganas un seguidor real', texto: 'El cliente te sigue en el acto y puede etiquetarte en historias y fotos.' },
    ],
    faqs: [
      { q: '¿Abre directo la aplicación de Instagram?', a: 'Sí, al acercar el teléfono o escanear el código QR se lanza la app oficial de Instagram con tu perfil listo para seguir.' },
      { q: '¿Puedo cambiar mi usuario de Instagram después?', a: 'Sí, el enlace se puede actualizar en cualquier momento desde tu panel de starTAP sin necesidad de cambiar el dispositivo físico.' },
      { q: '¿Necesita baterías o conectarse a corriente?', a: 'No. El chip NFC se energiza por inducción electromagnética con la antena del teléfono móvil del cliente. No requiere cables ni mantenimiento.' },
    ],
    coloresPorDefecto: ['Blanco con Degradado Instagram'],
  },
  {
    ids: ['placa-nfc-instagram', 'placa-instagram'],
    etiqueta: 'Acrílico 3mm Degradado Instagram',
    h1: 'Multiplica tus seguidores de Instagram en el mostrador.',
    h1Destacado: 'Sin fricción.',
    subtitulo:
      'Placa acrílica pulida de 3mm con adhesivo industrial 3M y diseño oficial de Instagram. Colócala en tu caja o mostrador para que cada cliente que pague se convierta en seguidor de tu marca.',
    nombreCorto: 'Placa Instagram',
    heroImagenAlt:
      'Placa acrílica de mostrador starTAP con chip NFC y QR para Instagram en Panamá',
    beneficios: [
      {
        titulo: 'Seguidores reales en el momento del cobro',
        texto:
          'Aprovecha los segundos en que el cliente espera su factura o tarjeta para invitarlo a seguirte y enterarse de tus promociones y novedades.',
        icono: 'zap',
        imagenAlt: 'Cliente acercando el celular a la placa acrílica de Instagram en el mostrador',
      },
      {
        titulo: 'Acrílico blanco de 3mm de alto impacto',
        texto:
          'Material duradero y elegante, resistente al agua y a la limpieza diaria con alcohol o desinfectantes comerciales.',
        icono: 'shield',
        imagenAlt: 'Acabado en acrílico brillante de la placa de mostrador Instagram',
      },
      {
        titulo: 'Fijación segura con adhesivo 3M incluido',
        texto:
          'Se instala en 30 segundos sobre madera, metal, vidrio o granito sin necesidad de taladros ni tornillos.',
        icono: 'sparkles',
        imagenAlt: 'Adhesivo 3M posterior en la placa NFC de Instagram starTAP',
      },
    ],
    pasos: [
      { titulo: 'Pégala junto a tu caja', texto: 'Retira la cinta protectora 3M y fíjala firmemente sobre el mostrador o pared.' },
      { titulo: 'El cliente acerca su móvil', texto: 'La antena NFC envía la señal y abre tu perfil de Instagram en 2 segundos.' },
      { titulo: 'Comunidad en crecimiento', texto: 'Convierte clientes presenciales en seguidores fieles que ven tus historias a diario.' },
    ],
    faqs: [
      { q: '¿En qué superficies se puede pegar?', a: 'Se adhiere perfectamente a madera, vidrio, mármol, acrílico y melamina gracias a su cinta 3M de alta adherencia.' },
      { q: '¿El pago incluye mensualidades?', a: 'No. Es un pago único de $35.00 de por vida, sin contratos ni suscripciones mensuales.' },
      { q: '¿Qué garantía tiene?', a: 'Cuenta con 12 meses de garantía de fábrica sobre el funcionamiento del chip NFC.' },
    ],
    coloresPorDefecto: ['Acrílico 3mm Degradado Instagram'],
  },
  {
    ids: ['tarjeta-nfc-instagram', 'tarjeta-instagram', 'card-instagram'],
    etiqueta: 'Tarjeta de Bolsillo Instagram',
    h1: 'Lleva tu perfil de Instagram a todas partes.',
    h1Destacado: 'Conecta en 2 segundos.',
    subtitulo:
      'Tarjeta de PVC en acabado satinado con diseño exclusivo de Instagram y chip NFC. Ideal para entregas a domicilio, eventos, ferias y networking comercial.',
    nombreCorto: 'Tarjeta Instagram',
    heroImagenAlt:
      'Tarjeta NFC de bolsillo starTAP con diseño Instagram para ganar seguidores en Panamá',
    beneficios: [
      {
        titulo: 'Tu tarjeta de presentación moderna e interactiva',
        texto:
          'En vez de entregar un papel que termina en la basura, acerca tu tarjeta al teléfono de tu cliente y queda guardado en su Instagram de inmediato.',
        icono: 'zap',
        imagenAlt: 'Persona tocando el celular de un cliente con la tarjeta NFC de Instagram',
      },
      {
        titulo: 'PVC resistente al agua y al bolsillo',
        texto:
          'Mismo grosor y durabilidad que una tarjeta de crédito (0.76mm). Llévala en tu billetera o con un lanyard en eventos corporativos.',
        icono: 'shield',
        imagenAlt: 'Tarjeta NFC de bolsillo Instagram en acabado PVC ultra resistente',
      },
      {
        titulo: 'Ideal para repartidores y vendedores en calle',
        texto:
          'Permite a tu equipo de ventas y mensajeros pedir que sigan la cuenta de tu negocio en la misma puerta del cliente al entregar el pedido.',
        icono: 'sparkles',
        imagenAlt: 'Uso de la tarjeta NFC de Instagram en entregas a domicilio',
      },
    ],
    pasos: [
      { titulo: 'Llévala en tu billetera', texto: 'Lista para usar en cualquier momento que conozcas a un cliente potencial.' },
      { titulo: 'Acércala a su celular', texto: 'El celular detecta la tarjeta sin necesidad de que el cliente instale ninguna aplicación.' },
      { titulo: 'Conexión instantánea', texto: 'Abre tu perfil de Instagram y el cliente te sigue al momento.' },
    ],
    faqs: [
      { q: '¿Es compatible con iPhone y Android?', a: 'Sí. Funciona con todos los modelos de iPhone desde el XS en adelante y con todos los dispositivos Android que tengan sensor NFC activo.' },
      { q: '¿Puedo llevarla colgada en una cinta o lanyard?', a: 'Sí, cabe en cualquier portacredenciales estándar de oficina o evento.' },
      { q: '¿Qué pasa si cambio el nombre de mi cuenta de Instagram?', a: 'Puedes reprogramar el enlace en cualquier momento usando una app gratuita como NFC Tools o contactando a nuestro soporte.' },
    ],
    coloresPorDefecto: ['PVC Degradado Instagram'],
  }
];

export function getLandingCopy(productId: string): LandingCopy | undefined {
  const normalized = productId.trim().toLowerCase();
  return LANDINGS.find((l) => l.ids.includes(normalized));
}
