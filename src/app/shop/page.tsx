'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { dbLocal, Product } from '@/lib/db';
import { ShoppingBag } from 'lucide-react';

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
      className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
    />
  );
};

export default function ShopPage() {
  const allProducts = dbLocal.getProducts();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredProducts = selectedCategory === 'all'
    ? allProducts
    : allProducts.filter(p => p.category === selectedCategory);

  const categories = [
    { id: 'all', name: 'Todos los Productos' },
    { id: 'plates', name: 'Placas de Acrílico' },
    { id: 'cards', name: 'Tarjetas PVC / Madera' },
    { id: 'accessories', name: 'Llaveros y Accesorios' }
  ];

  return (
    <div className="shopify-container max-w-6xl py-12 space-y-12 bg-brand-50">
      {/* Header */}
      <div className="space-y-3 text-center md:text-left">
        <span className="text-[10px] font-bold tracking-widest text-brand-400 uppercase">Colección Completa</span>
        <h1 className="text-3xl sm:text-4xl font-black text-brand-950 uppercase tracking-wide">Productos NFC Inteligentes</h1>
        <p className="text-brand-500 text-sm max-w-xl leading-relaxed">
          Selecciona tu modelo y configúralo con el logotipo de tu marca y tu dirección destino. Grabado láser y preprogramación de fábrica incluidos en Panamá.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-brand-200 pb-3">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all rounded ${
              selectedCategory === cat.id
                ? 'bg-brand-950 text-white shadow-sm'
                : 'bg-white text-brand-600 border border-brand-200 hover:bg-brand-100 hover:text-brand-950'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            className="group bg-white border border-brand-200 overflow-hidden hover:shadow-premium transition-all duration-300 flex flex-col h-full"
          >
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-brand-100 border-b border-brand-200">
              <HoverableImage product={product} />
              <span className="absolute top-4 left-4 bg-brand-950 text-white text-[8px] font-bold tracking-widest uppercase px-2 py-0.5">
                NFC + QR
              </span>
            </div>

            {/* Info */}
            <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-[9px] font-bold tracking-widest text-brand-400 uppercase block">
                  {product.category === 'plates' ? 'Placa de Mostrador' : product.category === 'cards' ? 'Tarjeta Inteligente' : 'Accesorio'}
                </span>
                <h2 className="text-sm font-bold text-brand-950 uppercase tracking-wide truncate">{product.name}</h2>
                <p className="text-xs text-brand-400 line-clamp-3 leading-relaxed">{product.description}</p>
              </div>

              {/* Action and Price */}
              <div className="flex justify-between items-center pt-4 border-t border-brand-100">
                <div>
                  <span className="text-[9px] text-brand-400 uppercase tracking-wider block font-semibold">Pago Único</span>
                  <span className="text-base font-black text-brand-950">${product.price.toFixed(2)}</span>
                </div>
                <Link
                  href={`/shop/${product.id}`}
                  className="shopify-btn-primary py-2 px-4 text-xs uppercase tracking-wider font-semibold rounded"
                >
                  Personalizar
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Corporate Banner */}
      <div className="border border-brand-200 bg-white rounded-lg p-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center md:text-left">
          <h3 className="font-bold text-sm text-brand-950 uppercase tracking-wider">¿Deseas Diseños o Cantidades Especiales?</h3>
          <p className="text-xs text-brand-500 max-w-xl">
            Ofrecemos tarifas para corporativos, hoteles y franquicias con múltiples locales en Panamá. Personalizamos el color de acrílico y grabado de logos complejos.
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/corporativo"
            className="shopify-btn-primary py-3 px-6 text-xs uppercase tracking-wider font-bold text-center"
          >
            Ver Planes Corporativos
          </Link>
          <a
            href="https://wa.me/50767134341?text=Hola,%20quisiera%20cotizar%20placas%20NFC%20al%20por%20mayor%20para%20mi%20empresa"
            target="_blank"
            rel="noopener noreferrer"
            className="shopify-btn-secondary py-3 px-6 text-xs uppercase tracking-wider font-bold border-brand-950 hover:bg-brand-950 hover:text-white text-center"
          >
            WhatsApp Corporativo (+507 6713-4341)
          </a>
        </div>
      </div>
    </div>
  );
}
