'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { dbLocal, Product } from '@/lib/db';
import { ShieldCheck, Truck, RotateCcw, ArrowRight, Star, MapPin, Smartphone, Award, CheckCircle2, ChevronDown, ChevronUp, Check, Zap } from 'lucide-react';

const HoverableImage = ({ product }: { product: Product }) => {
  const [imgSrc, setImgSrc] = useState(product.image);

  useEffect(() => {
    setImgSrc(product.image);
  }, [product.image]);

  const handleMouseEnter = () => {
    if (product.images && product.images.length > 1) {
      setImgSrc(product.images[1]);
    }
  };

  const handleMouseLeave = () => {
    setImgSrc(product.image);
  };

  return (
    <img
      src={imgSrc}
      alt={product.name}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
    />
  );
};

export default function HomePage() {
  const products = dbLocal.getProducts().slice(0, 3);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: '¿Cómo funcionan las placas y tarjetas NFC en Panamá?',
      a: 'Nuestros dispositivos contienen un microchip NFC inteligente incorporado y un código QR de alta resolución. Cuando un cliente acerca su teléfono inteligente a la placa o tarjeta, se detecta el chip electromagnéticamente y se abre de forma automática el enlace de reseñas de tu negocio o tu perfil de contacto digital. El proceso tarda solo 2 segundos y no requiere la descarga de ninguna aplicación.'
    },
    {
      q: '¿Qué es el código QR de respaldo y para qué sirve?',
      a: 'Aunque la mayoría de los celulares en Panamá cuentan con tecnología NFC de forma nativa, algunos modelos antiguos no la tienen. Para garantizar compatibilidad del 100%, todos nuestros productos incluyen un código QR vectorizado y grabado. El cliente solo abre su cámara y escanea el código para calificar tu negocio.'
    },
    {
      q: '¿Cómo obtengo el enlace de opiniones de Google para mi negocio?',
      a: 'Entra en el perfil de Google Business Profile (Google My Business) de tu empresa, busca el botón que indica "Solicitar opiniones" y copia la URL corta generada (usualmente empieza por https://g.page/r/... ). Ese es el enlace que usamos. Si tienes dudas, nuestro soporte en Ciudad de Panamá te guiará paso a paso.'
    },
    {
      q: '¿Puedo cambiar la dirección del enlace en el futuro?',
      a: '¡Por supuesto! Podrás acceder a tu panel personalizado para cambiar el enlace web tantas veces como desees. Si deseas recolectar reseñas en Google, o redirigir a tu WhatsApp, lo puedes configurar en tiempo real y los cambios se aplican al instante sin comprar otro producto.'
    },
    {
      q: '¿Nuestros dispositivos NFC requieren baterías?',
      a: 'No. Las placas y tarjetas inteligentes NFC de PanaCards son dispositivos completamente pasivos. Utilizan la energía de la antena emisora del teléfono del cliente al acercarlo. No requieren batería, cables, mantenimiento ni recargas eléctricas.'
    },
    {
      q: '¿Cómo se manejan los envíos en Ciudad de Panamá y provincias?',
      a: 'Ofrecemos envíos express a oficina o residencia en 24-48 horas en Ciudad de Panamá con tarifas económicas ($3.75) o retiro directo en nuestra sucursal de San Francisco ($3.00). Para el interior del país, enviamos vía Uno Express ($6.50) o Servientrega ($7.50).'
    }
  ];

  return (
    <div className="bg-brand-50 min-h-screen font-sans text-brand-950">
      
      {/* Promo Bar */}
      <div className="bg-brand-950 text-white text-xs py-2 text-center font-bold tracking-widest uppercase">
        Envíos rápidos a todo Panamá | Uno Express, Servientrega y Local
      </div>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-white via-yellow-50 to-yellow-200 border-b border-yellow-200 relative overflow-hidden">
        {/* Subtle decorative glow to mimic the radial effect in the reference */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white rounded-full opacity-40 blur-3xl pointer-events-none"></div>
        <div className="shopify-container max-w-7xl mx-auto px-4 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
          <div className="space-y-8">
            <div className="flex items-center space-x-2 text-yellow-500">
              <Star className="fill-current w-5 h-5" />
              <Star className="fill-current w-5 h-5" />
              <Star className="fill-current w-5 h-5" />
              <Star className="fill-current w-5 h-5" />
              <Star className="fill-current w-5 h-5" />
              <span className="text-brand-600 text-sm font-bold ml-2">Más de 500 comercios confían en nosotros</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-950 leading-[1.1] tracking-tight">
              Más reseñas en Google.<br className="hidden sm:block"/> Más clientes.<br className="hidden sm:block"/> Más ventas.
            </h1>
            <p className="text-base sm:text-lg text-brand-600 max-w-lg leading-relaxed">
              La forma más rápida y elegante de conseguir opiniones de 5 estrellas para tu negocio en Panamá. Con solo un toque, tus clientes dejarán una reseña en segundos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/shop" className="shopify-btn-primary text-center py-4 px-8 tracking-wider text-sm uppercase font-bold flex items-center justify-center gap-2">
                Ver Productos <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            <ul className="space-y-2 text-sm font-semibold text-brand-700">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-accent-600" /> Sin suscripciones mensuales</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-accent-600" /> Configuración en 1 minuto</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-accent-600" /> Envío a todo el país</li>
            </ul>
          </div>
          <div className="relative">
            <div className="aspect-square bg-brand-100 rounded-3xl overflow-hidden shadow-2xl border border-brand-200">
               {products.length > 0 && (
                 <img src={products[0].images?.[0] || products[0].image} alt="Placa Google" className="w-full h-full object-cover" />
               )}
            </div>
            <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-xl shadow-xl border border-brand-100 hidden md:block animate-bounce-slow">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 bg-blue-600 text-white flex items-center justify-center rounded-full font-bold text-xl">G</div>
                 <div>
                    <div className="flex text-yellow-500">
                      <Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" /><Star className="fill-current w-4 h-4" />
                    </div>
                    <p className="font-bold text-sm">"Excelente servicio. Muy recomendado."</p>
                    <p className="text-xs text-brand-500">Hace 2 minutos</p>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Product Grid */}
      <section className="py-20 bg-brand-50">
        <div className="shopify-container max-w-6xl mx-auto px-4">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl sm:text-4xl font-black text-brand-950 uppercase tracking-tight">Nuestros Productos</h2>
            <p className="text-brand-600 text-lg">Elige la solución que mejor se adapte a tu negocio</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {products.map((product) => (
              <div key={product.id} className="bg-white rounded-2xl overflow-hidden shadow-premium border border-brand-200 group flex flex-col">
                <div className="aspect-[4/5] relative bg-brand-100 overflow-hidden cursor-pointer" onClick={() => window.location.href=`/shop/${product.id}`}>
                  <HoverableImage product={product} />
                  {product.category === 'plates' && (
                    <div className="absolute top-4 left-4 bg-brand-950 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-lg">
                      Acrílico Premium
                    </div>
                  )}
                  {product.material === 'pvc' && (
                    <div className="absolute top-4 left-4 bg-brand-950 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-lg">
                      PVC
                    </div>
                  )}
                </div>
                <div className="p-6 flex flex-col flex-grow justify-between text-center">
                  <div>
                    <h3 className="text-lg font-black text-brand-950 tracking-wide uppercase mb-1">{product.name}</h3>
                    <p className="text-sm text-brand-500 mb-4">{product.description.substring(0, 60)}...</p>
                  </div>
                  <div>
                    <p className="text-2xl font-black text-brand-950 mb-6">${product.price.toFixed(2)}</p>
                    <Link href={`/shop/${product.id}`} className="shopify-btn-primary w-full py-4 uppercase text-xs tracking-wider block">
                      Seleccionar
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SEO Text Block Optimized for Panama */}
      <section className="py-16 bg-white border-t border-brand-100">
        <div className="shopify-container max-w-4xl mx-auto px-4 space-y-10 text-brand-700">
          <div className="space-y-4">
            <h2 className="text-2xl font-black text-brand-950 tracking-tight">Placas y Tarjetas NFC para Reseñas de Google en Panamá</h2>
            <p className="leading-relaxed">
              Nuestras soluciones NFC permiten que tus clientes dejen una valoración positiva en tu perfil de negocio con solo acercar su celular. Diseñadas con tecnología de proximidad avanzada, eliminan la necesidad de buscar el negocio manualmente. Al facilitar el acceso directo a tu ficha de Google Business Profile, mejoras tu posicionamiento local (SEO) y tu reputación online en todo Panamá de forma inmediata.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-brand-950">Beneficios para tu local comercial</h3>
              <ul className="space-y-2 list-disc list-inside pl-4">
                <li><strong className="text-brand-900">Visibilidad e Interacción:</strong> Ideal para restaurantes en Casco Antiguo, hoteles, clínicas y tiendas. El diseño moderno incentiva a los clientes a calificar antes de salir.</li>
                <li><strong className="text-brand-900">Instalación Permanente:</strong> Nuestras placas incluyen cinta 3M de alta fijación, resistiendo el clima tropical y el uso diario intenso.</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h3 className="text-xl font-bold text-brand-950">¿Cómo funciona la tecnología?</h3>
              <ul className="space-y-2 list-disc list-inside pl-4">
                <li><strong className="text-brand-900">Cero Fricción:</strong> Al aproximar un smartphone (iPhone o Android) al stand o placa, el sistema abre automáticamente el formulario de 5 estrellas de tu negocio.</li>
                <li><strong className="text-brand-900">Plug & Play:</strong> Recibes tu placa o tarjeta configurada y enlazada a tu perfil. No necesitas instalar ninguna app adicional.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Guarantee / Trust Bar */}
      <section className="bg-brand-950 text-white py-12">
        <div className="shopify-container max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/20">
          <div className="flex flex-col items-center space-y-3 pt-6 md:pt-0">
            <Truck className="w-10 h-10 text-accent-500" />
            <h4 className="font-bold text-lg">Envíos Rápidos</h4>
            <p className="text-brand-300 text-sm">A todo Panamá vía Uno Express y mensajería local.</p>
          </div>
          <div className="flex flex-col items-center space-y-3 pt-6 md:pt-0">
            <ShieldCheck className="w-10 h-10 text-accent-500" />
            <h4 className="font-bold text-lg">Calidad Garantizada</h4>
            <p className="text-brand-300 text-sm">Materiales premium: Acrílico 3mm y PVC resistente.</p>
          </div>
          <div className="flex flex-col items-center space-y-3 pt-6 md:pt-0">
            <RotateCcw className="w-10 h-10 text-accent-500" />
            <h4 className="font-bold text-lg">Pago Único</h4>
            <p className="text-brand-300 text-sm">Cero mensualidades. Software incluido de por vida.</p>
          </div>
        </div>
      </section>

      {/* 3 Steps Section */}
      <section className="py-24 bg-white">
        <div className="shopify-container max-w-5xl mx-auto px-4">
          <div className="text-center space-y-4 mb-20">
            <h2 className="text-3xl sm:text-4xl font-black text-brand-950 uppercase tracking-tight">Consigue reseñas en 3 simples pasos</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-brand-200 z-0"></div>
            
            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 bg-brand-50 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
                <span className="text-3xl font-black text-brand-950">1</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Eliges y pides</h3>
                <p className="text-brand-600 text-sm">Selecciona la placa o tarjeta que prefieras y completa tu pedido online. Te la enviamos a cualquier parte de Panamá.</p>
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 bg-brand-50 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
                <span className="text-3xl font-black text-brand-950">2</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Activas en segundos</h3>
                <p className="text-brand-600 text-sm">Cuando la recibas, escanéala e ingresa el enlace de tu Google Business Profile en nuestra plataforma. ¡Listo!</p>
              </div>
            </div>

            <div className="relative z-10 flex flex-col items-center text-center space-y-6">
              <div className="w-24 h-24 bg-brand-50 rounded-full border-4 border-white shadow-xl flex items-center justify-center">
                <span className="text-3xl font-black text-brand-950">3</span>
              </div>
              <div>
                <h3 className="text-xl font-bold mb-2">Consigues reseñas</h3>
                <p className="text-brand-600 text-sm">Colócala en tu mostrador. Tus clientes solo tienen que acercar su móvil para dejarte una reseña de 5 estrellas.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Alternating Info Sections */}
      <section className="py-24 bg-brand-50 space-y-24">
        {/* Section 1 */}
        <div className="shopify-container max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="order-2 lg:order-1 bg-white p-8 rounded-3xl shadow-lg border border-brand-200 aspect-square flex items-center justify-center">
             <div className="text-center">
                <Zap className="w-24 h-24 text-accent-500 mx-auto mb-6" />
                <h3 className="text-2xl font-black text-brand-950 uppercase">Tecnología Contactless</h3>
             </div>
          </div>
          <div className="order-1 lg:order-2 space-y-6">
            <h2 className="text-3xl font-black text-brand-950 uppercase tracking-tight">¿Qué es y cómo funciona?</h2>
            <p className="text-brand-600 text-lg leading-relaxed">
              Nuestras placas utilizan tecnología NFC (Near Field Communication), la misma que se usa para pagar con el móvil. Al acercar un smartphone a la placa, transmite instantáneamente tu enlace de reseñas.
            </p>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="text-brand-700">Sin necesidad de instalar ninguna aplicación.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="text-brand-700">Funciona con iPhone y Android modernos.</span>
              </li>
              <li className="flex items-start gap-3">
                <Check className="w-6 h-6 text-green-500 flex-shrink-0" />
                <span className="text-brand-700">Incluye código QR para compatibilidad total del 100%.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Section 2 */}
        <div className="shopify-container max-w-6xl mx-auto px-4 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <h2 className="text-3xl font-black text-brand-950 uppercase tracking-tight">Elimina la fricción. Multiplica tus reseñas.</h2>
            <p className="text-brand-600 text-lg leading-relaxed">
              Pedir a un cliente que busque tu negocio en Google y escriba una reseña es pedirle demasiado. Nuestra solución reduce un proceso de 2 minutos a solo 2 segundos.
            </p>
            <p className="text-brand-600 text-lg leading-relaxed">
              Está demostrado estadísticamente que facilitar este proceso aumenta la conversión de reseñas en más de un 300%. Más reseñas positivas mejoran tu posicionamiento en el mapa (SEO Local) y atraen a nuevos clientes todos los días.
            </p>
          </div>
          <div className="bg-brand-950 text-white p-8 sm:p-12 rounded-3xl shadow-lg relative overflow-hidden h-full flex flex-col justify-center min-h-[400px]">
             <div className="relative z-10 text-center space-y-6">
                <h3 className="text-4xl font-black text-accent-500">+300%</h3>
                <p className="text-xl font-bold">Aumento promedio en volumen de reseñas en los primeros 30 días.</p>
             </div>
          </div>
        </div>
      </section>

      {/* Personalization & Sustainability */}
      <section className="py-24 bg-white border-y border-brand-200">
        <div className="shopify-container max-w-4xl mx-auto px-4 text-center space-y-12">
          <h2 className="text-3xl font-black text-brand-950 uppercase tracking-tight">Diseño Premium que destaca en tu mostrador</h2>
          <p className="text-brand-600 text-lg">
            A diferencia de las pegatinas baratas o los códigos QR impresos en papel, nuestras placas de Acrílico y tarjetas de PVC están fabricadas para durar, proyectando una imagen profesional de tu establecimiento. Son elegantes, fáciles de limpiar y diseñadas para el alto tráfico comercial.
          </p>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="py-24 bg-brand-50">
        <div className="shopify-container max-w-3xl mx-auto px-4 space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-black text-brand-950 uppercase tracking-tight">Preguntas Frecuentes</h2>
            <p className="text-brand-600">Todo lo que necesitas saber antes de comprar.</p>
          </div>

          <div className="bg-white rounded-2xl shadow-premium border border-brand-200 divide-y divide-brand-200">
            {faqs.map((faq, index) => (
              <div key={index} className="p-6">
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full text-left font-bold text-sm sm:text-base tracking-wide text-brand-950 flex justify-between items-center focus:outline-none"
                >
                  <span className="pr-4">{faq.q}</span>
                  <span className="text-brand-500 bg-brand-50 p-2 rounded-full">
                    {activeFaq === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>
                {activeFaq === index && (
                  <div className="mt-4 text-sm text-brand-600 leading-relaxed pr-8">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Contact / CTA */}
      <section className="bg-brand-950 py-20 text-center px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          <h2 className="text-3xl font-black text-white uppercase tracking-tight">¿Listo para dominar tu SEO Local?</h2>
          <p className="text-brand-300">Únete a cientos de comercios panameños que ya están automatizando su captación de clientes.</p>
          <div className="pt-4">
            <Link href="/shop" className="shopify-btn-primary py-4 px-12 uppercase font-bold tracking-wider inline-block">
              Ver Colección Completa
            </Link>
          </div>
        </div>
      </section>
      
    </div>
  );
}
