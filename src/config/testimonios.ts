/**
 * Testimonios reales de clientes de starTAP.
 *
 * REGLAS, no son decorativas:
 *
 * 1. Solo va aquí lo que el cliente dijo de verdad. Nada se mejora ni se
 *    completa. Si la frase quedó corta o con un pero, va con el pero.
 * 2. `publicado` arranca en false. Se pone en true SOLO cuando el cliente
 *    autorizó por escrito que usemos su nombre y su negocio en la web.
 *    Un mensaje privado de WhatsApp no es autorización para publicar.
 * 3. Si el negocio es nuestro o de un familiar, `relacionado: true`. Eso
 *    imprime el aviso de transparencia al lado del testimonio. Omitirlo es
 *    engañar al lector.
 * 4. Estos NO son reseñas de producto con calificación y no se usan para el
 *    `aggregateRating` del schema de Producto. Para eso hace falta que el
 *    cliente ponga una nota del 1 al 5. Ver el punto 12 de
 *    INSTRUCCIONES_ANTIGRAVITY.md.
 */

export interface Testimonio {
  id: string;
  /** Nombre tal como el cliente quiere aparecer */
  nombre: string;
  /** Negocio y zona, si el cliente autoriza nombrarlo */
  negocio: string;
  /** Lo que dijo, textual */
  texto: string;
  /** Productos que compró, para mostrarlo en la ficha correcta */
  productos: string[];
  /** true solo con autorización por escrito del cliente */
  publicado: boolean;
  /** true si el negocio es nuestro o de un allegado: imprime aviso */
  relacionado?: boolean;
  /** Nota del 1 al 5 si el cliente la dio. Sin esto no hay estrellas. */
  calificacion?: number;
}

export const TESTIMONIOS: Testimonio[] = [
  {
    id: 'wilmer-gonzalez',
    nombre: 'Dr. Wilmer González',
    negocio: '',
    texto: 'Excelente producto, la placa y las tarjetas.',
    productos: ['placa-nfc-mostrador', 'tarjeta-nfc-bolsillo', 'pack-trio-comercial'],
    publicado: true,
    calificacion: 5,
  },
  {
    id: 'ruben-fernandez-rufpixel',
    nombre: 'Rubén Fernández',
    negocio: 'RUF PIXEL, impresión y grabado láser',
    texto: 'Producto de calidad. Diez reseñas el primer día con la placa y el stand.',
    productos: ['placa-nfc-mostrador', 'stand-nfc-mesa'],
    publicado: true,
    calificacion: 5,
  },
  {
    id: 'mercedes-arepitas-que-chiva',
    nombre: 'Mercedes',
    negocio: 'Arepitas Que Chiva',
    texto: 'Me gusta más el QR, pero sí ayuda.',
    productos: ['placa-nfc-mostrador'],
    publicado: true,
    calificacion: 4,
  },
];

/** Los que se pueden mostrar hoy */
export function testimoniosPublicables(): Testimonio[] {
  return TESTIMONIOS.filter((t) => t.publicado);
}

/** Los de un producto concreto, para su ficha */
export function testimoniosDeProducto(productId: string): Testimonio[] {
  return testimoniosPublicables().filter((t) => t.productos.includes(productId));
}

/**
 * aggregateRating para el schema de Producto, calculado SOLO con testimonios
 * publicados que traigan calificación del 1 al 5.
 *
 * Devuelve null cuando no hay ninguno con nota, y en ese caso el schema no
 * emite `aggregateRating`. Search Console avisa que falta el campo, y ese aviso
 * es correcto: significa que todavía no hay calificaciones reales. Nunca se
 * rellena a mano.
 */
export function aggregateRatingDeProducto(productId: string): {
  ratingValue: string;
  reviewCount: string;
  bestRating: string;
  worstRating: string;
} | null {
  const conNota = testimoniosDeProducto(productId).filter(
    (t) => typeof t.calificacion === 'number'
  );
  if (conNota.length === 0) return null;

  const suma = conNota.reduce((acc, t) => acc + (t.calificacion as number), 0);
  const promedio = suma / conNota.length;

  return {
    ratingValue: promedio.toFixed(1),
    reviewCount: String(conNota.length),
    bestRating: '5',
    worstRating: '1',
  };
}

/** Los `Review` del schema, solo los que tienen nota */
export function reviewsSchemaDeProducto(productId: string) {
  return testimoniosDeProducto(productId)
    .filter((t) => typeof t.calificacion === 'number')
    .map((t) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: t.nombre },
      reviewRating: {
        '@type': 'Rating',
        ratingValue: String(t.calificacion),
        bestRating: '5',
        worstRating: '1',
      },
      reviewBody: t.texto,
    }));
}
