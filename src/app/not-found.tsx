import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight, Compass, Star } from 'lucide-react';
import { PRODUCTS } from '@/config/products';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Página no encontrada | starTAP Panamá',
  robots: { index: false, follow: true },
};

// Solo los 3 productos principales (excluye packs)
const FEATURED = PRODUCTS.filter((p) => !p.isPack).slice(0, 3);

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center px-5 py-20 bg-slate-50">

      {/* ── Hero / Mensaje de marca ── */}
      <div className="max-w-xl w-full text-center space-y-6">
        {/* Icono */}
        <div className="mx-auto w-20 h-20 rounded-3xl bg-[#01A6D2]/10 flex items-center justify-center shadow-inner">
          <Compass className="w-10 h-10 text-[#01A6D2]" strokeWidth={1.5} />
        </div>

        {/* Voz de starTAP */}
        <div className="space-y-3">
          <p className="text-xs font-bold uppercase tracking-widest text-[#01A6D2]">
            Error 404
          </p>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 leading-tight tracking-tight">
            Esta página no existe (o se fue sin dejar reseña).
          </h1>
          <p className="text-slate-500 leading-relaxed">
            En starTAP ayudamos a que tu negocio aparezca justo donde te buscan.
            Parece que esta URL no tiene ese privilegio todavía.
            Prueba volviendo al inicio o explora nuestros dispositivos NFC.
          </p>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white text-sm font-bold rounded-xl transition-all shadow"
          >
            Volver al inicio
          </Link>
          <Link
            href="/catalogo"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 border border-slate-300 hover:border-[#01A6D2] text-slate-800 hover:text-[#01A6D2] text-sm font-bold rounded-xl transition-all"
          >
            Ver catálogo
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* ── Divisor ── */}
      <div className="w-full max-w-3xl my-14 border-t border-slate-200" />

      {/* ── Quizás te puede interesar ── */}
      <div className="w-full max-w-3xl space-y-6">
        <div className="text-center space-y-1">
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Quizás te puede interesar
          </p>
          <h2 className="text-xl font-black text-slate-950">
            Dispositivos NFC para tu negocio en Panamá
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {FEATURED.map((product) => (
            <Link
              key={product.id}
              href={`/catalogo/${product.id}`}
              className="group bg-white border border-slate-200 hover:border-[#01A6D2] rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col"
            >
              {/* Imagen */}
              <div className="w-full h-44 bg-slate-50 flex items-center justify-center p-4 relative overflow-hidden">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={200}
                  height={160}
                  className="object-contain max-h-full group-hover:scale-105 transition-transform duration-300"
                />
                <span className="absolute top-2 left-2 text-[9px] font-bold bg-white/90 text-slate-700 border border-slate-200 px-2 py-0.5 rounded-full">
                  {product.badge}
                </span>
              </div>

              {/* Info */}
              <div className="p-4 flex flex-col flex-1 gap-2">
                <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2">
                  {product.name}
                </h3>
                <p className="text-[11px] text-slate-500 line-clamp-2 flex-1">
                  {product.description}
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto">
                  <div className="flex items-center gap-0.5 text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className="w-3 h-3 fill-current" />
                    ))}
                    <span className="text-[10px] text-slate-400 ml-1 font-medium">
                      ({product.reviewCount})
                    </span>
                  </div>
                  <span className="text-sm font-black text-slate-950 font-mono">
                    {product.priceFormatted}
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* CTA catálogo completo */}
        <div className="text-center pt-2">
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-[#01A6D2] hover:underline"
          >
            Ver todos los productos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
