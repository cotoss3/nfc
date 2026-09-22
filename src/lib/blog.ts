import { post as articulo1 } from '@/content/blog/como-pedir-resenas-google-sin-penalizacion';
import { post as articulo2 } from '@/content/blog/por-que-mi-negocio-no-aparece-en-google-maps';

export const BASE_URL = 'https://startap.com.pa';

export interface BlogFaq {
  q: string;
  a: string;
}

export interface BlogPost {
  slug: string;
  /** Título visible, en H1 */
  titulo: string;
  /** Título para el <title> del navegador. Máx ~60 caracteres antes del sufijo */
  tituloSeo: string;
  descripcion: string;
  /** Entradilla que se muestra en el listado */
  resumen: string;
  fecha: string;
  actualizado: string;
  categoria: string;
  /** slug del autor en AUTORES */
  autor: string;
  minutosLectura: number;
  keywords: string[];
  imagen: { src: string; alt: string; ancho: number; alto: number };
  relacionados: { titulo: string; href: string }[];
  faqs: BlogFaq[];
  /** Cuerpo en markdown simple: ##, ###, **negrita**, *cursiva*, listas, enlaces */
  cuerpo: string;
  /** Firma, nota de transparencia y fuentes */
  cierre: string;
}

export interface Autor {
  slug: string;
  nombre: string;
  cargo: string;
  bio: string;
  foto?: string;
  /** Perfiles que Google usa para reconocer la entidad. Clave para E-E-A-T */
  sameAs: string[];
}

export const AUTORES: Record<string, Autor> = {
  'fernando-contreras': {
    slug: 'fernando-contreras',
    nombre: 'Fernando Contreras',
    cargo: 'Fundador de starTAP Panamá y DataKorex',
    bio: 'Fundador de DataKorex, agencia de desarrollo web y automatización en Panamá Oeste, y de starTAP Panamá, su línea de dispositivos NFC para reseñas de Google. Instala los equipos en los negocios y trabaja el SEO local de sus clientes en Panamá.',
    foto: '/autores/fernando-contreras.webp',
    sameAs: [
      'https://www.datakorex.com',
      'https://www.facebook.com/profile.php?id=61594455868652',
      // Añadir LinkedIn y perfiles reales cuando estén. Cada uno suma a la entidad.
    ],
  },
};

export const POSTS: BlogPost[] = [articulo1, articulo2];

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find((p) => p.slug === slug);
}

export function getAutor(slug: string): Autor | undefined {
  return AUTORES[slug];
}

/** Ordenados del más reciente al más viejo */
export function getPostsOrdenados(): BlogPost[] {
  return [...POSTS].sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
}

export function formatearFecha(iso: string): string {
  const meses = [
    'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
    'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
  ];
  const [y, m, d] = iso.split('-').map(Number);
  return `${d} de ${meses[m - 1]} de ${y}`;
}
