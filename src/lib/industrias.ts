export interface Industria {
  slug: string;
  nombre: string; // "restaurantes"
  nombreSingular: string; // "restaurante"
  h1: string;
  title: string;
  description: string;
  intro: string;
  dolor: string;
  momento: string;
  beneficios: string[];
  producto: string; // id de producto recomendado
  productoRazon: string;
  faqs: { q: string; a: string }[];
}

export const INDUSTRIAS: Industria[] = [
  {
    slug: 'restaurantes',
    nombre: 'restaurantes',
    nombreSingular: 'restaurante',
    h1: 'Más reseñas de Google para restaurantes en Panamá',
    title: 'Más Reseñas de Google para Restaurantes en Panamá',
    description:
      'Consigue más reseñas de 5 estrellas para tu restaurante en Panamá. Stand NFC en la mesa o en la caja: el cliente acerca el celular y deja su reseña en segundos.',
    intro:
      'En Panamá, la mayoría de la gente elige dónde comer buscando en Google Maps. El restaurante con más reseñas y mejor calificación se lleva la mesa, aunque el de al lado cocine igual de bien.',
    dolor:
      'El problema no es que a tus clientes no les guste la comida. Es que salen contentos y nunca escriben nada. Pedirles que busquen tu restaurante en Google y redacten una reseña son cinco pasos, y ahí se pierde la mayoría.',
    momento:
      'El mejor momento es justo cuando llega la cuenta: el cliente está satisfecho, sentado y con el celular a mano. Un stand NFC en la mesa o junto a la caja convierte ese momento en una reseña.',
    beneficios: [
      'Apareces más arriba cuando alguien busca "restaurante cerca de mí" en tu zona',
      'Más reseñas recientes suben tu calificación promedio y bajan el peso de una mala reseña vieja',
      'Tu equipo no tiene que explicar nada: el cliente acerca el celular y listo',
      'Funciona con cualquier teléfono moderno, y el código QR cubre el resto',
    ],
    producto: 'stand-nfc',
    productoRazon:
      'El stand de mostrador es el que mejor funciona en restaurantes: se queda en la mesa o en la caja, se ve y no se pierde.',
    faqs: [
      {
        q: '¿Puedo pedirle la reseña solo a los clientes que quedaron contentos?',
        a: 'No, y no conviene. Filtrar reseñas va contra las políticas de Google y puede costarte la ficha del negocio. El dispositivo se le ofrece a todos por igual; lo que sube tu promedio es el volumen de clientes satisfechos, que siempre son la mayoría.',
      },
      {
        q: '¿Sirve si tengo varias sucursales?',
        a: 'Sí. Cada dispositivo tiene su propio enlace, así que cada sucursal apunta a su propia ficha de Google y puedes ver los escaneos por local desde el panel.',
      },
      {
        q: '¿El cliente tiene que descargar algo?',
        a: 'No. Acerca el celular al dispositivo y se le abre directo la página de reseñas de tu restaurante. Si su teléfono no lee NFC, escanea el código QR impreso.',
      },
    ],
  },
  {
    slug: 'clinicas',
    nombre: 'clínicas y consultorios',
    nombreSingular: 'clínica',
    h1: 'Más reseñas de Google para clínicas y consultorios en Panamá',
    title: 'Más Reseñas de Google para Clínicas en Panamá',
    description:
      'Consigue más reseñas de Google para tu clínica o consultorio en Panamá. Placa NFC en recepción: el paciente acerca el celular y deja su reseña al salir.',
    intro:
      'Cuando alguien busca un especialista en Panamá, compara fichas de Google antes de llamar. La cantidad de reseñas y la calificación pesan más que la ubicación.',
    dolor:
      'Un paciente satisfecho lo comenta con su familia, pero rara vez lo escribe. Y las reseñas que llegan solas suelen ser de los pocos que tuvieron un mal día.',
    momento:
      'Al salir de la consulta, mientras espera la próxima cita o paga en recepción. Una placa NFC visible en el mostrador es todo lo que hace falta.',
    beneficios: [
      'Apareces más arriba cuando buscan tu especialidad en tu zona',
      'Balanceas las reseñas negativas con la opinión de la mayoría, que sí quedó conforme',
      'La recepcionista solo señala la placa, sin pedir datos ni explicar pasos',
      'No se registra información del paciente: el dispositivo solo abre un enlace',
    ],
    producto: 'placa-acrilica-nfc',
    productoRazon:
      'La placa acrílica adhesiva es la mejor opción para recepción: se pega al mostrador, se ve siempre y no ocupa espacio.',
    faqs: [
      {
        q: '¿Esto maneja datos de mis pacientes?',
        a: 'No. El dispositivo únicamente abre la página de reseñas de tu clínica en el navegador del paciente. No captura nombres, correos ni información médica.',
      },
      {
        q: '¿Puedo usar uno por doctor?',
        a: 'Sí. Cada dispositivo tiene su propio enlace configurable, así que puedes tener uno por especialista si cada uno maneja su propia ficha de Google.',
      },
      {
        q: '¿Qué hago si me llega una reseña negativa?',
        a: 'Respóndela con calma y sin dar detalles clínicos. Una respuesta profesional a una queja suele generar mejor impresión que no tener quejas.',
      },
    ],
  },
  {
    slug: 'barberias-y-salones',
    nombre: 'barberías y salones de belleza',
    nombreSingular: 'barbería',
    h1: 'Más reseñas de Google para barberías y salones en Panamá',
    title: 'Más Reseñas de Google para Barberías y Salones en Panamá',
    description:
      'Consigue más reseñas de Google para tu barbería o salón en Panamá. Tarjeta o stand NFC: el cliente deja su reseña con un toque antes de irse.',
    intro:
      'En barbería y belleza casi todo el negocio nuevo llega por búsqueda local y recomendación. Aparecer primero en el Google Maps de tu barrio es la diferencia entre una silla llena y una vacía.',
    dolor:
      'Tus clientes son fieles y vuelven cada dos semanas, pero eso no se ve en Google. Un local nuevo con 60 reseñas te pasa por encima aunque tú lleves cinco años.',
    momento:
      'Justo después del corte, cuando el cliente se está mirando en el espejo y va a pagar. Ese es el pico de satisfacción del día.',
    beneficios: [
      'Sales primero cuando buscan "barbería cerca de mí" en tu corregimiento',
      'Las fotos de tus cortes rinden más cuando la ficha tiene reseñas que las respalden',
      'Cada barbero puede tener su propia tarjeta y ver cuántas reseñas genera',
      'Cuesta una vez, sin mensualidad',
    ],
    producto: 'tarjeta-nfc',
    productoRazon:
      'La tarjeta NFC es ideal aquí: cabe en el bolsillo del barbero y se la pasa al cliente en la silla, sin moverse del puesto.',
    faqs: [
      {
        q: '¿Puedo ver cuántas reseñas trajo cada barbero?',
        a: 'Puedes ver cuántos escaneos tuvo cada dispositivo desde el panel. Con una tarjeta por barbero sabes quién está activando más clientes.',
      },
      {
        q: '¿Y si el cliente no tiene cuenta de Google?',
        a: 'Casi todo teléfono Android ya viene con una, y en iPhone basta con estar conectado a Gmail. Si no la tiene, Google le pide iniciar sesión y sigue desde ahí.',
      },
      {
        q: '¿Se despega o se daña con el uso?',
        a: 'Las tarjetas son de PVC y el chip va sellado adentro. Aguantan el uso diario de un local; no se borran con el roce ni con la humedad.',
      },
    ],
  },
  {
    slug: 'talleres-y-mecanicas',
    nombre: 'talleres y mecánicas',
    nombreSingular: 'taller',
    h1: 'Más reseñas de Google para talleres y mecánicas en Panamá',
    title: 'Más Reseñas de Google para Talleres en Panamá',
    description:
      'Consigue más reseñas de Google para tu taller o mecánica en Panamá. Placa NFC en el mostrador: el cliente deja su reseña al recoger el carro.',
    intro:
      'Nadie deja su carro con un mecánico desconocido sin buscarlo antes en Google. Las reseñas son literalmente la prueba de que se puede confiar en ti.',
    dolor:
      'La confianza que construyes reparando bien un carro se queda en el taller. En Google, un taller sin reseñas se ve igual de riesgoso que uno malo.',
    momento:
      'Cuando el cliente recoge el carro y lo ve funcionando. Es el momento de mayor alivio y el mejor para pedir la reseña.',
    beneficios: [
      'Apareces cuando buscan "taller mecánico cerca de mí" o tu especialidad',
      'Las reseñas dan la confianza que una foto del local no puede dar',
      'Sirve igual para mecánica, latonería, aire acondicionado o llantas',
      'Aguanta el ambiente del taller: se limpia y no se daña',
    ],
    producto: 'placa-acrilica-nfc',
    productoRazon:
      'La placa acrílica se pega al mostrador o al vidrio de la oficina y aguanta el polvo y el uso diario del taller.',
    faqs: [
      {
        q: '¿Funciona si mi taller no tiene ficha de Google todavía?',
        a: 'Primero hay que crear la ficha de Google Business de tu taller, que es gratis. Después configuras el dispositivo para que apunte a ella.',
      },
      {
        q: '¿Puedo cambiar el enlace después?',
        a: 'Sí, cuando quieras desde el panel. El dispositivo físico no se toca; solo cambias a dónde apunta.',
      },
      {
        q: '¿Puedo poner uno en recepción y otro en la caja?',
        a: 'Sí, y es lo recomendable. Mientras más puntos de contacto, más reseñas; todos pueden apuntar a la misma ficha.',
      },
    ],
  },
  {
    slug: 'hoteles-y-hospedajes',
    nombre: 'hoteles y hospedajes',
    nombreSingular: 'hotel',
    h1: 'Más reseñas de Google para hoteles y hospedajes en Panamá',
    title: 'Más Reseñas de Google para Hoteles en Panamá',
    description:
      'Consigue más reseñas de Google para tu hotel, hostal o alquiler en Panamá. Stand NFC en recepción o en la habitación, con un toque y sin apps.',
    intro:
      'El huésped que busca dónde quedarse en Panamá compara calificaciones antes que precios. Una diferencia de tres décimas en Google cambia cuál hotel abre primero.',
    dolor:
      'Los huéspedes contentos se van y siguen su viaje. Los que tuvieron un problema son los que se sientan a escribir. Por eso las fichas sin estrategia terminan con un promedio más bajo del que merecen.',
    momento:
      'Al hacer el check-out, o dejando el dispositivo en la habitación con una tarjeta de cortesía. Ambos funcionan.',
    beneficios: [
      'Subes en Google Maps y en las búsquedas de hospedaje de tu zona',
      'Compensas las reseñas de queja con la voz de la mayoría',
      'Funciona para hoteles, hostales, cabañas y alquileres cortos',
      'Puedes tener uno por habitación, cada uno con su propio enlace',
    ],
    producto: 'stand-nfc',
    productoRazon:
      'El stand de mostrador funciona en recepción y también en la mesa de noche de la habitación, sin necesidad de instalación.',
    faqs: [
      {
        q: '¿Sirve también para TripAdvisor o Airbnb?',
        a: 'Sí. El dispositivo abre el enlace que tú configures, así que puede apuntar a Google, TripAdvisor, tu perfil de Airbnb o donde quieras.',
      },
      {
        q: '¿Puedo poner uno en cada habitación?',
        a: 'Sí. Cada dispositivo se identifica por separado y puedes ver desde cuál habitación llegan más escaneos.',
      },
      {
        q: '¿Funciona con turistas extranjeros?',
        a: 'Sí. El NFC es un estándar mundial y la página de reseñas se abre en el idioma del teléfono del huésped.',
      },
    ],
  },
  {
    slug: 'tiendas-y-comercios',
    nombre: 'tiendas y comercios',
    nombreSingular: 'tienda',
    h1: 'Más reseñas de Google para tiendas y comercios en Panamá',
    title: 'Más Reseñas de Google para Tiendas en Panamá',
    description:
      'Consigue más reseñas de Google para tu tienda, minisúper o comercio en Panamá. Dispositivo NFC en la caja, con un toque y sin descargar apps.',
    intro:
      'El comercio local vive de la gente que busca "cerca de mí". Google decide a quién le muestra primero, y las reseñas son una de las señales que más pesan en esa decisión.',
    dolor:
      'Vendes todos los días y atiendes bien, pero tu ficha de Google sigue con cuatro reseñas de hace dos años. Para Google, eso parece un negocio inactivo.',
    momento:
      'En la caja, mientras el cliente espera el vuelto o empaca. Son los diez segundos que se necesitan.',
    beneficios: [
      'Apareces en las búsquedas "cerca de mí" de tu barrio o centro comercial',
      'Reseñas recientes le indican a Google que el negocio está activo',
      'Sirve para minisúper, boutiques, ferreterías, farmacias y cualquier comercio',
      'Un solo pago, sin mensualidad ni contrato',
    ],
    producto: 'stand-nfc',
    productoRazon:
      'El stand de mostrador se pone junto a la caja registradora, donde todo cliente pasa antes de salir.',
    faqs: [
      {
        q: '¿Cuántas reseñas puedo esperar al mes?',
        a: 'Depende de tu tráfico y de si tu equipo lo ofrece. Un comercio que atiende 40 clientes al día y menciona el dispositivo suele ver decenas de reseñas al mes; sin mencionarlo, bastantes menos.',
      },
      {
        q: '¿Puedo regalarle algo al cliente por dejar la reseña?',
        a: 'No. Google prohíbe incentivar reseñas y puede eliminarlas o penalizar tu ficha. Ofrécelo sin condiciones.',
      },
      {
        q: '¿Cuánto tarda en llegar el dispositivo?',
        a: 'Enviamos a todo Panamá. Escríbenos por WhatsApp y te confirmamos el tiempo según tu provincia.',
      },
    ],
  },
];

export function getIndustria(slug: string): Industria | undefined {
  return INDUSTRIAS.find((i) => i.slug === slug);
}
