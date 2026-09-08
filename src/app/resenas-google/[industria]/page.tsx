import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Check, MessageCircle, Smartphone, Star } from 'lucide-react';
import { INDUSTRIAS, getIndustria } from '@/lib/industrias';

const BASE_URL = 'https://startap.com.pa';
const WHATSAPP = 'https://wa.me/50767134341';

export function generateStaticParams() {
  return INDUSTRIAS.map((i) => ({ industria: i.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { industria: string };
}): Metadata {
  const ind = getIndustria(params.industria);
  if (!ind) return { title: 'Reseñas de Google en Panamá' };

  return {
    title: ind.title,
    description: ind.description,
    alternates: { canonical: `/resenas-google/${ind.slug}` },
    openGraph: {
      title: `${ind.title} | starTAP`,
      description: ind.description,
      url: `${BASE_URL}/resenas-google/${ind.slug}`,
    },
  };
}

export default function IndustriaPage({
  params,
}: {
  params: { industria: string };
}) {
  const ind = getIndustria(params.industria);
  if (!ind) notFound();

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: ind.faqs.map((f) => ({
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
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Reseñas de Google',
        item: `${BASE_URL}/resenas-google`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: ind.nombre,
        item: `${BASE_URL}/resenas-google/${ind.slug}`,
      },
    ],
  };

  const otras = INDUSTRIAS.filter((i) => i.slug !== ind.slug);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <article className="max-w-4xl mx-auto px-5 py-12 sm:py-16">
        <nav aria-label="Ruta de navegación" className="text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-accent-600">
            Inicio
          </Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700">{ind.nombre}</span>
        </nav>

        <header className="mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent-50 text-accent-600 text-xs font-bold uppercase tracking-wide mb-4">
            <Star className="w-3.5 h-3.5" />
            SEO local en Panamá
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 leading-tight tracking-tight">
            {ind.h1}
          </h1>
          <p className="mt-5 text-lg text-gray-600 leading-relaxed">{ind.intro}</p>
        </header>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-950 mb-3">
            Por qué tu {ind.nombreSingular} no recibe reseñas
          </h2>
          <p className="text-gray-600 leading-relaxed">{ind.dolor}</p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-950 mb-3">
            El momento exacto para pedirla
          </h2>
          <p className="text-gray-600 leading-relaxed">{ind.momento}</p>

          <ol className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { n: '1', t: 'El cliente acerca el celular', d: 'Al dispositivo NFC, o escanea el código QR.' },
              { n: '2', t: 'Se abre tu ficha de Google', d: 'Directo en la pantalla de escribir reseña.' },
              { n: '3', t: 'Deja sus estrellas', d: 'Sin apps, sin buscar, sin escribir tu nombre.' },
            ].map((p) => (
              <li key={p.n} className="rounded-2xl border border-gray-200 p-5">
                <div className="w-8 h-8 rounded-lg bg-accent-500 text-white font-bold flex items-center justify-center mb-3">
                  {p.n}
                </div>
                <h3 className="font-bold text-gray-950 text-sm">{p.t}</h3>
                <p className="text-sm text-gray-500 mt-1">{p.d}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-950 mb-4">
            Qué gana tu {ind.nombreSingular}
          </h2>
          <ul className="space-y-3">
            {ind.beneficios.map((b) => (
              <li key={b} className="flex gap-3 text-gray-600">
                <Check className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" />
                <span>{b}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="mb-12 rounded-3xl bg-gray-950 text-white p-7 sm:p-9">
          <div className="flex items-start gap-3 mb-3">
            <Smartphone className="w-6 h-6 text-accent-500 flex-shrink-0" />
            <h2 className="text-2xl font-bold">
              El dispositivo recomendado para {ind.nombre}
            </h2>
          </div>
          <p className="text-gray-300 leading-relaxed">{ind.productoRazon}</p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href={`/shop/${ind.producto}`}
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-accent-500 hover:bg-accent-600 font-bold transition"
            >
              Ver el producto
            </Link>
            <a
              href={WHATSAPP}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-white/20 hover:bg-white/10 font-bold transition"
            >
              <MessageCircle className="w-4 h-4" />
              Preguntar por WhatsApp
            </a>
          </div>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-950 mb-5">Preguntas frecuentes</h2>
          <dl className="space-y-5">
            {ind.faqs.map((f) => (
              <div key={f.q} className="border-b border-gray-200 pb-5">
                <dt className="font-bold text-gray-950">{f.q}</dt>
                <dd className="mt-2 text-gray-600 leading-relaxed">{f.a}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section aria-labelledby="otras-industrias">
          <h2 id="otras-industrias" className="text-xl font-bold text-gray-950 mb-4">
            Otros negocios que usan starTAP
          </h2>
          <ul className="flex flex-wrap gap-2">
            {otras.map((o) => (
              <li key={o.slug}>
                <Link
                  href={`/resenas-google/${o.slug}`}
                  className="inline-block px-4 py-2 rounded-full border border-gray-200 text-sm text-gray-700 hover:border-accent-500 hover:text-accent-600 transition"
                >
                  {o.nombre}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </article>
    </>
  );
}
