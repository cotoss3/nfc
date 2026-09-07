import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Sparkles, 
  Bot, 
  Zap, 
  BellRing, 
  BrainCircuit, 
  Tag, 
  TrendingUp, 
  FileText, 
  BarChart3, 
  Share2, 
  Globe2, 
  Trophy, 
  Building2, 
  Sliders, 
  QrCode, 
  Smartphone,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Star,
  MessageSquare
} from 'lucide-react';

export const metadata = {
  title: 'Funcionalidades Completas | starTAP Panamá',
  description: 'Descubre las 16 funcionalidades del ecosistema starTAP: Hardware NFC Gratuito + Plataforma Inteligente Pro para Google Maps.',
};

export default function FuncionesPage() {
  const featureGroups = [
    {
      badge: 'Reseñas & Automatización',
      title: 'Responde, Fideliza y Automatiza',
      description: 'Herramientas diseñadas para multiplicar tus opiniones de 5 estrellas y evitar que una mala experiencia arruine tu promedio.',
      color: 'from-blue-600 to-indigo-600',
      bgColor: 'bg-blue-50/50 border-blue-100',
      iconColor: 'text-blue-600',
      features: [
        {
          id: 'ia-tone',
          icon: Bot,
          title: 'Respuestas con IA en tu Tono de Marca',
          isPro: true,
          summary: 'La Inteligencia Artificial redacta respuestas personalizadas para cada reseña en segundos con el tono exacto de tu negocio (formal, amigable, con emojis o firma empresarial).',
          bullets: [
            'Detecta el motivo exacto de la opinión (atención, rapidez, comida, precio).',
            'Define tu tono una sola vez y se aplica en todas las respuestas.',
            'En opiniones negativas, incluye contacto directo para resolver en privado.'
          ],
          benefit: 'Responde 50 opiniones en el tiempo que antes te tomaba contestar una sola.'
        },
        {
          id: 'automations',
          icon: Zap,
          title: 'Automatización para Reseñas de 4★ y 5★',
          isPro: true,
          summary: 'Configura reglas automáticas para que el sistema responda las reseñas positivas sin que tengas que ingresar diariamente al panel.',
          bullets: [
            'Respuestas variadas y naturales para evitar sonar como un bot repetitivo.',
            'Retraso inteligente configurable (1 a 6 horas) para mayor naturalidad.',
            'Pausa o activa las automatizaciones por sucursal en cualquier momento.'
          ],
          benefit: 'Tus clientes felices siempre reciben un agradecimiento inmediato y profesional.'
        },
        {
          id: 'alerts',
          icon: BellRing,
          title: 'Alertas Inmediatas y Retención Privada (1★ - 3★)',
          isPro: true,
          summary: 'Recibe una alerta al instante en tu celular cuando ingresa una valoración baja para atender la insatisfacción antes de que sea pública o afecte tu reputación.',
          bullets: [
            'Notificaciones por correo o WhatsApp al detector de reseñas insatisfechas.',
            'Enrutamiento opcional de quejas a un formulario de atención privada.',
            'Protege la nota media de tu negocio en Google Maps.'
          ],
          benefit: 'Transforma una posible mala experiencia en un cliente fiel atendido a tiempo.'
        }
      ]
    },
    {
      badge: 'Inteligencia & Analítica',
      title: 'Entiende y Escucha a tus Clientes',
      description: 'Convierte cientos de texto de reseñas en datos cuantitativos e insights accionables para tu toma de decisiones.',
      color: 'from-purple-600 to-pink-600',
      bgColor: 'bg-purple-50/50 border-purple-100',
      iconColor: 'text-purple-600',
      features: [
        {
          id: 'sentiment',
          icon: BrainCircuit,
          title: 'Análisis de Sentimiento Inteligente',
          isPro: true,
          summary: 'Algoritmo que analiza el tono emocional de cada opinión (% positivo, neutro y negativo) independientemente de las estrellas asignadas.',
          bullets: [
            'Detecta cuándo la percepción del cliente empieza a decaer antes de que baje la media.',
            'Distingue opiniones con 4 estrellas que esconden quejas leves.',
            'Filtra tendencias por sucursal y rango de fechas.'
          ],
          benefit: 'Conoce la salud real de tu servicio leyendo un gráfico en lugar de cientos de comentarios.'
        },
        {
          id: 'keywords',
          icon: Tag,
          title: 'Nube de Palabras Clave y Temas Frecuentes',
          isPro: true,
          summary: 'Agrupación automática de los términos más mencionados por tus clientes tanto al felicitarte como al señalar fallas.',
          bullets: [
            'Términos positivos para destacar en tus campañas de marketing.',
            'Términos críticos para corregir en la operación de tu local.',
            'Métricas de frecuencia y peso emocional.'
          ],
          benefit: 'Usa la voz exacta de tus clientes para mejorar tu servicio y tus promociones.'
        },
        {
          id: 'nps',
          icon: TrendingUp,
          title: 'Medición de NPS Real (Net Promoter Score)',
          isPro: true,
          summary: 'Índice de recomendación calculado directamente sobre las opiniones detalladas escritas en Google.',
          bullets: [
            'Calcula la proporción exacta de Promotores, Pasivos y Detractores.',
            'Evolución mensual histórica para medir la efectividad de tus mejoras.',
            'Comparativa directa entre distintas sucursales.'
          ],
          benefit: 'Métrica de lealtad de marca transparente y sin autoengaños.'
        },
        {
          id: 'pdf-reports',
          icon: FileText,
          title: 'Informes Mensuales Automáticos en PDF',
          isPro: true,
          summary: 'El primer día de cada mes recibes en tu email un reporte corporativo con el resumen consolidado de tu reputación.',
          bullets: [
            'Métricas de reseñas, sentimiento, palabras clave y visibilidad en Google.',
            'Formato elegante y profesional listo para enviar a ejecutivos o socios.',
            'Comparativas porcentuales frente al mes anterior.'
          ],
          benefit: 'Ahorra horas de preparación manual de reportes de gestión.'
        }
      ]
    },
    {
      badge: 'Visibilidad & SEO Local',
      title: 'Domina Búsquedas en Google y Maps',
      description: 'Accede a datos oficiales de la API de Google y optimiza tu posicionamiento local para atraer más clientes.',
      color: 'from-amber-600 to-orange-600',
      bgColor: 'bg-amber-50/50 border-amber-100',
      iconColor: 'text-amber-600',
      features: [
        {
          id: 'google-metrics',
          icon: BarChart3,
          title: 'Métricas Oficiales de Google Business Profile',
          isPro: true,
          summary: 'Sincronización directa con Google para visualizar impresiones, llamadas recibidas, solicitudes de ruta (Waze/Maps) y visitas a tu web.',
          bullets: [
            'Datos oficiales en tiempo real sin tener que ingresar a Google Business.',
            'Comparativas de periodos (7, 30, 90 días).',
            'Reportes visuales por punto de venta.'
          ],
          benefit: 'Comprueba directamente cómo el aumento de reseñas incrementa tus ventas.'
        },
        {
          id: 'ai-posts',
          icon: Sparkles,
          title: 'Generación de Publicaciones con IA para Google',
          isPro: true,
          summary: 'Crea publicaciones, ofertas y novedades atractivas en tu ficha de Google Maps asistido por Inteligencia Artificial.',
          bullets: [
            'Textos redactados con llamadas a la acción enfocadas en conversión.',
            'Sugerencias de imágenes y hashtags relevantes para tu rubro.',
            'Mantiene tu perfil activo para favorecer el algoritmo de Google.'
          ],
          benefit: 'Mantén tu ficha siempre actualizada sin dedicar tiempo a redactar contenidos.'
        },
        {
          id: 'bulk-posts',
          icon: Share2,
          title: 'Publicación Masiva en Múltiples Sucursales',
          isPro: true,
          summary: 'Publica promociones o comunicados importantes en todas las fichas de Google de tus sucursales simultáneamente.',
          bullets: [
            'Lanzamiento de ofertas de temporada en un solo clic.',
            'Difusión coordinada para cadenas, hoteles y franquicias.',
            'Ahorro masivo de tiempo operativo.'
          ],
          benefit: 'Gestión uniforme y rápida de tu presencia multilocales.'
        }
      ]
    },
    {
      badge: 'Gestión, NFC & Equipos',
      title: 'Control Total de Hardware y Sucursales',
      description: 'La infraestructura física y digital para motivar a tu equipo y gestionar todos tus puntos de venta desde una sola pantalla.',
      color: 'from-emerald-600 to-teal-600',
      bgColor: 'bg-emerald-50/50 border-emerald-100',
      iconColor: 'text-emerald-600',
      features: [
        {
          id: 'employee-ranking',
          icon: Trophy,
          title: 'Ranking de Empleados / Leaderboard por Toques',
          isPro: false,
          isFreeIncluded: true,
          summary: 'Gamifica tu equipo registrando qué colaborador o mesero genera más escaneos y reseñas de clientes.',
          bullets: [
            'Tabla de clasificación en tiempo real por usuario o tarjeta asignada.',
            'Medición de rendimiento para programas de incentivos y comisiones.',
            'Filtros por día, semana, mes y sucursal.'
          ],
          benefit: 'Motiva a tu equipo de atención al cliente a solicitar reseñas activamente.'
        },
        {
          id: 'multi-branch',
          icon: Building2,
          title: 'Panel Multi-Sucursal Centralizado',
          isPro: true,
          summary: 'Administra la reputación y fichas de Google de 1, 5 o 50 establecimientos desde una sola cuenta maestra.',
          bullets: [
            'Acceso jerárquico para administradores y gerentes de local.',
            'Visión global consolidada o detalle individual por punto de venta.',
            'Gestión unificada de permisos y usuarios.'
          ],
          benefit: 'Escalabilidad perfecta para cadenas, restaurantes y franquicias.'
        },
        {
          id: 'bulk-edits',
          icon: Sliders,
          title: 'Cambios Masivos de Información en Fichas',
          isPro: true,
          summary: 'Actualiza horarios festivos, teléfonos de contacto o sitio web en múltiples fichas de Google de manera instantánea.',
          bullets: [
            'Evita modificar ficha por ficha manualmente.',
            'Sincronización segura vía API oficial de Google.',
            'Reducción de errores en la información pública del negocio.'
          ],
          benefit: 'Mantén los datos de tu empresa 100% precisos en todo Panamá.'
        },
        {
          id: 'nfc-routing',
          icon: QrCode,
          title: 'Redirección NFC & Códigos QR Auto-Configurables',
          isPro: false,
          isFreeIncluded: true,
          summary: 'Tus tarjetas y placas físicamente compradas permiten cambiar el destino del toque en tiempo real sin reprogramar el chip.',
          bullets: [
            'Direcciona a Google Maps, WhatsApp, Instagram, Menú PDF o Enlace Web.',
            'Edición instantánea en cualquier momento desde tu panel starTAP.',
            'Incluido 100% GRATIS sin mensualidades obligatorias.'
          ],
          benefit: 'Flexibilidad absoluta para adaptar tus dispositivos NFC a tus campañas.'
        },
        {
          id: 'device-mgmt',
          icon: Smartphone,
          title: 'Gestión y Diagnóstico de Dispositivos',
          isPro: false,
          isFreeIncluded: true,
          summary: 'Controla el listado completo de tus tarjetas, llaveros y placas para mostrador vinculadas a tu cuenta.',
          bullets: [
            'Asignación de nombres personalizados por colaborador o mesa.',
            'Conteo en vivo de toques y escaneos de códigos QR.',
            'Monitoreo de estado y activación instantánea.'
          ],
          benefit: 'Dominio absoluto sobre tus herramientas físicas de captura de clientes.'
        },
        {
          id: 'brand-tone',
          icon: Globe2,
          title: 'Tono de Marca Global Configurable',
          isPro: true,
          summary: 'Personaliza la personalidad de tu empresa para que todas las respuestas de IA reflejen la identidad de tu negocio.',
          bullets: [
            'Configura el nivel de formalidad, vocabulario regional y uso de emojis.',
            'Inserta saludos institucionales y firmas automáticas.',
            'Coherencia total de comunicación en todas tus sucursales.'
          ],
          benefit: 'Tus respuestas automáticas suenan idénticas a tu mejor agente de atención.'
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
      <Navbar />

      {/* Hero Header */}
      <section className="pt-28 pb-16 bg-gradient-to-b from-gray-900 via-gray-900 to-gray-800 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:24px_24px] opacity-40"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-brand-500/20 border border-brand-400/30 text-brand-300 text-xs font-semibold uppercase tracking-wider mb-6">
            <Sparkles className="h-4 w-4 text-brand-400" />
            <span>Suite Completa de 16 Funciones</span>
          </div>

          <h1 className="text-3xl md:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight mb-6">
            Una plataforma,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-300 via-brand-200 to-amber-300">
              16 superpoderes para tu negocio
            </span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-3xl mx-auto leading-relaxed mb-10">
            Desde la redirección NFC instantánea <strong>(100% Gratis de por vida)</strong> hasta la Inteligencia Artificial con automatización de Google Business Profile.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/shop"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-brand-950 font-bold text-sm uppercase tracking-wider transition-all shadow-lg hover:shadow-brand-500/25 flex items-center justify-center space-x-2"
            >
              <span>Ver Productos NFC</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/app"
              className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-medium text-sm border border-gray-700 transition-all flex items-center justify-center space-x-2"
            >
              <Sparkles className="h-4 w-4 text-amber-400" />
              <span>Explorar Software Pro</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Feature Navigation Pills */}
      <section className="sticky top-16 z-30 bg-white/90 backdrop-blur-md border-b border-gray-200 shadow-sm py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-start md:justify-center space-x-2 overflow-x-auto no-scrollbar pb-1">
            {featureGroups.map((group, idx) => (
              <a
                key={idx}
                href={`#grupo-${idx}`}
                className="px-4 py-2 rounded-lg text-xs md:text-sm font-semibold whitespace-nowrap bg-gray-100 text-gray-700 hover:bg-brand-50 hover:text-brand-950 transition-colors flex items-center space-x-1.5"
              >
                <span>{group.badge}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Main Features Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-24">
        {featureGroups.map((group, groupIdx) => (
          <section id={`grupo-${groupIdx}`} key={groupIdx} className="scroll-mt-36">
            <div className="mb-10 text-left border-l-4 border-brand-500 pl-4">
              <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600">{group.badge}</span>
              <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-1">{group.title}</h2>
              <p className="text-gray-600 mt-2 text-sm md:text-base max-w-3xl">{group.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {group.features.map((feat) => {
                const IconComponent = feat.icon;
                return (
                  <div
                    key={feat.id}
                    className="bg-white rounded-2xl border border-gray-200 hover:border-brand-300 p-7 shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group"
                  >
                    {/* Badge header */}
                    <div>
                      <div className="flex items-center justify-between mb-5">
                        <div className={`p-3 rounded-xl ${group.bgColor} ${group.iconColor}`}>
                          <IconComponent className="h-6 w-6" />
                        </div>
                        {feat.isFreeIncluded ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            100% GRATIS
                          </span>
                        ) : (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200 flex items-center space-x-1">
                            <Sparkles className="h-3 w-3 text-amber-600" />
                            <span>SOFTWARE PRO</span>
                          </span>
                        )}
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-brand-950 transition-colors">
                        {feat.title}
                      </h3>

                      <p className="text-gray-600 text-xs md:text-sm leading-relaxed mb-4">
                        {feat.summary}
                      </p>

                      <ul className="space-y-2 mb-6">
                        {feat.bullets.map((b, bIdx) => (
                          <li key={bIdx} className="flex items-start text-xs text-gray-700">
                            <CheckCircle2 className="h-3.5 w-3.5 text-brand-500 mr-2 shrink-0 mt-0.5" />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Benefit Box */}
                    <div className="mt-auto pt-4 border-t border-gray-100 bg-gray-50/70 -mx-7 -mb-7 p-5 rounded-b-2xl">
                      <p className="text-xs text-gray-700 italic">
                        <strong className="not-italic text-brand-950 font-semibold">Impacto: </strong>
                        {feat.benefit}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        ))}
      </main>

      {/* CTA Bottom Banner */}
      <section className="bg-brand-950 text-white py-16 border-t border-brand-900">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-extrabold mb-4">
            ¿Listo para llevar tu reputación en Google al siguiente nivel?
          </h2>
          <p className="text-brand-200 text-sm md:text-base max-w-2xl mx-auto mb-8">
            Empieza hoy con tus dispositivos físicos NFC sin cargos mensuales obligatorios, y añade el Software Pro cuando quieras potenciar tu crecimiento.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            <Link
              href="/shop"
              className="px-8 py-3.5 rounded-xl bg-brand-500 hover:bg-brand-400 text-brand-950 font-bold text-sm uppercase tracking-wide transition-all shadow-lg"
            >
              Comprar Dispositivos NFC
            </Link>
            <a
              href="https://wa.me/50767134341?text=Hola,%20quisiera%20asesoría%20sobre%20las%2016%20funciones%20de%20starTAP"
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm tracking-wide transition-all"
            >
              Consultar por WhatsApp (+507 6713-4341)
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
