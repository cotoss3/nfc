'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  ArrowRight 
} from 'lucide-react';

export default function AppProPage() {
  const [email, setEmail] = useState('');
  const [isJoined, setIsJoined] = useState(false);

  const handleWaitlistSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsJoined(true);
  };

  return (
    <div className="w-full bg-white font-sans text-brand-900">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-br from-brand-950 via-slate-900 to-brand-900 text-white pt-16 pb-24 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-amber-400/10 border border-amber-400/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-300 uppercase tracking-widest">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Próximamente • 100% Opcional</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
              starTAP App Pro <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                El Software Avanzado para Tu Negocio
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Próximamente lanzaremos una suite Pro con perfiles digitales interactivos, automatización avanzada de reseñas en Google y analíticas detalladas para potenciar la presencia de tu comercio en Panamá.
            </p>

            {/* 🛡️ Guarantee Box: Free Version is Preserved! */}
            <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-5 text-left space-y-2 max-w-2xl">
              <div className="flex items-center space-x-2 text-amber-300 font-bold text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Tu Versión Actual Sigue Siendo 100% Gratuita</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                <strong className="text-white">No te preocupes:</strong> Compras tu dispositivo starTAP una vez y dispones de tu plataforma web sin costo ni mensualidades obligatorias. La App Pro será una actualización totalmente opcional para quienes deseen funciones avanzadas de nivel enterprise.
              </p>
            </div>

            {/* Pre-registration waitlist form */}
            <div className="pt-2 max-w-md mx-auto lg:mx-0">
              {isJoined ? (
                <div className="bg-green-500/20 border border-green-500/40 p-4 rounded-xl text-center space-y-1">
                  <div className="flex items-center justify-center space-x-2 text-green-400 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>¡Te has unido a la Lista de Espera!</span>
                  </div>
                  <p className="text-[11px] text-slate-300">Te notificaremos primero cuando lancemos y recibirás 3 meses de prueba Pro totalmente gratis.</p>
                </div>
              ) : (
                <form onSubmit={handleWaitlistSubmit} className="space-y-2">
                  <label className="text-xs font-bold text-slate-300 block text-left uppercase tracking-wider">
                    Únete a la Lista de Acceso Anticipado (Beta)
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
                  <p className="text-[10px] text-slate-400 text-left">Recibirás acceso prioritario y 3 meses gratis de starTAP App Pro.</p>
                </form>
              )}
            </div>

          </div>

          {/* Right Visual Container */}
          <div className="lg:col-span-5">
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md shadow-2xl space-y-6 text-center">
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-amber-600 rounded-3xl flex items-center justify-center mx-auto shadow-lg text-brand-950">
                <Smartphone className="w-10 h-10" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full uppercase tracking-widest">
                  Software Next-Gen
                </span>
                <h3 className="text-xl font-black text-white mt-3">Experiencia Digital Interactiva</h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Diseñado para teléfonos modernos, permitiendo personalizar menús, videos, enlaces y calificaciones con un solo toque NFC.
                </p>
              </div>

              <div className="border-t border-white/10 pt-4 grid grid-cols-2 gap-3 text-left text-xs">
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Perfil Digital</span>
                  <span className="font-bold text-white text-xs">Landing Pro vCard</span>
                </div>
                <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                  <span className="text-[10px] text-slate-400 block uppercase font-bold">Reseñas Smart</span>
                  <span className="font-bold text-white text-xs">Ruteo IA Google</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. GOOGLE BUSINESS PROFILE INTEGRATION SHOWCASE */}
      <section className="py-20 px-4 bg-brand-950 text-white border-y border-brand-800">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <div className="inline-flex items-center space-x-2 bg-amber-400/10 border border-amber-400/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-300 uppercase tracking-widest">
              <Globe className="w-3.5 h-3.5 text-amber-400" />
              <span>Conexión Directa con Google Business Profile API</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-white">
              Data de SEO Local en Tiempo Real <br /> Directo de tu Ficha en Google Maps
            </h2>
            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              La versión App Pro se conecta de forma segura a la API oficial de Google para mostrarte qué está funcionando en tu perfil local, monitorear reseñas al instante y optimizar tu posicionamiento en Panamá.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature G1 */}
            <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-bold text-sm">
                ★
              </div>
              <h3 className="font-bold text-white text-base">Monitoreo de Reseñas & Rating Live</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sincroniza tus estrellas en Google (ej: 4.9 ★) y el contador total de opiniones en tiempo real. Recibe alertas en WhatsApp cada vez que entra una nueva reseña.
              </p>
            </div>

            {/* Feature G2 */}
            <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-bold text-sm">
                🤖
              </div>
              <h3 className="font-bold text-white text-base">Respuestas a Reseñas Asistidas por IA</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Genera respuestas profesionales en segundos para responder reseñas de tus clientes en Google Maps, mejorando la interacción y puntuación SEO en la plataforma.
              </p>
            </div>

            {/* Feature G3 */}
            <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-bold text-sm">
                🔍
              </div>
              <h3 className="font-bold text-white text-base">Auditoría de Salud SEO Local</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Revisa el estado de salud de tu ficha en Google Maps (horarios, fotos recientes, verificación activa) y detecta qué optimizaciones faltan para aparecer de #1 en Panamá.
              </p>
            </div>

            {/* Feature G4 */}
            <div className="bg-brand-900 border border-brand-800 rounded-2xl p-6 space-y-3">
              <div className="w-10 h-10 bg-amber-500/20 text-amber-400 rounded-xl flex items-center justify-center font-bold text-sm">
                📊
              </div>
              <h3 className="font-bold text-white text-base">Conversion Ratio NFC vs Búsquedas</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Mide cuántos toques NFC ocurren físicamente en tu local vs cuantas visualizaciones e impresiones orgánicas recibes en Google Search y Maps.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2.5 FEATURES GRID (PRO FEATURES) */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-brand-600 block">Funciones Futuras</span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-950">
              ¿Qué más incluirá starTAP App Pro?
            </h2>
            <p className="text-brand-600 text-sm sm:text-base leading-relaxed">
              Herramientas diseñadas para maximizar tus ventas, fidelizar clientes y capturar métricas avanzadas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 border border-brand-200 shadow-sm space-y-4 hover:border-brand-950 transition-colors">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-brand-950">Perfil Digital Interactivo (vCard Pro)</h3>
              <p className="text-xs text-brand-600 leading-relaxed">
                Crea una landing page profesional con tu logo, botones de WhatsApp, catálogo de productos en PDF, redes sociales y ubicación en Google Maps.
              </p>
              <span className="text-[10px] bg-amber-50 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-200 inline-block">
                Opcional Pro
              </span>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 border border-brand-200 shadow-sm space-y-4 hover:border-brand-950 transition-colors">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
                <Star className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-brand-950">Filtro Inteligente de Reseñas</h3>
              <p className="text-xs text-brand-600 leading-relaxed">
                Permite capturar las opiniones de tus clientes antes de publicarlas. Envía las experiencias de 5 estrellas directamente a Google Maps o TripAdvisor.
              </p>
              <span className="text-[10px] bg-amber-50 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-200 inline-block">
                Opcional Pro
              </span>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 border border-brand-200 shadow-sm space-y-4 hover:border-brand-950 transition-colors">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-brand-950">Analíticas & Métricas Avanzadas</h3>
              <p className="text-xs text-brand-600 leading-relaxed">
                Descubre qué días y horas tus clientes escanean más tus dispositivos. Compara el rendimiento entre distintas sucursales o colaboradores.
              </p>
              <span className="text-[10px] bg-amber-50 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-200 inline-block">
                Opcional Pro
              </span>
            </div>

            {/* Feature 4 */}
            <div className="bg-white rounded-2xl p-8 border border-brand-200 shadow-sm space-y-4 hover:border-brand-950 transition-colors">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
                <Sliders className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-brand-950">Reglas de Redirección Dinámica</h3>
              <p className="text-xs text-brand-600 leading-relaxed">
                Cambia automáticamente el destino del toque NFC según la hora del día (ej. Menú de almuerzo de día, Menú de cena de noche o promoción de fin de semana).
              </p>
              <span className="text-[10px] bg-amber-50 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-200 inline-block">
                Opcional Pro
              </span>
            </div>

            {/* Feature 5 */}
            <div className="bg-white rounded-2xl p-8 border border-brand-200 shadow-sm space-y-4 hover:border-brand-950 transition-colors">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-brand-950">Ranking & Competencia de Empleados</h3>
              <p className="text-xs text-brand-600 leading-relaxed">
                Gamifica la captación de opiniones. Asigna dispositivos a tus meseros o ejecutivos y premia al empleado del mes con el Leaderboard en vivo.
              </p>
              <span className="text-[10px] bg-amber-50 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-200 inline-block">
                Opcional Pro
              </span>
            </div>

            {/* Feature 6 */}
            <div className="bg-white rounded-2xl p-8 border border-brand-200 shadow-sm space-y-4 hover:border-brand-950 transition-colors">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center font-bold text-lg">
                ⚠️
              </div>
              <h3 className="text-lg font-bold text-brand-950">Alertas de Reseñas Negativas</h3>
              <p className="text-xs text-brand-600 leading-relaxed">
                Recibe notificaciones instantáneas en WhatsApp ante opiniones bajas para actuar antes de que afecten la puntuación pública de tu local.
              </p>
              <span className="text-[10px] bg-amber-50 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-200 inline-block">
                Opcional Pro
              </span>
            </div>

            {/* Feature 7 */}
            <div className="bg-white rounded-2xl p-8 border border-brand-200 shadow-sm space-y-4 hover:border-brand-950 transition-colors">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-brand-950">Gestión Multi-Sucursal & Publicaciones</h3>
              <p className="text-xs text-brand-600 leading-relaxed">
                Administra franquicias o redes de negocios en Panamá. Publica ofertas, fotos y cambios de horario masivos en todos tus perfiles de Google a la vez.
              </p>
              <span className="text-[10px] bg-amber-50 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-200 inline-block">
                Opcional Pro
              </span>
            </div>

            {/* Feature 8 */}
            <div className="bg-white rounded-2xl p-8 border border-brand-200 shadow-sm space-y-4 hover:border-brand-950 transition-colors">
              <div className="w-12 h-12 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-brand-950">Soporte Prioritario VIP</h3>
              <p className="text-xs text-brand-600 leading-relaxed">
                Atención directa personalizada vía WhatsApp y asesoría para optimizar tu posicionamiento SEO local en Google Maps Panamá.
              </p>
              <span className="text-[10px] bg-amber-50 text-amber-900 font-bold px-2 py-0.5 rounded border border-amber-200 inline-block">
                Opcional Pro
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. COMPARISON TABLE: FREE vs PRO */}
      <section className="py-20 px-4 bg-white border-t border-brand-200">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-3xl font-black text-brand-950 uppercase tracking-tight">Comparativa de Versiones</h2>
            <p className="text-xs text-brand-500">Compara la versión gratuita incluida con la versión Pro futura.</p>
          </div>

          <div className="border border-brand-200 rounded-2xl overflow-hidden shadow-sm bg-white">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-brand-950 text-white">
                  <th className="p-4 font-bold uppercase tracking-wider">Característica</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-center">Versión Gratis (Incluida)</th>
                  <th className="p-4 font-bold uppercase tracking-wider text-center text-amber-300">App Pro (Próximamente)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-100 text-brand-800">
                <tr>
                  <td className="p-4 font-semibold">Costo Mensual</td>
                  <td className="p-4 text-center font-bold text-green-600 uppercase">Gratis para siempre ($0)</td>
                  <td className="p-4 text-center font-bold text-amber-700">Suscripción Opcional</td>
                </tr>
                <tr>
                  <td className="p-4">Redirección Instantánea (Google / Social)</td>
                  <td className="p-4 text-center text-green-600 font-bold">✓ Incluido</td>
                  <td className="p-4 text-center text-green-600 font-bold">✓ Incluido</td>
                </tr>
                <tr>
                  <td className="p-4">Cambio de enlace en tiempo real</td>
                  <td className="p-4 text-center text-green-600 font-bold">✓ Ilimitado</td>
                  <td className="p-4 text-center text-green-600 font-bold">✓ Ilimitado</td>
                </tr>
                <tr>
                  <td className="p-4">Conector de Portal Web Básico</td>
                  <td className="p-4 text-center text-green-600 font-bold">✓ Incluido</td>
                  <td className="p-4 text-center text-green-600 font-bold">✓ Incluido</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold">Perfil Digital Interactivo vCard</td>
                  <td className="p-4 text-center text-brand-300">—</td>
                  <td className="p-4 text-center text-green-600 font-bold">✓ Avanzado</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold">Filtro Inteligente de Reseñas de 5 Estrellas</td>
                  <td className="p-4 text-center text-brand-300">—</td>
                  <td className="p-4 text-center text-green-600 font-bold">✓ Incluido</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold">Analíticas por Hora y Sucursal</td>
                  <td className="p-4 text-center text-brand-300">—</td>
                  <td className="p-4 text-center text-green-600 font-bold">✓ Reportes completos</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold">Reglas Horarias de Redirección</td>
                  <td className="p-4 text-center text-brand-300">—</td>
                  <td className="p-4 text-center text-green-600 font-bold">✓ Incluido</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="text-center pt-4">
            <Link
              href="/shop"
              className="inline-flex items-center gap-2 shopify-btn-primary uppercase tracking-wider text-xs font-bold py-4 px-8 rounded-xl"
            >
              <span>Ver Productos con Plataforma Gratis Incluida</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
