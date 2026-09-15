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
  momentoDetalle?: {
    titulo: string;
    subtitulo: string;
    pasos: { paso: string; titulo: string; descripcion: string }[];
  };
  manejoPreventivo?: {
    titulo: string;
    subtitulo: string;
    reglas: { alerta: string; explicacion: string }[];
    protocolo: string;
  };
  ubicacionVisual?: {
    titulo: string;
    subtitulo: string;
    puntos: { lugar: string; dispositivo: string; razon: string }[];
  };
  ctaDescriptivo?: {
    textoCatalogo: string;
    urlCatalogo: string;
    textoWhatsapp: string;
    mensajeWhatsapp: string;
  };
  beneficios: string[];
  producto: string; // id de producto recomendado
  productoRazon: string;
  faqs: { q: string; a: string }[];
  imagen: string;
  imagenAlt: string;
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
    momentoDetalle: {
      titulo: 'La Dinámica de Sala: El Momento Exacto en Restaurantes',
      subtitulo: 'Pedir la reseña a destiempo interrumpe al comensal o se ignora. En Panamá, la psicología del comensal responde con éxito a esta secuencia:',
      pasos: [
        {
          paso: '1',
          titulo: 'Pregunta de Calidad Previa',
          descripcion: 'Al retirar los platos principales o servir el café, el salonero valida: "¿Qué tal estuvo el término del plato hoy?". Si el cliente elogia la comida, queda listo para la recomendación.'
        },
        {
          paso: '2',
          titulo: 'Presentación con la Cuenta en Mesa',
          descripcion: 'El momento cumbre es cuando se entrega el porta-cuentas. El comensal está relajado en la sobremesa, satisfecho y con su teléfono en mano para revisar el total o pagar con Yappy.'
        },
        {
          paso: '3',
          titulo: 'El Toque de 2 Segundos',
          descripcion: 'El personal señala con naturalidad: "Si disfrutaron el servicio, con acercar su celular aquí al stand nos apoyan muchísimo en Google". Sin pedir 5 estrellas explícitamente ni crear fricción.'
        }
      ]
    },
    manejoPreventivo: {
      titulo: 'Protocolo Preventivo Anti-Reseñas Negativas en Sala',
      subtitulo: 'El 90% de las malas reseñas en Google Maps para restaurantes en Panamá provienen de clientes que sintieron que nadie los escuchó en el local:',
      reglas: [
        {
          alerta: 'Nunca presentes el Stand a una mesa con quejas',
          explicacion: 'Si el cliente reportó demora excesiva, un plato frío o una equivocación, no se le pide reseña. Se activa la atención gerencial de inmediato.'
        },
        {
          alerta: 'Resuelve la inconformidad antes de que pidan la cuenta',
          explicacion: 'Un cambio de plato rápido, un café o un postre de cortesía convierte una molestia inicial en un testimonio de excelente servicio.'
        },
        {
          alerta: 'Prohibido usar tablets compartidas del restaurante',
          explicacion: 'Google detecta múltiples opiniones emitidas desde la misma IP o aparato y las borra o marca la ficha. El cliente siempre debe usar su propio celular.'
        }
      ],
      protocolo: 'Si llega una reseña negativa a tu perfil de Google, responde antes de 4 horas con tono profesional, reconociendo el hecho sin discutir y ofreciendo un contacto de WhatsApp de gerencia para solucionar el caso.'
    },
    ubicacionVisual: {
      titulo: 'Ubicación Estratégica del Hardware en el Salón',
      subtitulo: 'Distribución estudiada para maximizar escaneos sin estorbar platos ni vasos:',
      puntos: [
        {
          lugar: 'Centro de Mesa / Junto al Servilletero',
          dispositivo: 'Stand NFC Autoportante 4:5',
          razon: 'Permanece visible durante toda la sobremesa sin estorbar los cubiertos ni la vajilla.'
        },
        {
          lugar: 'Estación de Cobro / Barra de Pago',
          dispositivo: 'Placa Acrílica Adhesiva 3mm',
          razon: 'A la vista directa del comensal que paga en caja con tarjeta de crédito o Yappy.'
        },
        {
          lugar: 'Bolsas de Delivery y Pedidos Para Llevar',
          dispositivo: 'Tarjeta NFC / QR en empaque',
          razon: 'Captura valoraciones de clientes en casa que ordenaron por WhatsApp o retiro en local.'
        }
      ]
    },
    ctaDescriptivo: {
      textoCatalogo: 'Comprar Stand NFC para Mesas de Restaurante en el Catálogo',
      urlCatalogo: '/catalogo/stand-nfc-mesa',
      textoWhatsapp: 'Cotizar Stands para mi Restaurante por WhatsApp',
      mensajeWhatsapp: 'Hola, tengo un restaurante en Panamá y quiero equipar mis mesas con Stands NFC starTAP para conseguir más reseñas en Google Maps.'
    },
    beneficios: [
      'Apareces más arriba cuando alguien busca "restaurante cerca de mí" en tu zona',
      'Más reseñas recientes suben tu calificación promedio y bajan el peso de una mala reseña vieja',
      'Tu equipo no tiene que explicar nada: el cliente acerca el celular y listo',
      'Funciona con cualquier teléfono moderno, y el código QR cubre el resto',
    ],
    producto: 'stand-nfc',
    productoRazon:
      'El stand de mostrador es el que mejor funciona en restaurantes: se queda en la mesa o en la caja, se ve y no se pierde.',
    imagen: '/images/resenas-google/resenas-google-restaurantes-panama-startap.webp',
    imagenAlt: 'Stand NFC starTAP para reseñas de Google en la mesa de un restaurante en Panamá',
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
    imagen: '/images/resenas-google/resenas-google-clinicas-consultorios-panama-startap.webp',
    imagenAlt: 'Placa acrílica NFC starTAP para reseñas de Google en recepción de clínica en Panamá',
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
    momentoDetalle: {
      titulo: 'La Dinámica de Barbería: El Clímax del Espejo',
      subtitulo: 'En barbería y estilismo no existe la sobremesa. El punto más alto de satisfacción dura apenas 60 segundos:',
      pasos: [
        {
          paso: '1',
          titulo: 'El Giro hacia el Espejo Principal',
          descripcion: 'El barbero retira la capa, sacude los residuos y gira la silla hacia el espejo grande bien iluminado. Es el instante en que el cliente sonríe, se acomoda el cabello y se siente seguro de su apariencia.'
        },
        {
          paso: '2',
          titulo: 'La Tarjeta en la Mano del Profesional',
          descripcion: 'Mientras aplica el aftershave o tónico, el barbero saca su Tarjeta NFC de Bolsillo del mandil o portacredencial: "Quedaste nítido bro. Si te gustó el degradado, tócale aquí atrás con tu cel y déjame la calificación en Google".'
        },
        {
          paso: '3',
          titulo: 'El Escaneo en la Misma Silla',
          descripcion: 'El cliente ya tiene el celular en la mano. El escaneo toma 2 segundos antes de levantarse hacia la caja, capturando la valoración en el instante de mayor alegría.'
        }
      ]
    },
    manejoPreventivo: {
      titulo: 'Protocolo Preventivo Anti-Reseñas Negativas en Barberías y Salones',
      subtitulo: 'El cabello y la barba son sumamente personales. Una pequeña duda no resuelta en el sillón se convierte en una mala reseña con foto en Google Maps:',
      reglas: [
        {
          alerta: 'Confirmación activa de satisfacción previa',
          explicacion: 'Antes de acercar la tarjeta o pedir la reseña, el profesional debe preguntar: "¿Te gustó el degradado o quieres que le baje un poco más a los laterales?". Si hay dudas, se retoca sin discutir.'
        },
        {
          alerta: 'Evitar pedir reseñas si hubo atraso en la cita',
          explicacion: 'Si el cliente tuvo que esperar 30 minutos a pesar de tener reserva previa, aunque el corte haya quedado impecable, la probabilidad de que mencione la tardanza en Google es alta.'
        },
        {
          alerta: 'Cumplimiento con la política de Google 2026',
          explicacion: 'No le pidas al cliente que escriba el nombre del barbero textualmente en la reseña ni fijes cuotas obligatorias por empleado; usa el panel starTAP para medir escaneos de forma interna y privada.'
        }
      ],
      protocolo: 'Si un cliente sale inconforme, el administrador debe contactarlo por WhatsApp el mismo día ofreciendo un perfilado o lavado de cortesía. Resolver el detalle en privado blinda tu calificación de 5 estrellas.'
    },
    ubicacionVisual: {
      titulo: 'Ubicación Estratégica del Hardware en el Salón',
      subtitulo: 'Distribución pensada para el flujo de trabajo sin estorbar máquinas ni tijeras:',
      puntos: [
        {
          lugar: 'Marco del Espejo / Estación de Corte',
          dispositivo: 'Placa Acrílica Adhesiva 3mm',
          razon: 'Pegada a la altura de la mirada del cliente cuando está sentado frente al tocador.'
        },
        {
          lugar: 'Bolsillo del Barbero / Portacredencial',
          dispositivo: 'Tarjeta NFC Personal PVC',
          razon: 'Permite a cada barbero o estilista solicitar la reseña en su propia silla sin depender de la recepción.'
        },
        {
          lugar: 'Mostrador de Cobro / Recepción',
          dispositivo: 'Stand NFC Autoportante',
          razon: 'Punto de contacto final para clientes que pagan en caja con Punto de Venta o Yappy.'
        }
      ]
    },
    ctaDescriptivo: {
      textoCatalogo: 'Comprar Tarjetas NFC para Barberos y Salones en el Catálogo',
      urlCatalogo: '/catalogo/tarjeta-nfc-bolsillo',
      textoWhatsapp: 'Pedir Tarjetas Personalizadas para mi Equipo por WhatsApp',
      mensajeWhatsapp: 'Hola, tengo una barbería/salón de belleza en Panamá y quiero equipar a mis estilistas con tarjetas NFC para reseñas de Google.'
    },
    beneficios: [
      'Sales primero cuando buscan "barbería cerca de mí" en tu corregimiento',
      'Las fotos de tus cortes rinden más cuando la ficha tiene reseñas que las respalden',
      'Cada barbero puede tener su propia tarjeta y ver cuántas reseñas genera',
      'Cuesta una vez, sin mensualidad',
    ],
    producto: 'tarjeta-nfc',
    productoRazon:
      'La tarjeta NFC es ideal aquí: cabe en el bolsillo del barbero y se la pasa al cliente en la silla, sin moverse del puesto.',
    imagen: '/images/resenas-google/resenas-google-barberias-salones-panama-startap.webp',
    imagenAlt: 'Tarjeta NFC de bolsillo starTAP para reseñas de Google en barbería o salón de belleza en Panamá',
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
    imagen: '/images/resenas-google/resenas-google-talleres-mecanicas-panama-startap.webp',
    imagenAlt: 'Stand NFC starTAP para valoraciones de Google en mostrador de taller mecánico en Panamá',
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
    imagen: '/images/resenas-google/resenas-google-hoteles-hospedajes-panama-startap.webp',
    imagenAlt: 'Stand NFC starTAP en recepción de hotel para conseguir reseñas de Google en Panamá',
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
    imagen: '/images/resenas-google/resenas-google-tiendas-comercios-panama-startap.webp',
    imagenAlt: 'Dispositivo NFC starTAP junto a la caja registradora de tienda comercial en Panamá',
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
