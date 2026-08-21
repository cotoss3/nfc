'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { dbLocal } from '@/lib/db';
import { ShieldCheck, Truck, RotateCcw, ArrowRight } from 'lucide-react';

export default function HomePage() {
  const products = dbLocal.getProducts().slice(0, 3);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: '¿Cómo funcionan las placas y tarjetas NFC?',
      a: 'Nuestras tarjetas y placas contienen un chip NFC inteligente y un código QR de respaldo. Cuando un cliente acerca su teléfono (o escanea el QR), se abre de forma automática el enlace de reseñas de tu negocio o tu tarjeta digital, sin necesidad de descargar apps.'
    },
    {
      q: '¿Puedo cambiar el enlace en el futuro?',
      a: '¡Sí! Al comprar tu PanaCard, tendrás acceso a tu panel de control (Dashboard). Desde allí podrás cambiar el enlace de destino de forma ilimitada y en tiempo real. Si hoy quieres reseñas en Google y mañana en TripAdvisor, lo cambias con un clic.'
    },
    {
      q: '¿Es compatible con todos los celulares?',
      a: 'Sí. El chip NFC integrado funciona con más del 95% de los teléfonos modernos (iOS y Android) con solo acercar el dispositivo. Para teléfonos antiguos sin NFC, incluimos un código QR de alta definición en el diseño para que lo escaneen con la cámara.'
    },
    {
      q: '¿Hay mensualidades o suscripciones ocultas?',
      a: 'No. Haces un solo pago por el producto físico y disfrutas de escaneos e integraciones ilimitadas para siempre. No cobramos mensualidades.'
    },
    {
      q: '¿Cómo es el proceso de envío en Panamá?',
      a: 'Enviamos a todo el país. Para Ciudad de Panamá ofrecemos entregas a domicilio el mismo día o al día siguiente de la producción. Para el interior del país (Chiriquí, Colón, Veraguas, Herrera, etc.), realizamos envíos seguros mediante Uno Express o Servientrega.'
    }
  ];

  return (
    <div className="space-y-24 pb-24 bg-brand-50">
      
      {/* Promo Bar / Trust Bar */}
      <section className="bg-brand-950 text-white text-xs py-2.5 text-center font-medium tracking-wider uppercase">
        ⚡ ENVÍOS EXPRESS A TODO PANAMÁ VÍA UNO EXPRESS Y SERVIENTREGA
      </section>

      {/* Hero Section */}
      <section className="shopify-container max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-6">
          {/* Left: Text Content */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <span className="text-xs font-bold tracking-widest text-brand-500 uppercase block">PanaCards NFC Panama</span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-950 leading-[1.1] tracking-tight">
                Consigue más reseñas y clientes con un toque.
              </h1>
              <p className="text-base text-brand-500 max-w-xl leading-relaxed">
                Diseñamos herramientas físicas inteligentes de alta gama para negocios en Panamá. Aumenta tus valoraciones en Google Maps, TripAdvisor o seguidores en Instagram sin fricción.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/shop" className="shopify-btn-primary text-center py-4 px-8 tracking-wider uppercase font-semibold">
                Comprar Colección NFC
              </Link>
              <Link href="/dashboard" className="shopify-btn-secondary text-center py-4 px-8 tracking-wider uppercase font-semibold">
                Probar Simulador
              </Link>
            </div>

            {/* Micro proof */}
            <div className="flex items-center space-x-6 text-xs text-brand-400 font-medium">
              <span className="flex items-center gap-1">• Diseños personalizados</span>
              <span className="flex items-center gap-1">• Sin cuotas mensuales</span>
              <span className="flex items-center gap-1">• Grabado láser premium</span>
            </div>
          </div>

          {/* Right: Mockup Picture */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group w-80 h-96 bg-brand-950 rounded-2xl p-8 shadow-card flex flex-col justify-between text-white border border-brand-950 card-glossy transition-all hover:scale-[1.01]">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold tracking-widest text-brand-400 block uppercase">Ficha Oficial</span>
                  <span className="text-sm font-bold text-white tracking-wide">Google Reviews</span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-accent-600 animate-pulse"></div>
              </div>

              {/* Graphic NFC Sign */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto text-white">
                  ⚡
                </div>
                <p className="text-xs font-bold text-brand-200 tracking-wider uppercase">Acerca tu Teléfono</p>
              </div>

              <div className="flex justify-between items-end border-t border-white/10 pt-4">
                <div>
                  <p className="text-[10px] text-brand-400 uppercase tracking-wider">PanaCards</p>
                  <p className="text-xs font-bold">Acrílico Doble Cara</p>
                </div>
                {/* Simulated QR Code */}
                <div className="w-10 h-10 bg-white rounded p-0.5">
                  <div className="w-full h-full bg-brand-950 rounded-[2px] flex items-center justify-center text-[5px] text-white font-bold font-mono">
                    QR
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shopify Services Trust Section */}
      <section className="border-y border-brand-200 bg-white py-8">
        <div className="shopify-container max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start space-x-4">
            <Truck className="h-6 w-6 text-brand-950 flex-shrink-0 stroke-[1.5]" />
            <div>
              <h4 className="text-sm font-bold text-brand-950 uppercase tracking-wider">Envíos a todo el País</h4>
              <p className="text-xs text-brand-500 mt-1">Envío a través de Uno Express, Servientrega o mensajería local en Ciudad de Panamá.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 border-t md:border-t-0 md:border-x border-brand-200 pt-6 md:pt-0 md:px-8">
            <ShieldCheck className="h-6 w-6 text-brand-950 flex-shrink-0 stroke-[1.5]" />
            <div>
              <h4 className="text-sm font-bold text-brand-950 uppercase tracking-wider">Garantía en Chip NFC</h4>
              <p className="text-xs text-brand-500 mt-1">Todos nuestros chips son NTAG213 originales y cuentan con garantía de funcionamiento de 1 año.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 border-t md:border-t-0 pt-6 md:pt-0">
            <RotateCcw className="h-6 w-6 text-brand-950 flex-shrink-0 stroke-[1.5]" />
            <div>
              <h4 className="text-sm font-bold text-brand-950 uppercase tracking-wider">Sin Suscripciones</h4>
              <p className="text-xs text-brand-500 mt-1">Un único pago por tu producto. Administra y cambia tus enlaces de forma gratuita para siempre.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Spotlight (Featured Products) */}
      <section className="shopify-container max-w-6xl space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold tracking-widest text-brand-400 uppercase block">Colecciones más Vendidas</span>
          <h2 className="text-3xl font-black text-brand-950">Placas y Tarjetas para Negocios</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group flex flex-col h-full bg-white border border-brand-200 overflow-hidden hover:shadow-premium transition-shadow duration-300">
              <div className="relative aspect-square overflow-hidden bg-brand-100 border-b border-brand-200">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {product.category === 'plates' && (
                  <span className="absolute top-4 left-4 bg-brand-950 text-white text-[9px] font-bold tracking-widest uppercase px-2.5 py-1">
                    Mostrador
                  </span>
                )}
              </div>

              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-1 text-center md:text-left">
                  <h3 className="text-sm font-bold text-brand-950 tracking-wide uppercase truncate">{product.name}</h3>
                  <p className="text-xs text-brand-400 font-medium">{product.category === 'plates' ? 'Placa de Reseñas' : 'Tarjeta de Presentación'}</p>
                  <p className="text-sm font-black text-brand-900 pt-1">${product.price.toFixed(2)}</p>
                </div>

                <Link
                  href={`/shop/${product.id}`}
                  className="w-full shopify-btn-secondary text-center tracking-wider text-xs uppercase py-3 border-brand-950 hover:bg-brand-950 hover:text-white"
                >
                  Personalizar y Comprar
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white border-y border-brand-200 py-16">
        <div className="shopify-container max-w-4xl text-center space-y-8">
          <span className="text-xs font-bold tracking-widest text-brand-400 uppercase block">Testimonios de Clientes</span>
          <p className="text-lg md:text-xl font-medium text-brand-800 italic leading-relaxed">
            "Colocamos la placa de Google en la caja de nuestro café en Costa del Este y pasamos de tener 45 reseñas a más de 300 en menos de dos meses. Los clientes lo escanean y se sorprenden de lo fácil que es."
          </p>
          <div>
            <h4 className="text-sm font-bold text-brand-950 uppercase tracking-wider">Alejandra R.</h4>
            <p className="text-xs text-brand-400">Dueña de Bistro & Co., Panamá</p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="shopify-container max-w-3xl space-y-8">
        <h2 className="text-2xl font-black text-brand-950 text-center uppercase tracking-wider">Preguntas Frecuentes</h2>
        <div className="divide-y divide-brand-200 border-y border-brand-200">
          {faqs.map((faq, index) => (
            <div key={index} className="py-4">
              <button
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full text-left py-2 font-bold text-sm tracking-wide text-brand-950 flex justify-between items-center focus:outline-none uppercase"
              >
                <span>{faq.q}</span>
                <span className="text-brand-500 font-light text-base">
                  {activeFaq === index ? '−' : '+'}
                </span>
              </button>
              {activeFaq === index && (
                <div className="pb-4 text-xs text-brand-500 leading-relaxed pt-2">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
