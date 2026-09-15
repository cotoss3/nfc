'use client';

import React, { useState } from 'react';
import { 
  Calculator, 
  Check, 
  Sparkles, 
  MessageCircle, 
  TrendingDown
} from 'lucide-react';

interface ProductOption {
  id: string;
  name: string;
  description: string;
  basePrice: number;
  icon: string;
}

const PRODUCTS: ProductOption[] = [
  {
    id: 'tarjeta',
    name: 'Tarjeta NFC de Bolsillo',
    description: 'PVC resistente con chip NTAG + QR impreso para equipos de ventas, meseros y ejecutivos.',
    basePrice: 20,
    icon: '💳'
  },
  {
    id: 'placa',
    name: 'Placa Acrílica Mostrador',
    description: 'Acrílico pulido de 3mm con adhesivo 3M para cajas de cobro, recepciones y mostradores.',
    basePrice: 30,
    icon: '🏢'
  },
  {
    id: 'stand',
    name: 'Stand NFC Autoportante',
    description: 'Estructura rígida para mesas de restaurantes, barras y escritorios de atención.',
    basePrice: 35,
    icon: '⭐'
  },
  {
    id: 'pack-mixto',
    name: 'Mix Corporativo (Placas + Tarjetas)',
    description: 'Combinación equilibrada para equipar mostradores fijos y personal móvil.',
    basePrice: 25,
    icon: '📦'
  }
];

export default function CorporativoCalculator() {
  const [selectedProduct, setSelectedProduct] = useState<string>('tarjeta');
  const [quantity, setQuantity] = useState<number>(25);

  const product = PRODUCTS.find((p) => p.id === selectedProduct) || PRODUCTS[0];

  // Escala de descuentos B2B en Panamá
  const getDiscountPercent = (qty: number): number => {
    if (qty >= 100) return 40;
    if (qty >= 50) return 30;
    if (qty >= 15) return 20;
    if (qty >= 5) return 10;
    return 0;
  };

  const discountPercent = getDiscountPercent(quantity);
  const unitPrice = product.basePrice * (1 - discountPercent / 100);
  const totalPrice = unitPrice * quantity;
  const originalTotalPrice = product.basePrice * quantity;
  const savings = originalTotalPrice - totalPrice;

  const whatsappPhone = '50767134341';
  const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    `Hola starTAP Corporativo, calculé este presupuesto en su web para mi empresa:\n\n` +
    `🏢 *COTIZACIÓN B2B POR VOLUMEN:*\n` +
    `• *Producto:* ${product.name}\n` +
    `• *Cantidad:* ${quantity} unidades\n` +
    `• *Precio Regular:* $${product.basePrice.toFixed(2)} c/u\n` +
    `• *Descuento Aplicado:* ${discountPercent}% OFF\n` +
    `• *Precio Unitario B2B:* $${unitPrice.toFixed(2)} c/u\n` +
    `• *Inversión Total Estimada:* $${totalPrice.toFixed(2)} USD\n` +
    `• *Ahorro Total:* $${savings.toFixed(2)} USD\n\n` +
    `Por favor contáctame para coordinar diseño personalizado con nuestro logo y factura fiscal de Panamá.`
  )}`;

  const presetQuantities = [10, 25, 50, 100, 250];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xl space-y-8">
      {/* Header */}
      <div className="space-y-2 border-b border-slate-100 pb-6">
        <div className="inline-flex items-center gap-2 bg-amber-400/15 text-amber-900 border border-amber-400/30 text-xs font-black uppercase px-3 py-1 rounded-full">
          <Calculator className="w-3.5 h-3.5 text-amber-600" />
          <span>Calculador de Presupuesto B2B en Panamá</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-slate-950 uppercase tracking-tight">
          Simula Tu Inversión por Volumen
        </h3>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
          Selecciona el tipo de dispositivo y la cantidad que requiere tu empresa para calcular de inmediato tu escala de descuento corporativo y ahorro estimado.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Controls */}
        <div className="lg:col-span-7 space-y-6">
          {/* Step 1: Select Product */}
          <div className="space-y-3">
            <label className="text-xs font-black uppercase tracking-wider text-slate-900 block">
              1. Selecciona el Tipo de Dispositivo
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {PRODUCTS.map((p) => {
                const isSelected = selectedProduct === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setSelectedProduct(p.id)}
                    className={`text-left p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? 'border-amber-500 bg-amber-50/40 shadow-sm ring-2 ring-amber-400/30'
                        : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-lg">{p.icon}</span>
                      <span className="text-xs font-extrabold text-slate-900 font-mono">
                        ${p.basePrice}.00 base
                      </span>
                    </div>
                    <div className="font-extrabold text-xs uppercase text-slate-950 mb-1">{p.name}</div>
                    <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">{p.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Step 2: Quantity selector */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-black uppercase tracking-wider text-slate-900">
                2. Cantidad de Unidades: <span className="text-amber-600 font-mono font-black text-base">{quantity} uds.</span>
              </label>
              {discountPercent > 0 && (
                <span className="text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingDown className="w-3 h-3" />
                  {discountPercent}% de Descuento
                </span>
              )}
            </div>

            {/* Range Slider */}
            <input
              type="range"
              min={5}
              max={500}
              step={5}
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-amber-500"
            />

            {/* Presets */}
            <div className="flex flex-wrap gap-2 pt-1">
              {presetQuantities.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setQuantity(preset)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg border transition-colors ${
                    quantity === preset
                      ? 'bg-slate-950 text-white border-slate-950'
                      : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {preset} uds.
                </button>
              ))}
              <span className="text-[10px] text-slate-400 self-center ml-1">
                (O ajusta el control deslizante)
              </span>
            </div>
          </div>

          {/* Scale info badges */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Escala de Ahorro Corporativo en Panamá
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-[10px] font-bold">
              <div className={`p-2 rounded-xl border ${quantity >= 5 && quantity < 15 ? 'bg-amber-100/60 border-amber-300 text-amber-950 font-black' : 'bg-white border-slate-200 text-slate-600'}`}>
                5-14 uds: 10% OFF
              </div>
              <div className={`p-2 rounded-xl border ${quantity >= 15 && quantity < 50 ? 'bg-amber-100/60 border-amber-300 text-amber-950 font-black' : 'bg-white border-slate-200 text-slate-600'}`}>
                15-49 uds: 20% OFF
              </div>
              <div className={`p-2 rounded-xl border ${quantity >= 50 && quantity < 100 ? 'bg-amber-100/60 border-amber-300 text-amber-950 font-black' : 'bg-white border-slate-200 text-slate-600'}`}>
                50-99 uds: 30% OFF
              </div>
              <div className={`p-2 rounded-xl border ${quantity >= 100 ? 'bg-emerald-100 border-emerald-300 text-emerald-950 font-black' : 'bg-white border-slate-200 text-slate-600'}`}>
                100+ uds: 40% OFF
              </div>
            </div>
          </div>
        </div>

        {/* Right Real-time Quote Card */}
        <div className="lg:col-span-5 bg-slate-950 text-white rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative overflow-hidden">
          <div className="space-y-1 border-b border-slate-800 pb-4">
            <div className="text-[10px] font-black uppercase tracking-widest text-amber-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Presupuesto Estimado</span>
            </div>
            <h4 className="text-xl font-black text-white">{product.name}</h4>
            <div className="text-xs text-slate-400">Volumen: <strong className="text-white">{quantity} unidades</strong></div>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex justify-between items-center text-slate-400">
              <span>Precio regular de lista:</span>
              <span className="line-through font-mono">${originalTotalPrice.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-emerald-400 font-bold">
              <span>Descuento B2B ({discountPercent}%):</span>
              <span className="font-mono">-${savings.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center text-slate-300 pt-1 border-t border-slate-800">
              <span>Precio unitario final:</span>
              <span className="text-sm font-black text-white font-mono">${unitPrice.toFixed(2)} <span className="text-[10px] font-normal text-slate-400">c/u</span></span>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 mt-2">
              <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                Inversión Total Estimada
              </div>
              <div className="text-3xl font-black text-amber-400 font-mono">
                ${totalPrice.toFixed(2)} <span className="text-xs font-normal text-slate-400">USD</span>
              </div>
              <div className="text-[11px] text-emerald-400 font-bold mt-1">
                Ahorras ${savings.toFixed(2)} en este pedido
              </div>
            </div>
          </div>

          {/* Included Features */}
          <div className="space-y-2 text-[11px] text-slate-300 border-t border-slate-800 pt-4">
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Factura Fiscal Panamá con RUC y DV</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Programación individual de enlaces por sucursal</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Impresión de logo corporativo y código QR</span>
            </div>
            {quantity >= 50 && (
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>Muestra física previa de aprobación incluida</span>
              </div>
            )}
          </div>

          {/* Direct WhatsApp CTA Button */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase tracking-wider py-4 px-6 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-center group"
          >
            <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Formalizar Cotización por WhatsApp</span>
          </a>

          <p className="text-[10px] text-center text-slate-400">
            Atención personalizada de lunes a viernes • Envíos a todo Panamá
          </p>
        </div>
      </div>
    </div>
  );
}
