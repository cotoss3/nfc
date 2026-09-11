'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { dbLocal, Product } from '@/lib/db';
import { ShieldCheck, Truck, RotateCcw, ArrowRight, Star, MapPin, Smartphone, CheckCircle2, ChevronDown, ChevronUp, Check, MessageSquare, Zap } from 'lucide-react';
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
  const whatsappUrl = `https://wa.me/50767134341?text=${whatsappMessage}`;

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
      a: 'Todos los productos StarTAP incluyen un código QR vectorizado impreso en la superficie. Si un cliente utiliza un celular sin lector NFC, solo abre la cámara de su teléfono, enfoca el código QR y accede exactamente al mismo formulario de calificación.'
    }
  ];

  return (
    <div className="bg-brand-50 min-h-screen font-sans text-slate-900">
      
      {/* Promo Bar */}
      <div className="bg-slate-950 text-white text-xs py-2.5 px-4 text-center font-bold tracking-wider">
        Envíos en 24-48 horas a Ciudad de Panamá y despachos a todo el país | Pagos por Yappy, Tarjeta y ACH
      </div>

      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-br from-white via-amber-50/50 to-amber-100/30 border-b border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white rounded-full opacity-40 blur-3xl pointer-events-none" />
        
        <div className="shopify-container max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-20 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          {/* Text Content Column */}
          <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
            <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-slate-950 px-3.5 py-1.5 rounded-full text-xs font-extrabold border border-amber-400/40">
              <div className="flex text-amber-500">
                <Star className="fill-current w-3.5 h-3.5" />
                <Star className="fill-current w-3.5 h-3.5" />
                <Star className="fill-current w-3.5 h-3.5" />
                <Star className="fill-current w-3.5 h-3.5" />
                <Star className="fill-current w-3.5 h-3.5" />
              </div>
              <span>Más de 500 comercios activos en Panamá</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 leading-[1.15] tracking-tight">
              Placas y Tarjetas NFC para Reseñas de Google en Panamá
            </h1>

            <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl font-medium">
              Tu cliente aproxima su teléfono al mostrador y publica la reseña en 5 segundos. Llega lista para usar, configurada con tu ficha de Google Maps y sin mensualidades.
            </p>

            <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
              <Link
                href="/shop"
                className="shopify-btn-primary text-center py-4 px-8 tracking-wider text-xs sm:text-sm uppercase font-bold text-white bg-slate-950 hover:bg-slate-900 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                Pedir mi Placa Ahora <ArrowRight className="w-4 h-4" />
              </Link>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shopify-btn-secondary text-center py-4 px-6 tracking-wider text-xs sm:text-sm uppercase font-bold rounded-xl border-2 border-slate-950 text-slate-950 hover:bg-slate-950 hover:text-white transition-all flex items-center justify-center gap-2 bg-white shadow-sm"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Consultas y Pedidos con Logo por WhatsApp</span>
              </a>
            </div>

            {/* Trust Bar */}
            <div className="pt-4 border-t border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold text-slate-800">
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
            <div className="aspect-square bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 relative">
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
            <div className="absolute -bottom-4 -left-2 sm:-bottom-6 sm:-left-4 bg-white p-4 rounded-2xl shadow-xl border border-slate-200 hidden sm:block">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-600 text-white flex items-center justify-center rounded-xl font-bold text-lg">
                  G
                </div>
                <div>
                  <div className="flex text-amber-500">
                    <Star className="fill-current w-3.5 h-3.5" />
                    <Star className="fill-current w-3.5 h-3.5" />
                    <Star className="fill-current w-3.5 h-3.5" />
                    <Star className="fill-current w-3.5 h-3.5" />
                    <Star className="fill-current w-3.5 h-3.5" />
                  </div>
                  <p className="font-bold text-xs text-slate-950 mt-0.5">Captura opiniones en el mostrador</p>
                  <p className="text-[11px] text-slate-500">Sin pedirle buscar tu negocio en Google</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATÁLOGO DE PRODUCTOS (Sin scroll vertical infinito en móvil) */}
      <section className="py-12 sm:py-20 bg-slate-50">
        <div className="shopify-container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 uppercase tracking-tight">
              Catálogo de Dispositivos NFC y QR
            </h2>
            <p className="text-slate-600 text-xs sm:text-base max-w-2xl mx-auto">
              Selecciona el formato ideal para la caja registradora, mesas o entregas presenciales de tu negocio en Panamá.
            </p>
          </div>

          {/* Catalog Pre-Configuration Notice */}
          <div className="mb-8 max-w-3xl mx-auto bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center shadow-sm">
            <p className="text-xs sm:text-sm font-bold text-amber-950">
              Incluye la configuración previa con la ficha oficial de Google Maps de tu negocio sin ningún costo adicional.
            </p>
          </div>

          {/* Responsive Layout: Horizontal Touch Scroll on Mobile (<768px), 3-Column Grid on Desktop */}
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 px-4 -mx-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:overflow-visible md:pb-0 scrollbar-none">
            
            {/* Item 1: Tarjeta NFC de Bolsillo */}
            <div className="w-[82vw] sm:w-[320px] shrink-0 snap-center md:w-auto bg-white rounded-3xl overflow-hidden shadow-card border border-slate-200 flex flex-col justify-between">
              <div className="aspect-[4/3] md:aspect-square max-h-56 sm:max-h-64 md:max-h-none relative bg-slate-100 overflow-hidden cursor-pointer" onClick={() => window.location.href='/catalogo'}>
                <img
                  src="/products/tarjeta-nfc/tarjeta-nfc-bolsillo-resenas-google-panama.webp"
                  alt="Tarjeta NFC de Bolsillo para Reseñas de Google Panamá"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-slate-950 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-sm">
                  Portátil
                </span>
              </div>
              <div className="p-5 sm:p-6 space-y-4 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wide mb-1.5">
                    Tarjeta NFC de Bolsillo
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    PVC ultrarresistente tamaño tarjeta de crédito. Llévala en tu billetera o portacredencial para solicitar valoraciones en entregas, visitas técnicas o eventos.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900">$20.00 USD</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Envío Panamá</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold leading-tight">
                    Incluye configuración con tu ficha de Google Maps lista para usar | Sin mensualidades
                  </p>
                  <Link
                    href="/catalogo"
                    className="shopify-btn-primary w-full py-3.5 uppercase text-xs font-bold tracking-wider block text-center rounded-xl bg-slate-950 text-white hover:bg-slate-900 mt-2"
                  >
                    Comprar Tarjeta — $20.00
                  </Link>
                </div>
              </div>
            </div>

            {/* Item 2: Placa NFC para Reseñas de Google */}
            <div className="w-[82vw] sm:w-[320px] shrink-0 snap-center md:w-auto bg-white rounded-3xl overflow-hidden shadow-card border-2 border-slate-950 flex flex-col justify-between relative">
              <div className="absolute -top-3 right-4 bg-amber-500 text-white text-[10px] font-black uppercase px-3.5 py-1 rounded-full shadow-md z-20">
                Más Vendida
              </div>
              <div className="aspect-[4/3] md:aspect-square max-h-56 sm:max-h-64 md:max-h-none relative bg-slate-100 overflow-hidden cursor-pointer" onClick={() => window.location.href='/catalogo'}>
                <img
                  src="/products/NFC_10001/NFC_10001_Placa.webp"
                  alt="Placa NFC para Reseñas de Google en Panamá"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-slate-950 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-sm">
                  Acrílico 3mm
                </span>
              </div>
              <div className="p-5 sm:p-6 space-y-4 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wide mb-1.5">
                    Placa NFC para Reseñas de Google
                  </h3>
                  <p className="text-xs text-slate-700 leading-relaxed font-medium">
                    Acrílico blanco pulido de 3mm con adhesivo 3M. Colócala en la caja registradora o recepción para que los clientes califiquen antes de salir de tu negocio.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900">$30.00 USD</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Envío Panamá</span>
                  </div>
                  <p className="text-[11px] text-slate-600 font-semibold leading-tight">
                    Incluye configuración con tu ficha de Google Maps lista para usar | Sin mensualidades
                  </p>
                  <Link
                    href="/catalogo"
                    className="shopify-btn-primary w-full py-3.5 uppercase text-xs font-bold tracking-wider block text-center rounded-xl bg-slate-950 text-white hover:bg-slate-900 mt-2"
                  >
                    Comprar Placa — $30.00
                  </Link>
                </div>
              </div>
            </div>

            {/* Item 3: Stand NFC para Reseñas de Google */}
            <div className="w-[82vw] sm:w-[320px] shrink-0 snap-center md:w-auto bg-white rounded-3xl overflow-hidden shadow-card border border-slate-200 flex flex-col justify-between">
              <div className="aspect-[4/3] md:aspect-square max-h-56 sm:max-h-64 md:max-h-none relative bg-slate-100 overflow-hidden cursor-pointer" onClick={() => window.location.href='/catalogo'}>
                <img
                  src="/products/NFC10002/NFC_10002_Stan.webp"
                  alt="Stand NFC para Reseñas de Google"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
                <span className="absolute top-3 left-3 bg-slate-950 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-sm">
                  Stand de Mesa
                </span>
              </div>
              <div className="p-5 sm:p-6 space-y-4 flex-grow flex flex-col justify-between">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-wide mb-1.5">
                    Stand NFC para Reseñas de Google
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Estructura rígida autoportante con ángulo de lectura optimizado para mesas de restaurantes, cafeterías, escritorios y clínicas.
                  </p>
                </div>
                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-baseline justify-between">
                    <span className="text-2xl font-black text-slate-900">$35.00 USD</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Envío Panamá</span>
                  </div>
                  <p className="text-[11px] text-slate-500 font-semibold leading-tight">
                    Incluye configuración con tu ficha de Google Maps lista para usar | Sin mensualidades
                  </p>
                  <Link
                    href="/catalogo"
                    className="shopify-btn-primary w-full py-3.5 uppercase text-xs font-bold tracking-wider block text-center rounded-xl bg-slate-950 text-white hover:bg-slate-900 mt-2"
                  >
                    Comprar Stand — $35.00
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 3. SECCIÓN "¿CÓMO FUNCIONA?" EN EL MOSTRADOR */}
      <section className="py-12 sm:py-20 bg-white border-y border-slate-200">
        <div className="shopify-container max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-2.5 mb-10 sm:mb-14">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 uppercase tracking-tight">
              ¿Cómo Funciona en Tu Comercio?
            </h2>
            <p className="text-slate-600 text-xs sm:text-base max-w-xl mx-auto">
              Tres pasos simples orientados a la atención presencial en el mostrador.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Step 1 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 font-mono rounded-xl flex items-center justify-center font-black text-lg shadow-sm">
                1
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Colócala en caja o mostrador
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Lista y configurada con el enlace oficial de tu negocio. Retiras la protección de la cinta 3M y la fijas en tu recepción o mesa.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 font-mono rounded-xl flex items-center justify-center font-black text-lg shadow-sm">
                2
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                El cliente acerca el teléfono
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Abre directamente la pantalla de 5 estrellas en Google sin instalar aplicaciones ni buscar manualmente el nombre de la empresa.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 space-y-3">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 font-mono rounded-xl flex items-center justify-center font-black text-lg shadow-sm">
                3
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900">
                Sube en el ranking local
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed">
                Más reseñas recientes significan más clientes buscando en Google Maps en Panamá que eligen tu establecimiento sobre la competencia.
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
      <section className="py-12 sm:py-16 bg-slate-50 border-t border-slate-200">
        <div className="shopify-container max-w-4xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8 text-slate-700">
          
          {/* Block 1 */}
          <div className="space-y-3 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-lg sm:text-2xl font-black text-slate-950 tracking-tight">
              Placas NFC para Google Maps en Panamá: Cómo superar a tus competidores locales
            </h2>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800">
              La solución directa para restaurantes, clínicas y comercios en Panamá
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
              En Panamá, el 87% de los consumidores consultan Google Maps antes de elegir dónde comer, atenderse o comprar. Cuando dos restaurantes o clínicas compiten en la misma zona —como San Francisco, Casco Antiguo o Costa del Este—, el negocio con más valoraciones de 5 estrellas recibe la mayor cantidad de clientes.
            </p>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
              Pedir a un cliente que busque tu nombre en internet, abra el mapa y escriba un comentario genera demasiada fricción. Con las placas NFC de StarTAP, el proceso ocurre en el punto de venta. El cliente acerca su dispositivo Android o iPhone, toca la pantalla y deja la reseña antes de retirarse.
            </p>
          </div>

          {/* Block 2 */}
          <div className="space-y-3 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm">
            <h2 className="text-lg sm:text-2xl font-black text-slate-950 tracking-tight">
              Placas QR y tecnología contactless para captar reseñas sin fricción
            </h2>
            <h3 className="text-xs sm:text-sm font-bold text-slate-800">
              Compatibilidad total con cualquier modelo de celular
            </h3>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
              Cada placa integra un chip NFC de respuesta inmediata junto a un código QR impreso en alta resolución. Si el teléfono del cliente no tiene el sensor NFC activo, solo requiere abrir la cámara para escanear el QR.
            </p>
            <p className="text-xs sm:text-sm leading-relaxed text-slate-600">
              El sistema funciona sin baterías, sin cables y sin obligar al cliente a instalar aplicaciones. Pagas una sola vez por el equipo físico y obtienes acceso permanente al panel de control para actualizar el enlace cuando lo necesites.
            </p>
          </div>

        </div>
      </section>

      {/* 4.1 SECCIÓN NUMERADA NEGRA (Espaciado optimizado & Alto contraste) */}
      <section className="bg-slate-950 text-white py-8 sm:py-16 border-y border-slate-800">
        <div className="shopify-container max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-center divide-y md:divide-y-0 md:divide-x divide-slate-800">
          
          <div className="flex flex-col items-center space-y-2 pt-4 md:pt-0">
            <span className="text-amber-400 font-mono text-3xl font-black">01</span>
            <h4 className="font-bold text-base text-white">Envíos a todo Panamá</h4>
            <p className="text-slate-300 text-xs leading-relaxed max-w-xs">
              Entregas en 24-48 horas en Ciudad de Panamá y despachos al interior por Uno Express y Servientrega.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-2 pt-4 md:pt-0">
            <span className="text-amber-400 font-mono text-3xl font-black">02</span>
            <h4 className="font-bold text-base text-white">Materiales Premium</h4>
            <p className="text-slate-300 text-xs leading-relaxed max-w-xs">
              Acrílico blanco pulido 3mm de alta durabilidad y PVC ultrarresistente para alto tráfico comercial.
            </p>
          </div>

          <div className="flex flex-col items-center space-y-2 pt-4 md:pt-0">
            <span className="text-amber-400 font-mono text-3xl font-black">03</span>
            <h4 className="font-bold text-base text-white">Pago Único</h4>
            <p className="text-slate-300 text-xs leading-relaxed max-w-xs">
              Cero cuotas mensuales. Software e integración con Google Maps incluida de por vida.
            </p>
          </div>

        </div>
      </section>

      {/* 5. ACORDEÓN DE PREGUNTAS FRECUENTES (FAQ con tarjetas independientes) */}
      <section className="py-12 sm:py-20 bg-slate-50">
        <div className="shopify-container max-w-3xl mx-auto px-4 sm:px-6 space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 uppercase tracking-tight">
              Preguntas Frecuentes
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm">
              Respuestas directas para resolver tus dudas antes de comprar.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white border border-slate-200 rounded-2xl shadow-sm p-5 sm:p-6 transition-all hover:border-slate-300">
                <button
                  onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                  className="w-full text-left flex justify-between items-center focus:outline-none"
                >
                  <h3 className="pr-4 font-extrabold text-sm sm:text-base text-slate-900 leading-snug">{faq.q}</h3>
                  <span className="text-slate-500 bg-slate-100 p-2 rounded-full flex-shrink-0">
                    {activeFaq === index ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </span>
                </button>
                {activeFaq === index && (
                  <div className="mt-3.5 text-xs sm:text-sm text-slate-700 leading-relaxed pt-3 border-t border-slate-100">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final Contact / CTA */}
      <section className="bg-slate-950 py-12 sm:py-16 text-center px-4">
        <div className="max-w-2xl mx-auto space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Comienza a Captar Reseñas de 5 Estrellas Hoy
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Pide tu placa en línea con pago por Yappy o tarjeta. Te la enviamos configurada y lista para colocar en tu mostrador.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3.5 justify-center">
            <Link
              href="/catalogo"
              className="shopify-btn-primary py-4 px-8 uppercase font-bold tracking-wider text-xs inline-block rounded-xl bg-white text-slate-950 hover:bg-slate-100 shadow-lg"
            >
              Pedir mi Placa Ahora
            </Link>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="shopify-btn-secondary py-4 px-8 uppercase font-bold tracking-wider text-xs inline-block rounded-xl border border-slate-700 text-white hover:bg-slate-800"
            >
              Consulta por WhatsApp
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}


