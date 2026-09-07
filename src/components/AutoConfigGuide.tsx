import React from 'react';
import { Smartphone, Zap, Sparkles, CheckCircle2, ShieldCheck, Package } from 'lucide-react';

export default function AutoConfigGuide() {
  return (
    <section className="my-10 bg-gradient-to-br from-slate-900 via-slate-850 to-slate-950 text-white rounded-3xl p-6 sm:p-10 shadow-2xl border border-slate-800 relative overflow-hidden">
      {/* Background Accent Glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
        <div className="inline-flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 px-3.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest">
          <Zap className="w-3.5 h-3.5" />
          <span>Dispositivos 100% Auto-Configurables</span>
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
          ¿Cómo funciona tu Dispositivo TAP?
        </h2>
        <p className="text-xs sm:text-sm text-slate-400">
          Ya no necesitas enviarnos URLs complejas. Tu dispositivo viene listo para vincular en 30 segundos desde tu celular.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
        {/* Step 1 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative hover:border-amber-500/50 transition">
          <div className="w-12 h-12 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg mb-4">
            1
          </div>
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <span>Recibes tu Dispositivo TAP</span> 📦
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tu placa o tarjeta inteligente llega a tu negocio en Panamá lista para usar, cargada con chip NFC electromagnético de alta respuesta.
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative hover:border-amber-500/50 transition">
          <div className="w-12 h-12 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg mb-4">
            2
          </div>
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <span>Tocas o Escaneas por 1ª Vez</span> 📱
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Acerca tu teléfono al dispositivo. El sistema de auto-configuración te guiará en 30 segundos a vincular tu enlace de Google Reviews, TripAdvisor o Instagram.
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 relative hover:border-amber-500/50 transition">
          <div className="w-12 h-12 bg-amber-500 text-slate-950 rounded-2xl flex items-center justify-center font-black text-lg shadow-lg mb-4">
            3
          </div>
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <span>¡Capturas Reseñas y Clientes!</span> 🚀
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Tus clientes dejan opiniones de 5 estrellas al instante. Podrás cambiar o actualizar el destino de tu dispositivo cuantas veces quieras desde tu panel sin costo extra.
          </p>
        </div>
      </div>

      <div className="mt-8 pt-6 border-t border-slate-800/80 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-400">
        <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Sin mensualidades ni contratos</span>
        <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-400" /> Cambios de enlace ilimitados</span>
        <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Compatible con iPhone y Android</span>
      </div>
    </section>
  );
}
