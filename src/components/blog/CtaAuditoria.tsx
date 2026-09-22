import React from 'react';
import { MessageCircle, Mail, Check, X } from 'lucide-react';

const MENSAJE_WHATSAPP =
  'Hola Fernando, leí el artículo del blog sobre por qué mi negocio no aparece en Google Maps. ¿Me puedes hacer la revisión gratuita de mi ficha de Google?';

const WHATSAPP_REVISION = `https://wa.me/50764839004?text=${encodeURIComponent(MENSAJE_WHATSAPP)}`;

const ASUNTO_CORREO = encodeURIComponent('Revisión de mi ficha de Google');
const CORREO_REVISION = `mailto:info@startap.com.pa?subject=${ASUNTO_CORREO}`;

export default function CtaAuditoria() {
  return (
    <section
      aria-labelledby="revision-ficha"
      className="not-prose mt-14 rounded-2xl border border-accent-200 bg-gradient-to-br from-accent-50 to-orange-50/40 p-6 sm:p-8 shadow-xs"
    >
      <span className="inline-block px-2.5 py-0.5 rounded-md bg-accent-600 text-white text-[10px] font-bold uppercase tracking-wider">
        Revisión gratuita
      </span>

      <h2 id="revision-ficha" className="mt-3 text-xl sm:text-2xl font-black text-brand-950">
        Te reviso la ficha sin costo
      </h2>

      <p className="mt-3 text-sm sm:text-base text-brand-700 leading-relaxed">
        Me mandas el enlace de tu ficha de Google y te digo cuál de los seis puntos tienes mal y en
        qué orden arreglarlo. No es una propuesta comercial disfrazada: si tu problema es la
        verificación, te lo digo y no te vendo nada.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-brand-200 bg-white p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-950 mb-2.5">
            Qué incluye
          </h3>
          <ul className="space-y-2 text-sm text-brand-700">
            {[
              'Los seis puntos revisados en tu ficha, uno por uno',
              'El orden en que yo los arreglaría',
              'Las categorías que usan los que salen arriba en tu zona',
              'Una respuesta escrita, no una llamada de venta',
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <Check className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-brand-200 bg-white p-4">
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-950 mb-2.5">
            Qué no incluye
          </h3>
          <ul className="space-y-2 text-sm text-brand-700">
            {[
              'No hago la verificación por ti, esa la tiene que pasar el dueño',
              'No fusiono ni recupero fichas suspendidas',
              'No te digo cuándo vas a subir, eso depende de tu competencia',
              'No auditamos tu web ni tus redes, solo la ficha',
            ].map((t) => (
              <li key={t} className="flex items-start gap-2">
                <X className="w-4 h-4 text-brand-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
                <span>{t}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <a
          href={WHATSAPP_REVISION}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent-500 hover:bg-accent-600 text-white font-bold text-sm transition shadow-xs hover:shadow-md"
        >
          <MessageCircle className="w-4 h-4" aria-hidden="true" />
          Escribir por WhatsApp
        </a>
        <a
          href={CORREO_REVISION}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-brand-300 bg-white hover:border-accent-500 hover:text-accent-600 text-brand-800 font-bold text-sm transition"
        >
          <Mail className="w-4 h-4" aria-hidden="true" />
          info@startap.com.pa
        </a>
      </div>

      <p className="mt-4 text-xs text-brand-500 leading-relaxed">
        Escribe al +507 6483-9004. Vendemos dispositivos NFC para reseñas, así que esa parte la
        tengo a favor y la digo de frente. Los otros cinco puntos no te los vendemos.
      </p>
    </section>
  );
}
