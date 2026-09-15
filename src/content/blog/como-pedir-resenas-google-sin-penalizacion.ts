import type { BlogPost } from '@/lib/blog';

export const post: BlogPost = {
  slug: 'como-pedir-resenas-google-sin-penalizacion',
  titulo: 'Cómo pedir reseñas de Google sin que te penalicen',
  tituloSeo: 'Cómo Pedir Reseñas de Google sin que te Penalicen | Guía Panamá',
  descripcion:
    'Pedir reseñas a tus clientes es legal. Filtrarlas o pagarlas no. Qué permite Google, qué te puede costar la ficha y cómo pedirlas bien en un negocio de Panamá.',
  resumen:
    'La pregunta que más me hacen visitando negocios no es cuánto cuesta, es si esto se puede hacer. Aquí está la línea exacta entre pedir reseñas y que Google te sancione.',
  fecha: '2026-09-15',
  actualizado: '2026-09-15',
  categoria: 'SEO local',
  autor: 'fernando-contreras',
  minutosLectura: 8,
  keywords: [
    'pedir reseñas de Google',
    'reseñas de Google Panamá',
    'políticas de reseñas de Google',
    'penalización reseñas Google',
    'review gating',
    'Google Business Profile Panamá',
  ],
  /** Imagen de portada y OpenGraph. Ver la lista en FOTOS_BLOG.md */
  imagen: {
    src: '/blog/pedir-resenas-google-panama-nfc.webp',
    alt: 'Cliente acercando su celular a un dispositivo NFC para dejar una reseña de Google en un negocio de Panamá',
    ancho: 1200,
    alto: 675,
  },
  /** Productos y páginas propias que este artículo enlaza */
  relacionados: [
    { titulo: 'Más reseñas para restaurantes', href: '/resenas-google/restaurantes' },
    { titulo: 'Más reseñas para barberías y salones', href: '/resenas-google/barberias-y-salones' },
    { titulo: 'Ver los dispositivos NFC', href: '/catalogo' },
  ],
  faqs: [
    {
      q: "¿Cuánto cuesta tener mi negocio en Google Maps?",
      a: `Nada. Crear y administrar tu ficha en Google Business Profile es gratis, y siempre lo ha sido. Si alguien te llama ofreciéndote "activar tu perfil de Google" por una mensualidad, es un cobro por algo que puedes hacer tú en veinte minutos. Lo que sí toma tiempo es la verificación, que hoy suele ser por video y puede tardar unos días.`,
    },
    {
      q: "¿Puedo pedirle reseñas a mi familia o a mis empleados?",
      a: `No conviene. Google cruza señales de dispositivo, cuenta y ubicación, y las reseñas de personas vinculadas al negocio suelen terminar borradas. Peor todavía si todas llegan juntas los primeros días. Es el error típico de quien acaba de abrir la ficha y quiere arrancar con algo.`,
    },
    {
      q: "Me dejaron una reseña falsa. ¿La puedo borrar?",
      a: `Borrarla tú, no. Lo que puedes hacer es reportarla desde tu perfil si incumple las políticas de Google, por ejemplo si tiene insultos, si es de alguien que nunca fue tu cliente o si es publicidad de otro negocio. Google la revisa y decide. El proceso demora y no siempre falla a tu favor.

Mientras tanto, respóndela con calma y sin pelear. Un cliente nuevo que llega a tu ficha lee mucho más tu respuesta que la queja.`,
    },
    {
      q: "¿Cuántas reseñas necesito para salir en los primeros lugares?",
      a: `No hay un número. Google mezcla cercanía, relevancia y prominencia, así que depende de contra quién compites en tu zona. Lo práctico es esto: busca en Google Maps lo que tu cliente buscaría, mira los tres negocios que salen arriba y cuenta cuántas reseñas tienen. Esa es tu meta real, no una cifra que te diga alguien.`,
    },
    {
      q: "Tengo reseñas viejas sin responder. ¿Vale la pena contestarlas ahora?",
      a: `Sí. Responder tarde es mejor que no responder, y la tasa de respuesta del dueño cuenta para Google. Empieza por las negativas y por las más recientes. No necesitas una respuesta larga: reconocer lo que pasó y decir qué hiciste al respecto alcanza.`,
    },
    {
      q: "¿Qué pasa con mis reseñas si me mudo de local?",
      a: `Se quedan contigo. Actualizas la dirección en tu perfil y el historial te sigue. Lo que no puedes hacer es usar la ficha de un negocio anterior para uno nuevo y distinto, porque ahí sí Google lo trata como ficha engañosa.`,
    },
    {
      q: "Mi negocio no tiene local, trabajo desde casa. ¿Puedo estar en Google Maps?",
      a: `Sí. Se configura como negocio de zona de servicio: Google te pide la dirección para verificarte pero no la muestra al público, y en su lugar aparecen las áreas donde atiendes. Es lo normal para plomeros, catering, fotógrafos y cualquiera que vaya donde el cliente. Nosotros mismos operamos así.`,
    },
    {
      q: "¿Necesito una tarjeta o un dispositivo NFC para conseguir reseñas?",
      a: `No. Puedes hacerlo gratis con el enlace corto de tu perfil, mandado por WhatsApp después de cada venta. Vendemos dispositivos NFC y aun así te lo digo: si estás empezando, prueba primero con el enlace. Si notas que se te olvida pedirlo o que el cliente se va antes, ahí es donde un dispositivo a la vista en la caja cambia las cosas.`,
    },
  ],
  cuerpo: `La pregunta que más me hacen cuando visito un negocio no es cuánto cuesta. Es si esto se puede hacer.

Y tiene sentido, porque casi todos escucharon a alguien que "consigue reseñas" y no quieren meterse en problemas. La respuesta corta es que sí, pedir reseñas es completamente legal y Google lo recomienda. Lo que no se puede es elegir quién las deja o pagarlas.

Esa diferencia es la que te puede costar la ficha, así que vale la pena entenderla bien.

## Antes que nada: sí, esto le importa a tu negocio

Cuando le explico esto a un dueño de local, una parte me dice algo que al principio me sorprendió: no sabe qué es Google Maps.

No lo digo como burla. Lo digo porque es lo más común que me encuentro, y porque si estás ahí, no estás atrasado ni eres el único.

Tu negocio probablemente ya aparece en Google Maps aunque tú nunca lo hayas puesto. Google arma fichas solo, con lo que encuentra. Cuando alguien busca "restaurante cerca de mí" o "taller en La Chorrera", Google le muestra tres negocios arriba de todo. Ese bloque de tres es donde se decide quién recibe la llamada.

Y para elegir esos tres, Google mira tres cosas: qué tan cerca estás de quien busca, qué tan bien le calzas a lo que buscó, y qué tan conocido eres. Las reseñas pesan en las últimas dos.

## Lo que Google sí permite

Puedes pedirle una reseña a cualquier cliente. Google lo dice en su propia documentación y hasta te da un enlace corto para compartir desde tu perfil de empresa.

Esto está permitido:

- Pedirla de palabra al cerrar la venta o al entregar el trabajo
- Mandarla por WhatsApp con tu enlace
- Ponerla en la factura, en el recibo o en la firma del correo
- Tener un cartel, un sticker, un QR o un dispositivo NFC a la vista
- Recordársela a un cliente que ya te dijo que quedó contento

En resumen: puedes pedirla cuantas veces quieras y a quien quieras, siempre que se la ofrezcas a todos por igual.

![Dispositivo físico starTAP con NFC y código QR para colocar visiblemente en mostrador o pared de atención](/products/NFC_10001/placa-acrilica-resistente-agua-limpieza.webp)

## Lo que te puede costar la ficha

Aquí está la parte que casi nadie te cuenta.

**Filtrar.** Preguntarle primero al cliente si quedó contento y mandar a Google solo a los que dicen que sí. En inglés le dicen *review gating* y Google lo prohíbe de forma expresa. Es la práctica más común entre quienes venden "sistemas de reseñas" en la región, y es la más riesgosa.

**Pagar o regalar.** Un descuento, un café, un sorteo, puntos de fidelidad. Cualquier cosa a cambio de la reseña está prohibida, aunque no le pidas que sea positiva.

**Comprar reseñas.** Google las detecta y las borra. Solo en 2025 bloqueó o eliminó [más de 292 millones de reseñas que incumplían sus políticas](https://blog.google/products-and-platforms/products/maps/new-ways-were-protecting-businesses-on-maps/), y borró 13 millones de fichas falsas. Y no solo desaparece la comprada: te queda la ficha marcada.

**Pedírselas a tu propia gente.** Empleados, familiares, tú mismo desde otra cuenta. Google cruza señales de dispositivo y ubicación.

**Ponerle metas de reseñas a tu equipo.** Esto es nuevo. Desde abril de 2026 Google prohíbe de forma expresa pedirle a los empleados que consigan cierta cantidad de reseñas en cierto tiempo. Si tenías pensado un bono por reseñas conseguidas, mejor no.

**Pedirle al cliente que escriba algo en particular.** También entró en abril de 2026. Decirle "menciona a Karla en la reseña" o "di que te gustó el corte degradado" está prohibido, aunque suene inofensivo. La reseña la redacta el cliente, con lo que él quiera.

**Poner una tablet en el local para que dejen la reseña ahí.** Esta sorprende a muchos. Si todas las reseñas salen de la misma IP y del mismo aparato, Google las agrupa y puede descartarlas completas. El cliente debe usar su propio teléfono.

Las consecuencias suben por escalones: primero te borran las reseñas afectadas, después te bloquean la posibilidad de recibir nuevas, y en los casos serios te suspenden la ficha. Recuperar una ficha suspendida toma semanas de apelaciones, y mientras tanto desapareces del mapa.

Hay un escalón intermedio que asusta más que la suspensión: Google puede poner un **aviso público en tu ficha** advirtiendo que detectó reseñas sospechosas. Lo ve cualquiera que te busque. Es el peor de los dos mundos, porque sigues visible pero con un cartel que dice que hiciste trampa.

## Entonces, ¿cómo se hace bien?

Después de instalar dispositivos en varios negocios, lo que veo es que casi todo se juega en dos cosas: cuándo la pides y cuánto esfuerzo le cuesta al cliente.

**El momento.** No es cuando entra ni cuando está esperando. Es el instante justo después de que quedó satisfecho: cuando el barbero le da la vuelta a la silla y el cliente se mira, cuando llega la cuenta y comentó que la comida estuvo buena, cuando le entregas el carro funcionando. Ese pico dura poco y se desperdicia casi siempre.

**El esfuerzo.** Pedirle que busque tu negocio en Google, lo encuentre entre varios parecidos, baje hasta reseñas y escriba algo son cinco pasos. Ahí se cae casi todo el mundo, no por mala voluntad sino porque es incómodo hacerlo parado frente a ti.

Por eso funciona cualquier cosa que lo reduzca a un toque: un enlace directo por WhatsApp, un QR en la mesa, un dispositivo NFC en la caja. La tecnología no es lo importante. Lo importante es que el cliente llegue directo a la pantalla de calificar.

![Stand NFC y QR autoportante para mesas y barras de atención](/products/NFC10002/stand-nfc-resenas-google-frontal.webp)

Y una cosa más que aprendí a la mala: si tu equipo no lo menciona, no pasa nada. Un stand en el mostrador que nadie señala genera una fracción de lo que genera el mismo stand con un mesero diciendo "si te gustó, acercá el celular aquí".

![Tarjeta NFC de bolsillo para que meseros y personal de atención la lleven en su portacredencial](/products/tarjeta-nfc/tarjeta-nfc-en-lanyard-empleado.webp)

## Un caso con números

RufPixel, un cliente nuestro de impresión y grabado láser, tenía una sola reseña hace dos semanas. Hoy tiene diez.

No es una cifra espectacular y no la voy a inflar. Pero diez reseñas en un negocio chico de Panamá Oeste ya te mueve de posición contra un competidor que tiene dos, y se consiguieron sin filtrar a nadie y sin regalar nada. Solo pidiéndoselas a todos, en el momento correcto, con un toque.

Con PanamaToons, que vende souvenirs, el reto es distinto: mucho cliente de paso que no vuelve. Ahí el momento útil es la caja, y solo ese.

## Lo que no te va a arreglar esto

Las reseñas no compensan un mal servicio. Si el problema es el tiempo de espera o la atención, pedir más reseñas solo hace que se note más rápido.

Tampoco es instantáneo. Google reparte el peso entre volumen, recencia y calificación, y una ficha que salta de 2 a 60 reseñas en una semana se ve rara. Sube parejo.

Y te lo digo con la carta sobre la mesa: nosotros vendemos dispositivos NFC para esto. Puedes conseguir el mismo resultado con tu enlace de Google pegado por WhatsApp, gratis. El dispositivo ahorra fricción en el local, no hace magia.

## Por dónde empezar esta semana

1. Busca tu negocio en Google Maps desde tu celular. Si no aparece, créalo en Google Business Profile, que es gratis.
2. En tu perfil, copia el enlace corto para pedir reseñas.
3. Mándaselo por WhatsApp a los últimos diez clientes con los que quedaste bien. A todos, no solo a los que crees que van a hablar bien.
4. Responde cada reseña que llegue, buena o mala, dentro de las 24 horas.

Ese paso 4 es el más subestimado. La tasa de respuesta del dueño es señal para Google y es lo primero que lee un cliente nuevo cuando llega a tu ficha.`,
  cierre: `**Fernando Contreras** es fundador de starTAP y de DataKorex, en Panamá Oeste. starTAP es un producto de DataKorex.

*Nota de transparencia: la ficha de Google de starTAP está en proceso de verificación mientras se publica este artículo. Cuando esté activa vas a poder ver ahí mismo si aplicamos lo que recomendamos.*

**Fuentes**

- [Política de contenido generado por usuarios de Google Maps](https://support.google.com/contributionpolicy/answer/7400114?hl=es), sección "Manipulación de valoraciones". Es la que prohíbe los incentivos, el conflicto de intereses y "solicitar reseñas positivas de clientes de forma selectiva".
- [Restricciones del perfil de empresa por incumplimiento de políticas](https://support.google.com/business/answer/14114287?hl=es), donde Google detalla las sanciones.
- [New ways we're protecting businesses on Maps](https://blog.google/products-and-platforms/products/maps/new-ways-were-protecting-businesses-on-maps/), blog oficial de Google, con las cifras de 2025.

*Las dos prohibiciones sobre metas de reseñas para empleados y sobre pedir contenido específico se añadieron a la política de manipulación de valoraciones el 17 de abril de 2026.*`,
};
