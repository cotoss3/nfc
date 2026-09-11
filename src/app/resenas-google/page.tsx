import type { Metadata } from 'next';
import Link from 'next/link';
import { 
  ArrowRight, 
  Star, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Zap, 
  TrendingUp, 
  Utensils, 
  Stethoscope, 
  Scissors, 
  Wrench, 
  Building2, 
  ShoppingBag, 
  Image as ImageIcon,
  ChevronRight,
  Sparkles,
  Smartphone,
  Cpu,
  QrCode
} from 'lucide-react';
import { INDUSTRIAS } from '@/lib/industrias';

const BASE_URL = 'https://startap.com.pa';

export const metadata: Metadata = {
  title: 'Guía de Reseñas de Google por Industria en Panamá | starTAP',
  description:
    'Estrategias comprobadas por tipo de negocio en Panamá para multiplicar tus reseñas de Google en segundos con tecnología NFC + QR. Restaurantes, clínicas, barberías, talleres, hoteles y comercios.',
  alternates: { canonical: '/resenas-google' },
  openGraph: {
    title: 'Guía de Reseñas de Google por Industria en Panamá | starTAP',
    description: 'Estrategias y tecnología NFC + QR para dominar el ranking de Google Maps en Panamá.',
    url: `${BASE_URL}/resenas-google`,
  },
};

const INDUSTRY_ICONS: Record<string, any> = {
  restaurantes: Utensils,
  clinicas: Stethoscope,
  'barberias-y-salones': Scissors,
  'talleres-y-mecanicas': Wrench,
  'hoteles-y-hospedajes': Building2,
  'tiendas-y-comercios': ShoppingBag,
};

const INDUSTRY_PHOTO_IDEAS: Record<string, string> = {
  restaurantes: 'Foto de mesero entregando la cuenta junto al Stand NFC en la mesa de un restaurante en Panamá',
  clinicas: 'Foto de la Placa NFC en acrílico 3mm instalada en la recepción de un consultorio médico en Panamá',
  'barberias-y-salones': 'Foto del barbero mostrando la Tarjeta NFC de Bolsillo al cliente tras terminar el corte',
  'talleres-y-mecanicas': 'Foto de cliente escaneando el dispositivo en la recepción/caja de un taller mecánico',
  'hoteles-y-hospedajes': 'Foto del Stand NFC ubicado en el mostrador de Check-out en la recepción de un hotel',
  'tiendas-y-comercios': 'Foto de cliente realizando Tap con su smartphone junto a la caja registradora de la tienda',
};

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
      className={`${aspectRatio} ${className} bg-slate-50 rounded-2xl border-2 border-dashed border-slate-300 p-5 flex flex-col items-center justify-center text-center group hover:border-amber-400 hover:bg-amber-50/20 transition-all`}
    >
      <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-xs mb-2 group-hover:text-amber-600 transition-colors">
        <ImageIcon className="w-5 h-5" />
      </div>
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">
        📸 Espacio para Imagen Recomendada
      </span>
      <p className="text-xs font-semibold text-slate-600 max-w-sm leading-relaxed">
        {ideaText}
      </p>
    </div>
  );
}

export default function ResenasGoogleHub() {
  const itemListSchema = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Reseñas de Google por tipo de negocio en Panamá',
    itemListElement: INDUSTRIAS.map((i, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: i.h1,
      url: `${BASE_URL}/resenas-google/${i.slug}`,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }}
      />

      <div className="bg-slate-50 min-h-screen text-slate-900 font-sans pb-24">
        {/* HERO SECTION */}
        <section className="bg-slate-950 text-white py-16 sm:py-20 px-4 border-b border-slate-800 relative overflow-hidden">
          <div className="max-w-5xl mx-auto space-y-6 text-center relative z-10">
            <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-amber-300 border border-amber-400/30 text-xs font-black uppercase px-4 py-1.5 rounded-full">
              <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              <span>Estrategia de Posicionamiento Local en Panamá</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black uppercase tracking-tight text-white leading-tight">
              Cómo Conseguir Más Reseñas de Google por Industria
            </h1>

            <p className="text-slate-300 text-base sm:text-xl max-w-3xl mx-auto leading-relaxed">
              Las valoraciones de Google Maps deciden qué negocio se lleva al cliente en Panamá. 
              Selecciona tu categoría comercial para conocer el <strong className="text-amber-400">momento exacto</strong>, 
              la <strong className="text-amber-400">frase clave</strong> y el dispositivo <strong className="text-amber-400">NFC + QR</strong> de mayor conversión.
            </p>

            <div className="pt-4 flex flex-wrap justify-center gap-3 sm:gap-4 text-xs font-bold text-slate-200">
              <span className="bg-slate-800/90 border border-slate-700 px-3.5 py-2 rounded-xl flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-emerald-400" /> +300% de Conversión Presencial
              </span>
              <span className="bg-slate-800/90 border border-slate-700 px-3.5 py-2 rounded-xl flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400" /> Captura en 2 Segundos
              </span>
              <span className="bg-slate-800/90 border border-slate-700 px-3.5 py-2 rounded-xl flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-blue-400" /> 100% Legal (Google Policies)
              </span>
            </div>
          </div>
        </section>

        <div className="max-w-6xl mx-auto px-4 pt-12 space-y-16">
          {/* GRID DE INDUSTRIAS */}
          <section className="space-y-8">
            <div className="text-center space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-brand-400">Guías Especializadas</span>
              <h2 className="text-2xl sm:text-4xl font-black text-slate-950 uppercase tracking-tight">
                Selecciona Tu Tipo de Negocio
              </h2>
              <p className="text-slate-600 text-sm max-w-xl mx-auto">
                Descubre cómo los líderes de cada sector en Panamá automatizan la recolección de reseñas positivas de 5 estrellas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {INDUSTRIAS.map((ind) => {
                const IconComponent = INDUSTRY_ICONS[ind.slug] || Sparkles;
                const photoIdea = INDUSTRY_PHOTO_IDEAS[ind.slug] || `Foto representativa de ${ind.nombre} usando el dispositivo de reseñas`;

                return (
                  <div
                    key={ind.slug}
                    className="bg-white border border-slate-200 rounded-3xl p-6 shadow-card hover:shadow-xl transition-all flex flex-col justify-between space-y-5 group hover:border-slate-400"
                  >
                    <div className="space-y-4">
                      {/* Top Bar with Icon & Title */}
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-amber-500/10 text-amber-600 rounded-2xl flex items-center justify-center shrink-0 border border-amber-500/20 group-hover:bg-slate-950 group-hover:text-amber-400 transition-colors">
                          <IconComponent className="w-6 h-6" />
                        </div>
                        <div>
                          <span className="text-[10px] font-bold text-brand-400 uppercase tracking-wider block">Sector Comercial</span>
                          <h3 className="text-lg font-black text-slate-950 capitalize leading-snug">
                            {ind.nombre}
                          </h3>
                        </div>
                      </div>

                      {/* Photo Placeholder */}
                      <FotoPlaceholder ideaText={photoIdea} aspectRatio="aspect-[16/10]" />

                      {/* Short Description */}
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {ind.intro}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-3">
                      <div className="flex items-center justify-between text-[11px] text-slate-500 font-semibold">
                        <span>Dispositivo Ideal:</span>
                        <span className="font-bold text-slate-900 uppercase font-mono">{ind.producto}</span>
                      </div>

                      <Link
                        href={`/resenas-google/${ind.slug}`}
                        className="w-full py-3 px-4 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 group-hover:bg-amber-500 group-hover:text-slate-950"
                      >
                        <span>Ver Guía para {ind.nombre.split(' ')[0]}</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>

          {/* FLUJOGRAMA DE 3 PASOS */}
          <section className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-12 space-y-8 shadow-card">
            <div className="text-center space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-brand-400">Proceso Simplificado</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">
                ¿Cómo Funciona la Captura Instantánea en El Mostrador?
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 relative">
                <div className="w-10 h-10 bg-slate-950 text-amber-400 font-mono rounded-xl flex items-center justify-center font-black text-lg shadow-sm">
                  1
                </div>
                <h3 className="text-sm font-extrabold text-slate-950 uppercase">
                  El cliente acerca el teléfono
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Al dispositivo físico NFC o escanea el código QR HD integrado en la mesa, mostrador o portacredencial.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 relative">
                <div className="w-10 h-10 bg-slate-950 text-amber-400 font-mono rounded-xl flex items-center justify-center font-black text-lg shadow-sm">
                  2
                </div>
                <h3 className="text-sm font-extrabold text-slate-950 uppercase">
                  Abre tu ficha oficial en Google
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Directamente en la casilla para calificar con estrellas, sin descargar aplicaciones ni buscar el nombre de tu negocio.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 space-y-3 relative">
                <div className="w-10 h-10 bg-slate-950 text-amber-400 font-mono rounded-xl flex items-center justify-center font-black text-lg shadow-sm">
                  3
                </div>
                <h3 className="text-sm font-extrabold text-slate-950 uppercase">
                  Calificación de 5 Estrellas
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  El cliente presiona publicar en menos de 5 segundos antes de salir de tu establecimiento.
                </p>
              </div>
            </div>
          </section>

          {/* BUENAS PRÁCTICAS & REGLAS DE ORO */}
          <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-12 space-y-8 border border-slate-800 shadow-xl">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-wider">
                <XCircle className="w-4 h-4 text-rose-400" />
                Cumplimiento de Políticas de Google Maps 2026
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
                Lo Que NUNCA Debes Hacer al Solicitar Reseñas
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm max-w-2xl">
                Proteger la reputación de tu negocio en Panamá es nuestra máxima prioridad. Sigue estas reglas esenciales para evitar sanciones en Google Business Profile:
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 space-y-2">
                <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs uppercase">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>No Filtres Clientes</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Ofrecer la placa o tarjeta únicamente a quienes expresen satisfacción explícita viola las normas de imparcialidad de Google. Pon el dispositivo disponible para todos.
                </p>
              </div>

              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 space-y-2">
                <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs uppercase">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>No Incentives Financieramente</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Regalar bebidas, descuentos o rifas a cambio de 5 estrellas está prohibido. Los algoritmos borran reseñas sospechosas automáticamente.
                </p>
              </div>

              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 space-y-2">
                <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs uppercase">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>No Compres Reseñas Falsas</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Las granjas de bots o cuentas falsas son detectadas tarde o temprano, resultando en la suspensión permanente de tu perfil comercial.
                </p>
              </div>

              <div className="bg-slate-800/90 border border-slate-700/80 rounded-2xl p-5 space-y-2">
                <div className="flex items-center space-x-2 text-rose-400 font-bold text-xs uppercase">
                  <XCircle className="w-4 h-4 shrink-0" />
                  <span>No Sobrecargues el Nombre Comercial</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Mapear palabras clave spam en el nombre oficial de tu negocio en Google Maps es motivo de penalización directa. Usa el nombre legal de tu letrero.
                </p>
              </div>
            </div>
          </section>

          {/* CTA FINAL */}
          <section className="bg-gradient-to-r from-amber-400 to-amber-500 rounded-3xl p-8 sm:p-12 text-slate-950 space-y-6 shadow-xl text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="space-y-2 max-w-xl">
              <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight">
                ¿Listo para Equipar Tu Comercio en Panamá?
              </h2>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed">
                Adquiere tus dispositivos NFC + QR programados y configurados con tu enlace directo. Pago único sin mensualidades y con envío a todo Panamá.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 shrink-0 w-full sm:w-auto">
              <Link
                href="/catalogo"
                className="py-4 px-8 bg-slate-950 hover:bg-slate-800 text-white font-extrabold text-xs uppercase tracking-widest rounded-xl shadow-lg transition text-center"
              >
                Ver Catálogo de Dispositivos
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
