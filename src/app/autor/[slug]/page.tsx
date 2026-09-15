import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { BASE_URL, AUTORES, getAutor, getPostsOrdenados, formatearFecha } from '@/lib/blog';

export function generateStaticParams() {
  return Object.keys(AUTORES).map((slug) => ({ slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const autor = getAutor(params.slug);
  if (!autor) return { title: 'Autor no encontrado' };

  return {
    title: `${autor.nombre}, ${autor.cargo}`,
    description: autor.bio,
    alternates: { canonical: `/autor/${autor.slug}` },
    openGraph: {
      type: 'profile',
      url: `${BASE_URL}/autor/${autor.slug}`,
      title: `${autor.nombre} | starTAP`,
      description: autor.bio,
    },
  };
}

export default function AutorPage({ params }: { params: { slug: string } }) {
  const autor = getAutor(params.slug);
  if (!autor) notFound();

  const posts = getPostsOrdenados().filter((p) => p.autor === autor.slug);

  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${BASE_URL}/autor/${autor.slug}#person`,
    name: autor.nombre,
    jobTitle: autor.cargo,
    description: autor.bio,
    url: `${BASE_URL}/autor/${autor.slug}`,
    ...(autor.foto ? { image: `${BASE_URL}${autor.foto}` } : {}),
    ...(autor.sameAs.length ? { sameAs: autor.sameAs } : {}),
    worksFor: {
      '@type': 'Organization',
      name: 'DataKorex',
      url: 'https://www.datakorex.com',
    },
    knowsAbout: [
      'SEO local',
      'Google Business Profile',
      'Reseñas de Google',
      'Tecnología NFC',
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      <div className="max-w-3xl mx-auto px-5 py-12 sm:py-16">
        <nav aria-label="Ruta de navegación" className="text-xs text-brand-400 mb-6">
          <Link href="/" className="hover:text-accent-600">Inicio</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-accent-600">Blog</Link>
        </nav>

        <header className="flex flex-col sm:flex-row gap-6 items-start mb-12 pb-12 border-b border-brand-200">
          {autor.foto ? (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={autor.foto}
              alt={`Foto de ${autor.nombre}, ${autor.cargo}`}
              width={112}
              height={112}
              className="w-28 h-28 rounded-2xl object-cover flex-shrink-0 bg-brand-50"
            />
          ) : (
            <div
              className="w-28 h-28 rounded-2xl bg-brand-100 flex items-center justify-center text-2xl font-black text-brand-400 flex-shrink-0"
              aria-hidden="true"
            >
              {autor.nombre
                .split(' ')
                .map((n) => n[0])
                .join('')
                .slice(0, 2)}
            </div>
          )}

          <div>
            <h1 className="text-3xl font-black text-brand-950">{autor.nombre}</h1>
            <p className="text-accent-600 font-bold text-sm mt-1">{autor.cargo}</p>
            <p className="text-brand-600 leading-relaxed mt-4">{autor.bio}</p>

            {autor.sameAs.length > 0 && (
              <ul className="flex flex-wrap gap-3 mt-4 text-sm">
                {autor.sameAs.map((enlace) => (
                  <li key={enlace}>
                    <a
                      href={enlace}
                      target="_blank"
                      rel="noopener noreferrer me"
                      className="text-accent-600 hover:underline"
                    >
                      {enlace.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </header>

        <h2 className="text-xl font-bold text-brand-950 mb-6">
          Artículos de {autor.nombre.split(' ')[0]}
        </h2>

        <ul className="space-y-4">
          {posts.map((p) => (
            <li key={p.slug}>
              <Link
                href={`/blog/${p.slug}`}
                className="group block rounded-2xl border border-brand-200 p-6 hover:border-accent-500 transition"
              >
                <h3 className="font-bold text-brand-950">{p.titulo}</h3>
                <p className="text-sm text-brand-500 mt-2">{p.resumen}</p>
                <div className="mt-3 flex items-center gap-3 text-xs text-brand-400">
                  <time dateTime={p.fecha}>{formatearFecha(p.fecha)}</time>
                  <span>{p.minutosLectura} min</span>
                </div>
                <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-accent-600">
                  Leer
                  <ArrowRight
                    className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
