'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { dbLocal, Product } from '@/lib/db';
import { ShieldCheck, Truck, RotateCcw, ArrowRight, Star, MapPin, Smartphone, CheckCircle2, ChevronDown, ChevronUp, Check, MessageSquare } from 'lucide-react';
import AutoConfigGuide from '@/components/AutoConfigGuide';

const HoverableImage = ({ product, altText }: { product: Product; altText?: string }) => {
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
      alt={altText || product.name}
      width={600}
      height={600}
      loading="lazy"
      decoding="async"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="w-full h-full object-cover transition-all duration-500 hover:scale-105"
    />
  );
};

export default function HomeClient() {
  const products = dbLocal.getProducts().slice(0, 3);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const whatsappMessage = encodeURIComponent("Hola StarTAP, quiero pedir una placa NFC personalizada con el logo de mi negocio en Panamá.");
  const whatsappUrl = `https://wa.me/50765239821?text=${whatsappMessage}`;

  const faqs = [
    {
      q: '¿Requiere alguna aplicación para el cliente?',
      a: 'No. El cliente no necesita descargar ni instalar nada en su celular. Al acercar su smartphone a la placa o escanear el código QR impreso, el navegador del teléfono abre de inmediato la ventana de 5 estrellas de tu negocio en Google Maps.'
    },
    {
      q: '¿Cómo se configura con mi negocio?',
      a: 'Nosotros nos encargamos de la programación. Al hacer tu pedido ingresas el nombre de tu establecimiento tal como figura en Google Maps. Programamos el chip NFC y el código QR antes del despacho para que recibas el producto listo para usar en tu mostrador.'
    },
    {
      q: '¿Tengo que pagar mensualidades o suscripciones?',
      a: 'No. Haces un solo pago por el equipo físico. El chip NFC, el código QR y el acceso al portal de gestión de enlaces están incluidos de por vida sin cuotas ni pagos recurrentes.'
    },
    {
      q: '¿Hacen envíos al interior del país y cómo se paga por Yappy?',
      a: 'Enviamos a todas las provincias de Panamá por Uno Express y mensajería local. Las entregas en Ciudad de Panamá toman de 24 a 48 horas. Al finalizar la compra puedes seleccionar pago por Yappy, tarjeta de crédito o transferencia ACH.'
    },
    {
      q: '¿Qué pasa si el teléfono del cliente no tiene NFC?',
      a: 'Todos los productos StarTAP incluyen un código QR vectorizado grabado en la superficie. Si un cliente utiliza un celular sin lector NFC, solo abre la cámara de su teléfono, enfoca el código QR y accede exactamente al mismo formulario de calificación.'
    }
  ];

  return (
    <div className="bg-brand-50 min-h-screen font-sans text-brand-950">
      
      {/* Promo Bar */}
      <div className="bg-brand-950 text-white text-xs py-2.5 px-4 text-center font-bold tracking-wider">
        Envíos en 24-48 horas a Ciudad de Panamá y despachos a todo el país | Pagos por Yappy, Tarjeta y ACH
      </div>

      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-br from-white via-accent-50/60 to-accent-100/40 border-b border-accent-200 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white rounded-full opacity-40 blur-3xl pointer-events-none" />
        
        <div className="shopify-container max-w-7xl mx-auto px-4 py-12 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          {/* Text Content Column */}
          <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
            <div className="inline-flex items-center space-x-2 bg-yellow-400/20 text-yellow-950 px-3 py-1 rounded-full text-xs font-bold border border-yellow-400/40">
              <div className="flex text-yellow-500">
                <Star className="fill-current w-3.5 h-3.5" />
                <Star className="fill-current w-3.5 h-3.5" />
                <Star className="fill-current w-3.5 h-3.5" />
                <Star className="fill-current w-3.5 h-3.5" />
                <Star className="fill-current w-3.5 h-3.5" />
              </div>
              <span>Más de 500 comercios activos en Panamá</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-950 leading-[1.15] tracking-tight">
              Placas NFC para Reseñas de Google en Panamá | Multiplica tus Opiniones de 5 Estrellas
            </h1>

            <p className="text-base sm:text-lg text-brand-700 leading-relaxed max-w-2xl">
              Tu cliente aproxima su teléfono al mostrador y publica la reseña en 5 segundos. Llega lista para usar, configurada con tu ficha de Google Maps y sin mensualidades.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link
                href="/shop"
                className="shopify-btn-primary text-center py-4 px-8 tracking-wider text-sm uppercase font-bold flex items-center justify-center gap-2 rounded-xl shadow-lg hover:shadow-xl transition-all"
              >
                Ver Catálogo y Precios <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shopify-btn-secondary text-center py-4 px-8 tracking-wider text-sm uppercase font-bold flex items-center justify-center gap-2 rounded-xl border-brand-950 text-brand-950 hover:bg-brand-950 hover:text-white transition-all"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600" /> Pedir con Logo por WhatsApp
              </a>
            </div>

            {/* Trust Bar */}
            <div className="pt-4 border-t border-brand-200/80">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold text-brand-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Envíos a todo el país</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Pago directo con Yappy</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>0 suscripciones mensuales</span>
                </div>
              </div>
            </div>
          </div>

          {/* Hero Image Column with desktop padding to prevent floating badge overlap */}
          <div className="lg:col-span-5 relative order-1 lg:order-2 px-2 sm:px-4 lg:pb-12">
            <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-2xl border border-brand-200 relative">
              <img
                src="/images/startap_negocio_resenas.webp"
                alt="Empresario usando placa NFC StarTAP para conseguir reseñas en Google Maps en Panamá"
                title="Placas y Tarjetas NFC para Reseñas de Google en Panamá | StarTAP"
                width={1024}
                height={1024}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Floating badge positioned cleanly with room on desktop */}
            <div className="absolute -bottom-4 -left-2 sm:-bottom-6 sm:-left-4 bg-white p-4 rounded-2xl shadow-xl border border-brand-200 hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-xl font-bold text-lg">
                  G
                </div>
                <div>
                  <div className="flex text-yellow-500">
                    <Star className="fill-current w-3.5 h-3.5" />
                    <Star className="fill-current w-3.5 h-3.5" />
                    <Star className="fill-current w-3.5 h-3.5" />
                    <Star className="fill-current w-3.5 h-3.5" />
                    <Star className="fill-current w-3.5 h-3.5" />
                  </div>
                  <p className="font-bold text-xs text-brand-950 mt-0.5">Captura opiniones en el mostrador</p>
                  <p className="text-[11px] text-brand-500">Sin pedirle buscar tu negocio en Google</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECCIÓN DE PRODUCTOS (Grid de 3 artículos) */}
      <section className="py-16 sm:py-20 bg-brand-50">
        <div className="shopify-container max-w-6xl mx-auto px-4">
          <div className="text-center space-y-3 mb-12">
            <h2 className="text-2xl sm:text-4xl font-black text-brand-950 uppercase tracking-tight">
              Catálogo de Dispositivos NFC y QR
            </h2>
            <p className="text-brand-600 text-sm sm:text-base max-w-2xl mx-auto">
              Selecciona el formato ideal para la caja registradora, mesas o entregas presenciales de tu establecimiento en Panamá.
            </p>
          </div>

          {/* Catalog Pre-Configuration Notice */}
          <div className="mb-8 max-w-3xl mx-auto bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center">
            <p className="text-xs sm:text-sm font-bold text-amber-950">
              Incluye la configuración previa con el enlace directo de Google Maps de tu negocio sin ningún costo adicional.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Item 1: Tarjeta NFC */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-card border border-brand-200 flex flex-col justify-between">
              <div className="aspect-square relative bg-brand-100 overflow-hidden cursor-pointer" onClick={() => window.location.href='/shop/tarjeta-nfc'}>
                <img
                  src="https://tapreview.es/wp-content/uploads/2025/01/Tarjeta-NFC-TapReview.webp"
                  alt="Tarjeta NFC de Bolsillo para Reseñas de Google"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-brand-950 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                  Portátil
                </span>
              </div>
              <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-brand-950 uppercase tracking-wide mb-2">
                    Tarjeta NFC de Bolsillo
                  </h3>
                  <p className="text-xs text-brand-600 leading-relaxed">
                    PVC ultrarresistente tamaño tarjeta de crédito. Llévala en la billetera para pedir reseñas en entregas a domicilio, eventos o ventas presenciales en Panamá.
                  </p>
                </div>
                <div className="pt-2 border-t border-brand-100">
                  <p className="text-2xl font-black text-brand-950 mb-3">$15.00 USD</p>
                  <Link
                    href="/shop/tarjeta-nfc"
                    className="shopify-btn-primary w-full py-3.5 uppercase text-xs font-bold tracking-wider block text-center rounded-xl"
                  >
                    Comprar Tarjeta — $15.00
                  </Link>
                </div>
              </div>
            </div>

            {/* Item 2: Placa Acrílica Estándar */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-card border-2 border-brand-950 flex flex-col justify-between relative">
              <div className="absolute top-3 right-3 bg-accent-500 text-white text-[10px] font-black uppercase px-3 py-1 rounded-full shadow-md z-10">
                Más Vendida
              </div>
              <div className="aspect-square relative bg-brand-100 overflow-hidden cursor-pointer" onClick={() => window.location.href='/shop/placa-acrilica-nfc'}>
                <img
                  src="/products/NFC_10001/NFC_10001_Placa.webp"
                  alt="Placa Acrílica de Mostrador Estándar para Reseñas"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-brand-950 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                  Acrílico 3mm
                </span>
              </div>
              <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-brand-950 uppercase tracking-wide mb-2">
                    Placa Acrílica de Mostrador Estándar
                  </h3>
                  <p className="text-xs text-brand-600 leading-relaxed">
                    Acrílico blanco pulido de 3mm con adhesivo 3M. Colócala en la caja registradora o recepción para que los clientes califiquen antes de salir de tu negocio.
                  </p>
                </div>
                <div className="pt-2 border-t border-brand-100">
                  <p className="text-2xl font-black text-brand-950 mb-3">$25.00 USD</p>
                  <Link
                    href="/shop/placa-acrilica-nfc"
                    className="shopify-btn-primary w-full py-3.5 uppercase text-xs font-bold tracking-wider block text-center rounded-xl"
                  >
                    Comprar Placa — $25.00
                  </Link>
                </div>
              </div>
            </div>

            {/* Item 3: Placa Premium Personalizada */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-card border border-brand-200 flex flex-col justify-between">
              <div className="aspect-square relative bg-brand-100 overflow-hidden cursor-pointer" onClick={() => window.location.href='/shop/stand-nfc'}>
                <img
                  src="/products/NFC10002/NFC_10002_Stan.webp"
                  alt="Placa Acrílica Premium Personalizada con Logo"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-4 left-4 bg-brand-950 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full">
                  Logo Grabado
                </span>
              </div>
              <div className="p-6 space-y-4 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-brand-950 uppercase tracking-wide mb-2">
                    Placa Acrílica Premium Personalizada
                  </h3>
                  <p className="text-xs text-brand-600 leading-relaxed">
                    Grabado láser oficial de la marca de tu negocio en acrílico de alta densidad. Incluye chip NFC NTAG213 y código QR impreso de alta resolución.
                  </p>
                </div>
                <div className="pt-2 border-t border-brand-100">
                  <p className="text-2xl font-black text-brand-950 mb-3">$29.99 USD</p>
                  <Link
                    href="/shop/stand-nfc"
                    className="shopify-btn-primary w-full py-3.5 uppercase text-xs font-bold tracking-wider block text-center rounded-xl"
                  >
                    Pedir Personalizada — $29.99
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECCIÓN "¿CÓMO FUNCIONA?" (3 pasos rápidos sin lenguaje técnico) */}
      <section className="py-16 sm:py-24 bg-white border-y border-brand-200">
        <div className="shopify-container max-w-5xl mx-auto px-4">
          <div className="text-center space-y-3 mb-16">
            <h2 className="text-2xl sm:text-4xl font-black text-brand-950 uppercase tracking-tight">
              ¿Cómo Funciona en Tu Comercio?
            </h2>
            <p className="text-brand-600 text-sm sm:text-base max-w-xl mx-auto">
              Proceso simple orientado a la atención directa en el punto de venta.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-12 relative">
            <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-0.5 bg-brand-200 z-0" />
            
            {/* Step 1 */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-4 bg-brand-50/60 p-6 rounded-2xl border border-brand-200/80">
              <div className="w-16 h-16 bg-brand-950 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-md">
                1
              </div>
              <h3 className="text-base font-bold text-brand-950">Recibes la placa pre-configurada</h3>
              <p className="text-brand-600 text-xs leading-relaxed">
                Pides tu placa en la web y la enviamos a tu comercio en Panamá. Ya viene vinculada a la ficha de Google Maps de tu empresa.
              </p>
            </div>

            {/* Step 2 */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-4 bg-brand-50/60 p-6 rounded-2xl border border-brand-200/80">
              <div className="w-16 h-16 bg-brand-950 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-md">
                2
              </div>
              <h3 className="text-base font-bold text-brand-950">La pegas en tu mostrador o recepción</h3>
              <p className="text-brand-600 text-xs leading-relaxed">
                Retiras el protector del adhesivo 3M en la parte trasera y la fijas cerca de la caja registradora o en las mesas de tu restaurante.
              </p>
            </div>

            {/* Step 3 */}
            <div className="relative z-10 flex flex-col items-center text-center space-y-4 bg-brand-50/60 p-6 rounded-2xl border border-brand-200/80">
              <div className="w-16 h-16 bg-brand-950 text-white rounded-2xl flex items-center justify-center font-black text-2xl shadow-md">
                3
              </div>
              <h3 className="text-base font-bold text-brand-950">El cliente acerca su celular y califica</h3>
              <p className="text-brand-600 text-xs leading-relaxed">
                Tus clientes aproximan su teléfono a la placa. Se abre automáticamente el formulario de 5 estrellas en su pantalla para publicar la opinión en 5 segundos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Auto-Configurable 3-Step Guide Component */}
      <div className="shopify-container max-w-6xl mx-auto px-4 pt-12">
        <AutoConfigGuide />
      </div>

      {/* 4. SECCIÓN SEO CON PALABRAS CLAVE LOCALES */}
      <section className="py-16 sm:py-20 bg-brand-50 border-t border-brand-200">
        <div className="shopify-container max-w-4xl mx-auto px-4 space-y-8 text-brand-700">
          
          {/* Block 1 */}
          <div className="space-y-4 bg-white p-6 sm:p-8 rounded-3xl border border-brand-200 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-black text-brand-950 tracking-tight">
              Placas NFC para Google Maps en Panamá: Cómo superar a tus competidores locales
            </h2>
            <h3 className="text-sm sm:text-base font-bold text-brand-800">
              La solución directa para restaurantes, clínicas y comercios en Panamá
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-brand-600">
              En Panamá, el 87% de los consumidores consultan Google Maps antes de elegir dónde comer, atenderse o comprar. Cuando dos restaurantes o clínicas compiten en la misma zona —como San Francisco, Casco Antiguo o Costa del Este—, el negocio con más valoraciones de 5 estrellas recibe la mayor cantidad de clientes.
            </p>
            <p className="text-xs sm:text-sm leading-relaxed text-brand-600">
              Pedir a un cliente que busque tu nombre en internet, abra el mapa y escriba un comentario genera demasiada fricción. Con las placas NFC de StarTAP, el proceso ocurre en el punto de venta. El cliente acerca su dispositivo Android o iPhone, toca la pantalla y deja la reseña antes de retirarse.
            </p>
          </div>

          {/* Block 2 */}
          <div className="space-y-4 bg-white p-6 sm:p-8 rounded-3xl border border-brand-200 shadow-sm">
            <h2 className="text-xl sm:text-2xl font-black text-brand-950 tracking-tight">
              Placas QR y tecnología contactless para captar reseñas sin fricción
            </h2>
            <h3 className="text-sm sm:text-base font-bold text-brand-800">
              Compatibilidad total con cualquier modelo de celular
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-brand-600">
              Cada placa integra un chip NFC de respuesta inmediata junto a un código QR impreso en alta resolución. Si el teléfono del cliente no tiene el sensor NFC activo, solo requiere abrir la cámara para escanear el QR.
            </p>
            <p className="text-xs sm:text-sm leading-relaxed text-brand-600">
              El sistema funciona sin baterías, sin cables y sin obligar al cliente a instalar aplicaciones. Pagas una sola vez por el equipo físico y obtienes acceso permanente al panel de control para actualizar el enlace cuando lo necesites.
            </p>
          </div>

        </div>
      </section>

      {/* Guarantee / Trust Bar */}
      <section className="bg-brand-950 text-white py-12">
        <div className="shopify-container max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-white/20">
          <div className="flex flex-col items-center space-y-2.5 pt-6 md:pt-0">
            <Truck className="w-8 h-8 text-accent-500" />
            <h4 className="font-bold text-base">Envíos a todo Panamá</h4>
            <p className="text-brand-300 text-xs">Entregas en 24-48 horas en Ciudad de Panamá y despachos por Uno Express.</p>
          </div>
          <div className="flex flex-col items-center space-y-2.5 pt-6 md:pt-0">
            <ShieldCheck className="w-8 h-8 text-accent-500" />
            <h4 className="font-bold text-base">Materiales Premium</h4>
            <p className="text-brand-300 text-xs">Acrílico blanco 3mm de alta durabilidad y PVC ultrarresistente.</p>
          </div>
          <div className="flex flex-col items-center space-y-2.5 pt-6 md:pt-0">
            <RotateCcw className="w-8 h-8 text-accent-500" />
            <h4 className="font-bold text-base">Pago Único</h4>
            <p className="text-brand-300 text-xs">Cero cuotas mensuales. Software e integración incluida de por vida.</p>
          </div>
        </div>
      </section>

      {/* 5. PREGUNTAS FRECUENTES (FAQ) DE CIERRE DE VENTAS */}
      <section className="py-16 sm:py-24 bg-brand-50">
        <div className="shopify-container max-w-3xl mx-auto px-4 space-y-10">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-4xl font-black text-brand-950 uppercase tracking-tight">
              Preguntas Frecuentes
            </h2>
            <p className="text-brand-600 text-sm">
              Respuestas claras para resolver tus dudas antes de comprar.
            </p>
          </div>

          <div className="bg-white rounded-3xl shadow-card border border-brand-200 divide-y divide-brand-200 overflow-hidden">
            {faqs.map((faq, index) => (
              <div key={index} className="p-5 sm:p-6">
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full text-left font-bold text-sm sm:text-base tracking-wide text-brand-950 flex justify-between items-center focus:outline-none"
                >
                  <h3 className="pr-4 font-bold text-sm sm:text-base text-brand-950">{faq.q}</h3>
                  <span className="text-brand-500 bg-brand-50 p-2 rounded-full flex-shrink-0">
                    {activeFaq === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>
                {activeFaq === index && (
                  <div className="mt-4 text-xs sm:text-sm text-brand-600 leading-relaxed pr-6">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Contact / CTA */}
      <section className="bg-brand-950 py-16 text-center px-4">
        <div className="max-w-2xl mx-auto space-y-6">
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Comienza a Captar Reseñas de 5 Estrellas Hoy
          </h2>
          <p className="text-brand-300 text-xs sm:text-sm leading-relaxed">
            Pide tu placa en línea con pago por Yappy o tarjeta. Te la enviamos configurada y lista para colocar en tu mostrador.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/shop"
              className="shopify-btn-primary py-4 px-10 uppercase font-bold tracking-wider text-xs inline-block rounded-xl"
            >
              Ver Colección Completa
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shopify-btn-secondary py-4 px-10 uppercase font-bold tracking-wider text-xs inline-block rounded-xl border-white text-white hover:bg-white hover:text-brand-950"
            >
              Consulta por WhatsApp
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}

