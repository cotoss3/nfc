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

  // Filtrar y ordenar exactamente los 3 productos insignia solicitados: 1. Placa, 2. Stand, 3. Tarjeta
  const targetIds = ['placa-acrilica-nfc', 'stand-nfc', 'tarjeta-nfc'];
  
  const mainProducts = targetIds
    .map(id => allProducts.find(p => p.id === id))
    .filter((p): p is Product => p !== undefined);

  const displayProducts = mainProducts.length === 3 
    ? mainProducts 
    : allProducts.slice(0, 3);

  const productTechDetails: Record<string, { badge: string; categoryLabel: string; spec: string; alt: string }> = {
    'placa-acrilica-nfc': {
      badge: 'Acrílico Premium 3mm',
      categoryLabel: 'Placa de Mostrador y Pared',
      spec: 'Adhesivo 3M Industrial + Microchip NTAG Integrado',
      alt: 'Placa de mesa acrílica NFC y código QR para reseñas de Google en Panamá'
    },
    'stand-nfc': {
      badge: 'PVC Técnico Autoportante',
      categoryLabel: 'Stand de Mesa y Recepción',
      spec: 'Ángulo Inclinado Ergonómico + Antena NFC Dual',
      alt: 'Dispositivo NFC StarTAP para mostrador y mesa de restaurante en Panamá'
    },
    'tarjeta-nfc': {
      badge: 'PVC Contactless 0.76mm',
      categoryLabel: 'Tarjeta Portátil de Bolsillo',
      spec: 'Impermeable HD + Impresión Láser de Alta Durabilidad',
      alt: 'Tarjeta PVC contactless NFC para Google Reviews en Panamá'
    }
  };

  return (
    <div className="bg-brand-50 text-brand-950 min-h-screen pb-24 font-sans">
      
      {/* Header en Sintonía con el Branding del Home */}
      <section className="bg-white border-b border-brand-200 py-16 px-4">
        <div className="shopify-container max-w-6xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-amber-900 border border-amber-300 font-extrabold text-xs uppercase px-3 py-1 rounded-full">
            <Cpu className="w-4 h-4 text-amber-600" />
            <span>Tecnología Contactless de Proximidad 13.56 MHz</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-950 uppercase tracking-tight">
            Catálogo de Dispositivos NFC & QR
          </h1>

          <p className="text-brand-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Hardware de captación de reseñas en Google Maps para tu negocio en Panamá. <strong className="text-brand-900 font-semibold">Sin apps, sin baterías y sin mensualidades.</strong>
          </p>

          {/* Ficha de Especificaciones del Hardware */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-brand-700">
            <span className="flex items-center gap-1.5 bg-brand-50 px-3 py-1.5 rounded-full border border-brand-200">
              <Wifi className="w-4 h-4 text-accent-600" /> Chip NFC NTAG Integrado
            </span>
            <span className="flex items-center gap-1.5 bg-brand-50 px-3 py-1.5 rounded-full border border-brand-200">
              <QrCode className="w-4 h-4 text-accent-600" /> Código QR HD Respaldo 100%
            </span>
            <span className="flex items-center gap-1.5 bg-brand-50 px-3 py-1.5 rounded-full border border-brand-200">
              <Zap className="w-4 h-4 text-accent-600" /> Respuesta Instantánea en 2 Segundos
            </span>
          </div>
        </div>
      </section>

      {/* Grid de los 3 Productos Principales */}
      <section className="shopify-container max-w-6xl mx-auto px-4 pt-16">
        <div className="text-center space-y-2 mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-brand-950 uppercase tracking-tight">
            Nuestros 3 Dispositivos Principales
          </h2>
          <p className="text-brand-600 text-sm">Elige la solución que mejor se adapte a tu local comercial o personal</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {displayProducts.map((product) => {
            const details = productTechDetails[product.id] || {
              badge: 'Dispositivo TAP',
              categoryLabel: 'Dispositivo NFC',
              spec: 'NFC Contactless + Código QR Impreso HD',
              alt: product.name
            };

            return (
              <div
                key={product.id}
                className="bg-white rounded-2xl overflow-hidden shadow-premium border border-brand-200 group flex flex-col justify-between hover:shadow-2xl transition-all duration-300"
              >
                {/* Imagen del Producto */}
                <div 
                  className="aspect-[4/5] relative bg-brand-100 overflow-hidden cursor-pointer border-b border-brand-200"
                  onClick={() => window.location.href = `/shop/${product.id}`}
                >
                  <HoverableImage product={product} altText={details.alt} />
                  <div className="absolute top-4 left-4 bg-brand-950 text-white text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-full shadow-lg">
                    {details.badge}
                  </div>
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md text-brand-950 border border-brand-200 text-[10px] font-bold tracking-widest uppercase px-2.5 py-1 rounded-full shadow">
                    NFC + QR
                  </div>
                </div>

                {/* Contenido e Información del Producto */}
                <div className="p-6 space-y-5 flex-grow flex flex-col justify-between">
                  <div className="space-y-3">
                    <span className="text-[10px] font-bold tracking-widest text-brand-400 uppercase block">
                      {details.categoryLabel}
                    </span>
                    <h3 className="text-lg font-black text-brand-950 uppercase tracking-wide group-hover:text-accent-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-xs text-brand-600 leading-relaxed line-clamp-3">
                      {product.description}
                    </p>

                    {/* Especificaciones en Caja Clarita de Marca */}
                    <div className="bg-brand-50 p-3 rounded-xl border border-brand-200 text-[11px] space-y-1 text-brand-800">
                      <p className="font-bold text-brand-950">⚙️ Especificaciones:</p>
                      <p className="text-[11px] text-brand-600">{details.spec}</p>
                    </div>
                  </div>

                  {/* Precios y Botón de Acción */}
                  <div className="pt-4 border-t border-brand-100 space-y-4">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-brand-400 block font-semibold">Pago Único</span>
                        <span className="text-2xl font-black text-brand-950">${product.price.toFixed(2)}</span>
                      </div>
                      <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded border border-green-200 flex items-center gap-1">
                        <Check className="w-3.5 h-3.5 text-green-600" /> Envío en Panamá
                      </span>
                    </div>

                    <Link
                      href={`/shop/${product.id}`}
                      className="shopify-btn-primary w-full py-4 text-xs font-bold uppercase tracking-wider block text-center rounded-xl shadow-md"
                    >
                      Personalizar y Comprar
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Especificaciones Técnicas con Branding del Home */}
      <section className="shopify-container max-w-5xl mx-auto px-4 mt-20">
        <div className="bg-white border border-brand-200 rounded-3xl p-8 sm:p-12 space-y-8 shadow-premium">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <span className="text-xs font-extrabold uppercase tracking-widest text-accent-600">Calidad e Innovación</span>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-950 uppercase tracking-tight">
              ¿Por qué elegir los Dispositivos StarTAP?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
            <div className="bg-brand-50 p-6 rounded-2xl border border-brand-200 space-y-2">
              <div className="w-10 h-10 bg-amber-400/20 text-amber-900 rounded-xl flex items-center justify-center font-bold text-lg mb-2">📡</div>
              <h3 className="font-bold text-brand-950 text-sm">Microchip NTAG Integrado</h3>
              <p className="text-brand-600 leading-relaxed">Frecuencia estándar de 13.56 MHz de alta respuesta. Lectura electromagnética sin baterías ni recargas.</p>
            </div>

            <div className="bg-brand-50 p-6 rounded-2xl border border-brand-200 space-y-2">
              <div className="w-10 h-10 bg-amber-400/20 text-amber-900 rounded-xl flex items-center justify-center font-bold text-lg mb-2">⚙️</div>
              <h3 className="font-bold text-brand-950 text-sm">Plataforma Cloud Ruteable</h3>
              <p className="text-brand-600 leading-relaxed">Cambia la dirección destino de tus dispositivos en tiempo real desde tu celular sin comprar otro producto.</p>
            </div>

            <div className="bg-brand-50 p-6 rounded-2xl border border-brand-200 space-y-2">
              <div className="w-10 h-10 bg-amber-400/20 text-amber-900 rounded-xl flex items-center justify-center font-bold text-lg mb-2">🛡️</div>
              <h3 className="font-bold text-brand-950 text-sm">Resistente a Alto Tráfico</h3>
              <p className="text-brand-600 leading-relaxed">Acrílico premium de 3mm y PVC de alta durabilidad diseñados para el uso comercial diario en Panamá.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Banner Corporativo */}
      <section className="shopify-container max-w-5xl mx-auto px-4 mt-12">
        <div className="border border-brand-200 bg-white rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-premium">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="font-black text-base text-brand-950 uppercase tracking-wider">¿Deseas pedidos corporativos o cantidades especiales?</h3>
            <p className="text-xs text-brand-600 max-w-xl leading-relaxed">
              Ofrecemos volumen especial para hoteles, restaurantes y cadenas comerciales en Panamá. Personalizamos colores e impresión de logos corporativos.
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
              className="shopify-btn-secondary py-3.5 px-6 text-xs uppercase tracking-wider font-bold border-brand-950 hover:bg-brand-950 hover:text-white text-center rounded-xl"
            >
              WhatsApp Corporativo
            </a>
          </div>
        </div>
      </section>

    </div>
  );
}


