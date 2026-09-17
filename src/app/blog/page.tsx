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

      <div className="max-w-6xl mx-auto px-5 py-12 sm:py-16">
        {/* Cabecera */}
        <header className="mb-12 max-w-2xl">
          <p className="text-xs font-bold uppercase tracking-widest text-[#01A6D2] mb-3">Blog</p>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 leading-tight tracking-tight">
            SEO local y reseñas de Google, explicado para negocios en Panamá
          </h1>
          <p className="mt-5 text-lg text-slate-500 leading-relaxed">
            Guías prácticas escritas desde el trabajo de campo: qué mira Google para elegir los
            tres negocios que muestra arriba, cómo pedir reseñas sin arriesgar tu ficha y qué
            hacer esta semana para mejorar.
          </p>
        </header>

        {/* ── Mosaico de artículos ── */}
        {posts.length === 0 ? (
          <p className="text-slate-400 text-sm">Próximamente nuevos artículos.</p>
        ) : (
          <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {posts.map((p, idx) => {
              const autor = getAutor(p.autor);
              const isHero = idx === 0;

              return (
                <li key={p.slug} className={isHero ? 'sm:col-span-2 lg:col-span-2' : ''}>
                  <Link
                    href={`/blog/${p.slug}`}
                    className="group flex flex-col h-full rounded-2xl border border-slate-200 hover:border-[#01A6D2] overflow-hidden bg-white shadow-xs hover:shadow-md transition-all"
                  >
                    {/* ── Imagen destacada FUERA del texto ── */}
                    <div className={`w-full overflow-hidden bg-slate-100 ${isHero ? 'h-64 sm:h-72' : 'h-48'}`}>
                      {p.imagen?.src ? (
                        <img
                          src={p.imagen.src}
                          alt={p.imagen.alt}
                          width={p.imagen.ancho}
                          height={p.imagen.alto}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          loading={isHero ? 'eager' : 'lazy'}
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#01A6D2]/10 to-slate-100">
                          <span className="text-4xl">⭐</span>
                        </div>
                      )}
                    </div>

                    {/* ── Contenido ── */}
                    <div className="flex flex-col flex-1 p-5 sm:p-6 gap-3">
                      <span className="inline-block self-start px-2.5 py-0.5 rounded-full bg-[#01A6D2]/10 text-[#01A6D2] text-[10px] font-bold uppercase tracking-wide">
                        {p.categoria}
                      </span>

                      <h2 className={`font-black text-slate-950 leading-snug group-hover:text-[#01A6D2] transition-colors ${isHero ? 'text-2xl sm:text-3xl' : 'text-lg'}`}>
                        {p.titulo}
                      </h2>

                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 flex-1">
                        {p.resumen}
                      </p>

                      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 text-xs text-slate-400 pt-3 border-t border-slate-100 mt-auto">
                        <div className="flex items-center gap-3">
                          {autor && <span className="font-medium">{autor.nombre}</span>}
                          <time dateTime={p.fecha} className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" aria-hidden="true" />
                            {formatearFecha(p.fecha)}
                          </time>
                          <span>{p.minutosLectura} min</span>
                        </div>
                        <span className="inline-flex items-center gap-1 text-[#01A6D2] font-bold text-xs group-hover:gap-2 transition-all">
                          Leer
                          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                        </span>
                      </div>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        {/* ── CTA industrias ── */}
        <section className="mt-14 rounded-3xl bg-slate-50 border border-slate-200 p-7">
          <h2 className="text-xl font-bold text-slate-950 mb-3">¿Buscas algo de tu rubro?</h2>
          <p className="text-slate-500 text-sm leading-relaxed mb-4">
            Tenemos guías separadas por tipo de negocio, con el momento exacto para pedir la
            reseña en cada caso.
          </p>
          <Link
            href="/resenas-google"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#01A6D2] hover:underline"
          >
            Ver las guías por industria
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </section>
      </div>
    </>
  );
}
