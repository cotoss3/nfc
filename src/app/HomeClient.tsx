'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { dbLocal, Product } from '@/lib/db';
import { useCart } from '@/context/CartContext';
import {
  ShieldCheck,
  Truck,
  RotateCcw,
  ArrowRight,
  Star,
  MapPin,
  Smartphone,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Check,
  MessageSquare,
  Zap,
  ShoppingCart,
  Sparkles,
  Flame,
  Award,
  Lock,
  Tag,
  ShoppingBag
} from 'lucide-react';
import AutoConfigGuide from '@/components/AutoConfigGuide';

export default function HomeClient() {
  const router = useRouter();
  const { addToCart, getItemCount } = useCart();

  // Los 3 productos principales del home
  const HOME_PRODUCT_IDS = ['tarjeta-nfc-bolsillo', 'placa-nfc-mostrador', 'stand-nfc-mesa'];
  const allProducts = dbLocal.getProducts();
  const homeProducts = HOME_PRODUCT_IDS.map(id =>
    allProducts.find(p => p.id === id)
  ).filter(Boolean) as typeof allProducts;

  // Feedback Toast de Carrito
  const [addedItemName, setAddedItemName] = useState<string | null>(null);

  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const whatsappMessage = encodeURIComponent(
    "Hola StarTAP, quiero pedir una placa NFC personalizada con el logo de mi negocio en Panamá."
  );
  const whatsappUrl = `https://wa.me/50764839004?text=${whatsappMessage}`;

  const handleQuickAdd = (product: Product, redirect: boolean = false) => {
    addToCart({
      product_id: product.id,
      product_name: product.name,
      quantity: 1,
      price: product.price,
      selected_color: product.id === 'placa-nfc-mostrador' ? 'Blanco Pro' : undefined,
    });

    if (redirect) {
      router.push('/checkout');
    } else {
      setAddedItemName(product.name);
      setTimeout(() => setAddedItemName(null), 4000);
    }
  };

  const faqs = [
    {
      q: '¿Requiere alguna aplicación para el cliente?',
      a: 'No. El cliente no necesita descargar ni instalar nada en su celular. Al acercar su smartphone a la placa o escanear el código QR impreso, el navegador del teléfono abre de inmediato la ventana de 5 estrellas de tu negocio en Google Maps.'
    },
    {
      q: '¿Cómo se configura con mi negocio?',
      a: 'Es 100% auto-configurable al llegar. No necesitas enviarnos ningún enlace al comprar. Al recibir tu paquete, simplemente acercas tu teléfono al chip NFC o escaneas el código QR para vincularlo a tu perfil de Google Maps en menos de 30 segundos.'
    },
    {
      q: '¿Tengo que pagar mensualidades o suscripciones?',
      a: 'No. Haces un solo pago por el equipo físico. El chip NFC, el código QR y el acceso al portal de gestión de enlaces están incluidos de por vida sin cuotas ni pagos recurrentes.'
    },
    {
      q: '¿Hacen envíos al interior del país y cómo se paga por Yappy?',
      a: 'Enviamos a todas las provincias de Panamá por Uno Express y mensajería local. Las entregas en Ciudad de Panamá toman de 24 a 48 horas. Al finalizar la compra puedes seleccionar pago con tarjeta Visa, Mastercard o directamente por Yappy.'
    },
    {
      q: '¿Qué pasa si el teléfono del cliente no tiene NFC?',
      a: 'Todos los productos StarTAP incluyen un código QR vectorizado impreso en la superficie. Si un cliente utiliza un celular sin lector NFC, solo abre la cámara de su teléfono, enfoca el código QR y accede exactamente al mismo formulario de calificación.'
    }
  ];

  return (
    <div className="bg-brand-50 min-h-screen font-sans text-slate-900 pb-20 md:pb-0">
      
      {/* 0. PROMO & URGENCY TOP BAR */}
      <div className="bg-slate-950 text-white text-xs py-2.5 px-4 text-center font-bold tracking-wider flex items-center justify-center gap-2">
        <Flame className="w-4 h-4 text-amber-400 animate-pulse flex-shrink-0" />
        <span>Envíos 24-48h a todo Panamá | Pagos por Yappy, Visa y Mastercard | 0 Suscripciones</span>
      </div>

      {/* FLOATING CART FEEDBACK TOAST */}
      {addedItemName && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-slate-950 text-white px-6 py-3.5 rounded-2xl shadow-2xl border border-emerald-500 flex items-center gap-4 animate-bounce">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <span>¡{addedItemName} añadido al carrito!</span>
          </div>
          <Link
            href="/checkout"
            className="bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-xl uppercase tracking-wider transition"
          >
            Pagar Ahora &rarr;
          </Link>
        </div>
      )}

      {/* 1. HIGH-CONVERTING HERO SECTION */}
      <section className="bg-gradient-to-br from-white via-amber-50/40 to-amber-100/30 border-b border-slate-200 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-white rounded-full opacity-40 blur-3xl pointer-events-none" />
        
        <div className="shopify-container max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
          
          {/* Text Content Column */}
          <div className="lg:col-span-7 space-y-6 order-2 lg:order-1">
            
            {/* Social Proof Badge */}
            <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-slate-950 px-3.5 py-1.5 rounded-full text-xs font-extrabold border border-amber-400/40">
              <div className="flex text-amber-500">
                <Star className="fill-current w-3.5 h-3.5" />
                <Star className="fill-current w-3.5 h-3.5" />
                <Star className="fill-current w-3.5 h-3.5" />
                <Star className="fill-current w-3.5 h-3.5" />
                <Star className="fill-current w-3.5 h-3.5" />
              </div>
              <span className="font-bold">4.9/5 · Más de 500 comercios activos en Panamá</span>
            </div>

            {/* High-Impact Benefit Headline */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 leading-[1.12] tracking-tight">
              Multiplica tus Reseñas de 5★ en Google Maps en tu Mostrador 🇵🇦
            </h1>

            {/* Clear Value Proposition */}
            <p className="text-base sm:text-lg text-slate-700 leading-relaxed max-w-2xl font-medium">
              Tu cliente aproxima el celular a la placa al pagar y publica la reseña en 5 segundos. Sin descargar apps, sin mensualidades y 100% auto-configurable al llegar.
            </p>

            {/* Action Buttons (CRO-Optimized) */}
            <div className="flex flex-col sm:flex-row gap-3.5 pt-2">
              <a
                href="#catalogo-home"
                className="shopify-btn-primary text-center py-4 px-8 tracking-wider text-xs sm:text-sm uppercase font-bold text-white bg-slate-950 hover:bg-slate-900 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
              >
                <ShoppingCart className="w-4 h-4 text-amber-400" />
                <span>Ver Productos ($20 - $35 USD)</span>
              </a>

              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="shopify-btn-secondary text-center py-4 px-6 tracking-wider text-xs sm:text-sm uppercase font-bold rounded-xl border-2 border-slate-950 text-slate-950 hover:bg-slate-950 hover:text-white transition-all flex items-center justify-center gap-2 bg-white shadow-sm"
              >
                <MessageSquare className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span>Pedir con Logo por WhatsApp</span>
              </a>
            </div>

            {/* Trust Badges */}
            <div className="pt-4 border-t border-slate-200">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-bold text-slate-800">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Envíos 24-48h en Panamá</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>Pago con Yappy & Tarjetas</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  <span>0 Mensualidades (Pago Único)</span>
                </div>
              </div>
            </div>

          </div>

          {/* Hero Image Column */}
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

            {/* Floating Badge */}
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
                  <p className="font-bold text-xs text-slate-950 mt-0.5">Captura reseñas en el mostrador</p>
                  <p className="text-[11px] text-slate-500">Abre directamente el formulario de 5 estrellas</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 2. ROI & COMPARISON SECTION (POR QUÉ TU NEGOCIO NECESITA STARTAP) */}
      <section className="py-10 bg-white border-b border-slate-200">
        <div className="shopify-container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-8 space-y-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Impacto Inmediato en Ventas
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">
              ¿Por qué el 90% de tus clientes no dejan reseña?
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm max-w-xl mx-auto">
              Pedirle a un cliente que busque tu negocio en Google Maps genera demasiada fricción. starTAP elimina los pasos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* SIN STARTAP */}
            <div className="bg-rose-50/60 border border-rose-200 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-rose-700 font-black text-sm uppercase tracking-wide">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                Sin starTAP (Método Antiguo)
              </div>
              <ul className="space-y-2.5 text-xs text-slate-700 font-medium">
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  El cliente promete dejar reseña en casa y lo olvida.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  Tiene que abrir el mapa, escribir el nombre y buscar la empresa.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-rose-500 font-bold">✕</span>
                  Solo 1 de cada 50 clientes publica una valoracion (98% de pérdida).
                </li>
              </ul>
            </div>

            {/* CON STARTAP */}
            <div className="bg-emerald-50/70 border-2 border-emerald-500 rounded-3xl p-6 space-y-4 shadow-sm relative">
              <span className="absolute -top-3 right-6 bg-emerald-600 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full">
                Recomendado
              </span>
              <div className="flex items-center gap-2 text-emerald-800 font-black text-sm uppercase tracking-wide">
                <Zap className="w-4 h-4 text-emerald-600" />
                Con starTAP Contactless
              </div>
              <ul className="space-y-2.5 text-xs text-slate-800 font-bold">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  El cliente acerca su celular al pagar en la caja o mesa.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  Se le abre el formulario directo de 5 estrellas en 5 segundos.
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  Multiplicas tus valoraciones semanales y dominas la zona local.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. CATÁLOGO DE PRODUCTOS (CON BOTÓN DE COMPRA DIRECTA) */}
      <section id="catalogo-home" className="py-12 sm:py-16 bg-slate-50 scroll-mt-6">
        <div className="shopify-container max-w-6xl mx-auto px-4 sm:px-6">
          
          <div className="text-center space-y-3 mb-8 sm:mb-12">
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 uppercase tracking-tight">
              Catálogo de Dispositivos NFC y QR
            </h2>
            <p className="text-slate-600 text-xs sm:text-base max-w-2xl mx-auto font-medium">
              Haz tu pedido hoy con envío express en Panamá. Todos vienen listos para autoconfigurar en 30 segundos.
            </p>
          </div>

          <div className="mb-8 max-w-3xl mx-auto bg-amber-50 border border-amber-200 rounded-2xl p-4 text-center shadow-xs">
            <p className="text-xs sm:text-sm font-bold text-amber-950">
              ⚡ Incluye chip NFC de respuesta rápida + Código QR impreso en alta resolución. 0 mensualidades.
            </p>
          </div>

          {/* Catalog Responsive Layout: Horizontal Touch Scroll on Mobile (<768px), 3-Column Grid on Desktop */}
          <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 pb-6 px-4 -mx-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:overflow-visible scrollbar-none">
            
            {/* Item 1: Tarjeta NFC de Bolsillo */}
            {homeProducts[0] && (
              <div className="w-[82vw] sm:w-[310px] shrink-0 snap-center md:w-auto bg-white rounded-3xl overflow-hidden shadow-md border border-slate-200 flex flex-col justify-between hover:border-slate-400 transition-all">
                <div>
                  <div className="aspect-square relative bg-slate-50 cursor-pointer overflow-hidden flex items-center justify-center p-2" onClick={() => router.push(`/catalogo/${homeProducts[0].id}`)}>
                    <img
                      src={homeProducts[0].image}
                      alt={homeProducts[0].name}
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-slate-950 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-sm z-10">
                      Portátil
                    </span>
                  </div>
                  <div className="p-4 sm:p-5 space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight cursor-pointer hover:text-amber-600 transition-colors line-clamp-1" onClick={() => router.push(`/catalogo/${homeProducts[0].id}`)}>
                      {homeProducts[0].name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-snug font-medium line-clamp-2">
                      PVC ultrarresistente tamaño tarjeta de crédito. Llévala en tu billetera o portacredencial para entregas o eventos.
                    </p>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-xl sm:text-2xl font-black text-slate-950 font-mono">${homeProducts[0].price.toFixed(2)} USD</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">Envío Panamá</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 sm:p-5 sm:pt-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuickAdd(homeProducts[0], true)}
                      className="flex-1 py-3 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition flex items-center justify-center gap-1"
                    >
                      <span>Comprar Ahora &rarr;</span>
                    </button>
                    <button
                      onClick={() => handleQuickAdd(homeProducts[0], false)}
                      className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition flex items-center justify-center shrink-0"
                      title="Añadir al Carrito"
                    >
                      <ShoppingCart className="w-4 h-4 text-slate-800" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Item 2: Placa NFC Mostrador (DESTACADO) */}
            {homeProducts[1] && (
              <div className="w-[82vw] sm:w-[310px] shrink-0 snap-center md:w-auto bg-white rounded-3xl overflow-hidden shadow-xl border-2 border-slate-950 flex flex-col justify-between relative transform hover:-translate-y-1 transition-all">
                <span className="absolute -top-3 right-4 bg-amber-500 text-white text-[10px] font-black uppercase px-3 py-0.5 rounded-full shadow-md z-20">
                  🔥 Más Vendida
                </span>
                <div>
                  <div className="aspect-square relative bg-slate-50 cursor-pointer overflow-hidden flex items-center justify-center p-2" onClick={() => router.push(`/catalogo/${homeProducts[1].id}`)}>
                    <img
                      src={homeProducts[1].image}
                      alt={homeProducts[1].name}
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-slate-950 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-sm z-10">
                      Acrílico 3mm
                    </span>
                  </div>
                  <div className="p-4 sm:p-5 space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight cursor-pointer hover:text-amber-600 transition-colors line-clamp-1" onClick={() => router.push(`/catalogo/${homeProducts[1].id}`)}>
                      {homeProducts[1].name}
                    </h3>
                    <p className="text-xs text-slate-700 leading-snug font-semibold line-clamp-2">
                      Acrílico blanco pulido de 3mm con adhesivo 3M. Colócala en la caja registradora o recepción para capturar reseñas al cobrar.
                    </p>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-xl sm:text-2xl font-black text-slate-950 font-mono">${homeProducts[1].price.toFixed(2)} USD</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">Envío Panamá</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 sm:p-5 sm:pt-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuickAdd(homeProducts[1], true)}
                      className="flex-1 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition flex items-center justify-center gap-1"
                    >
                      <span>Comprar Ahora &rarr;</span>
                    </button>
                    <button
                      onClick={() => handleQuickAdd(homeProducts[1], false)}
                      className="p-3 bg-slate-950 hover:bg-slate-900 text-white font-bold rounded-xl transition flex items-center justify-center shrink-0"
                      title="Añadir al Carrito"
                    >
                      <ShoppingCart className="w-4 h-4 text-amber-400" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Item 3: Stand NFC Mesa */}
            {homeProducts[2] && (
              <div className="w-[82vw] sm:w-[310px] shrink-0 snap-center md:w-auto bg-white rounded-3xl overflow-hidden shadow-md border border-slate-200 flex flex-col justify-between hover:border-slate-400 transition-all">
                <div>
                  <div className="aspect-square relative bg-slate-50 cursor-pointer overflow-hidden flex items-center justify-center p-2" onClick={() => router.push(`/catalogo/${homeProducts[2].id}`)}>
                    <img
                      src={homeProducts[2].image}
                      alt={homeProducts[2].name}
                      className="w-full h-full object-contain hover:scale-105 transition-transform duration-500"
                    />
                    <span className="absolute top-3 left-3 bg-slate-950 text-white text-[10px] font-bold uppercase px-3 py-1 rounded-full shadow-sm z-10">
                      Stand de Mesa
                    </span>
                  </div>
                  <div className="p-4 sm:p-5 space-y-2">
                    <h3 className="text-base sm:text-lg font-black text-slate-900 uppercase tracking-tight cursor-pointer hover:text-amber-600 transition-colors line-clamp-1" onClick={() => router.push(`/catalogo/${homeProducts[2].id}`)}>
                      {homeProducts[2].name}
                    </h3>
                    <p className="text-xs text-slate-600 leading-snug font-medium line-clamp-2">
                      Estructura rígida autoportante ideal para mesas de restaurantes, cafeterías, escritorios y clínicas.
                    </p>
                    <div className="flex items-baseline justify-between pt-1">
                      <span className="text-xl sm:text-2xl font-black text-slate-950 font-mono">${homeProducts[2].price.toFixed(2)} USD</span>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">Envío Panamá</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 sm:p-5 sm:pt-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleQuickAdd(homeProducts[2], true)}
                      className="flex-1 py-3 bg-slate-950 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-xs transition flex items-center justify-center gap-1"
                    >
                      <span>Comprar Ahora &rarr;</span>
                    </button>
                    <button
                      onClick={() => handleQuickAdd(homeProducts[2], false)}
                      className="p-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition flex items-center justify-center shrink-0"
                      title="Añadir al Carrito"
                    >
                      <ShoppingCart className="w-4 h-4 text-slate-800" />
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Banner Pack Especial Recomendado (Mismo estilo que en /catalogo) */}
          <div className="mt-10 bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-amber-400 text-slate-950 font-black text-[10px] sm:text-xs uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow z-10">
              <Star className="w-3.5 h-3.5 fill-slate-950" /> Pack Recomendado
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-8 space-y-3">
                <div className="inline-flex items-center gap-1.5 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Tag className="w-4 h-4" /> PACK COMERCIO 3-EN-1 (AHORRAS $20.00)
                </div>
                
                <h3 className="text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                  Pack Comercio Completo (1 Placa + 2 Tarjetas NFC)
                </h3>

                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  Equipa tu caja de cobro y a tu personal en movimiento con la solución completa para capturar reseñas.
                </p>

                <div className="bg-slate-800/80 rounded-2xl p-3.5 border border-slate-700 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>1 Placa NFC de Mostrador (Acrílico 3mm)</strong> para la caja registradora</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                    <span><strong>2 Tarjetas NFC de Bolsillo (PVC 0.76mm)</strong> para tu equipo en movimiento</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-emerald-400 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span><strong>ENVÍO GRATIS A TODO PANAMÁ</strong> + Auto-configuración incluida</span>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 space-y-4 text-left md:text-right border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6">
                <div>
                  {/* MINI THUMBNAILS ROW (1 Placa + 2 Tarjetas) JUST ABOVE $50.00 */}
                  <div className="grid grid-cols-3 gap-2.5 w-full mb-3.5">
                    <div className="h-20 sm:h-24 bg-white rounded-2xl p-1 border-2 border-amber-400 shadow-sm flex items-center justify-center overflow-hidden">
                      <img
                        src="/products/NFC_10001/NFC_10001_Placa.webp"
                        alt="1x Placa Acrílica de Mostrador"
                        className="max-h-full max-w-full object-contain hover:scale-105 transition-transform"
                        title="1x Placa Acrílica de Mostrador (3mm)"
                      />
                    </div>
                    <div className="h-20 sm:h-24 bg-white rounded-2xl p-1 border border-slate-700 shadow-sm flex items-center justify-center overflow-hidden">
                      <img
                        src="/products/tarjeta-nfc/tarjeta-nfc-bolsillo-resenas-google-panama.webp"
                        alt="1x Tarjeta NFC de Bolsillo"
                        className="max-h-full max-w-full object-contain hover:scale-105 transition-transform"
                        title="1x Tarjeta NFC de Bolsillo (PVC 0.76mm)"
                      />
                    </div>
                    <div className="h-20 sm:h-24 bg-white rounded-2xl p-1 border border-slate-700 shadow-sm flex items-center justify-center overflow-hidden">
                      <img
                        src="/products/tarjeta-nfc/tarjeta-nfc-bolsillo-resenas-google-panama.webp"
                        alt="2x Tarjeta NFC de Bolsillo"
                        className="max-h-full max-w-full object-contain hover:scale-105 transition-transform"
                        title="2x Tarjeta NFC de Bolsillo (PVC 0.76mm)"
                      />
                    </div>
                  </div>

                  <div className="flex items-baseline gap-2 md:justify-end">
                    <span className="text-3xl font-black text-amber-400 font-mono">$50.00</span>
                    <span className="text-xs text-slate-400 line-through font-semibold">$70.00</span>
                  </div>
                  <span className="inline-block mt-1 text-[10px] font-black text-slate-950 bg-amber-400 px-2.5 py-0.5 rounded shadow-xs">
                    AHORRAS $20.00 USD
                  </span>
                </div>

                <button
                  onClick={() => {
                    addToCart({
                      product_id: 'pack-negocio-3in1',
                      product_name: 'Pack Comercio Completo (1 Placa + 2 Tarjetas NFC)',
                      price: 50.00,
                      quantity: 1,
                      selected_color: 'Acrílico 3mm + PVC 0.76mm'
                    });
                    router.push('/checkout');
                  }}
                  className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase px-5 py-3.5 rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Comprar Pack ($50 USD)</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECCIÓN UNIFICADA: ¿CÓMO FUNCIONA EL SISTEMA STARTAP EN TU COMERCIO? */}
      <section className="py-12 sm:py-16 bg-white border-y border-slate-200">
        <div className="shopify-container max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-2.5 mb-10 sm:mb-14">
            <span className="text-xs font-black uppercase tracking-wider text-amber-900 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Sistema Completo Hardware + Panel Software
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-slate-950 uppercase tracking-tight">
              ¿Cómo Funciona el Sistema starTAP en Tu Comercio?
            </h2>
            <p className="text-slate-600 text-xs sm:text-base max-w-2xl mx-auto font-medium">
              Hardware NFC & QR en tu mostrador conectado a tu Panel Gratuito de Gestión de Enlaces.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3 relative hover:border-amber-400 transition">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 font-mono rounded-xl flex items-center justify-center font-black text-lg shadow-sm">
                1
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                <span>Colócala en Caja</span> 📦
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Auto-configurable en 30 segundos. Retiras la protección de la cinta 3M, la vinculas con tu celular y la fijas en tu recepción sin enviarnos links largos.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3 relative hover:border-amber-400 transition">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 font-mono rounded-xl flex items-center justify-center font-black text-lg shadow-sm">
                2
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                <span>Cliente Acerca Celular</span> 📱
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Abre directamente el formulario de 5 estrellas en Google Maps (NFC o QR). Compatible con el 100% de iPhones y Androids sin descargar apps.
              </p>
            </div>

            {/* Step 3 (PANEL GRATUITO DE GESTIÓN DE ENLACES) */}
            <div className="bg-amber-500/10 p-6 rounded-3xl border-2 border-amber-400 space-y-3 relative hover:shadow-md transition">
              <span className="absolute -top-3 right-4 bg-amber-500 text-slate-950 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-xs">
                Panel Incluido
              </span>
              <div className="w-10 h-10 bg-slate-950 text-amber-400 font-mono rounded-xl flex items-center justify-center font-black text-lg shadow-sm">
                3
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-950 flex items-center gap-1.5">
                <span>Panel Gratuito de URLs</span> 💻
              </h3>
              <p className="text-slate-800 text-xs leading-relaxed font-bold">
                Acceso de por vida a tu Dashboard Gratuito. Cambia tu enlace de Google Maps, redirige a WhatsApp, Menú Digital o Instagram cuando quieras sin pagar nada extra.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 space-y-3 relative hover:border-amber-400 transition">
              <div className="w-10 h-10 bg-slate-950 text-amber-400 font-mono rounded-xl flex items-center justify-center font-black text-lg shadow-sm">
                4
              </div>
              <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
                <span>Sube en Google Maps</span> 🚀
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed font-medium">
                Multiplica tus opiniones semanales de 5 estrellas. Más valoraciones posicionan tu negocio por encima de tu competencia en Panamá.
              </p>
            </div>
          </div>

          <div className="mt-8 bg-slate-950 text-white rounded-2xl p-4 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-300">
            <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> 0 Mensualidades ni suscripciones</span>
            <span className="flex items-center gap-1.5"><Sparkles className="w-4 h-4 text-amber-400" /> Cambios de enlace ilimitados en el panel</span>
            <span className="flex items-center gap-1.5"><CheckCircle2 className="w-4 h-4 text-blue-400" /> Doble tecnología NFC + Código QR HD</span>
          </div>
        </div>
      </section>

      {/* 5. PREGUNTAS FRECUENTES (FAQ) */}
      <section className="py-12 sm:py-16 bg-slate-50">
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
              <div key={index} className="bg-white border border-slate-200 rounded-2xl shadow-xs p-5 sm:p-6 transition-all hover:border-slate-300">
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

      {/* 6. FINAL BOTTOM CTA */}
      <section className="bg-slate-950 py-12 sm:py-16 text-center px-4">
        <div className="max-w-2xl mx-auto space-y-5">
          <h2 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight">
            Comienza a Captar Reseñas de 5 Estrellas Hoy
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
            Pide tu placa en línea con pago por Yappy o tarjeta. Te la enviamos lista para colocar en tu mostrador y auto-configurar en segundos.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row gap-3.5 justify-center">
            <a
              href="#catalogo-home"
              className="shopify-btn-primary py-4 px-8 uppercase font-bold tracking-wider text-xs inline-block rounded-xl bg-white text-slate-950 hover:bg-slate-100 shadow-lg"
            >
              Ver Productos ($20 - $35)
            </a>
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

      {/* 7. STICKY MOBILE BOTTOM FLOATING ACTION BAR */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-slate-950 text-white border-t border-slate-800 p-3 flex items-center justify-between shadow-2xl">
        <div>
          <div className="text-xs font-black text-amber-400 font-mono">Dispositivos desde $20</div>
          <div className="text-[10px] text-slate-400 font-medium">Envío Panamá · Yappy & Tarjetas</div>
        </div>
        <a
          href="#catalogo-home"
          className="bg-amber-400 hover:bg-amber-500 text-slate-950 font-black text-xs px-4 py-2.5 rounded-xl uppercase tracking-wider flex items-center gap-1.5 shadow-md"
        >
          <ShoppingCart className="w-3.5 h-3.5" />
          <span>Comprar</span>
        </a>
      </div>

    </div>
  );
}
