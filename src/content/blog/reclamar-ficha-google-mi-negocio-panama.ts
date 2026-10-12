import type { BlogPost } from '@/lib/blog';

export const post: BlogPost = {
  slug: 'reclamar-ficha-google-mi-negocio-panama',
  titulo: 'Cómo reclamar la ficha de Google de tu negocio cuando ya existe',
  tituloSeo: 'Reclamar Ficha de Google de mi Negocio | Guía Panamá',
  descripcion:
    'Tu negocio aparece en Google Maps y tú nunca lo pusiste. Cómo saber si la ficha está sin reclamar, cómo reclamarla y qué hacer si alguien más la administra.',
  resumen:
    'Google crea fichas solo, sin avisarle a nadie. Mientras no la reclames no puedes responder reseñas ni corregir tu horario, y cualquiera puede cambiar tu información.',
  fecha: '2026-10-12',
  actualizado: '2026-10-12',
  categoria: 'SEO local',
  autor: 'fernando-contreras',
  minutosLectura: 9,
  keywords: [
    'reclamar ficha de Google',
    'mi negocio aparece en Google y no es mío',
    'ficha de Google sin reclamar',
    'alguien más administra mi ficha de Google',
    'solicitud de acceso Google Business Profile',
    'reclamar negocio en Google Maps Panamá',
  ],
  /** Imagen de portada y OpenGraph. Prompts en herramientas/prompts/imagenes-reclamar-ficha.md */
  imagen: {
    src: '/blog/reclamar-ficha-google-negocio-panama.webp',
    alt: 'Dueño de un negocio en Panamá reclamando la ficha de Google Maps de su local desde el celular',
    ancho: 1200,
    alto: 630,
  },
  /** Productos y páginas propias que este artículo enlaza */
  relacionados: [
    { titulo: 'Por qué tu negocio no aparece en Google Maps', href: '/blog/por-que-mi-negocio-no-aparece-en-google-maps' },
    { titulo: 'Cómo pedir reseñas sin que te penalicen', href: '/blog/como-pedir-resenas-google-sin-penalizacion' },
    { titulo: 'Más reseñas para talleres y mecánicas', href: '/resenas-google/talleres-y-mecanicas' },
    { titulo: 'Ver los dispositivos NFC', href: '/catalogo' },
  ],
  faqs: [
    {
      q: "¿Cuánto cuesta reclamar mi ficha de Google?",
      a: `Nada. Reclamar y administrar el perfil es gratis. Si te llaman ofreciéndote activar tu perfil por una mensualidad, te están cobrando por un trámite que haces tú.`,
    },
    {
      q: "Mi negocio ya sale en Google Maps y yo nunca lo puse. ¿Es normal?",
      a: `Sí. Google arma fichas con la información que encuentra. Que exista no significa que sea tuya: hasta que la reclames no puedes responder reseñas ni corregir los datos.`,
    },
    {
      q: "La ficha la tiene la agencia que me hizo la web y ya no trabajo con ellos.",
      a: `Entra a reclamarla igual. Google te muestra el correo del administrador con parte de los caracteres tapados. Si lo reconoces, pídele la transferencia. Si no, manda la solicitud de acceso desde ahí y Google le da un plazo para responder.`,
    },
    {
      q: "¿Cuánto tarda la solicitud de acceso?",
      a: `Google le da unos días al administrador actual para aceptar o rechazar. Si no responde en ese plazo, puedes quedarte con el control. Si rechaza, te va a pedir documentos del negocio. No hay forma de apurarlo.`,
    },
    {
      q: "¿Reclamar la ficha me va a subir en Google Maps?",
      a: `Por sí sola, no. Te da el control para corregir la categoría, el horario y responder reseñas, que son cosas que sí cuentan. La posición depende de cercanía, relevancia y de cuántas reseñas recientes tengas frente a los que compiten contigo.`,
    },
    {
      q: "Encontré dos fichas de mi negocio. ¿Qué hago?",
      a: `Quédate con la que tenga más reseñas y reporta la otra como duplicada desde Maps. No borres ni abandones la fuerte, que es el error más caro: las reseñas no se transfieren solas.`,
    },
  ],
  cuerpo: `Google crea fichas de negocios por su cuenta. Las arma con lo que encuentra en internet, en mapas viejos y en lo que reportan los usuarios, y las publica sin avisarle a nadie. Si nunca entraste a Google Business Profile y tu negocio igual aparece en Maps, esa ficha existe y no es tuya todavía.

![Dueño de una barbería en Panamá revisando en su celular la ficha de Google de su propio negocio](/blog/revisar-ficha-google-sin-reclamar-panama.webp)

## Qué significa que esté sin reclamar

Reclamar es el trámite por el que Google confirma que tú eres el dueño y te entrega el control. Mientras no lo hagas, la ficha vive sola: muestra el horario que alguien supuso, la categoría que Google adivinó y las fotos que subieron los clientes.

Hay tres cosas que no puedes hacer con una ficha sin reclamar, y las tres cuestan plata:

- No puedes responder las reseñas. La tasa de respuesta del dueño es una de las señales que Google mira, y la tuya queda en cero.
- No puedes corregir el horario ni el teléfono. Si están mal, el cliente llama y no contesta nadie.
- Cualquiera puede sugerir un cambio en tu información y Google lo puede aceptar sin que te enteres.

Hay algo más, y es la razón por la que esto importa para posicionarte: una ficha sin dueño le dice a Google que el negocio no está atendido. Entre dos locales parecidos, el que tiene perfil verificado y activo arranca con ventaja.

## Cómo saber si la tuya está así

Busca tu negocio en Google Maps desde el celular, tal como lo buscaría un cliente. Mira el bloque de información y busca una de estas señales:

1. Aparece el enlace **«¿Es tu empresa?»** o **«Reclamar este negocio»**. Esa es la señal clara: nadie la ha reclamado.
2. No ves el panel de propietario con las opciones de editar, publicar y ver estadísticas.
3. Dice **«Pendiente de verificación»** o te manda a un proceso cuando intentas editar. Ahí la ficha ya está reclamada, puede que por alguien que trabajó contigo antes.

![Captura de la ficha de Google Maps de un negocio mostrando el enlace para reclamar el negocio](/blog/enlace-reclamar-negocio-google-maps.webp)

De los 228 negocios que llevamos anotados en nuestra lista de prospección entre La Chorrera y Arraiján, 8 tenían la ficha sin reclamar. Son fondas, barberías y salones que ya salían en Maps con reseñas de clientes reales (algunas de hace más de tres años) y sin nadie del otro lado administrándolas ni leyendo los comentarios.

En varios de estos casos, al conversar con el propietario o encargado, nos encontramos con la misma situación: asumían que para tener el control de esa ficha necesitaban pagar una mensualidad a un intermediario o que era un trámite engorroso con Google. Cuando les mostramos que su local ya acumulaba opiniones y que el proceso de reclamación es 100% gratuito y directo, pudieron verificar su número de WhatsApp comercial y empezar a contestar las dudas que los clientes dejaban en Maps sin gastar un centavo.

## Reclamarla cuando nadie más la tiene

Es el caso fácil y toma menos de lo que parece.

1. Entra a la ficha en Google Maps y toca «Reclamar este negocio», o ve a business.google.com con el correo que vas a usar de aquí en adelante. Elige bien ese correo: cambiarlo después es un trámite aparte.
2. Confirma el nombre y la dirección exactos. Si el negocio no atiende al público en una dirección, lo configuras como zona de servicio, que es otra historia y la conté en [cómo poner en Google Maps un negocio que no tiene local](/blog/negocio-sin-local-google-maps-panama).
3. Elige el método de verificación que te ofrezca. En Panamá hoy casi siempre es video, a veces código por correo o por teléfono. No eliges tú, Google decide según el rubro y la zona.
4. Mientras esperas, no crees otra ficha. Ese es el error que más daño hace y lo explico abajo.

## Cuando alguien más ya la administra

Pasa más de lo que uno cree. La agencia que te hizo la web, el sobrino que ayudó con el Instagram, el proveedor de un sistema de pedidos. Alguien la reclamó y ya nadie se acuerda con qué correo.

Google tiene un proceso para esto y se llama solicitud de acceso. Cuando intentas reclamar una ficha que ya tiene dueño, te muestra el correo con parte de los caracteres tapados, del tipo \`j••••@gmail.com\`, que suele bastar para reconocer quién es. Si lo reconoces, lo más rápido es llamar a esa persona y pedirle que te transfiera la propiedad desde el panel.

Si no reconoces el correo o no te responden, mandas la solicitud desde ahí mismo. Google le escribe al administrador actual y le da unos días para aceptar o rechazar. Si no contesta en el plazo, puedes quedarte con el control. Si rechaza, Google te pide documentos del negocio y lo revisa.

Es lento y no hay forma de apurarlo. Por eso vale la pena hacerlo ahora y no el día que necesites corregir algo urgente.

## Lo que cambia cuando la reclamas

Lo primero que recuperas es la conversación. Puedes responder todas las reseñas que ya están ahí, incluso las de hace años, y la respuesta del dueño es de lo poco que un cliente nuevo lee completo antes de decidir.

Después puedes arreglar lo básico: la categoría principal, que es el campo que más pesa para que salgas en las búsquedas de tu rubro, el horario, el teléfono y las fotos. También quedas habilitado para publicar novedades y ver cuánta gente te buscó y cómo llegó.

![Panel de Google Business Profile ya reclamado mostrando las opciones de responder reseñas y editar la información del negocio](/blog/panel-google-business-profile-reclamado.webp)

Lo que no cambia: reclamar la ficha no te sube en el mapa por sí solo. Te da las herramientas para competir y la posición se gana aparte. Si tu problema es que no sales en las búsquedas de categoría, eso se diagnostica distinto y lo expliqué en [por qué tu negocio no aparece en Google Maps](/blog/por-que-mi-negocio-no-aparece-en-google-maps).

Tampoco te borra las reseñas malas, porque eso no lo puede hacer nadie, ni tú ni nosotros. Lo que ganas es poder contestarlas.

## El error que más daño hace

Crear una ficha nueva porque la vieja no la puedes controlar.

Terminas con dos fichas del mismo negocio compitiendo entre ellas. Google reparte las reseñas, las señales y las búsquedas entre las dos, y ninguna llega a estar fuerte. Lo vimos hace poco con un negocio del rubro automotriz en Panamá que tenía dos fichas en la misma dirección, una con 17 reseñas y otra con 86. Esa segunda era la que trabajaba, y el dueño llevaba meses mirando la equivocada.

Arreglarlo después es más trabajo que esperar la verificación: hay que reportar la duplicada, pedir la fusión y esperar que Google decida. Si ya tienes dos, reporta la que tenga menos reseñas y quédate con la fuerte.

## Después de reclamarla

Con el perfil en la mano, lo que mueve la aguja es el flujo de reseñas nuevas. Un negocio con 7 reseñas de hace tres años le dice a Google lo mismo que uno abandonado.

La forma de pedirlas sin arriesgar la ficha está en [cómo pedir reseñas de Google sin que te penalicen](/blog/como-pedir-resenas-google-sin-penalizacion), y si quieres el lado práctico, en [cómo conseguir 100 reseñas reales](/blog/como-conseguir-100-resenas-google-maps) está el guion que usamos.

![Placa NFC de starTAP en el mostrador de un negocio en Panamá para que el cliente deje su reseña de Google con un toque](/blog/placa-nfc-mostrador-despues-de-reclamar-ficha.webp)

Nosotros vendemos dispositivos que acortan ese paso, y los tienes en [el catálogo](/catalogo). Nada de lo que está arriba sobre reclamar la ficha necesita que nos compres algo: el trámite es gratis y lo haces tú en una tarde.`,
  cierre: `Escrito por Fernando Contreras, fundador de starTAP Panamá. Los datos de fichas sin reclamar salen de nuestra propia lista de prospección en La Chorrera y Arraiján.

Nota de transparencia: vendemos dispositivos NFC para reseñas de Google. Reclamar tu ficha es gratis y no requiere comprarnos nada.

Fuentes: documentación de Google Business Profile sobre reclamación de fichas y sobre solicitudes de acceso a un perfil administrado por otra persona.`,
  ctaAuditoria: true,
};
