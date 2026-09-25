import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { 
  Check, 
  MessageCircle, 
  Smartphone, 
  Star, 
  ArrowLeft, 
  ArrowRight, 
  AlertTriangle, 
  Zap, 
  ShieldCheck, 
  CheckCircle2, 
  Image as ImageIcon,
  HelpCircle,
  ShoppingBag, 
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { INDUSTRIAS, getIndustria } from '@/lib/industrias';
import { getProductById } from '@/config/products';

const BASE_URL = 'https://startap.com.pa';
const WHATSAPP = 'https://wa.me/50764839004';

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
    ...(ind.keywords?.length ? { keywords: ind.keywords } : {}),
    alternates: { canonical: `/resenas-google/${ind.slug}` },
    openGraph: {
      title: `${ind.title} | starTAP Panamá`,
      description: ind.description,
      url: `${BASE_URL}/resenas-google/${ind.slug}`,
      images: [
        {
          url: `${BASE_URL}${ind.imagen}`,
          width: 1024,
          height: 1024,
          alt: ind.imagenAlt,
        },
      ],
    },
  };
}

function FotoPlaceholder({
  ideaText,
  aspectRatio = 'aspect-[16/9]',
  className = '',
}: {
  ideaText: string;
  aspectRatio?: string;
  className?: string;
}) {
  return (
    <div
      className={`${aspectRatio} ${className} bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 p-6 flex flex-col items-center justify-center text-center group hover:border-amber-400 hover:bg-amber-50/20 transition-all`}
    >
      <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-xs mb-3 group-hover:text-amber-600 transition-colors">
        <ImageIcon className="w-6 h-6" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
        📸 Espacio para Imagen Recomendada
      </span>
      <p className="text-xs font-semibold text-slate-600 max-w-md leading-relaxed">
        {ideaText}
      </p>
    </div>
  );
}

export default function IndustriaPage({
  params,
}: {
  params: { industria: string };
}) {
  const ind = getIndustria(params.industria);
  if (!ind) notFound();

  const recommendedProduct = getProductById(ind.producto);

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

  const whatsappProducto = `${WHATSAPP}?text=${encodeURIComponent(
    `Hola, leí la guía de reseñas para ${ind.nombre} y me interesa adquirir el ${recommendedProduct?.name || ind.producto}.`
  )}`;

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

      <div className="bg-slate-50 min-h-screen text-slate-900 font-sans pb-24">
        
        {/* TOP BREADCRUMB BAR */}
        <div className="bg-white border-b border-slate-200 py-3 px-4">
          <div className="max-w-5xl mx-auto flex items-center justify-between text-xs font-semibold text-slate-500">
            <nav aria-label="Ruta de navegación" className="flex items-center space-x-2">
              <Link href="/" className="hover:text-slate-950 transition-colors">
                Inicio
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <Link href="/resenas-google" className="hover:text-slate-950 transition-colors">
                Reseñas de Google
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-slate-900 font-bold capitalize">{ind.nombre}</span>
            </nav>

            <Link href="/resenas-google" className="hidden sm:inline-flex items-center space-x-1 text-slate-600 hover:text-slate-950 font-bold">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Ver todas las industrias</span>
            </Link>
          </div>
        </div>

        {/* HERO SECTION */}
        <section className="bg-white border-b border-slate-200 py-12 sm:py-16 px-4">
          <div className="max-w-5xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 bg-amber-400/10 text-amber-900 border border-amber-400/30 text-xs font-black uppercase px-3.5 py-1.5 rounded-full">
              <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
              <span>Estrategia SEO Local para {ind.nombre} en Panamá</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 uppercase tracking-tight leading-tight">
              {ind.h1}
            </h1>

            <p className="text-slate-600 text-base sm:text-lg max-w-3xl leading-relaxed">
              {ind.intro}
            </p>

            {/* Quick Metrics Bar */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Dispositivo Ideal</span>
                <span className="font-extrabold text-slate-900 text-sm block">{recommendedProduct?.name || ind.producto}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Momento Clave</span>
                <span className="font-extrabold text-slate-900 text-sm block truncate">{ind.momento.split(':')[0]}</span>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Instalación</span>
                <span className="font-extrabold text-emerald-700 text-sm block">Auto-configurable • Listo en segundos</span>
              </div>
            </div>

            {/* Hero Image */}
            <div className="pt-4">
              <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full rounded-3xl overflow-hidden bg-slate-100 border border-slate-200 shadow-md">
                <Image
                  src={ind.imagen}
                  alt={ind.imagenAlt}
                  fill
                  priority
                  sizes="(max-width: 1200px) 100vw, 1024px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <div className="max-w-5xl mx-auto px-4 pt-12 space-y-16">
          
          {/* EL PROBLEMA VS LA SOLUCIÓN */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* El Problema */}
            <div className="bg-rose-50/70 border border-rose-200 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="w-10 h-10 bg-rose-100 text-rose-700 rounded-xl flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black text-rose-950 uppercase tracking-wide">
                Por Qué Tu {ind.nombreSingular} No Recibe Reseñas
              </h2>
              <p className="text-xs sm:text-sm text-rose-900 leading-relaxed font-medium">
                {ind.dolor}
              </p>
            </div>

            {/* La Solución */}
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-3xl p-6 sm:p-8 space-y-4">
              <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-black text-emerald-950 uppercase tracking-wide">
                El Momento Exacto Para Solicitarlas
              </h2>
              <p className="text-xs sm:text-sm text-emerald-900 leading-relaxed font-medium">
                {ind.momento}
              </p>
            </div>
          </section>

          {/* DINÁMICA OPERATIVA Y MOMENTO EXACTO */}
          {ind.momentoDetalle && (
            <section className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 space-y-6 shadow-card">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-amber-600 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Dinámica de Servicio</span>
                </span>
                <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tight">
                  {ind.momentoDetalle.titulo}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                  {ind.momentoDetalle.subtitulo}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {ind.momentoDetalle.pasos.map((p) => (
                  <div key={p.paso} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2 relative">
                    <div className="w-8 h-8 rounded-xl bg-amber-400 text-slate-950 font-mono font-black text-sm flex items-center justify-center">
                      {p.paso}
                    </div>
                    <h3 className="font-extrabold text-slate-950 text-xs sm:text-sm uppercase pt-1">{p.titulo}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{p.descripcion}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* PROTOCOLO PREVENTIVO DE RESEÑAS NEGATIVAS */}
          {ind.manejoPreventivo && (
            <section className="bg-gradient-to-br from-amber-500/10 via-amber-400/5 to-slate-50 border border-amber-300/60 rounded-3xl p-8 sm:p-10 space-y-6 shadow-card">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-amber-800 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-amber-700" />
                  <span>Control de Calidad y Reputación</span>
                </span>
                <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tight">
                  {ind.manejoPreventivo.titulo}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                  {ind.manejoPreventivo.subtitulo}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {ind.manejoPreventivo.reglas.map((r, idx) => (
                  <div key={idx} className="bg-white border border-amber-200/80 rounded-2xl p-5 space-y-2 shadow-xs">
                    <div className="flex items-center gap-2 text-rose-700">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <h3 className="font-extrabold text-xs uppercase text-slate-950">{r.alerta}</h3>
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{r.explicacion}</p>
                  </div>
                ))}
              </div>

              {ind.manejoPreventivo.protocolo && (
                <div className="bg-white/80 border border-slate-200 rounded-2xl p-4 sm:p-5 text-xs text-slate-700 leading-relaxed flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="font-bold text-slate-900 block mb-0.5">Protocolo ante una queja publicada:</strong>
                    {ind.manejoPreventivo.protocolo}
                  </div>
                </div>
              )}
            </section>
          )}

          {/* UBICACIÓN FÍSICA ESTRATÉGICA */}
          {ind.ubicacionVisual && (
            <section className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 space-y-6 shadow-card">
              <div className="space-y-1">
                <span className="text-xs font-black uppercase tracking-widest text-brand-400">Instalación Contextualizada</span>
                <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tight">
                  {ind.ubicacionVisual.titulo}
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
                  {ind.ubicacionVisual.subtitulo}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-3">
                {ind.ubicacionVisual.puntos.map((pt, idx) => (
                  <div key={idx} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2.5">
                    <div className="inline-block px-2.5 py-1 rounded-md bg-slate-950 text-white text-[10px] font-black uppercase tracking-wider">
                      {pt.lugar}
                    </div>
                    <div className="text-xs font-extrabold text-amber-600 block">{pt.dispositivo}</div>
                    <p className="text-xs text-slate-600 leading-relaxed">{pt.razon}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* FLUJO DE 3 PASOS EN EL LOCAL */}
          <section className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 space-y-6 shadow-card">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-brand-400">Paso a Paso en el Local</span>
              <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tight">
                ¿Cómo Funciona la Recolección en Tu {ind.nombreSingular}?
              </h2>
            </div>

            <ol className="grid gap-4 sm:grid-cols-3">
              {[
                { n: '1', t: 'El cliente acerca el teléfono', d: 'Al dispositivo NFC o escanea el QR HD en segundos.' },
                { n: '2', t: 'Abre tu ficha directa', d: 'Directo en la casilla de escribir reseña sin buscar en Google.' },
                { n: '3', t: 'Publica sus 5 estrellas', d: 'Sin descargar nada, sin contraseñas adicionales.' },
              ].map((p) => (
                <li key={p.n} className="bg-slate-50 border border-slate-200 rounded-2xl p-5 space-y-2">
                  <div className="w-8 h-8 rounded-xl bg-slate-950 text-amber-400 font-mono font-black text-sm flex items-center justify-center">
                    {p.n}
                  </div>
                  <h3 className="font-extrabold text-slate-950 text-xs sm:text-sm uppercase">{p.t}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{p.d}</p>
                </li>
              ))}
            </ol>
          </section>

          {/* BENEFICIOS CLAVE */}
          <section className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-brand-400">Resultados Medibles</span>
              <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tight">
                Qué Gana Tu {ind.nombreSingular} con starTAP
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {ind.beneficios.map((b, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-5 flex items-start space-x-3.5 shadow-xs">
                  <div className="w-7 h-7 bg-emerald-100 text-emerald-700 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                  <span className="text-xs sm:text-sm font-semibold text-slate-800 leading-relaxed">{b}</span>
                </div>
              ))}
            </div>
          </section>

          {/* PRODUCTO RECOMENDADO DESTACADO */}
          <section className="bg-slate-950 text-white rounded-3xl p-8 sm:p-12 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              
              {/* Product Photo */}
              <div className="lg:col-span-5">
                {recommendedProduct?.image ? (
                  <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner flex items-center justify-center p-6">
                    <Image
                      src={recommendedProduct.image}
                      alt={`Dispositivo starTAP ${recommendedProduct.name} para ${ind.nombre}`}
                      width={500}
                      height={500}
                      className="object-contain max-h-full max-w-full drop-shadow-xl"
                    />
                  </div>
                ) : (
                  <FotoPlaceholder
                    ideaText={`Idea Visual: Fotografía de catálogo profesional del producto ${recommendedProduct?.name || ind.producto} grabado e instalado para ${ind.nombre}`}
                    aspectRatio="aspect-square"
                  />
                )}
              </div>

              {/* Product Info & CTA */}
              <div className="lg:col-span-7 space-y-5">
                <div className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-extrabold uppercase px-3 py-1 rounded-full">
                  <Sparkles className="w-3.5 h-3.5 fill-amber-400" />
                  <span>Hardware Recomendado para {ind.nombre}</span>
                </div>

                <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                  {recommendedProduct?.name || ind.producto}
                </h2>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  {ind.productoRazon}
                </p>

                {recommendedProduct && (
                  <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase tracking-widest block font-bold">Precio Único</span>
                      <span className="text-2xl font-black text-amber-400">${recommendedProduct.price}.00</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950 border border-emerald-800 px-3 py-1 rounded-full uppercase">
                      Sin Mensualidades
                    </span>
                  </div>
                )}

                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <Link
                    href={ind.ctaDescriptivo?.urlCatalogo || `/catalogo/${recommendedProduct?.id || ind.producto}`}
                    className="py-3.5 px-6 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center justify-center gap-2 text-center"
                  >
                    <ShoppingBag className="w-4 h-4 shrink-0" />
                    <span>{ind.ctaDescriptivo?.textoCatalogo || 'Ver Producto y Configurar'}</span>
                  </Link>

                  <a
                    href={
                      ind.ctaDescriptivo?.mensajeWhatsapp
                        ? `${WHATSAPP}?text=${encodeURIComponent(ind.ctaDescriptivo.mensajeWhatsapp)}`
                        : whatsappProducto
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-3.5 px-6 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 text-center"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span>{ind.ctaDescriptivo?.textoWhatsapp || 'Consultar por WhatsApp'}</span>
                  </a>
                </div>
              </div>

            </div>
          </section>

          {/* PREGUNTAS FRECUENTES */}
          <section className="space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-black uppercase tracking-widest text-brand-400">Preguntas Frecuentes</span>
              <h2 className="text-2xl font-black text-slate-950 uppercase tracking-tight">
                Dudas Comunes sobre Reseñas en {ind.nombre}
              </h2>
            </div>

            <div className="space-y-4">
              {ind.faqs.map((f, idx) => (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl p-6 space-y-2 shadow-card">
                  <h3 className="font-extrabold text-slate-950 text-sm sm:text-base flex items-start gap-2">
                    <HelpCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                    <span>{f.q}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-7">
                    {f.a}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* OTRAS INDUSTRIAS NAV */}
          <section className="bg-white border border-slate-200 rounded-3xl p-8 space-y-4 shadow-card">
            <h2 className="text-sm font-extrabold text-slate-950 uppercase tracking-wider">
              Explorar Guías para Otros Negocios en Panamá
            </h2>
            <div className="flex flex-wrap gap-2.5">
              {otras.map((o) => (
                <Link
                  key={o.slug}
                  href={`/resenas-google/${o.slug}`}
                  className="px-4 py-2 bg-slate-50 hover:bg-slate-950 hover:text-white border border-slate-200 font-bold text-xs rounded-xl capitalize transition-colors"
                >
                  {o.nombre}
                </Link>
              ))}
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
