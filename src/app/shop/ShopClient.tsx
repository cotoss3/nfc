'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { dbLocal, Product } from '@/lib/db';
import { 
  Cpu, Zap, Wifi, ShieldCheck, Layers, QrCode, Smartphone, 
  Sparkles, ArrowRight, Check, CheckCircle2, Award, Star, ExternalLink 
} from 'lucide-react';

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
      className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105"
    />
  );
};

export default function ShopClient() {
  const allProducts = dbLocal.getProducts();

  // Filtrar los 3 productos insignia solicitados: Placa, Stand y Tarjeta
  const targetIds = ['placa-acrilica-nfc', 'stand-nfc', 'tarjeta-nfc'];
  
  // Ordenar explícitamente: 1. Placa, 2. Stand, 3. Tarjeta
  const mainProducts = targetIds
    .map(id => allProducts.find(p => p.id === id))
    .filter((p): p is Product => p !== undefined);

  // Fallback si por alguna razón no se encuentran por ID exacto
  const displayProducts = mainProducts.length === 3 
    ? mainProducts 
    : allProducts.slice(0, 3);

  const productTechDetails: Record<string, { badge: string; icon: string; spec: string; alt: string }> = {
    'placa-acrilica-nfc': {
      badge: 'Instalación de Pared / Mostrador',
      icon: '🛡️ Acrílico Blanco 3mm',
      spec: 'Adhesivo 3M Industrial + Chip NTAG216 Integrado',
      alt: 'Placa de mesa acrílica NFC y código QR para reseñas de Google en Panamá'
    },
    'stand-nfc': {
      badge: 'Mesa & Recepción Commercial',
      icon: '📐 PVC Técnico Autoportante',
      spec: 'Ángulo Inclinado Ergonómico + Antena NFC Dual',
      alt: 'Dispositivo NFC StarTAP para mostrador y mesa de restaurante en Panamá'
    },
    'tarjeta-nfc': {
      badge: 'Portátil para Vendedores & Personal',
      icon: '💳 PVC Premium 0.76mm',
      spec: 'Resistente al Agua + Impresión Láser HD',
      alt: 'Tarjeta PVC contactless NFC para Google Reviews en Panamá'
    }
  };

  return (
    <div className="bg-brand-950 text-white min-h-screen pb-24 font-sans selection:bg-amber-400 selection:text-brand-950">
      
      {/* High-Tech Banner Header */}
      <section className="relative pt-12 pb-16 px-4 border-b border-brand-800 bg-gradient-to-b from-slate-950 via-brand-950 to-brand-900 overflow-hidden">
        {/* Futuristic Grid Accent */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b15_1px,transparent_1px),linear-gradient(to_bottom,#1e293b15_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="shopify-container max-w-6xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center gap-2 bg-amber-400/10 text-amber-400 border border-amber-400/20 px-4 py-1.5 rounded-full text-xs font-mono uppercase tracking-widest shadow-inner">
            <Cpu className="w-4 h-4 animate-pulse" />
            <span>Tecnología Contactless de Proximidad 13.56 MHz</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight uppercase text-white leading-tight">
            Catálogo de Dispositivos <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500">StarTAP</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Hardware de captura de reseñas geolocalizadas para Panamá. <strong className="text-amber-400 font-semibold">Sin apps, sin baterías y sin mensualidades</strong>. Conecta el mundo físico con tu ficha de Google Maps en 2 segundos.
          </p>

          {/* Quick Hardware Specs Pill Bar */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs font-mono text-slate-300">
            <span className="flex items-center gap-2 bg-brand-900/80 px-3 py-1.5 rounded-lg border border-brand-800">
              <Wifi className="w-3.5 h-3.5 text-amber-400" /> Chip NFC NTAG Passiv
            </span>
            <span className="flex items-center gap-2 bg-brand-900/80 px-3 py-1.5 rounded-lg border border-brand-800">
              <QrCode className="w-3.5 h-3.5 text-amber-400" /> Código QR HD Respaldo 100%
            </span>
            <span className="flex items-center gap-2 bg-brand-900/80 px-3 py-1.5 rounded-lg border border-brand-800">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Respuesta &lt; 0.2s
            </span>
          </div>
        </div>
      </section>

      {/* Main 3 Products Showcase */}
      <section className="shopify-container max-w-6xl mx-auto px-4 pt-16">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white">
            Las 3 Soluciones Principales para Tu Comercio
          </h2>
          <p className="text-slate-400 text-sm">Selecciona el formato ideal según la distribución de tu local o fuerza de ventas</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {displayProducts.map((product, idx) => {
            const details = productTechDetails[product.id] || {
              badge: 'Dispositivo Comercial TAP',
              icon: '⚡ Chip NFC Alta Respuesta',
              spec: 'NFC Contactless + Código QR Grabado',
              alt: product.name
            };

            return (
              <div
                key={product.id}
                className="group bg-brand-900/90 border border-brand-800 hover:border-amber-400/50 rounded-3xl overflow-hidden shadow-2xl transition-all duration-500 flex flex-col justify-between hover:shadow-amber-500/10"
              >
                {/* Tech Badge Header */}
                <div className="p-4 bg-slate-950/60 border-b border-brand-800 flex items-center justify-between">
                  <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> {details.badge}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 bg-brand-950 px-2 py-0.5 rounded border border-brand-800">
                    OPCIÓN #{idx + 1}
                  </span>
                </div>

                {/* Product Image */}
                <div 
                  className="relative aspect-square overflow-hidden bg-brand-950 cursor-pointer border-b border-brand-800"
                  onClick={() => window.location.href = `/shop/${product.id}`}
                >
                  <HoverableImage product={product} altText={details.alt} />
                  <div className="absolute top-4 right-4 bg-brand-950/90 backdrop-blur-md text-amber-400 border border-amber-400/30 text-[10px] font-mono font-bold tracking-widest uppercase px-3 py-1 rounded-full shadow-xl flex items-center gap-1">
                    <Wifi className="w-3 h-3" /> NFC + QR
                  </div>
                </div>

                {/* Info & Tech Spec Content */}
                <div className="p-6 space-y-5 flex-grow flex flex-col justify-between">
                  <div className="space-y-3">
                    <h3 className="text-xl font-black text-white uppercase tracking-wide group-hover:text-amber-400 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed line-clamp-3">
                      {product.description}
                    </p>

                    {/* Spec Bullet Badges */}
                    <div className="bg-slate-950/80 p-3.5 rounded-xl border border-brand-800 text-[11px] font-mono space-y-1.5 text-slate-300">
                      <p className="text-amber-300 font-semibold">{details.icon}</p>
                      <p className="text-[10px] text-slate-400">{details.spec}</p>
                    </div>
                  </div>

                  {/* Pricing and Action Button */}
                  <div className="pt-4 border-t border-brand-800 space-y-4">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">Pago Único de por vida</span>
                        <span className="text-3xl font-black text-white">${product.price.toFixed(2)}</span>
                      </div>
                      <span className="text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20">
                        ✓ Envío en Panamá
                      </span>
                    </div>

                    <Link
                      href={`/shop/${product.id}`}
                      className="shopify-btn-primary w-full py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 rounded-xl group-hover:bg-amber-400 group-hover:text-brand-950 transition-all shadow-lg shadow-amber-500/10"
                    >
                      Personalizar y Comprar <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tech Specifications Comparison Section */}
      <section className="shopify-container max-w-5xl mx-auto px-4 mt-20">
        <div className="bg-slate-950 border border-brand-800 rounded-3xl p-8 sm:p-12 space-y-8 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-500/5 rounded-full blur-3xl pointer-events-none"></div>

          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400">Especificaciones Técnicas de Fábrica</span>
            <h2 className="text-2xl sm:text-3xl font-black text-white">¿Por Qué la Tecnología StarTAP es Superior?</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 font-mono text-xs">
            <div className="bg-brand-900/60 p-5 rounded-2xl border border-brand-800 space-y-2">
              <div className="w-8 h-8 bg-amber-400/10 text-amber-400 rounded-lg flex items-center justify-center font-bold text-sm">📡</div>
              <h3 className="font-bold text-white text-sm">Microchip NTAG Integrado</h3>
              <p className="text-slate-400 text-[11px] leading-relaxed">Frecuencia estándar 13.56 MHz de alta sensibilidad. Lectura ultra rápida al contacto sin rozamiento.</p>
            </div>

            <div className="bg-brand-900/60 p-5 rounded-2xl border border-brand-800 space-y-2">
              <div className="w-8 h-8 bg-amber-400/10 text-amber-400 rounded-lg flex items-center justify-center font-bold text-sm">⚙️</div>
              <h3 className="font-bold text-white text-sm">Plataforma Cloud Ruteable</h3>
              <p className="text-slate-400 text-[11px] leading-relaxed">Redirige tus dispositivos en tiempo real desde tu celular sin tener que volver a imprimirlos.</p>
            </div>

            <div className="bg-brand-900/60 p-5 rounded-2xl border border-brand-800 space-y-2">
              <div className="w-8 h-8 bg-amber-400/10 text-amber-400 rounded-lg flex items-center justify-center font-bold text-sm">🛡️</div>
              <h3 className="font-bold text-white text-sm">Resistente a Uso Comercial</h3>
              <p className="text-slate-400 text-[11px] leading-relaxed">Materiales de grado profesional (Acrílico 3mm / PVC técnico) impermeables y duraderos.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Corporate Special Orders */}
      <section className="shopify-container max-w-5xl mx-auto px-4 mt-12">
        <div className="border border-brand-800 bg-brand-900/80 rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-black text-lg text-white uppercase tracking-wider">¿Necesitas pedidos corporativos o lotes para franquicias?</h3>
            <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
              Ofrecemos volumen especial para hoteles, restaurantes y cadenas comerciales en Panamá. Personalización masiva con el branding exacto de tu empresa.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Link
              href="/corporativo"
              className="shopify-btn-primary py-3.5 px-6 text-xs uppercase tracking-wider font-bold text-center rounded-xl"
            >
              Planes Corporativos
            </Link>
            <a
              href="https://wa.me/50767134341?text=Hola,%20quisiera%20cotizar%20placas%20NFC%20al%20por%20mayor%20para%20mi%20empresa"
              target="_blank"
              rel="noopener noreferrer"
              className="shopify-btn-secondary py-3.5 px-6 text-xs uppercase tracking-wider font-bold border-brand-700 hover:border-amber-400 text-slate-200 hover:text-white text-center rounded-xl"
            >
              WhatsApp Corporativo
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}

