import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { INDUSTRIAS } from '@/lib/industrias';

const BASE_URL = 'https://startap.com.pa';

export const metadata: Metadata = {
  title: 'Cómo Conseguir Más Reseñas de Google en Panamá',
  description:
    'Guía por tipo de negocio para conseguir más reseñas de Google en Panamá: restaurantes, clínicas, barberías, talleres, hoteles y comercios.',
  alternates: { canonical: '/resenas-google' },
};

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

      <div className="max-w-4xl mx-auto px-5 py-12 sm:py-16">
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-gray-950 leading-tight tracking-tight">
            Cómo conseguir más reseñas de Google en Panamá
          </h1>
          <p className="mt-5 text-lg text-gray-600 leading-relaxed">
            Las reseñas son una de las señales que más pesan para aparecer primero en Google Maps.
            Aquí tienes la guía según el tipo de negocio que manejas, con el momento exacto para
            pedir la reseña y el dispositivo que mejor funciona en cada caso.
          </p>
        </header>

        <ul className="grid gap-4 sm:grid-cols-2">
          {INDUSTRIAS.map((i) => (
            <li key={i.slug}>
              <Link
                href={`/resenas-google/${i.slug}`}
                className="group block h-full rounded-2xl border border-gray-200 p-6 hover:border-accent-500 transition"
              >
                <h2 className="font-bold text-gray-950 capitalize">{i.nombre}</h2>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{i.intro}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-accent-600">
                  Ver la guía
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </span>
              </Link>
            </li>
          ))}
        </ul>

        <section className="mt-14 rounded-3xl bg-gray-50 border border-gray-200 p-7">
          <h2 className="text-xl font-bold text-gray-950 mb-3">
            Lo que nunca debes hacer con las reseñas
          </h2>
          <ul className="space-y-2 text-gray-600 text-sm leading-relaxed">
            <li>
              <strong className="text-gray-950">No filtres.</strong> Pedirle la reseña solo a los
              clientes contentos va contra las políticas de Google y puede costarte la ficha.
            </li>
            <li>
              <strong className="text-gray-950">No incentives.</strong> Regalar algo a cambio de una
              reseña está prohibido y Google las elimina.
            </li>
            <li>
              <strong className="text-gray-950">No compres reseñas.</strong> Se detectan, se borran y
              dejan la ficha marcada.
            </li>
            <li>
              <strong className="text-gray-950">No metas palabras clave en el nombre</strong> de tu
              negocio en Google. Es motivo de suspensión.
            </li>
          </ul>
        </section>
      </div>
    </>
  );
}
