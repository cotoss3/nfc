'use client';

import React from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getItemCount } = useCart();

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
                      <p>Grabado: <span className="font-bold text-brand-800 uppercase">{item.business_name}</span></p>
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
            
            <div className="space-y-3 text-xs text-brand-500">
              <div className="flex justify-between">
                <span>Cantidad Total</span>
                <span className="font-semibold text-brand-950">{getItemCount()} artículos</span>
              </div>
              <div className="flex justify-between">
                <span>Grabado Digital Láser</span>
                <span className="text-accent-600 font-bold uppercase">Gratuito</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span className="font-semibold text-brand-950">Calculado al checkout</span>
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
              Completar Compra
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
