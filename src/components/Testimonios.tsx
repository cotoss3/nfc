import { Quote, Star } from 'lucide-react';
import { testimoniosPublicables, testimoniosDeProducto, type Testimonio } from '@/config/testimonios';

function Tarjeta({ t }: { t: Testimonio }) {
  return (
    <figure className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col gap-3 shadow-xs">
      <div className="flex items-center justify-between">
        <Quote className="w-5 h-5 text-amber-500 flex-shrink-0" aria-hidden="true" />
        {typeof t.calificacion === 'number' && (
          <div className="flex items-center gap-1" aria-label={`${t.calificacion} de 5 estrellas`}>
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 ${
                  star <= (t.calificacion || 0)
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-slate-100 text-slate-200'
                }`}
                aria-hidden="true"
              />
            ))}
          </div>
        )}
      </div>
      <blockquote className="text-sm sm:text-base text-slate-800 leading-relaxed">
        {t.texto}
      </blockquote>
      <figcaption className="mt-auto pt-2 border-t border-slate-100">
        <span className="block text-sm font-bold text-slate-900">{t.nombre}</span>
        {t.negocio && <span className="block text-xs text-slate-500">{t.negocio}</span>}
        {t.relacionado && (
          <span className="block text-[11px] text-slate-400 mt-1.5 italic">
            Aviso de transparencia: es un negocio nuestro.
          </span>
        )}
      </figcaption>
    </figure>
  );
}

/** Bloque de testimonios. Sin autorizados, no renderiza nada. */
export default function Testimonios({
  productId,
  titulo = 'Lo que dicen los que ya lo tienen',
}: {
  productId?: string;
  titulo?: string;
}) {
  const lista = productId ? testimoniosDeProducto(productId) : testimoniosPublicables();
  if (lista.length === 0) return null;

  return (
    <section className="py-12 sm:py-16 bg-slate-50" aria-labelledby="titulo-testimonios">
      <div className="max-w-6xl mx-auto px-4">
        <h2 id="titulo-testimonios" className="text-2xl sm:text-3xl font-black text-slate-950 mb-2">
          {titulo}
        </h2>
        <p className="text-sm text-slate-500 mb-8">
          Clientes de starTAP en Panamá, con su permiso para publicarlo.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lista.map((t) => (
            <Tarjeta key={t.id} t={t} />
          ))}
        </div>
      </div>
    </section>
  );
}
