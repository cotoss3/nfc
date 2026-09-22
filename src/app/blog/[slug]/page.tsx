import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Calendar, Clock, ArrowRight, MessageCircle, BookOpen, UserCheck, Sparkles, RefreshCw } from 'lucide-react';
import Markdown, { extraerEncabezados } from '@/components/Markdown';
import dynamic from 'next/dynamic';
import ReadingProgressBar from '@/components/ReadingProgressBar';
import {
  BASE_URL,
  POSTS,
  getPost,
  getAutor,
  formatearFecha,
} from '@/lib/blog';
import { WHATSAPP_URL } from '@/lib/landings';

import CtaAuditoria from '@/components/blog/CtaAuditoria';

const DiagnosticoFicha = dynamic(() => import('@/components/blog/DiagnosticoFicha'));

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
      <ReadingProgressBar />
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

      <article className="min-h-screen">
        {/* Header & Hero Area */}
        <div className="bg-gradient-to-b from-brand-50/70 to-transparent border-b border-brand-100/60 pb-10 pt-6">
          <header className="max-w-4xl mx-auto px-5">
            <nav aria-label="Ruta de navegación" className="text-xs text-brand-500 mb-6 flex items-center gap-1.5 font-medium">
              <Link href="/" className="hover:text-accent-600 transition">Inicio</Link>
              <span className="text-brand-300">/</span>
              <Link href="/blog" className="hover:text-accent-600 transition">Blog</Link>
              <span className="text-brand-300">/</span>
              <span className="text-brand-700 truncate max-w-[200px] sm:max-w-none">{post.categoria}</span>
            </nav>

            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-50 border border-accent-200/60 text-accent-600 text-[11px] font-bold uppercase tracking-wider mb-5 shadow-xs">
              <Sparkles className="w-3 h-3" />
              {post.categoria}
            </span>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-950 leading-[1.15] tracking-tight">
              {post.titulo}
            </h1>

            <p className="mt-5 text-lg sm:text-xl text-brand-600 leading-relaxed max-w-3xl">{post.resumen}</p>

            {autor && (
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-xs sm:text-sm text-brand-600 pt-6 border-t border-brand-200/80">
                <div className="flex items-center gap-3">
                  {autor.foto && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={autor.foto}
                      alt={autor.nombre}
                      className="w-9 h-9 rounded-full object-cover border border-brand-200 shadow-xs"
                    />
                  )}
                  <div>
                    <span className="block font-bold text-brand-950 leading-tight">
                      <Link href={`/autor/${autor.slug}`} rel="author" className="hover:text-accent-600 transition">
                        {autor.nombre}
                      </Link>
                    </span>
                    <span className="text-xs text-brand-500">{autor.cargo}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-brand-500 sm:ml-auto">
                  <time dateTime={post.fecha} className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-brand-200/70 shadow-2xs">
                    <Calendar className="w-3.5 h-3.5 text-accent-500" aria-hidden="true" />
                    {formatearFecha(post.fecha)}
                  </time>
                  <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-full border border-brand-200/70 shadow-2xs">
                    <Clock className="w-3.5 h-3.5 text-accent-500" aria-hidden="true" />
                    {post.minutosLectura} min de lectura
                  </span>
                  {/* La fecha de actualizacion visible la exige REGLAS_CONTENIDO.md
                      (Confianza). Hasta ahora solo estaba en el JSON-LD, donde el
                      lector no la ve. */}
                  {post.actualizado && post.actualizado !== post.fecha && (
                    <time
                      dateTime={post.actualizado}
                      className="flex items-center gap-1.5 bg-accent-50 px-3 py-1.5 rounded-full border border-accent-200 text-accent-800 font-semibold"
                    >
                      <RefreshCw className="w-3.5 h-3.5 text-accent-600" aria-hidden="true" />
                      Actualizado el {formatearFecha(post.actualizado)}
                    </time>
                  )}
                </div>
              </div>
            )}
          </header>
        </div>

        {/* Hero Image */}
        <div className="max-w-5xl mx-auto px-5 mt-8 mb-12">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.imagen.src}
            alt={post.imagen.alt}
            width={post.imagen.ancho}
            height={post.imagen.alto}
            className="w-full rounded-2xl sm:rounded-3xl object-cover max-h-[500px] shadow-md border border-brand-100 bg-brand-50"
          />
        </div>

        {/* Main Content & Sidebar Grid */}
        <div className="max-w-6xl mx-auto px-5 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* Left Column: Article Body & FAQs */}
            <main className="lg:col-span-8 min-w-0">
              {/* Mobile Table of Contents */}
              {secciones.length > 2 && (
                <nav
                  aria-label="Contenido del artículo"
                  className="lg:hidden mb-10 rounded-2xl border border-brand-200 bg-brand-50/80 p-5 sm:p-6"
                >
                  <h2 className="text-xs font-bold uppercase tracking-widest text-brand-950 mb-3 flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-accent-600" />
                    En este artículo
                  </h2>
                  <ol className="space-y-2 text-sm">
                    {secciones.map((s) => (
                      <li key={s.id}>
                        <a href={`#${s.id}`} className="text-brand-700 hover:text-accent-600 font-medium transition">
                          {s.texto}
                        </a>
                      </li>
                    ))}
                  </ol>
                </nav>
              )}

              {/* Main Markdown Content */}
              <div className="prose prose-brand max-w-none text-[17px] sm:text-[18px] leading-relaxed text-brand-800">
                <Markdown>{post.cuerpo}</Markdown>
              </div>

              {post.herramienta === 'diagnostico-ficha' && <DiagnosticoFicha />}

              {/* FAQs */}
              {post.faqs.length > 0 && (
                <section className="mt-16 pt-10 border-t border-brand-200" aria-labelledby="faq">
                  <h2 id="faq" className="text-2xl sm:text-3xl font-black text-brand-950 mb-6">
                    Preguntas frecuentes
                  </h2>
                  <dl className="space-y-6">
                    {post.faqs.map((f) => (
                      <div key={f.q} className="rounded-2xl border border-brand-200/80 bg-brand-50/40 p-5 sm:p-6">
                        <dt className="font-bold text-brand-950 text-base mb-2">{f.q}</dt>
                        <dd className="text-brand-600 text-sm leading-relaxed">
                          <Markdown>{f.a}</Markdown>
                        </dd>
                      </div>
                    ))}
                  </dl>
                </section>
              )}

              {post.ctaAuditoria && <CtaAuditoria />}

              {/* Article Footer & Transparency Note */}
              <footer className="mt-12 pt-8 border-t border-brand-200">
                <div className="text-xs sm:text-sm text-brand-500 bg-brand-50/60 rounded-2xl p-5 border border-brand-200/60 leading-relaxed">
                  <Markdown>{post.cierre}</Markdown>
                </div>
              </footer>

              {/* CTA Section */}
              <section className="mt-12 rounded-3xl bg-gradient-to-br from-brand-950 via-brand-900 to-brand-950 text-white p-7 sm:p-9 shadow-xl relative overflow-hidden">
                <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-accent-500/10 rounded-full blur-2xl pointer-events-none" />
                <h2 className="text-2xl sm:text-3xl font-black mb-3 text-white">¿Quieres que te ayudemos con tu negocio?</h2>
                <p className="text-brand-300 leading-relaxed text-sm sm:text-base">
                  Vendemos dispositivos NFC para reseñas y trabajamos SEO local en Panamá. Si tienes
                  dudas sobre tu ficha, escríbenos y te decimos qué te falta, compres o no.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent-500 hover:bg-accent-600 font-bold transition text-white shadow-md hover:shadow-lg"
                  >
                    <MessageCircle className="w-5 h-5" aria-hidden="true" />
                    Escríbenos por WhatsApp
                  </a>
                  <Link
                    href="/catalogo"
                    className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-white/25 hover:bg-white/10 font-bold transition text-white"
                  >
                    Ver catálogo NFC
                  </Link>
                </div>
              </section>

              {/* Related links */}
              {post.relacionados.length > 0 && (
                <section className="mt-12" aria-labelledby="relacionados">
                  <h2 id="relacionados" className="text-lg font-bold text-brand-950 mb-4">
                    Enlaces relacionados
                  </h2>
                  <ul className="flex flex-wrap gap-2">
                    {post.relacionados.map((r) => (
                      <li key={r.href}>
                        <Link
                          href={r.href}
                          className="inline-block px-4 py-2 rounded-xl border border-brand-200 text-sm text-brand-700 hover:border-accent-500 hover:text-accent-600 transition bg-white shadow-2xs"
                        >
                          {r.titulo}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}

              {/* Other Articles */}
              {otros.length > 0 && (
                <section className="mt-10 pt-8 border-t border-brand-200">
                  <h2 className="text-lg font-bold text-brand-950 mb-4">Más artículos del blog</h2>
                  <ul className="grid gap-4 sm:grid-cols-2">
                    {otros.map((o) => (
                      <li key={o.slug}>
                        <Link
                          href={`/blog/${o.slug}`}
                          className="group block h-full rounded-2xl border border-brand-200 p-5 hover:border-accent-500 transition bg-white shadow-2xs hover:shadow-md"
                        >
                          <span className="text-[11px] font-bold text-accent-600 uppercase tracking-wide">{o.categoria}</span>
                          <h3 className="font-bold text-brand-950 text-sm mt-1">{o.titulo}</h3>
                          <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-accent-600">
                            Leer artículo
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" aria-hidden="true" />
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </main>

            {/* Right Column: Desktop Sticky Sidebar */}
            <aside className="lg:col-span-4 hidden lg:block sticky top-24 space-y-6">
              
              {/* Desktop Table of Contents */}
              {secciones.length > 0 && (
                <div className="rounded-2xl border border-brand-200/90 bg-white p-6 shadow-xs">
                  <h2 className="text-xs font-bold uppercase tracking-wider text-brand-950 mb-4 flex items-center gap-2 pb-3 border-b border-brand-100">
                    <BookOpen className="w-4 h-4 text-accent-500" />
                    En este artículo
                  </h2>
                  <ol className="space-y-2.5 text-xs leading-relaxed">
                    {secciones.map((s) => (
                      <li key={s.id}>
                        <a
                          href={`#${s.id}`}
                          className="text-brand-600 hover:text-accent-600 font-medium transition block hover:translate-x-0.5"
                        >
                          {s.texto}
                        </a>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Author Box */}
              {autor && (
                <div className="rounded-2xl border border-brand-200/90 bg-brand-50/50 p-6 shadow-xs">
                  <div className="flex items-center gap-3 mb-3">
                    {autor.foto ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={autor.foto}
                        alt={autor.nombre}
                        className="w-12 h-12 rounded-full object-cover border border-brand-200 shadow-xs"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-accent-100 text-accent-600 flex items-center justify-center font-bold">
                        <UserCheck className="w-6 h-6" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-brand-950 text-sm">{autor.nombre}</h3>
                      <p className="text-xs text-brand-500">{autor.cargo}</p>
                    </div>
                  </div>
                  <p className="text-xs text-brand-600 leading-relaxed mb-4">
                    {autor.bio}
                  </p>
                  <Link
                    href={`/autor/${autor.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-accent-600 hover:text-accent-700 transition"
                  >
                    Ver perfil completo
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              )}

              {/* Sidebar CTA */}
              <div className="rounded-2xl border border-accent-200/80 bg-gradient-to-br from-accent-50 to-orange-50/40 p-5 shadow-xs">
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="inline-block px-2.5 py-0.5 rounded-md bg-accent-600 text-white text-[10px] font-bold uppercase tracking-wider">
                    Solución starTAP
                  </span>
                  <span className="text-[11px] font-bold text-brand-700 bg-white/80 border border-brand-200/60 px-2 py-0.5 rounded-md">
                    Desde $20.00
                  </span>
                </div>

                <div className="relative mx-auto my-3 overflow-hidden rounded-xl bg-white/80 p-2 shadow-xs border border-brand-100 max-w-[220px]">
                  <img
                    src="/blog/placa-nfc-google-startap-sidebar.webp"
                    alt="Placa y Tarjeta NFC starTAP para reseñas en Google Maps"
                    width={500}
                    height={500}
                    className="w-full h-auto object-contain mx-auto transition-transform hover:scale-105 duration-300"
                    loading="lazy"
                  />
                </div>

                <h3 className="font-bold text-brand-950 text-sm mb-2">
                  ¿Quieres recibir más reseñas en Google?
                </h3>
                <p className="text-xs text-brand-600 leading-relaxed mb-4">
                  Nuestras tarjetas y placas NFC permiten a tus clientes dejar su reseña en 3 segundos acercando su celular.
                </p>
                <div className="space-y-2">
                  <a
                    href={WHATSAPP_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-2.5 px-4 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-bold text-xs transition shadow-xs"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Consultar por WhatsApp
                  </a>
                  <Link
                    href="/catalogo"
                    className="flex items-center justify-center w-full py-2.5 px-4 rounded-xl border border-brand-200 bg-white hover:bg-brand-50 text-brand-800 font-bold text-xs transition"
                  >
                    Ver Catálogo
                  </Link>
                </div>
              </div>

            </aside>
          </div>
        </div>
      </article>
    </>
  );
}
