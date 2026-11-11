import type { BlogPost } from '@/lib/blog';

export const post: BlogPost = {
  slug: 'que-es-nfc-y-para-que-sirve-en-un-negocio',
  titulo: 'Qué es NFC y para qué sirve en un negocio',
  tituloSeo: 'Qué es NFC y para qué Sirve en un Negocio | starTAP',
  descripcion:
    'Qué es el chip NFC, cómo funciona sin batería y para qué sirve en un local: reseñas, wifi, menú y contacto. Los tres casos donde no responde y qué hacer.',
  resumen:
    'Es el mismo chip con el que pagas acercando la tarjeta al datáfono. Dentro de un negocio sirve para que el cliente haga en un toque lo que hoy no hace.',
  fecha: '2026-11-11',
  actualizado: '2026-11-11',
  categoria: 'Dispositivos',
  autor: 'fernando-contreras',
  minutosLectura: 8,
  keywords: [
    'qué es NFC',
    'para qué sirve NFC',
    'cómo funciona una tarjeta NFC',
    'chip NFC negocio',
    'usos del NFC en un local',
    'NFC sin batería',
  ],
  /** Imagen de portada y OpenGraph. Prompts en herramientas/prompts/imagenes-que-es-nfc.md */
  imagen: {
    src: '/blog/placa-nfc-qr-mostrador-cobro-panama.webp',
    alt: 'Cliente con teléfono junto a la placa de mostrador starTAP con chip NFC y código QR en un comercio de Panamá',
    ancho: 1200,
    alto: 630,
  },
  /** Productos y páginas propias que este artículo enlaza */
  relacionados: [
    { titulo: 'QR o NFC: cuál poner al frente', href: '/blog/qr-o-nfc-resenas-google-panama' },
    { titulo: 'Stand NFC para mesas y mostradores', href: '/catalogo/stand-nfc-mesa' },
    { titulo: 'Placa NFC de mostrador', href: '/catalogo/placa-nfc-mostrador' },
    { titulo: 'Cuántas reseñas necesitas en Google Maps', href: '/blog/cuantas-resenas-necesitas-google-maps-panama' },
  ],
  faqs: [
    {
      q: '¿Qué significa NFC?',
      a: `Comunicación de campo cercano, por sus siglas en inglés. Es la tecnología que permite que dos aparatos intercambien datos cuando están a pocos centímetros, sin cables y sin emparejarlos.`,
    },
    {
      q: '¿El chip NFC necesita batería o pilas?',
      a: `No. El chip de una tarjeta o placa es pasivo: el propio celular lo alimenta por inducción cuando se acerca. Por eso no se descarga y no caduca.`,
    },
    {
      q: '¿El cliente tiene que descargar una aplicación?',
      a: `No. El celular lee el chip con el sistema que ya trae y abre el enlace en el navegador. Ni el cliente ni el negocio instalan nada.`,
    },
    {
      q: '¿Qué pasa si el celular del cliente no lee NFC?',
      a: `Usa el código QR impreso en la misma pieza. Los equipos sin chip, los Android con el NFC apagado en ajustes y las fundas con placa metálica son los tres casos donde conviene tener el QR a la vista.`,
    },
    {
      q: '¿Se puede cambiar lo que abre el chip después de comprarlo?',
      a: `Sí. El enlace grabado es editable, así que la misma pieza sirve si cambias de ficha de Google, de red social o de local.`,
    },
    {
      q: '¿Es seguro? ¿Pueden copiar mis datos?',
      a: `El chip solo guarda un enlace público, el mismo que podrías mandar por WhatsApp. No lleva datos bancarios ni información privada, y el alcance es de pocos centímetros.`,
    },
  ],
  cuerpo: `NFC son las siglas de comunicación de campo cercano. Es el mismo chip con el que pagas acercando la tarjeta al datáfono.

Dentro de un negocio sirve para una cosa: que el cliente haga en un toque algo que hoy le da pereza hacer en seis pasos. Dejar una reseña, seguirte en Instagram, conectarse al wifi, ver el menú.

Abajo está cómo funciona por dentro, para qué se usa en un local, los tres casos donde no responde y lo que no resuelve.

![Cliente con teléfono junto a la placa de mostrador starTAP con chip NFC y código QR en un comercio de Panamá](/blog/placa-nfc-qr-mostrador-cobro-panama.webp)

## Qué hay dentro del chip

Una antena de cobre enrollada y un microchip del tamaño de un grano de arena. Nada más. No hay batería, no hay pilas, no hay nada que se descargue.

¿Cómo funciona sin corriente? Cuando acercas el celular, su propia antena genera un campo magnético. Ese campo induce corriente en la antena del chip y lo enciende por el tiempo que dure el contacto. El chip devuelve lo que tiene grabado, que en nuestro caso es un enlace, y el teléfono lo abre en el navegador.

Por eso una tarjeta NFC no caduca y no se daña con el uso. Lo que se puede dañar es el plástico, no el circuito.

El alcance son dos o tres centímetros. Tiene que ser así: si funcionara a un metro, cualquiera leería tu tarjeta de crédito desde la fila del supermercado.

## Para qué sirve en un local

Aquí está el punto que casi nadie explica. El chip no hace nada por sí mismo. Lo que hace es **quitar pasos**.

Hagamos la cuenta con el caso que más vendemos. Pedirle a un cliente que te deje una reseña en Google por su cuenta son seis movimientos: desbloquear el teléfono, abrir Maps, escribir el nombre del negocio, encontrarlo entre los parecidos, bajar hasta el bloque de opiniones y tocar las estrellas.

Con el chip sobre el mostrador es uno: acercar.

Esa diferencia de seis a uno es todo el producto, y se aplica a cualquier cosa que hoy le pidas al cliente con un enlace:

- **Reseñas de Google.** Abre la ventana de las cinco estrellas de tu ficha.
- **Instagram.** Abre tu perfil con el botón de seguir a la vista.
- **Wifi.** Conecta al invitado sin dictarle la contraseña.
- **Menú o catálogo.** Abre la carta digital sin imprimir nada.
- **Contacto.** Guarda tu teléfono en la agenda del cliente.
- **Ubicación.** Abre la ruta hasta tu local en Maps.

Todas usan el mismo chip. Lo único que cambia es el enlace que lleva grabado, y ese se edita cuando quieras.

## Los tres casos donde el chip no responde

Esta sección existe porque es la que separa una explicación honesta de un folleto.

**El celular no trae NFC.** Equipos de gama baja y modelos viejos. El cliente acerca el teléfono y no pasa nada.

**Lo trae apagado.** Pasa en Android, donde el NFC es un interruptor en ajustes que mucha gente nunca encendió.

**La funda estorba.** Las fundas gruesas con placa metálica, las de los soportes magnéticos de carro, bloquean el campo.

En los tres casos la cara que pone el cliente es la peor publicidad que puedes tener en tu mostrador. Por eso nuestras piezas llevan el código QR impreso en la misma cara: el chip resuelve el caso rápido y el QR cubre al que no puede usarlo.

Mercedes, de Arepitas Que Chiva, nos lo dijo con sus palabras después de instalar la placa: le gusta más el QR, pero sí ayuda. Esa frase vale más que cualquier argumento de producto, y es la razón de que no vendamos piezas con chip solo.

![Cliente con funda gruesa en el celular escaneando el código QR de la placa porque el chip no responde](/blog/celular-funda-gruesa-escaneo-qr-panama.webp)

## En qué formato viene

El chip es el mismo en los tres. Lo que cambia es dónde se para la pieza y en qué momento la ve el cliente.

| Formato | Dónde va | Para quién |
| --- | --- | --- |
| Tarjeta de bolsillo | Billetera o delantal | Quien atiende fuera del mostrador |
| Stand de mesa | Sobre la mesa o la barra | Restaurantes y salas de espera |
| Placa de mostrador | Pegada en la caja | Tiendas, talleres y recepciones |

El [stand NFC](/catalogo/stand-nfc-mesa) es el formato que más preguntan los restaurantes y las salas de espera, porque se para solo y queda con el ángulo inclinado hacia la persona que está sentada. La [placa NFC de mostrador](/catalogo/placa-nfc-mostrador) va pegada y no se mueve, que es su ventaja: nadie la guarda en una gaveta al limpiar.

Rubén, de RUF PIXEL, instaló la placa y el stand juntos y registró diez reseñas el primer día. Ese es el número más alto que tenemos anotado y no es lo que le pasa a todo el mundo. Lo publico porque muestra de qué depende: él puso las piezas a la vista y su equipo las ofrecía.

## NFC o QR, cuál pones al frente

Las dos vienen en la misma pieza, así que la pregunta no es cuál comprar sino cuál dejas a la vista.

En la ciudad, donde la mayoría de los teléfonos que pasan por la caja ya pagan acercando el celular, el chip al frente funciona. En el interior, donde buena parte de la clientela anda con equipos más sencillos y está contenta con ellos, el QR grande es el que trabaja.

Lo desarrollo con más detalle en [QR o NFC para reseñas de Google](/blog/qr-o-nfc-resenas-google-panama).

## Lo que el NFC no resuelve

**No consigue clientes.** Acorta el camino del que ya está parado frente a ti.

**No convence a nadie.** Si el cliente salió molesto, el chip también le acorta el camino para decirlo.

**No sustituye tener la ficha en orden.** De los 525 negocios que llevamos anotados en nuestra lista de prospección entre La Chorrera y Arraiján, 44 tienen la ficha de Google sin reclamar. Para esos, comprar un dispositivo antes de reclamarla sería gastar en el orden equivocado, porque el chip mandaría gente a un perfil que no controlan.

**No funciona guardado.** Lo hemos visto: el local compra la pieza, la deja detrás del monitor y no pasa nada. Lo que mueve el número es la frase corta de quien atiende cuando la pone sobre la mesa.

## Qué haría yo

Si estás leyendo esto porque viste una placa en algún lado y te dio curiosidad, haz la prueba antes de comprar nada.

Busca tu negocio en Google Maps desde tu propio celular, como lo haría un cliente. Si abajo dice «¿Es tu empresa?», ese es tu primer trabajo y es gratis: [reclamar la ficha](/blog/reclamar-ficha-google-mi-negocio-panama).

Si la ficha ya es tuya, mira los tres negocios que salen arriba del tuyo y cuenta sus reseñas. Esa cuenta te dice si tu problema es de cantidad o es de otra cosa, y lo explico en [cuántas reseñas necesitas en Google Maps](/blog/cuantas-resenas-necesitas-google-maps-panama).

Y si el problema es de cantidad, ahí sí una pieza sobre el mostrador te ahorra la conversación incómoda de pedirla.`,
  cierre: `Escrito por Fernando Contreras, fundador de starTAP Panamá. Los testimonios de Mercedes y de Rubén están publicados con su autorización. El dato de fichas sin reclamar sale de nuestra lista de prospección en La Chorrera y Arraiján, anotada negocio por negocio.

Nota de transparencia: vendemos dispositivos NFC con código QR. Todo lo explicado sobre cómo funciona la tecnología, y el consejo de reclamar la ficha antes de comprar nada, no requiere comprarnos nada.

Fuentes: especificación de NFC Forum sobre etiquetas pasivas y documentación de Google Business Profile sobre reseñas.`,
  ctaAuditoria: true,
};
