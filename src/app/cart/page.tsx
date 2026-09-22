'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { PRODUCTS } from '@/config/products';
import {
  FREE_SHIPPING_THRESHOLD,
  amountMissingForFreeShipping,
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
  Lock,
  ChevronLeft,
  ChevronRight,
  Plus,
  Minus,
  FileText
} from 'lucide-react';

function YappyBadge() {
  return (
    <Image
      src="/logos/yappy-logo.png"
      alt="Pagar con Yappy"
      width={95}
      height={24}
      className="h-6 w-auto object-contain"
      priority
    />
  );
}

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getItemCount } = useCart();

  const faltaParaGratis = amountMissingForFreeShipping(getCartTotal());
  const progresoGratis = Math.min(100, (getCartTotal() / FREE_SHIPPING_THRESHOLD) * 100);
  const [mounted, setMounted] = useState(false);
  const [orderNotes, setOrderNotes] = useState('');
  const [showNotes, setShowNotes] = useState(false);

  const whatsappNumber = '50764839004';

  const generateWhatsAppMessage = () => {
    const itemsList = cart.map(item => {
      const extras = [
        item.has_custom_logo ? 'Logo personalizado' : '',
        item.has_qr_code ? 'Código QR' : '',
        item.selected_color ? `Acabado: ${item.selected_color}` : ''
      ].filter(Boolean).join(', ');

      const extrasText = extras ? ` (${extras})` : '';
      return `- ${item.quantity}x ${item.product_name}${extrasText} : $${(item.price * item.quantity).toFixed(2)}`;
    }).join('\n');

    const envio = faltaParaGratis > 0 ? 'Por coordinar' : 'GRATIS (pedido mayor a $50)';

    const lines = [
      'Hola starTAP Panamá, quiero realizar mi pedido por Yappy / WhatsApp.',
      '',
      '*DETALLES DEL PEDIDO:*',
      itemsList,
      '',
      `*SUBTOTAL:* $${getCartTotal().toFixed(2)} USD`,
      `*ENVÍO:* ${envio}`,
      '*GARANTÍA:* 90 días incluida',
      orderNotes ? `*NOTAS:* ${orderNotes}` : '',
      '',
      'Por favor confirmarme cómo transferir por Yappy para despachar mi orden. ¡Gracias!'
    ].filter(Boolean);

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="animate-spin h-6 w-6 border-2 border-slate-900 border-t-transparent rounded-full"></span>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Cargando carrito...</p>
        </div>
      </div>
    );
  }

  // Complementary cross-sell products from PRODUCTS not currently in cart
  const crossSellProducts = PRODUCTS.filter(
    p => !cart.some(item => item.product_id === p.id || p.aliases?.includes(item.product_id))
  ).slice(0, 3);

  if (cart.length === 0) {
    return (
      <div className="min-h-[75vh] bg-slate-50/60 flex items-center justify-center px-4 py-16">
        <div className="max-w-lg w-full bg-white border border-slate-200/90 rounded-3xl p-8 sm:p-12 text-center shadow-sm space-y-6">
          <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-500 shadow-xs">
            <ShoppingBag className="h-8 w-8 stroke-[1.5]" />
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-slate-900">Tu carrito está vacío</h1>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              Aún no has agregado placas o tarjetas inteligentes NFC a tu pedido. Explora nuestro catálogo y empieza a capturar reseñas para tu negocio.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/catalogo"
              className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-8 py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <span>Explorar Catálogo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/60 pb-20 pt-6 sm:pt-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Navigation & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <Link
              href="/catalogo"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors mb-2"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Seguir comprando</span>
            </Link>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">Tu Carrito</h1>
              <span className="text-xs font-bold px-2.5 py-1 bg-slate-200 text-slate-800 rounded-full">
                {getItemCount()} {getItemCount() === 1 ? 'artículo' : 'artículos'}
              </span>
            </div>
          </div>

          <a
            href={`https://wa.me/${whatsappNumber}?text=${encodeURIComponent('Hola starTAP, tengo una consulta sobre los productos en mi carrito.')}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 hover:text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-3.5 py-2 rounded-xl transition self-start sm:self-auto"
          >
            <MessageCircle className="w-4 h-4" />
            <span>¿Dudas con tu pedido? WhatsApp</span>
          </a>
        </div>

        {/* Free Shipping Progress Card (Shopify OS 2.0 style) */}
        <div className="bg-white border border-slate-200/80 rounded-2xl p-4 sm:p-5 shadow-xs mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
              faltaParaGratis <= 0 ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-50 text-blue-600'
            }`}>
              <Truck className="w-5 h-5" />
            </div>
            <div>
              {faltaParaGratis > 0 ? (
                <p className="text-xs sm:text-sm font-semibold text-slate-800">
                  Estás a solo <strong className="text-blue-600 font-extrabold">${faltaParaGratis.toFixed(2)}</strong> de tener <strong className="text-slate-950 font-bold">Envío Gratis</strong> en todo Panamá.
                </p>
              ) : (
                <p className="text-xs sm:text-sm font-bold text-emerald-800 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 inline" />
                  <span>¡Felicidades! Calificas para <strong>Envío Gratis</strong> a todo Panamá.</span>
                </p>
              )}
              <p className="text-[11px] text-slate-400 mt-0.5">
                Envío gratuito aplicable en compras de ${FREE_SHIPPING_THRESHOLD}.00 o más.
              </p>
            </div>
          </div>

          <div className="w-full sm:w-56 space-y-1">
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>$0</span>
              <span>${FREE_SHIPPING_THRESHOLD}</span>
            </div>
            <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  faltaParaGratis <= 0 ? 'bg-emerald-500' : 'bg-blue-600'
                }`}
                style={{ width: `${progresoGratis}%` }}
              />
            </div>
          </div>
        </div>

        {/* Main Cart Grid (Shopify 2-column layout) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Items Table (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xs">
              {/* Desktop Table Header */}
              <div className="hidden sm:grid sm:grid-cols-12 gap-4 pb-4 border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <div className="sm:col-span-7">Producto</div>
                <div className="sm:col-span-3 text-center">Cantidad</div>
                <div className="sm:col-span-2 text-right">Total</div>
              </div>

              {/* Items List */}
              <div className="divide-y divide-slate-100">
                {cart.map((item) => {
                  const prod = PRODUCTS.find((p) => p.id === item.product_id || p.aliases?.includes(item.product_id));
                  const imgUrl = prod?.image || '/logos/startap-logo.webp';

                  return (
                    <div
                      key={item.id}
                      className="py-6 flex flex-col sm:grid sm:grid-cols-12 gap-4 sm:items-center first:pt-4 last:pb-0"
                    >
                      {/* Product Thumbnail & Details (Col 1-7) */}
                      <div className="sm:col-span-7 flex items-start gap-4">
                        <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border border-slate-200/80 bg-slate-50/50 p-2 flex-shrink-0 flex items-center justify-center">
                          <img
                            src={imgUrl}
                            alt={item.product_name}
                            className="w-full h-full object-contain"
                          />
                        </div>

                        <div className="space-y-1.5 flex-1 min-w-0">
                          <Link
                            href={`/catalogo/${item.product_id}`}
                            className="font-bold text-slate-900 text-sm hover:text-blue-600 transition block leading-snug"
                          >
                            {item.product_name}
                          </Link>

                          <div className="text-xs text-slate-500 font-medium">
                            ${item.price.toFixed(2)} c/u
                          </div>

                          {/* Variant & Customization Badges */}
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {item.selected_color && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                                Acabado: {item.selected_color}
                              </span>
                            )}
                            {item.business_name && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700">
                                Negocio: {item.business_name}
                              </span>
                            )}
                            {item.has_custom_logo && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                ✓ Logo (+ $5.00)
                              </span>
                            )}
                            {item.has_qr_code && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                                ✓ QR (+ $3.00)
                              </span>
                            )}
                            {item.initial_redirect_url && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-slate-50 text-slate-600 border border-slate-200/60 max-w-[200px] truncate">
                                🔗 {item.initial_redirect_url}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Quantity Stepper (Col 8-10) */}
                      <div className="sm:col-span-3 flex items-center justify-between sm:justify-center gap-3 pt-2 sm:pt-0">
                        <div className="inline-flex items-center border border-slate-200 rounded-full bg-slate-50/80 p-1 shadow-2xs">
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
                            aria-label="Disminuir cantidad"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="w-9 text-center font-bold text-xs text-slate-900">
                            {item.quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-7 h-7 rounded-full flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition-colors"
                            aria-label="Aumentar cantidad"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Mobile Delete Button */}
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="sm:hidden p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          aria-label="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Line Item Total & Desktop Delete (Col 11-12) */}
                      <div className="sm:col-span-2 flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0">
                        <span className="sm:hidden text-xs text-slate-500 font-medium">Subtotal:</span>
                        <div className="text-right">
                          <span className="font-extrabold text-slate-900 text-sm sm:text-base font-mono block">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.id)}
                          className="hidden sm:inline-flex p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors ml-1"
                          title="Eliminar de la orden"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Order Notes (Classic Shopify Feature) */}
              <div className="pt-6 border-t border-slate-100 mt-6">
                {!showNotes ? (
                  <button
                    type="button"
                    onClick={() => setShowNotes(true)}
                    className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>¿Instrucciones especiales para el grabado o entrega? Agregar nota</span>
                  </button>
                ) : (
                  <div className="space-y-2 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5" />
                        <span>Notas o requerimientos de tu pedido:</span>
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowNotes(false)}
                        className="text-[11px] text-slate-400 hover:text-slate-600"
                      >
                        Ocultar
                      </button>
                    </div>
                    <textarea
                      rows={2}
                      value={orderNotes}
                      onChange={(e) => setOrderNotes(e.target.value)}
                      placeholder="Ej: Colocar el logo centrado, o instrucciones sobre el local de entrega..."
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 outline-none focus:ring-1 focus:ring-slate-900 transition"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Guaranteed Trust Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Garantía 90 Días</h4>
                  <p className="text-[11px] text-slate-500 leading-snug">Reposición directa ante cualquier fallo del chip NFC.</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
                <Zap className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Listo para Usar</h4>
                  <p className="text-[11px] text-slate-500 leading-snug">Programado de fábrica para tu negocio sin apps extras.</p>
                </div>
              </div>

              <div className="bg-white border border-slate-200/80 rounded-2xl p-4 flex items-start gap-3 shadow-2xs">
                <Truck className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">Envíos Rápidos</h4>
                  <p className="text-[11px] text-slate-500 leading-snug">Despachos por Uno Express y Servientrega en Panamá.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Sticky Summary Sidebar (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="sticky top-28 bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <h2 className="text-base font-bold text-slate-900">Resumen de Compra</h2>
                <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                  {getItemCount()} artículos
                </span>
              </div>

              {/* Price Breakdown */}
              <div className="space-y-3 text-xs text-slate-600">
                <div className="flex justify-between items-center">
                  <span>Subtotal</span>
                  <span className="font-bold text-slate-900 font-mono">${getCartTotal().toFixed(2)} USD</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Envío a Panamá</span>
                  <span>
                    {faltaParaGratis <= 0 ? (
                      <span className="text-emerald-600 font-extrabold uppercase">Gratis</span>
                    ) : (
                      <span className="text-slate-500 font-medium">Calculado al pagar</span>
                    )}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Configuración del Chip</span>
                  <span className="text-slate-900 font-semibold">Incluida ($0.00)</span>
                </div>

                <div className="flex justify-between items-center">
                  <span>Soporte y Garantía 90d</span>
                  <span className="text-emerald-600 font-semibold">Incluida</span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-4 space-y-1">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-bold text-slate-900">Total Estimado</span>
                  <span className="text-2xl font-black text-slate-950 font-mono">
                    ${getCartTotal().toFixed(2)}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {faltaParaGratis <= 0 
                    ? '¡Envío gratis aplicado! No hay cargos sorpresa.' 
                    : 'Tarifa de envío ($3.50 en Ciudad / $6.50 Provincias) se selecciona en el siguiente paso.'}
                </p>
              </div>

              {/* Primary Action Button (Shopify Style) */}
              <div className="space-y-3 pt-2">
                <Link
                  href="/checkout"
                  className="w-full py-4 px-6 bg-slate-950 hover:bg-slate-900 text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group active:scale-[0.99]"
                >
                  <Lock className="w-4 h-4 text-slate-400 group-hover:text-white transition-colors" />
                  <span>Proceder al Pago</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>


              </div>

              {/* Security Sells & Accepted Payments */}
              <div className="pt-3 border-t border-slate-100 flex flex-col items-center justify-center gap-2 text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Aceptamos:</span>
                  <div className="flex items-center gap-1.5">
                    <Image
                      src="/logos/visa-logo.svg"
                      alt="Visa"
                      width={32}
                      height={20}
                      className="h-4 w-auto object-contain rounded shadow-2xs"
                    />
                    <Image
                      src="/logos/mastercard-logo.svg"
                      alt="Mastercard"
                      width={32}
                      height={20}
                      className="h-4 w-auto object-contain rounded shadow-2xs"
                    />
                    <Image
                      src="/logos/yappy-logo.png"
                      alt="Yappy"
                      width={55}
                      height={14}
                      className="h-3.5 w-auto object-contain ml-0.5"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1 text-[10px]">
                  <Lock className="w-3 h-3 text-slate-400" />
                  <span>Compra 100% Cifrada • starTAP Panamá</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Cross-Sell Recommendations Section (Shopify OS 2.0 Style) */}
        {crossSellProducts.length > 0 && (
          <div className="mt-16 pt-10 border-t border-slate-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                  Complementa tu pedido
                </h3>
                <p className="text-xs text-slate-500">
                  Agrega más puntos de contacto para tu negocio con tarifa combinada de envío.
                </p>
              </div>
              <Link
                href="/catalogo"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
              >
                <span>Ver catálogo completo</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {crossSellProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white border border-slate-200/90 rounded-3xl p-5 shadow-xs flex flex-col justify-between hover:border-slate-300 hover:shadow-sm transition-all group"
                >
                  <div className="space-y-3">
                    <div className="w-full h-40 rounded-2xl bg-slate-50 flex items-center justify-center p-3 relative overflow-hidden">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      />
                      <span className="absolute top-2 left-2 text-[9px] font-bold text-slate-700 bg-white/90 px-2 py-0.5 rounded-full border border-slate-200">
                        {product.badge}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-slate-900 text-sm line-clamp-1">
                        {product.name}
                      </h4>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-1">
                        {product.description}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 flex items-center justify-between mt-3 border-t border-slate-100">
                    <span className="text-sm font-extrabold text-slate-900 font-mono">
                      {product.priceFormatted}
                    </span>
                    <Link
                      href={`/catalogo/${product.id}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-900 text-xs font-bold rounded-lg transition"
                    >
                      <span>Ver detalles</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
