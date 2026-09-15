'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import {
  FREE_SHIPPING_THRESHOLD,
  amountMissingForFreeShipping,
  YAPPY,
} from '@/config/shipping';
import { 
  Trash2, 
  ShoppingBag, 
  ArrowRight, 
  Truck, 
  MessageCircle,
  ShieldCheck,
  Zap,
  Smartphone,
  CheckCircle2,
  Sparkles,
  Lock
} from 'lucide-react';

function YappyBadge() {
  return (
    <div className="flex items-center gap-1.5 bg-white px-2.5 py-1 rounded-md shadow-sm">
      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="32" height="32" rx="8" fill="#005CE6" />
        <path d="M9 10L14.5 18.5V23H17.5V18.5L23 10H19.5L16 15.8L12.5 10H9Z" fill="white" />
        <circle cx="22.5" cy="10" r="2.5" fill="#FF5E00" />
      </svg>
      <span className="text-[#005CE6] font-black text-sm tracking-tight">yappy</span>
    </div>
  );
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getItemCount } = useCart();

  const faltaParaGratis = amountMissingForFreeShipping(getCartTotal());
  const progresoGratis = Math.min(100, (getCartTotal() / FREE_SHIPPING_THRESHOLD) * 100);
  const [mounted, setMounted] = useState(false);

  const whatsappNumber = '50767134341';

  const generateWhatsAppMessage = () => {
    const itemsList = cart.map(item => {
      const extras = [
        item.has_custom_logo ? 'Logo personalizado' : '',
        item.has_qr_code ? 'Código QR' : '',
        item.selected_color ? `Acabado: ${item.selected_color}` : ''
      ].filter(Boolean).join(', ');
      
      const extrasText = extras ? ` (${extras})` : '';
      return `• ${item.quantity}x ${item.product_name}${extrasText} - $${(item.price * item.quantity).toFixed(2)}`;
    }).join('\n');

    const message = `Hola starTAP, quiero pagar mi pedido directo por Yappy / WhatsApp sin tarjeta:

📦 *RESUMEN DEL PEDIDO:*
${itemsList}

💰 *TOTAL:* $${getCartTotal().toFixed(2)} USD
🚚 *ENVÍO:* ${faltaParaGratis > 0 ? 'Por coordinar con asesor' : 'Envío Gratis incluido (+$50)'}
🛡️ *GARANTÍA:* 90 días starTAP incluida

¿Me confirmas tu número de Yappy comercial (${YAPPY.numero}) para realizar la transferencia y coordinar el despacho?`;

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center text-xs text-brand-400 uppercase tracking-widest">
        Cargando carrito...
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-6">
        <div className="w-12 h-12 bg-brand-100 rounded-full flex items-center justify-center mx-auto text-brand-400">
          <ShoppingBag className="h-6 w-6 stroke-[1.5]" />
        </div>
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-brand-950 uppercase tracking-wider">Tu Carrito está Vacío</h1>
          <p className="text-xs text-brand-500">Agrega placas o tarjetas inteligentes NFC de nuestro catálogo para continuar.</p>
        </div>
        <Link
          href="/shop"
          className="inline-block shopify-btn-primary uppercase tracking-wider text-xs font-bold w-full py-3.5"
        >
          Ver Productos
        </Link>
      </div>
    );
  }

  return (
    <div className="shopify-container max-w-5xl py-12">
      <h1 className="text-3xl font-black text-brand-950 uppercase tracking-wide mb-10">Tu Carrito de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Cart Items List */}
        <div className="lg:col-span-8 space-y-6">
          <div className="border border-brand-200 bg-white divide-y divide-brand-200">
            {cart.map((item) => (
              <div
                key={item.id}
                className="p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6"
              >
                {/* Visual */}
                <div className="flex items-center space-x-4">
                  <div className={`w-14 h-9 rounded flex items-center justify-center text-[10px] font-bold text-white shadow-sm flex-shrink-0 ${
                    item.selected_color?.includes('Negro') ? 'bg-brand-950' :
                    item.selected_color?.includes('Blanco') ? 'bg-brand-100 border border-brand-200 !text-brand-950' :
                    item.selected_color?.includes('Bambú') ? 'bg-[#f7e2c4] !text-amber-950' :
                    'bg-yellow-500'
                  }`}>
                    NFC
                  </div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-brand-950 text-xs sm:text-sm uppercase tracking-wide leading-snug">{item.product_name}</h3>
                    <div className="text-[10px] text-brand-500 space-y-0.5">
                      <p>Acabado: <span className="font-bold text-brand-800 uppercase">{item.selected_color}</span></p>
                      <p>Negocio: <span className="font-bold text-brand-800 uppercase">{item.business_name}</span></p>
                      {item.has_custom_logo && (
                        <p className="flex items-center gap-1 text-green-700 font-bold">
                          <span>✓ Logo Personalizado (+ $5.00)</span>
                        </p>
                      )}
                      {item.has_qr_code && (
                        <p className="flex items-center gap-1 text-green-700 font-bold">
                          <span>✓ Código QR Impreso (+ $3.00)</span>
                        </p>
                      )}
                      {item.initial_redirect_url && (
                        <p className="truncate max-w-[180px] sm:max-w-[280px]">
                          Destino: <span className="font-bold text-brand-800 font-mono">{item.initial_redirect_url}</span>
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Pricing & Control */}
                <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-6 pt-4 sm:pt-0 border-t border-brand-100 sm:border-0">
                  <div className="flex items-center border border-brand-300 rounded bg-white">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="px-2.5 py-1 font-bold text-brand-500 hover:bg-brand-100"
                    >
                      −
                    </button>
                    <span className="px-3 font-bold text-xs text-brand-800">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="px-2.5 py-1 font-bold text-brand-500 hover:bg-brand-100"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-[9px] text-brand-400 block font-semibold">Subtotal</span>
                    <span className="font-black text-brand-950 text-sm">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="p-1.5 text-brand-400 hover:text-brand-950 hover:bg-brand-100 rounded transition-colors"
                    aria-label="Eliminar"
                  >
                    <Trash2 className="h-4.5 w-4.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Cart Summary */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white border border-brand-200 rounded-lg p-6 space-y-6 shadow-premium">
            <h2 className="font-bold text-xs uppercase tracking-widest text-brand-950 border-b border-brand-100 pb-3">Resumen de Compra</h2>
            
            {/* Barra de progreso hacia el envío gratis */}
            <div className="space-y-2">
              {faltaParaGratis > 0 ? (
                <p className="text-xs text-brand-600 leading-snug">
                  Te faltan{' '}
                  <strong className="text-brand-950">${faltaParaGratis.toFixed(2)}</strong> para
                  el <strong className="text-brand-950">envío gratis</strong>.
                </p>
              ) : (
                <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <Truck className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                  ¡Tienes envío gratis a todo Panamá!
                </p>
              )}
              <div
                className="h-2 w-full bg-brand-100 rounded-full overflow-hidden"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={FREE_SHIPPING_THRESHOLD}
                aria-valuenow={Math.min(getCartTotal(), FREE_SHIPPING_THRESHOLD)}
                aria-label="Progreso hacia el envío gratis"
              >
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    faltaParaGratis > 0 ? 'bg-accent-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${progresoGratis}%` }}
                />
              </div>
              <p className="text-[10px] text-brand-400">
                Envío gratis en pedidos de ${FREE_SHIPPING_THRESHOLD} o más.
              </p>
            </div>

            <hr className="border-brand-200" />

            <div className="space-y-3 text-xs text-brand-500">
              <div className="flex justify-between">
                <span>Cantidad Total</span>
                <span className="font-semibold text-brand-950">{getItemCount()} artículos</span>
              </div>
              <div className="flex justify-between">
                <span>Programación del Chip NFC</span>
                <span className="text-accent-600 font-bold uppercase">Gratuito</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span className="font-semibold text-brand-950">
                  {faltaParaGratis > 0 ? 'Calculado al checkout' : (
                    <span className="text-emerald-600 font-bold uppercase">Gratis</span>
                  )}
                </span>
              </div>
            </div>

            <hr className="border-brand-200" />

            <div className="flex justify-between items-baseline">
              <span className="font-bold text-xs uppercase tracking-wider text-brand-950">Subtotal</span>
              <span className="text-xl font-black text-brand-950">${getCartTotal().toFixed(2)}</span>
            </div>

            <Link
              href="/checkout"
              className="w-full shopify-btn-primary uppercase tracking-widest text-xs font-bold py-4"
            >
              Completar Compra con Tarjeta
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

            {/* CRO Panamá: Compra directa por Yappy / WhatsApp para evitar abandono de pasarelas */}
            <div className="pt-2 space-y-3">
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-brand-200"></div>
                <span className="flex-shrink mx-3 text-[10px] font-bold uppercase tracking-wider text-brand-400">
                  o paga sin tarjeta bancaria
                </span>
                <div className="flex-grow border-t border-brand-200"></div>
              </div>

              {/* Botón Yappy / WhatsApp mejorado */}
              <a
                href={generateWhatsAppMessage()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full bg-[#005CE6] hover:bg-[#0052cc] text-white font-black text-sm normal-case tracking-normal py-4 px-5 rounded-xl shadow-lg transition-all flex flex-col items-center justify-center gap-2 group hover:shadow-xl hover:scale-[1.01] active:scale-100"
              >
                {/* Row: Yappy badge + WhatsApp icon */}
                <div className="flex items-center gap-3">
                  <YappyBadge />
                  <span className="text-white/40 text-lg font-light">+</span>
                  {/* WhatsApp SVG */}
                  <div className="flex items-center gap-1.5 bg-[#25D366] px-2.5 py-1 rounded-md">
                    <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                      <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.821.487 3.532 1.338 5.017L2.01 22l5.123-1.32A9.96 9.96 0 0012 22c5.523 0 10-4.478 10-10S17.523 2 12 2zm0 18.18a8.147 8.147 0 01-4.16-1.143l-.298-.177-3.039.783.81-2.96-.195-.306A8.177 8.177 0 013.82 12c0-4.508 3.671-8.18 8.18-8.18 4.508 0 8.18 3.672 8.18 8.18 0 4.509-3.672 8.18-8.18 8.18z"/>
                    </svg>
                    <span className="text-white font-black text-sm">WhatsApp</span>
                  </div>
                </div>
                <span className="text-white/90 text-xs font-semibold normal-case">
                  Pago inmediato sin formularios • {YAPPY.numero} ({YAPPY.titular})
                </span>
              </a>
            </div>

            {/* TRUST BADGES: Garantía, Envío, Beneficios de conversión */}
            <div className="pt-4 border-t border-brand-100 space-y-3">
              <p className="text-[10px] font-black text-brand-500 uppercase tracking-widest text-center">¿Por qué comprar en starTAP?</p>

              <div className="grid grid-cols-1 gap-2">
                {/* Garantía 90 días */}
                <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-emerald-900">Garantía de 90 días</p>
                    <p className="text-[11px] text-emerald-700">Si tu dispositivo NFC falla, lo reponemos sin costo. Sin letra pequeña.</p>
                  </div>
                </div>

                {/* Envío a todo Panamá */}
                <div className="flex items-start gap-3 bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <Truck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-blue-900">Envío a todo Panamá</p>
                    <p className="text-[11px] text-blue-700">Despachamos a todas las provincias por Uno Express y Servientrega. Gratis desde \$50.</p>
                  </div>
                </div>

                {/* Chip programado gratis */}
                <div className="flex items-start gap-3 bg-amber-50 border border-amber-200 rounded-lg p-3">
                  <Zap className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-amber-900">Chip NFC configurado de fábrica</p>
                    <p className="text-[11px] text-amber-700">Llega listo para usarse. Solo acerca un celular y funciona al instante.</p>
                  </div>
                </div>

                {/* Cambio de destino sin costo */}
                <div className="flex items-start gap-3 bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <Smartphone className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-purple-900">Cambia el destino cuando quieras</p>
                    <p className="text-[11px] text-purple-700">Actualiza el link de tu tarjeta desde el panel sin reprogramar el chip.</p>
                  </div>
                </div>
              </div>

              {/* Sello de seguridad */}
              <div className="flex items-center justify-center gap-2 text-[10px] text-brand-400 pt-1">
                <Lock className="w-3 h-3" />
                <span>Compra segura • Empresa registrada en Panamá (DataKorex)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
