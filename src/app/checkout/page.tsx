'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { dbLocal } from '@/lib/db';
import { ShieldCheck, Check, CheckCircle2, Info, CreditCard, AlertCircle, Lock, Truck } from 'lucide-react';
import {
  SHIPPING_METHODS,
  calculateShippingCost,
  qualifiesForFreeShipping,
  amountMissingForFreeShipping,
  FREE_SHIPPING_THRESHOLD,
  YAPPY,
  type ShippingMethodId,
} from '@/config/shipping';
import confetti from 'canvas-confetti';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, getCartTotal, clearCart } = useCart();

  // Shipping details states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [province, setProvince] = useState('Panamá');
  const [district, setDistrict] = useState('');
  const [address, setAddress] = useState('');
  const [shippingMethod, setShippingMethod] = useState<ShippingMethodId>('local');
  const [paymentMethod, setPaymentMethod] = useState<'tarjeta' | 'yappy'>('tarjeta');

  // Yappy Reference State
  const [yappyRef, setYappyRef] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const status = params.get('status');
      if (status === 'success') {
        const orderId = params.get('order');
        if (orderId) {
          dbLocal.updateOrderPaymentStatus(orderId, 'completed');
        }
        setIsSuccess(true);
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 }
        });
        clearCart();
      } else if (status === 'failed') {
        const reason = params.get('reason') || 'El pago no pudo ser completado. Inténtalo nuevamente.';
        setErrorMessage(reason);
      }
    }
  }, []);

  useEffect(() => {
    if (mounted && cart.length === 0 && !isSuccess) {
      router.push('/catalogo');
    }
  }, [cart, isSuccess, router, mounted]);

  if (!mounted) {
    return (
      <div className="max-w-md mx-auto py-24 text-center text-xs text-brand-400 uppercase tracking-widest">
        Cargando checkout...
      </div>
    );
  }

  const provincesPanama = [
    'Panamá',
    'Panamá Oeste',
    'Colón',
    'Chiriquí',
    'Coclé',
    'Herrera',
    'Los Santos',
    'Veraguas',
    'Bocas del Toro',
    'Darién'
  ];

  const isPackInCart = cart.some(
    (item) =>
      item.product_id === 'pack-trio-comercial' ||
      item.product_id === 'pack-trio' ||
      item.product_name.toLowerCase().includes('pack')
  );

  const getShippingCost = () =>
    calculateShippingCost(getCartTotal(), shippingMethod, isPackInCart);

  const envioGratis = isPackInCart || qualifiesForFreeShipping(getCartTotal());

  const getGrandTotal = () => {
    return getCartTotal() + getShippingCost();
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name || !email || !phone || !address || !district) {
      alert('Por favor completa todos los campos de información de envío');
      return;
    }

    if (paymentMethod === 'yappy' && !yappyRef) {
      alert('Por favor ingresa el número de referencia de tu pago en Yappy');
      return;
    }

    setIsProcessing(true);

    const orderNumber = `STP-${Date.now().toString().slice(-8)}`;

    // El pedido se registra SIEMPRE como pendiente de pago.
    // Solo Tilopay (tarjeta) o la verificación manual (Yappy) lo marcan pagado.
    const baseOrder = {
      customer_name: name,
      customer_email: email,
      customer_phone: phone,
      shipping_province: province,
      shipping_district: district,
      shipping_address: address,
      payment_method: paymentMethod,
      payment_status: 'pending' as const,
      status: 'pending' as const,
      total: getGrandTotal(),
      items: cart,
    };

    try {
      if (paymentMethod === 'tarjeta') {
        // Tarjeta: se paga en la pasarela de Tilopay, nunca en este sitio.
        dbLocal.createOrder({ ...baseOrder, id: orderNumber } as any);
        sessionStorage.setItem('current_user_email', email);
        sessionStorage.setItem('current_user_name', name);

        const res = await fetch('/api/tilopay/process', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderNumber,
            name,
            email,
            phone,
            province,
            district,
            address,
            shippingMethod,
            items: cart.map((i) => ({
              product_id: i.product_id,
              quantity: i.quantity,
              has_custom_logo: i.has_custom_logo,
              has_qr_code: i.has_qr_code,
            })),
            total: getGrandTotal(),
          }),
        });

        const data = await res.json();

        if (!res.ok || !data.success || !data.redirectUrl) {
          throw new Error(data.error || 'No pudimos iniciar el pago con tarjeta. Intenta de nuevo o paga con Yappy.');
        }

        // Fuera del sitio: el cliente escribe su tarjeta en Tilopay, no aquí.
        window.location.href = data.redirectUrl;
        return;
      }

      // Yappy: queda pendiente hasta que confirmes el pago manualmente.
      dbLocal.createOrder({ ...baseOrder, id: orderNumber, yappy_reference: yappyRef } as any);
      sessionStorage.setItem('current_user_email', email);
      sessionStorage.setItem('current_user_name', name);

      setIsProcessing(false);
      setIsSuccess(true);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      clearCart();
      setTimeout(() => {
        router.push(`/dashboard?email=${encodeURIComponent(email)}`);
      }, 3000);
    } catch (err: any) {
      console.error('[CHECKOUT_ERROR]', err);
      setErrorMessage(err.message || 'Ocurrió un error al procesar tu pedido.');
      setIsProcessing(false);
    }
  };

  if (cart.length === 0 && !isSuccess) return null;

  return (
    <div className="bg-brand-50 min-h-screen">
      {isSuccess ? (
        <div className="max-w-md mx-auto text-center space-y-6 py-32 px-4">
          <div className="w-16 h-16 bg-accent-50 rounded-full flex items-center justify-center mx-auto text-accent-600 border border-accent-100">
            <Check className="h-8 w-8" />
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-bold uppercase tracking-wider text-brand-950">
              {paymentMethod === 'yappy' ? '¡Pedido recibido!' : '¡Pago exitoso!'}
            </h1>
            <p className="text-xs text-brand-500 leading-relaxed">
              {paymentMethod === 'yappy'
                ? `Registramos tu pedido con la referencia de Yappy. Verificamos el pago al ${YAPPY.numero} y te confirmamos por WhatsApp.`
                : 'Tu pago fue procesado correctamente. Recibirás un correo de confirmación.'}
            </p>
            <p className="text-[10px] text-brand-400">
              Redirigiendo a tu portal para configurar los enlaces NFC de tus productos...
            </p>
          </div>
        </div>
      ) : (
        /* Shopify style two-column checkout screen */
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen max-w-7xl mx-auto border-x border-brand-200">
          
          {/* Left Column: Shipping details & Options */}
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-10 bg-white">
            
            {/* Header info */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-widest text-brand-400 uppercase block">StarTAP Panamá</span>
              <h1 className="text-xl font-extrabold text-brand-950 uppercase tracking-wide">Paso de Pago Seguro</h1>
            </div>

            {errorMessage && (
              <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded text-xs flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold">Error en la transacción</p>
                  <p className="text-[11px]">{errorMessage}</p>
                </div>
              </div>
            )}

            <form id="checkout-form" onSubmit={handlePayment} className="space-y-8">
              
              {/* Shipping Form */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-950 border-b border-brand-100 pb-2">Información del Envío</h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">Nombre Completo</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Carlos Mendoza"
                      className="shopify-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">Correo del Negocio</label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="carlos@correo.com"
                      className="shopify-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">Teléfono Celular (WhatsApp)</label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="6523-9821"
                      className="shopify-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">Provincia</label>
                    <select
                      value={province}
                      onChange={(e) => setProvince(e.target.value)}
                      className="shopify-input bg-white"
                    >
                      {provincesPanama.map((prov) => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">Distrito / Corregimiento / Localidad</label>
                    <input
                      type="text"
                      required
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      placeholder="Ej. San Francisco / Vía Porras"
                      className="shopify-input"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-brand-500 uppercase tracking-wider">Dirección Exacta (Local, Edificio, Apartamento)</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Edificio Sunset Place, Piso 4, Apto 4B"
                      className="shopify-input"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Options */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-950 border-b border-brand-100 pb-2">Método de Envío</h3>

                {envioGratis && (
                  <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3 rounded text-xs flex items-center space-x-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                    <span className="font-bold">
                      {isPackInCart
                        ? '¡Envío gratis a todo Panamá incluido en tu pack!'
                        : `¡Envío gratis! Tu pedido supera los $${FREE_SHIPPING_THRESHOLD}.`}
                    </span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SHIPPING_METHODS.map((m) => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setShippingMethod(m.id)}
                      aria-pressed={shippingMethod === m.id}
                      className={`p-4 border rounded text-left flex justify-between items-start transition-all ${
                        shippingMethod === m.id
                          ? 'border-brand-950 bg-brand-50'
                          : 'border-brand-200 hover:bg-brand-50 bg-white'
                      }`}
                    >
                      <div>
                        <span className="font-bold text-xs uppercase tracking-wide block text-brand-900">
                          {m.label}
                        </span>
                        <span className="text-[10px] text-brand-400">{m.detail}</span>
                      </div>
                      <span className="font-black text-xs text-brand-950">
                        {envioGratis ? '$0.00' : `$${m.cost.toFixed(2)}`}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </form>
          </div>

          {/* Right Column: Payment Methods & Order Summary */}
          <div className="lg:col-span-5 p-6 sm:p-10 bg-brand-100 space-y-8 border-t lg:border-t-0 lg:border-l border-brand-200">
            
            {/* PAYMENT METHODS SECTION (POSITIONED ABOVE ORDER SUMMARY) */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-950 border-b border-brand-200 pb-2">Método de Pago</h3>
              
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('tarjeta')}
                  className={`p-4 border rounded flex items-center justify-center space-x-2 font-bold text-xs uppercase tracking-wider transition-all ${
                    paymentMethod === 'tarjeta' ? 'border-brand-950 bg-white text-brand-950 shadow-sm' : 'border-brand-200 text-brand-500 hover:bg-white bg-brand-50'
                  }`}
                >
                  <CreditCard className="h-4 w-4" />
                  <span>Tarjeta</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('yappy')}
                  className={`p-4 border rounded flex items-center justify-center space-x-2 font-bold text-xs uppercase tracking-wider transition-all ${
                    paymentMethod === 'yappy' ? 'border-brand-950 bg-white text-brand-950 shadow-sm' : 'border-brand-200 text-brand-500 hover:bg-white bg-brand-50'
                  }`}
                >
                  <span>⚡</span>
                  <span>Yappy</span>
                </button>
              </div>

              {/* Tarjeta: el pago ocurre en la pasarela de Tilopay, no en este sitio */}
              {paymentMethod === 'tarjeta' && (
                <div className="bg-white p-4 border border-brand-200 rounded space-y-3 shadow-sm">
                  <div className="flex items-center space-x-2 text-[10px] text-brand-500">
                    <Lock className="h-3.5 w-3.5 text-accent-600" />
                    <span className="font-semibold">Pago seguro con Tilopay (Visa / Mastercard)</span>
                  </div>
                  <p className="text-[11px] text-brand-600 leading-relaxed">
                    Al confirmar te llevamos a la pasarela segura de Tilopay para que ingreses los
                    datos de tu tarjeta. Nosotros nunca vemos ni guardamos tu número de tarjeta.
                  </p>
                  <div className="flex items-start space-x-2 text-[10px] text-brand-500 bg-brand-50 p-2.5 rounded border border-brand-200">
                    <ShieldCheck className="h-4 w-4 text-accent-600 flex-shrink-0 mt-0.5" />
                    <span>Al terminar el pago vuelves automáticamente a starTAP con tu comprobante.</span>
                  </div>
                </div>
              )}

              {/* Yappy Steps instructions */}
              {paymentMethod === 'yappy' && (
                <div className="bg-white p-4 border border-brand-200 rounded space-y-4 shadow-sm">
                  <div className="flex items-start space-x-2 text-[10px] text-brand-500 bg-brand-50 p-2.5 rounded border border-brand-200">
                    <Info className="h-4 w-4 text-brand-500 flex-shrink-0 mt-0.5" />
                    <span>
                      Envía el total de tu pedido por Yappy al <strong>{YAPPY.numero}</strong> ({YAPPY.titular})
                      y pega abajo el número de referencia. Verificamos el pago y te confirmamos por WhatsApp.
                    </span>
                  </div>

                  <div className="text-center py-2 space-y-0.5 border border-brand-200 bg-brand-50 rounded">
                    <p className="text-[8px] text-brand-400 uppercase tracking-widest font-bold">Yappy</p>
                    <p className="text-base font-black text-brand-950 font-mono">{YAPPY.numero}</p>
                    <p className="text-[11px] font-bold text-brand-700">{YAPPY.titular}</p>
                    <p className="text-xs font-bold text-brand-500">Monto total: ${getGrandTotal().toFixed(2)}</p>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="yappyRef" className="text-xs font-bold text-brand-900 block mb-1">Número de Referencia (Yappy)</label>
                    <input
                      type="text"
                      id="yappyRef"
                      value={yappyRef}
                      onChange={(e) => setYappyRef(e.target.value)}
                      placeholder="Ej: Y-568213"
                      className="shopify-input"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* ORDER SUMMARY SECTION */}
            <div className="space-y-6 pt-4 border-t border-brand-200">
              <h2 className="text-xs font-bold uppercase tracking-widest text-brand-950 border-b border-brand-200 pb-3">Resumen de tu Pedido</h2>
              
              {/* List items */}
              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center text-xs gap-3">
                    <div className="flex items-center space-x-3 truncate">
                      <div className="w-10 h-10 bg-brand-200 rounded flex items-center justify-center font-bold text-[8px] flex-shrink-0 text-brand-700 relative">
                        NFC
                        <span className="absolute -top-1.5 -right-1.5 bg-brand-850 text-white rounded-full text-[9px] w-4.5 h-4.5 flex items-center justify-center font-bold">
                          {item.quantity}
                        </span>
                      </div>
                      <div className="truncate">
                        <span className="font-bold text-brand-950 uppercase tracking-wide block truncate">{item.product_name}</span>
                        <span className="text-[9px] text-brand-400 block truncate">
                          {item.selected_color} • {item.business_name}
                          {item.has_custom_logo ? ' • Logo (+ $5)' : ''}
                          {item.has_qr_code ? ' • QR (+ $3)' : ''}
                        </span>
                      </div>
                    </div>
                    <span className="font-black text-brand-950 flex-shrink-0">${(item.price * item.quantity).toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <hr className="border-brand-200" />

              {/* Calculations lines */}
              <div className="space-y-2 text-xs text-brand-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-brand-950">${getCartTotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>
                    Envío
                    {isPackInCart
                      ? ' (incluido en el pack)'
                      : qualifiesForFreeShipping(getCartTotal())
                      ? ` (gratis sobre $${FREE_SHIPPING_THRESHOLD})`
                      : ` (${SHIPPING_METHODS.find((m) => m.id === shippingMethod)?.label})`}
                  </span>
                  <span className="font-semibold text-brand-950">
                    {envioGratis ? (
                      <span className="text-emerald-600 font-bold uppercase">Gratis</span>
                    ) : (
                      `$${getShippingCost().toFixed(2)}`
                    )}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Programación y Ruteo</span>
                  <span className="text-accent-600 font-bold uppercase">Gratuito</span>
                </div>
              </div>

              <hr className="border-brand-200" />

              <div className="flex justify-between items-baseline">
                <span className="font-bold text-xs uppercase tracking-wider text-brand-950">Total Final</span>
                <span className="text-2xl font-black text-brand-950">${getGrandTotal().toFixed(2)}</span>
              </div>

              <button
                form="checkout-form"
                type="submit"
                disabled={isProcessing}
                className="w-full shopify-btn-primary uppercase tracking-widest text-xs font-bold py-4.5 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle"></span>
                    <span>
                      {paymentMethod === 'tarjeta' ? 'Redirigiendo a Tilopay...' : 'Registrando tu pedido...'}
                    </span>
                  </>
                ) : (
                  <span>
                    {paymentMethod === 'tarjeta' ? 'Pagar con tarjeta' : 'Confirmar pedido'} • $
                    {getGrandTotal().toFixed(2)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
