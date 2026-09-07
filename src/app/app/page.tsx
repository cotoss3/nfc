'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { 
  Smartphone, 
  Sparkles, 
  Zap, 
  CheckCircle2, 
  BarChart3, 
  Star, 
  Lock, 
  ShieldCheck, 
  Bell, 
  Globe, 
  Layers, 
  Sliders, 
  Users, 
  ArrowRight,
  Bot,
  BellRing,
  BrainCircuit,
  Tag,
  TrendingUp,
  FileText,
  Share2,
  Trophy,
  Building2,
  QrCode,
  Globe2,
  Phone,
  Navigation,
  Send,
  Download,
  AlertTriangle,
  ThumbsUp
} from 'lucide-react';

export default function AppProPage() {
  const [email, setEmail] = useState('');
  const [isJoined, setIsJoined] = useState(false);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsJoined(true);
  };

  const featureGroups = [
    {
      badge: 'Reseñas & Automatización',
      title: 'Responde, Fideliza y Automatiza',
      description: 'Multiplica tus opiniones de 5 estrellas en Google y gestiona cualquier queja de forma privada antes de que baje tu promedio.',
      features: [
        {
          id: 'ia-tone',
          icon: Bot,
          badgeLabel: 'SOFTWARE PRO',
          isFree: false,
          kicker: 'RESEÑAS CON IA',
          title: 'Respuestas con IA en tu Tono de Marca',
          summary: 'La Inteligencia Artificial redacta respuestas personalizadas para cada reseña en segundos con la personalidad exacta de tu negocio.',
          bullets: [
            'Detecta el motivo exacto de la opinión (atención, comida, rapidez, precio).',
            'Escribe en tu estilo: amigable, formal, con emojis o firma empresarial.',
            'En opiniones negativas, reconoce la queja e incluye contacto para resolver en privado.',
            'Tú decides: aprueba con un clic o deja que se responda automáticamente.'
          ],
          benefit: 'Responde 50 opiniones en el tiempo que antes te tomaba redactar una sola.',
          mockup: (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="h-9 w-9 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-sm">
                    CM
                  </div>
                  <div>
                    <div className="font-bold text-gray-900 text-xs sm:text-sm">Carlos Mendoza</div>
                    <div className="flex text-amber-400 text-xs">★★★★★ <span className="text-gray-400 text-[10px] ml-1">hace 2 horas</span></div>
                  </div>
                </div>
                <span className="text-[10px] font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded">Google Maps</span>
              </div>
              <p className="text-xs text-gray-700 italic">
                "¡Excelente atención en starTAP Bistro! La comida estuvo increíble y la placa NFC en la mesa para dejar la reseña fue super rápida."
              </p>

              <div className="bg-brand-50 border border-brand-200 rounded-xl p-3.5 space-y-2 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-brand-950 flex items-center">
                    <Sparkles className="h-3.5 w-3.5 text-amber-500 mr-1 animate-pulse" />
                    Borrador Generado por IA
                  </span>
                  <span className="text-[9px] bg-amber-200 text-amber-900 font-extrabold px-1.5 py-0.5 rounded">Tono: Amigable 😊</span>
                </div>
                <p className="text-[11px] text-gray-800 leading-relaxed">
                  "¡Hola Carlos! 🌟 Muchas gracias por tus palabras. Nos alegra enormemente que hayas disfrutado la comida y la facilidad de nuestra placa starTAP. ¡Te esperamos muy pronto de vuelta!"
                </p>
                <div className="pt-2 flex justify-end space-x-2">
                  <button className="px-3 py-1 bg-brand-950 hover:bg-brand-900 text-white rounded-lg text-[10px] font-bold flex items-center">
                    <Send className="h-3 w-3 mr-1" />
                    Enviar a Google
                  </button>
                </div>
              </div>
            </div>
          )
        },
        {
          id: 'automations',
          icon: Zap,
          badgeLabel: 'SOFTWARE PRO',
          isFree: false,
          kicker: 'AUTOMATIZACIÓN',
          title: 'Automatización Inteligente 4★ & 5★',
          summary: 'Configura reglas automáticas para responder las opiniones excelentes sin que tengas que ingresar manualmente todos los días.',
          bullets: [
            'Respuestas variadas y naturales para evitar sonar repetitivo.',
            'Retraso programable (1 a 6 horas) para simular atención humana real.',
            'Pausa o activa las reglas por sucursal cuando lo necesites.'
          ],
          benefit: 'Tus clientes felices jamás se quedan sin un agradecimiento inmediato.',
          mockup: (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <span className="text-xs font-bold text-gray-900">Reglas de Respuesta Automática</span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-extrabold px-2 py-0.5 rounded flex items-center">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 mr-1 animate-ping" />
                  SISTEMA ACTIVO
                </span>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-gray-900 flex items-center">
                    <span>Reseñas de 4★ y 5★</span>
                    <span className="text-amber-400 text-xs ml-1.5">★★★★★</span>
                  </div>
                  <div className="text-[10px] text-gray-500">Respuesta automática + Retraso de 2 horas</div>
                </div>
                <div className="w-10 h-5 bg-emerald-500 rounded-full p-0.5 flex justify-end cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full shadow" />
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex items-center justify-between">
                <div className="space-y-0.5">
                  <div className="text-xs font-bold text-gray-900 flex items-center">
                    <span>Alerta de Reseña de 1★ a 3★</span>
                    <span className="text-red-400 text-xs ml-1.5">★☆☆☆☆</span>
                  </div>
                  <div className="text-[10px] text-gray-500">Notificar a WhatsApp (+507 6713-4341)</div>
                </div>
                <div className="w-10 h-5 bg-emerald-500 rounded-full p-0.5 flex justify-end cursor-pointer">
                  <div className="w-4 h-4 bg-white rounded-full shadow" />
                </div>
              </div>
            </div>
          )
        },
        {
          id: 'alerts',
          icon: BellRing,
          badgeLabel: 'SOFTWARE PRO',
          isFree: false,
          kicker: 'ALERTAS TEMPRANAS',
          title: 'Alertas Inmediatas de Reseñas Negativas',
          summary: 'Recibe una notificación urgente cuando entra una valoración baja para atender la queja antes de que arruine la reputación de tu negocio.',
          bullets: [
            'Alertas instantáneas vía WhatsApp o Correo Electrónico.',
            'Identifica la sucursal y la hora exacta del incidente.',
            'Permite contactar al cliente para resolver el problema en privado.'
          ],
          benefit: 'Transforma una mala experiencia en la oportunidad de fidelizar a un cliente.',
          mockup: (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg space-y-3">
              <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-red-700 flex items-center">
                    <AlertTriangle className="h-4 w-4 mr-1 text-red-600" />
                    ¡Alerta de Reseña Crítica!
                  </span>
                  <span className="text-[10px] text-red-500 font-medium">Hace 3 min</span>
                </div>
                <p className="text-[11px] text-gray-800">
                  <strong>Sucursal Costa del Este:</strong> Reseña de 2★ recibida. <i>"El pedido demoró 45 minutos en llegar a la mesa..."</i>
                </p>
                <div className="pt-1 flex space-x-2">
                  <button className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold">
                    Atender en Privado
                  </button>
                  <button className="px-3 py-1 bg-white border border-gray-300 text-gray-700 rounded text-[10px] font-semibold">
                    Ver en Panel
                  </button>
                </div>
              </div>
            </div>
          )
        }
      ]
    },
    {
      badge: 'Inteligencia de Negocio',
      title: 'Analítica Avanzada & Sentimiento de Clientes',
      description: 'Convierte cientos de comentarios en datos estructurados e insights accionables para la toma de decisiones gerenciales.',
      features: [
        {
          id: 'sentiment',
          icon: BrainCircuit,
          badgeLabel: 'SOFTWARE PRO',
          isFree: false,
          kicker: 'ANÁLISIS IA',
          title: 'Análisis de Sentimiento Inteligente',
          summary: 'La Inteligencia Artificial lee el texto de cada opinión y clasifica la emoción real del cliente (% positivo, neutro, negativo).',
          bullets: [
            'Detecta descontentos leves en opiniones de 4 estrellas.',
            'Evalúa tendencias de satisfacción mes a mes.',
            'Filtra por sucursal o equipo de trabajo.'
          ],
          benefit: 'Entiende la salud real de tu negocio con gráficos claros en lugar de leer 200 comentarios.',
          mockup: (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">Distribución de Sentimiento</span>
                <span className="text-[10px] bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">Últimos 30 días</span>
              </div>

              <div className="space-y-2.5">
                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-emerald-700 flex items-center"><ThumbsUp className="h-3 w-3 mr-1" /> Positivo</span>
                    <span className="text-gray-900">84% (240 reseñas)</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: '84%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-gray-600">Neutro</span>
                    <span className="text-gray-900">11% (31 reseñas)</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gray-400 rounded-full" style={{ width: '11%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] font-bold mb-1">
                    <span className="text-red-600">Negativo</span>
                    <span className="text-gray-900">5% (14 reseñas)</span>
                  </div>
                  <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full" style={{ width: '5%' }} />
                  </div>
                </div>
              </div>
            </div>
          )
        },
        {
          id: 'keywords',
          icon: Tag,
          badgeLabel: 'SOFTWARE PRO',
          isFree: false,
          kicker: 'PALABRAS CLAVE',
          title: 'Nube de Palabras Clave y Temas Frecuentes',
          summary: 'Agrupación automática de los términos que más repiten tus clientes tanto al felicitarte como al señalar aspectos a mejorar.',
          bullets: [
            'Términos elogiosos para destacar en tus redes sociales.',
            'Términos críticos para corregir rápidamente en la operación.',
            'Métricas de frecuencia de menciones por semana.'
          ],
          benefit: 'Usa el vocabulario exacto de tus clientes para promocionar tus fortalezas.',
          mockup: (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg space-y-3">
              <span className="text-xs font-bold text-gray-900 block mb-1">Términos Más Mencionados</span>

              <div className="flex flex-wrap gap-2">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                  💚 Excelente atención (+54)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                  💚 Comida deliciosa (+42)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-xs font-bold">
                  ⭐ Ambiente acogedor (+28)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-red-100 text-red-800 text-xs font-bold">
                  ⚠️ Tiempo de espera (-6)
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-xs font-bold">
                  💚 Placa NFC rápida (+19)
                </span>
              </div>
            </div>
          )
        },
        {
          id: 'nps',
          icon: TrendingUp,
          badgeLabel: 'SOFTWARE PRO',
          isFree: false,
          kicker: 'LEALTAD DE MARCA',
          title: 'Medición de NPS Real (Net Promoter Score)',
          summary: 'Métrica internacional de recomendación calculada sobre comentarios detallados, descartando notas infladas.',
          bullets: [
            'Calcula la proporción de Promotores, Pasivos y Detractores.',
            'Comparativa histórica para verificar mejoras operativas.',
            'Medición objetiva por punto de venta.'
          ],
          benefit: 'Indicador transparente de la lealtad real de tu clientela.',
          mockup: (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg text-center space-y-3">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">Net Promoter Score (NPS)</span>
              <div className="text-4xl font-extrabold text-brand-950 flex items-center justify-center space-x-1">
                <span>+68</span>
                <span className="text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">Excelente</span>
              </div>
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                <div className="bg-emerald-50 p-2 rounded-lg">
                  <div className="text-xs font-extrabold text-emerald-700">76%</div>
                  <div className="text-[10px] text-emerald-800">Promotores</div>
                </div>
                <div className="bg-gray-50 p-2 rounded-lg">
                  <div className="text-xs font-extrabold text-gray-700">16%</div>
                  <div className="text-[10px] text-gray-600">Pasivos</div>
                </div>
                <div className="bg-red-50 p-2 rounded-lg">
                  <div className="text-xs font-extrabold text-red-700">8%</div>
                  <div className="text-[10px] text-red-800">Detractores</div>
                </div>
              </div>
            </div>
          )
        },
        {
          id: 'pdf-reports',
          icon: FileText,
          badgeLabel: 'SOFTWARE PRO',
          isFree: false,
          kicker: 'REPORTES AUTOMÁTICOS',
          title: 'Informes Mensuales Automáticos en PDF',
          summary: 'El primer día de cada mes recibes un consolidado corporativo en PDF con todas tus métricas de reputación.',
          bullets: [
            'Resumen completo de reseñas, sentimiento y palabras clave.',
            'Comparativa porcentual con el mes anterior.',
            'Listo para entregar a socios o gerencia.'
          ],
          benefit: 'Ahorra tiempo eliminando la elaboración manual de reportes.',
          mockup: (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg flex items-center space-x-4">
              <div className="h-12 w-12 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <FileText className="h-6 w-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-gray-900 truncate">Informe_Reputacion_Septiembre.pdf</div>
                <div className="text-[10px] text-gray-500">Generado automáticamente el 1 de Octubre</div>
                <div className="mt-1.5">
                  <button className="px-2.5 py-1 bg-gray-900 hover:bg-gray-800 text-white rounded text-[10px] font-bold flex items-center">
                    <Download className="h-3 w-3 mr-1" /> Descargar Reporte PDF
                  </button>
                </div>
              </div>
            </div>
          )
        }
      ]
    },
    {
      badge: 'Visibilidad & SEO Local',
      title: 'Domina Google Maps y Búsquedas en Panamá',
      description: 'Sincronización directa con la API oficial de Google Business para controlar el impacto en tráfico real.',
      features: [
        {
          id: 'google-metrics',
          icon: BarChart3,
          badgeLabel: 'SOFTWARE PRO',
          isFree: false,
          kicker: 'MÉTRICAS GOOGLE',
          title: 'Métricas Oficiales de Google Business Profile',
          summary: 'Visualiza en tiempo real impresiones, llamadas telefónicas, solicitudes de ruta en Waze/Maps y clics al sitio web.',
          bullets: [
            'Datos oficiales consumidos directamente de la API de Google.',
            'Comparativas de 7, 30 y 90 días.',
            'Medición del retorno de inversión directo de tus reseñas.'
          ],
          benefit: 'Comprueba cómo las nuevas opiniones aumentan las llamadas y visitas físicas.',
          mockup: (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg space-y-3">
              <span className="text-xs font-bold text-gray-900 block border-b border-gray-100 pb-2">Rendimiento en Google Maps (Últimos 30 días)</span>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-blue-50/60 p-3 rounded-xl border border-blue-100">
                  <div className="text-[10px] font-bold text-blue-700 uppercase flex items-center">
                    <Globe className="h-3 w-3 mr-1" /> Impresiones
                  </div>
                  <div className="text-lg font-extrabold text-gray-900 mt-1">28,450</div>
                  <div className="text-[10px] font-bold text-emerald-600">↑ +18% este mes</div>
                </div>

                <div className="bg-amber-50/60 p-3 rounded-xl border border-amber-100">
                  <div className="text-[10px] font-bold text-amber-800 uppercase flex items-center">
                    <Phone className="h-3 w-3 mr-1" /> Llamadas
                  </div>
                  <div className="text-lg font-extrabold text-gray-900 mt-1">1,240</div>
                  <div className="text-[10px] font-bold text-emerald-600">↑ +14% este mes</div>
                </div>

                <div className="bg-purple-50/60 p-3 rounded-xl border border-purple-100">
                  <div className="text-[10px] font-bold text-purple-700 uppercase flex items-center">
                    <Navigation className="h-3 w-3 mr-1" /> Solicitudes Ruta
                  </div>
                  <div className="text-lg font-extrabold text-gray-900 mt-1">3,890</div>
                  <div className="text-[10px] font-bold text-emerald-600">↑ +22% este mes</div>
                </div>

                <div className="bg-emerald-50/60 p-3 rounded-xl border border-emerald-100">
                  <div className="text-[10px] font-bold text-emerald-800 uppercase flex items-center">
                    <Send className="h-3 w-3 mr-1" /> Clics Web
                  </div>
                  <div className="text-lg font-extrabold text-gray-900 mt-1">1,650</div>
                  <div className="text-[10px] font-bold text-emerald-600">↑ +9% este mes</div>
                </div>
              </div>
            </div>
          )
        },
        {
          id: 'ai-posts',
          icon: Sparkles,
          badgeLabel: 'SOFTWARE PRO',
          isFree: false,
          kicker: 'CONTENIDO IA',
          title: 'Generación de Publicaciones con IA para Google',
          summary: 'Crea publicaciones, ofertas y novedades atractivas en tu ficha de Google impulsadas por Inteligencia Artificial.',
          bullets: [
            'Redacción automatizada con llamados a la acción.',
            'Mantiene el perfil activo para favorecer el algoritmo de Google.',
            'Publicación directa sin salir del panel.'
          ],
          benefit: 'Mantén tu perfil siempre actualizado sin dedicar tiempo a redactar.',
          mockup: (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-gray-900">Publicación Lista para Google</span>
                <span className="text-[10px] bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded">Borrador IA</span>
              </div>
              <div className="bg-gradient-to-r from-amber-500 to-brand-500 text-white text-xs font-extrabold p-3 rounded-xl flex items-center justify-between">
                <span>🎉 Promoción Especial de Fin de Semana</span>
                <Sparkles className="h-4 w-4" />
              </div>
              <p className="text-[11px] text-gray-700 leading-relaxed">
                "¡Ven a disfrutar de nuestro menú especial! Presenta tu toque starTAP en caja y recibe un postre de la casa gratis. 🍰"
              </p>
              <button className="w-full py-1.5 bg-brand-950 text-white rounded-lg text-xs font-bold">
                Publicar Ahora en Google Maps
              </button>
            </div>
          )
        },
        {
          id: 'bulk-posts',
          icon: Share2,
          badgeLabel: 'SOFTWARE PRO',
          isFree: false,
          kicker: 'DIFUSIÓN MASIVA',
          title: 'Publicación Masiva en Múltiples Sucursales',
          summary: 'Difunde promociones o comunicados importantes en todas las fichas de Google de tus sucursales simultáneamente.',
          bullets: [
            'Publicación simultánea para cadenas y franquicias.',
            'Lanzamiento coordinado de promociones.',
            'Ahorro masivo de tiempo operativo.'
          ],
          benefit: 'Gestión uniforme y veloz de la comunicación multilocales.',
          mockup: (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg space-y-3">
              <span className="text-xs font-bold text-gray-900 block">Publicar en Múltiples Puntos de Venta</span>
              <div className="space-y-1.5 text-xs text-gray-700">
                <label className="flex items-center space-x-2 bg-gray-50 p-2 rounded border border-gray-200">
                  <input type="checkbox" defaultChecked className="rounded text-brand-600" />
                  <span>Sucursal Calle 50 (Ciudad de Panamá)</span>
                </label>
                <label className="flex items-center space-x-2 bg-gray-50 p-2 rounded border border-gray-200">
                  <input type="checkbox" defaultChecked className="rounded text-brand-600" />
                  <span>Sucursal Costa del Este</span>
                </label>
                <label className="flex items-center space-x-2 bg-gray-50 p-2 rounded border border-gray-200">
                  <input type="checkbox" defaultChecked className="rounded text-brand-600" />
                  <span>Sucursal Chiriquí (David)</span>
                </label>
              </div>
              <button className="w-full py-1.5 bg-brand-950 text-white rounded-lg text-xs font-bold flex items-center justify-center space-x-1">
                <Share2 className="h-3.5 w-3.5" />
                <span>Enviar a 3 Fichas de Google</span>
              </button>
            </div>
          )
        }
      ]
    },
    {
      badge: 'Gestión, NFC & Equipos',
      title: 'Hardware NFC Físico & Control Multilocal',
      description: 'Infraestructura completa para motivar a tu equipo presencial y administrar tus dispositivos y sucursales.',
      features: [
        {
          id: 'employee-ranking',
          icon: Trophy,
          badgeLabel: '100% GRATIS',
          isFree: true,
          kicker: 'GAMIFICACIÓN DE EQUIPO',
          title: 'Ranking de Empleados / Leaderboard por Escaneos',
          summary: 'Motiva a tus meseros o vendedores midiendo quién genera más toques y reseñas de clientes en tiempo real.',
          bullets: [
            'Tabla de posiciones por colaborador o tarjeta asignada.',
            'Medición de rendimiento para programas de incentivos.',
            'Filtros por día, semana y mes.'
          ],
          benefit: 'Incentiva a tu personal a solicitar opiniones activamente a cada cliente.',
          mockup: (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                <span className="text-xs font-extrabold text-gray-900 flex items-center">
                  <Trophy className="h-4 w-4 text-amber-500 mr-1" />
                  Tabla de Clasificación del Equipo
                </span>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">Septiembre</span>
              </div>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-amber-50 border border-amber-200">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-amber-700">🥇 #1</span>
                    <span className="font-bold text-gray-900">María González</span>
                  </div>
                  <span className="font-extrabold text-amber-900">184 Escaneos (48 Reseñas)</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-gray-600">🥈 #2</span>
                    <span className="font-bold text-gray-900">Juan Pérez</span>
                  </div>
                  <span className="font-extrabold text-gray-700">142 Escaneos (36 Reseñas)</span>
                </div>

                <div className="flex items-center justify-between p-2 rounded-lg bg-gray-50 border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-amber-800">🥉 #3</span>
                    <span className="font-bold text-gray-900">Sofía Ruiz</span>
                  </div>
                  <span className="font-extrabold text-gray-700">98 Escaneos (24 Reseñas)</span>
                </div>
              </div>
            </div>
          )
        },
        {
          id: 'nfc-routing',
          icon: QrCode,
          badgeLabel: '100% GRATIS',
          isFree: true,
          kicker: 'ENRUTAMIENTO NFC',
          title: 'Redirección NFC & Códigos QR Auto-Configurables',
          summary: 'Tus tarjetas y placas físicamente compradas permiten cambiar el destino del toque en tiempo real sin reprogramar el chip.',
          bullets: [
            'Redirecciona a Google Maps, WhatsApp, Menú PDF o Instagram.',
            'Edición instantánea en cualquier momento desde tu panel.',
            '100% GRATIS de por vida sin mensualidades obligatorias.'
          ],
          benefit: 'Adapta tus dispositivos NFC a tus campañas de marketing al instante.',
          mockup: (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg space-y-3">
              <span className="text-xs font-bold text-gray-900 block">Destino del Toque NFC / QR</span>
              <div className="space-y-2 text-xs">
                <div className="p-2.5 rounded-xl bg-brand-50 border border-brand-300 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="h-2 w-2 rounded-full bg-brand-500 animate-ping" />
                    <span className="font-bold text-brand-950">Reseñas Directas en Google Maps</span>
                  </div>
                  <span className="text-[10px] bg-brand-950 text-white font-bold px-2 py-0.5 rounded">ACTIVO</span>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between opacity-75">
                  <span>Chat Directo a WhatsApp Business</span>
                  <span className="text-[10px] text-gray-500">Seleccionar</span>
                </div>

                <div className="p-2.5 rounded-xl bg-gray-50 border border-gray-200 flex items-center justify-between opacity-75">
                  <span>Menú Digital PDF en la Nube</span>
                  <span className="text-[10px] text-gray-500">Seleccionar</span>
                </div>
              </div>
            </div>
          )
        },
        {
          id: 'device-mgmt',
          icon: Smartphone,
          badgeLabel: '100% GRATIS',
          isFree: true,
          kicker: 'GESTIÓN DE DISPOSITIVOS',
          title: 'Gestión y Diagnóstico de Dispositivos',
          summary: 'Controla el listado completo de tus tarjetas, llaveros y placas para mostrador vinculadas a tu cuenta.',
          bullets: [
            'Asigna nombres personalizados por colaborador o mesa.',
            'Conteo en vivo de toques y escaneos de códigos QR.',
            'Monitoreo de estado y activación instantánea.'
          ],
          benefit: 'Dominio absoluto sobre tus herramientas físicas de captura.',
          mockup: (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg space-y-2.5">
              <span className="text-xs font-bold text-gray-900 block border-b border-gray-100 pb-2">Dispositivos Físicos Activos</span>
              
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-xs">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-4 w-4 text-brand-600" />
                  <span className="font-semibold text-gray-900">Tarjeta PVC - Mesero #1</span>
                </div>
                <span className="font-bold text-emerald-600">142 toques</span>
              </div>

              <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg text-xs">
                <div className="flex items-center space-x-2">
                  <QrCode className="h-4 w-4 text-amber-600" />
                  <span className="font-semibold text-gray-900">Placa Mostrador - Caja</span>
                </div>
                <span className="font-bold text-emerald-600">380 toques</span>
              </div>
            </div>
          )
        },
        {
          id: 'multi-branch',
          icon: Building2,
          badgeLabel: 'SOFTWARE PRO',
          isFree: false,
          kicker: 'MULTILOCAL',
          title: 'Panel Multi-Sucursal Centralizado',
          summary: 'Administra la reputación de 1, 5 o 50 sucursales en Panamá desde una sola cuenta maestra.',
          bullets: [
            'Acceso jerárquico para administradores y gerentes.',
            'Visión global consolidada o análisis individual.',
            'Gestión unificada de permisos.'
          ],
          benefit: 'Escalabilidad ideal para cadenas, restaurantes y franquicias.',
          mockup: (
            <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-lg space-y-3">
              <span className="text-xs font-bold text-gray-900 block">Sucursales Conectadas</span>
              <div className="space-y-1.5 text-xs">
                <div className="p-2 bg-gray-50 rounded-lg flex justify-between items-center">
                  <span className="font-bold text-gray-900">📍 San Francisco</span>
                  <span className="text-amber-500 font-extrabold">4.9 ★ (340 reseñ.)</span>
                </div>
                <div className="p-2 bg-gray-50 rounded-lg flex justify-between items-center">
                  <span className="font-bold text-gray-900">📍 Costa del Este</span>
                  <span className="text-amber-500 font-extrabold">4.8 ★ (210 reseñ.)</span>
                </div>
              </div>
            </div>
          )
        }
      ]
    }
  ];

  return (
    <div className="w-full bg-white font-sans text-brand-900 min-h-screen flex flex-col justify-between">
      <Navbar />

      <main className="flex-grow">
        {/* 1. HERO SECTION */}
        <section className="relative bg-gradient-to-br from-brand-950 via-slate-900 to-brand-900 text-white pt-24 pb-24 px-4 overflow-hidden">
          <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
            
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center space-x-2 bg-amber-400/10 border border-amber-400/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-300 uppercase tracking-widest">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>Próximamente • Suite Pro Completa</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
                starTAP App Pro <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                  16 Superpoderes para Tu Negocio
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
                La solución todo en uno para empresas en Panamá: desde redirección NFC física gratuita de por vida hasta Inteligencia Artificial con automatización avanzada en Google Maps.
              </p>

              {/* 🛡️ Guarantee Box */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-left space-y-2 max-w-2xl">
                <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                  <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <span>Tu Versión Actual NFC Sigue Siendo 100% Gratuita</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">Transparencia total:</strong> Compras tus tarjetas o placas físicas una vez y las usas sin mensualidades obligatorias. La suite App Pro será una actualización opcional para empresas que requieran módulos avanzados.
                </p>
              </div>

              {/* Waitlist Form */}
              <div className="pt-2 max-w-md mx-auto lg:mx-0">
                {isJoined ? (
                  <div className="bg-emerald-500/20 border border-emerald-500/40 p-4 rounded-xl text-center space-y-1">
                    <div className="flex items-center justify-center space-x-2 text-emerald-400 font-bold text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>¡Te has unido a la Lista de Espera!</span>
                    </div>
                    <p className="text-[11px] text-slate-300">Te notificaremos cuando esté activo y tendrás 3 meses gratis de prueba Pro.</p>
                  </div>
                ) : (
                  <form onSubmit={handleWaitlistSubmit} className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 block text-left uppercase tracking-wider">
                      Únete al Acceso Anticipado (Beta VIP)
                    </label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="tu.correo@negocio.com"
                        className="px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-400 text-xs focus:outline-none focus:border-amber-400 flex-grow"
                      />
                      <button
                        type="submit"
                        className="bg-amber-500 hover:bg-amber-400 text-brand-950 font-black text-xs uppercase tracking-widest px-6 py-3.5 rounded-xl transition-all shadow-lg flex items-center justify-center gap-1.5 flex-shrink-0"
                      >
                        <Bell className="w-3.5 h-3.5" />
                        Avisarme
                      </button>
                    </div>
                  </form>
                )}
              </div>

            </div>

            {/* Right Visual */}
            <div className="lg:col-span-5">
              <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md shadow-2xl space-y-6 text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg text-brand-950">
                  <Smartphone className="w-10 h-10" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full uppercase tracking-widest">
                    Plataforma Integrada
                  </span>
                  <h3 className="text-xl font-black text-white mt-3">Infraestructura Física + IA</h3>
                  <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                    Gestiona desde un toque NFC en mesa hasta analíticas avanzadas de sentimiento en Google Maps.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* 2. FULL 16 FEATURES SUITE WITH ALTERNATING SPLIT-FEATURE LAYOUT & LIVE UI MOCKUPS */}
        <section className="py-20 px-4 bg-gray-50 border-t border-gray-200">
          <div className="max-w-7xl mx-auto space-y-24">
            <div className="text-center max-w-3xl mx-auto space-y-3">
              <span className="text-xs font-black uppercase tracking-widest text-brand-600 bg-brand-50 px-3 py-1 rounded-full border border-brand-200">
                Catálogo de Funcionalidades
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
                Las 16 Funcionalidades del Ecosistema starTAP
              </h2>
              <p className="text-gray-600 text-sm sm:text-base">
                Explora cada herramienta explicada paso a paso con su demostración de interfaz gráfica en vivo.
              </p>
            </div>

            {featureGroups.map((group, groupIdx) => (
              <div key={groupIdx} className="space-y-16">
                <div className="text-center max-w-2xl mx-auto border-b border-gray-200 pb-6">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-brand-600">{group.badge}</span>
                  <h3 className="text-2xl font-bold text-gray-900 mt-1">{group.title}</h3>
                  <p className="text-xs text-gray-600 mt-1">{group.description}</p>
                </div>

                <div className="space-y-20">
                  {group.features.map((feat, featIdx) => {
                    const isEven = featIdx % 2 === 0;

                    return (
                      <div
                        key={feat.id}
                        className={`grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center ${
                          isEven ? '' : 'lg:flex-row-reverse'
                        }`}
                      >
                        {/* Text Column */}
                        <div className={`lg:col-span-6 space-y-5 ${isEven ? '' : 'lg:order-2'}`}>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-extrabold text-brand-700 tracking-wider uppercase">
                              {feat.kicker}
                            </span>
                            {feat.isFree ? (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                100% GRATIS
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-900 border border-amber-200 flex items-center space-x-1">
                                <Sparkles className="h-3 w-3 text-amber-600" />
                                <span>SOFTWARE PRO</span>
                              </span>
                            )}
                          </div>

                          <h4 className="text-2xl font-extrabold text-gray-900 leading-tight">
                            {feat.title}
                          </h4>

                          <p className="text-gray-600 text-xs sm:text-sm leading-relaxed">
                            {feat.summary}
                          </p>

                          <ul className="space-y-2 pt-1">
                            {feat.bullets.map((b, bIdx) => (
                              <li key={bIdx} className="flex items-start text-xs text-gray-700">
                                <CheckCircle2 className="h-4 w-4 text-brand-500 mr-2 shrink-0 mt-0.5" />
                                <span>{b}</span>
                              </li>
                            ))}
                          </ul>

                          <div className="pt-3 border-t border-gray-200">
                            <div className="bg-brand-50/70 border border-brand-200 rounded-xl p-3.5 text-xs text-gray-800">
                              <strong className="text-brand-950 font-bold">¿Para qué sirve? </strong>
                              {feat.benefit}
                            </div>
                          </div>
                        </div>

                        {/* UI Mockup Column */}
                        <div className={`lg:col-span-6 ${isEven ? '' : 'lg:order-1'}`}>
                          <div className="bg-gradient-to-br from-gray-100 to-gray-200 p-6 rounded-3xl border border-gray-200 shadow-sm relative overflow-hidden">
                            {feat.mockup}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. COMPARISON TABLE: FREE vs PRO */}
        <section className="py-20 px-4 bg-white border-t border-brand-200">
          <div className="max-w-4xl mx-auto space-y-10">
            <div className="text-center space-y-2">
              <h2 className="text-2xl sm:text-3xl font-black text-brand-950 uppercase tracking-tight">Comparativa de Versiones</h2>
              <p className="text-xs text-brand-500">Hardware Gratis de por Vida vs Actualización Opcional App Pro.</p>
            </div>

            <div className="border border-brand-200 rounded-2xl overflow-hidden shadow-sm bg-white">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-brand-950 text-white">
                    <th className="p-4 font-bold uppercase tracking-wider">Módulo / Funcionalidad</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-center">Físico Incluido ($0/mes)</th>
                    <th className="p-4 font-bold uppercase tracking-wider text-center text-amber-300">App Pro (Próximamente)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100 text-brand-800">
                  <tr>
                    <td className="p-4 font-semibold">Costo Mensual Obligatorio</td>
                    <td className="p-4 text-center font-bold text-emerald-600 uppercase">$0 (Gratis)</td>
                    <td className="p-4 text-center font-bold text-amber-700">Suscripción Opcional</td>
                  </tr>
                  <tr>
                    <td className="p-4">Redirección NFC & Códigos QR Instantáneos</td>
                    <td className="p-4 text-center text-emerald-600 font-bold">✓ Incluido</td>
                    <td className="p-4 text-center text-emerald-600 font-bold">✓ Incluido</td>
                  </tr>
                  <tr>
                    <td className="p-4">Ranking de Empleados / Leaderboard</td>
                    <td className="p-4 text-center text-emerald-600 font-bold">✓ Incluido</td>
                    <td className="p-4 text-center text-emerald-600 font-bold">✓ Incluido</td>
                  </tr>
                  <tr>
                    <td className="p-4">Gestión de Tarjetas y Placas Físicas</td>
                    <td className="p-4 text-center text-emerald-600 font-bold">✓ Incluido</td>
                    <td className="p-4 text-center text-emerald-600 font-bold">✓ Incluido</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Respuestas a Reseñas con IA (Tono de Marca)</td>
                    <td className="p-4 text-center text-brand-300">—</td>
                    <td className="p-4 text-center text-emerald-600 font-bold">✓ Módulo Avanzado</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Automatización de Reseñas (4★ y 5★)</td>
                    <td className="p-4 text-center text-brand-300">—</td>
                    <td className="p-4 text-center text-emerald-600 font-bold">✓ Incluido</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Alertas Inmediatas de Reseñas Negativas</td>
                    <td className="p-4 text-center text-brand-300">—</td>
                    <td className="p-4 text-center text-emerald-600 font-bold">✓ Incluido</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Análisis de Sentimiento IA & Palabras Clave</td>
                    <td className="p-4 text-center text-brand-300">—</td>
                    <td className="p-4 text-center text-emerald-600 font-bold">✓ Incluido</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">API Google Maps (Llamadas, Rutas, Métricas)</td>
                    <td className="p-4 text-center text-brand-300">—</td>
                    <td className="p-4 text-center text-emerald-600 font-bold">✓ Sincronizado Live</td>
                  </tr>
                  <tr>
                    <td className="p-4 font-semibold">Informes Mensuales Automáticos en PDF</td>
                    <td className="p-4 text-center text-brand-300">—</td>
                    <td className="p-4 text-center text-emerald-600 font-bold">✓ Incluido</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="text-center pt-4">
              <Link
                href="/shop"
                className="inline-flex items-center gap-2 bg-brand-950 hover:bg-brand-900 text-white uppercase tracking-wider text-xs font-bold py-4 px-8 rounded-xl transition-all shadow-md"
              >
                <span>Comprar Dispositivos NFC</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
