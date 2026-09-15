import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, ArrowRight, MessageCircle } from 'lucide-react';
import Markdown, { extraerEncabezados } from '@/components/Markdown';
import {
  BASE_URL,
  POSTS,
  getPost,
  getAutor,
  formatearFecha,
} from '@/lib/blog';
import { WHATSAPP_URL } from '@/lib/landings';

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const post = getPost(params.slug);
  if (!post) return { title: 'Artículo no encontrado' };

  const autor = getAutor(post.autor);
  const url = `${BASE_URL}/blog/${post.slug}`;

  return {
    title: post.tituloSeo,
    description: post.descripcion,
    keywords: post.keywords,
    authors: autor ? [{ name: autor.nombre, url: `${BASE_URL}/autor/${autor.slug}` }] : undefined,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: 'article',
      url,
      title: post.titulo,
      description: post.descripcion,
      publishedTime: post.fecha,
      modifiedTime: post.actualizado,
      authors: autor ? [autor.nombre] : undefined,
      images: [
        {
          url: `${BASE_URL}${post.imagen.src}`,
          width: post.imagen.ancho,
          height: post.imagen.alto,
          alt: post.imagen.alt,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.titulo,
      description: post.descripcion,
      images: [`${BASE_URL}${post.imagen.src}`],
    },
  };
}

export default function ArticuloPage({ params }: { params: { slug: string } }) {
  const post = getPost(params.slug);
  if (!post) notFound();

  const autor = getAutor(post.autor);
  const url = `${BASE_URL}/blog/${post.slug}`;
  const secciones = extraerEncabezados(post.cuerpo);

  const autorSchema = autor
    ? {
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
      }
    : undefined;

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    '@id': `${url}#article`,
    headline: post.titulo,
    description: post.descripcion,
    inLanguage: 'es-PA',
    datePublished: post.fecha,
    dateModified: post.actualizado,
    articleSection: post.categoria,
    keywords: post.keywords.join(', '),
    wordCount: post.cuerpo.split(/\s+/).length,
    image: {
      '@type': 'ImageObject',
      url: `${BASE_URL}${post.imagen.src}`,
      width: post.imagen.ancho,
      height: post.imagen.alto,
    },
    author: autorSchema,
    publisher: { '@id': `${BASE_URL}/#organization` },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    isPartOf: { '@type': 'Blog', '@id': `${BASE_URL}/blog#blog`, name: 'Blog de starTAP' },
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: post.faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: BASE_URL },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${BASE_URL}/blog` },
      { '@type': 'ListItem', position: 3, name: post.titulo, item: url },
    ],
  };

  const otros = POSTS.filter((p) => p.slug !== post.slug).slice(0, 2);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="max-w-3xl mx-auto px-5 py-12 sm:py-16">
        <nav aria-label="Ruta de navegación" className="text-xs text-brand-400 mb-6">
          <Link href="/" className="hover:text-accent-600">Inicio</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-accent-600">Blog</Link>
        </nav>

        <header className="mb-10">
          <span className="inline-block px-3 py-1 rounded-full bg-accent-50 text-accent-600 text-[11px] font-bold uppercase tracking-wide mb-4">
            {post.categoria}
          </span>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-950 leading-[1.15] tracking-tight">
            {post.titulo}
          </h1>

          <p className="mt-5 text-lg text-brand-600 leading-relaxed">{post.resumen}</p>

          {autor && (
            <div className="mt-7 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-brand-500 border-y border-brand-200 py-4">
              <span>
                Por{' '}
                <Link
                  href={`/autor/${autor.slug}`}
                  rel="author"
                  className="font-bold text-brand-950 hover:text-accent-600"
                >
                  {autor.nombre}
                </Link>
                , {autor.cargo}
              </span>
              <time dateTime={post.fecha} className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                {formatearFecha(post.fecha)}
              </time>
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" aria-hidden="true" />
                {post.minutosLectura} min de lectura
              </span>
            </div>
          )}
        </header>

        {/* Portada. Cuando la imagen exista se muestra sola. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={post.imagen.src}
          alt={post.imagen.alt}
          width={post.imagen.ancho}
          height={post.imagen.alto}
          className="w-full rounded-2xl mb-10 bg-brand-50"
        />

        {secciones.length > 2 && (
          <nav
            aria-label="Contenido del artículo"
            className="mb-12 rounded-2xl border border-brand-200 bg-brand-50 p-6"
          >
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-950 mb-3">
              En este artículo
            </h2>
            <ol className="space-y-1.5 text-sm">
              {secciones.map((s) => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-brand-600 hover:text-accent-600">
                    {s.texto}
                  </a>
                </li>
              ))}
            </ol>
          </nav>
        )}

        <div className="text-[17px]">
          <Markdown>{post.cuerpo}</Markdown>
        </div>

        {post.faqs.length > 0 && (
          <section className="mt-16" aria-labelledby="faq">
            <h2 id="faq" className="text-2xl sm:text-3xl font-black text-brand-950 mb-6">
              Preguntas frecuentes
            </h2>
            <dl className="space-y-6">
              {post.faqs.map((f) => (
                <div key={f.q} className="border-b border-brand-200 pb-6">
                  <dt className="font-bold text-brand-950 mb-2">{f.q}</dt>
                  <dd className="text-brand-600">
                    <Markdown>{f.a}</Markdown>
                  </dd>
                </div>
              ))}
            </dl>
          </section>
        )}

        <footer className="mt-14 pt-8 border-t border-brand-200">
          <div className="text-sm text-brand-500">
            <Markdown>{post.cierre}</Markdown>
          </div>
        </footer>

        <section className="mt-12 rounded-3xl bg-brand-950 text-white p-7 sm:p-9">
          <h2 className="text-2xl font-black mb-3">¿Quieres que te ayudemos con esto?</h2>
          <p className="text-brand-300 leading-relaxed">
            Vendemos dispositivos NFC para reseñas y trabajamos SEO local en Panamá. Si tienes
            dudas sobre tu ficha, escríbenos y te decimos qué te falta, compres o no.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent-500 hover:bg-accent-600 font-bold transition"
            >
              <MessageCircle className="w-4 h-4" aria-hidden="true" />
              Escríbenos por WhatsApp
            </a>
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 font-bold transition"
            >
              Ver los dispositivos
            </Link>
          </div>
        </section>

        {post.relacionados.length > 0 && (
          <section className="mt-12" aria-labelledby="relacionados">
            <h2 id="relacionados" className="text-xl font-bold text-brand-950 mb-4">
              Seguir leyendo
            </h2>
            <ul className="flex flex-wrap gap-2">
              {post.relacionados.map((r) => (
                <li key={r.href}>
                  <Link
                    href={r.href}
                    className="inline-block px-4 py-2 rounded-full border border-brand-200 text-sm text-brand-700 hover:border-accent-500 hover:text-accent-600 transition"
                  >
                    {r.titulo}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {otros.length > 0 && (
          <section className="mt-10">
            <ul className="grid gap-4 sm:grid-cols-2">
              {otros.map((o) => (
                <li key={o.slug}>
                  <Link
                    href={`/blog/${o.slug}`}
                    className="group block h-full rounded-2xl border border-brand-200 p-5 hover:border-accent-500 transition"
                  >
                    <h3 className="font-bold text-brand-950 text-sm">{o.titulo}</h3>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-accent-600">
                      Leer
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}
      </article>
    </>
  );
}
