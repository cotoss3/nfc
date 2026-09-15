import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, Calendar } from 'lucide-react';
import { BASE_URL, getPostsOrdenados, getAutor, formatearFecha } from '@/lib/blog';

export const metadata: Metadata = {
  title: 'Blog de SEO Local y Reseñas de Google en Panamá',
  description:
    'Guías prácticas para que tu negocio en Panamá salga primero en Google Maps: cómo pedir reseñas sin que te penalicen, qué mira Google y qué hacer cada semana.',
  alternates: { canonical: '/blog' },
  openGraph: {
    type: 'website',
    url: `${BASE_URL}/blog`,
    title: 'Blog de SEO Local y Reseñas de Google en Panamá | starTAP',
    description:
      'Guías prácticas de SEO local para negocios panameños, escritas por quien instala los dispositivos y trabaja las fichas.',
  },
};

export default function BlogHub() {
  const posts = getPostsOrdenados();

  const blogSchema = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    '@id': `${BASE_URL}/blog#blog`,
    name: 'Blog de starTAP',
    description:
      'Guías de SEO local y reseñas de Google para negocios en Panamá.',
    inLanguage: 'es-PA',
    url: `${BASE_URL}/blog`,
    publisher: { '@id': `${BASE_URL}/#organization` },
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      '@id': `${BASE_URL}/blog/${p.slug}#article`,
      headline: p.titulo,
      description: p.descripcion,
      datePublished: p.fecha,
      dateModified: p.actualizado,
      url: `${BASE_URL}/blog/${p.slug}`,
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="max-w-4xl mx-auto px-5 py-12 sm:py-16">
        <header className="mb-12">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-950 leading-tight tracking-tight">
            SEO local y reseñas de Google, explicado para negocios en Panamá
          </h1>
          <p className="mt-5 text-lg text-brand-600 leading-relaxed">
            Guías prácticas escritas desde el trabajo de campo: qué mira Google para elegir los
            tres negocios que muestra arriba, cómo pedir reseñas sin arriesgar tu ficha y qué
            hacer esta semana para mejorar.
          </p>
        </header>

        <ul className="space-y-6">
          {posts.map((p) => {
            const autor = getAutor(p.autor);
            return (
              <li key={p.slug}>
                <Link
                  href={`/blog/${p.slug}`}
                  className="group block rounded-2xl border border-brand-200 p-6 sm:p-8 hover:border-accent-500 transition"
                >
                  <span className="inline-block px-2.5 py-0.5 rounded-full bg-accent-50 text-accent-600 text-[10px] font-bold uppercase tracking-wide mb-3">
                    {p.categoria}
                  </span>

                  <h2 className="text-xl sm:text-2xl font-black text-brand-950 leading-snug">
                    {p.titulo}
                  </h2>

                  <p className="mt-3 text-brand-600 leading-relaxed">{p.resumen}</p>

                  <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-brand-400">
                    {autor && <span>{autor.nombre}</span>}
                    <time dateTime={p.fecha} className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                      {formatearFecha(p.fecha)}
                    </time>
                    <span>{p.minutosLectura} min</span>
                  </div>

                  <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-accent-600">
                    Leer el artículo
                    <ArrowRight
                      className="w-4 h-4 group-hover:translate-x-0.5 transition-transform"
                      aria-hidden="true"
                    />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <section className="mt-14 rounded-3xl bg-brand-50 border border-brand-200 p-7">
          <h2 className="text-xl font-bold text-brand-950 mb-3">¿Buscas algo de tu rubro?</h2>
          <p className="text-brand-600 text-sm leading-relaxed mb-4">
            Tenemos guías separadas por tipo de negocio, con el momento exacto para pedir la
            reseña en cada caso.
          </p>
          <Link
            href="/resenas-google"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-accent-600 hover:underline"
          >
            Ver las guías por industria
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </>
  );
}
