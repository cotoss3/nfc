'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { dbLocal } from '@/lib/db';
import { ShieldCheck, Check, Info, CreditCard } from 'lucide-react';
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
  const [shippingMethod, setShippingMethod] = useState<'uno' | 'servi' | 'local' | 'office'>('local');
  const [paymentMethod, setPaymentMethod] = useState<'tarjeta' | 'yappy'>('tarjeta');

  // Credit Card Simulation
  const [cardNumber, setCardNumber] = useState('');
  const [cardName, setCardName] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  // Yappy Simulation
  const [yappyRef, setYappyRef] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && cart.length === 0 && !isSuccess) {
      router.push('/shop');
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

  const getShippingCost = () => {
    switch (shippingMethod) {
      case 'uno': return 6.50;
      case 'servi': return 7.50;
      case 'local': return 3.75;
      case 'office': return 3.00;
    }
  };

  const getGrandTotal = () => {
    return getCartTotal() + getShippingCost();
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !phone || !address || !district) {
      alert('Por favor completa todos los campos del envío');
      return;
    }

    if (paymentMethod === 'tarjeta' && (!cardNumber || !cardExpiry || !cardCvv)) {
      alert('Por favor completa los detalles de tu tarjeta de crédito');
      return;
    }

    if (paymentMethod === 'yappy' && !yappyRef) {
      alert('Por favor ingresa el número de referencia de tu pago en Yappy');
      return;
    }

    setIsProcessing(true);

    setTimeout(() => {
      // Create order
      dbLocal.createOrder({
        customer_name: name,
        customer_email: email,
        customer_phone: phone,
        shipping_province: province,
        shipping_district: district,
        shipping_address: address,
        payment_method: paymentMethod,
        payment_status: 'completed',
        status: 'pending',
        total: getGrandTotal(),
        items: cart
      });

      sessionStorage.setItem('current_user_email', email);
      sessionStorage.setItem('current_user_name', name);

      setIsProcessing(false);
      setIsSuccess(true);
      
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });

      clearCart();
      setTimeout(() => {
        router.push(`/dashboard?email=${encodeURIComponent(email)}`);
      }, 3000);
    }, 2000);
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
            <h1 className="text-xl font-bold uppercase tracking-wider text-brand-950">¡Pago Exitoso!</h1>
            <p className="text-xs text-brand-500 leading-relaxed">
              Tu pedido ha sido registrado correctamente. Recibirás un correo electrónico de confirmación de tu compra.
            </p>
            <p className="text-[10px] text-brand-400">
              Redirigiendo a tu portal para configurar los enlaces NFC de tus productos...
            </p>
          </div>
        </div>
      ) : (
        /* Shopify style two-column checkout screen */
        <div className="grid grid-cols-1 lg:grid-cols-12 min-h-screen max-w-7xl mx-auto border-x border-brand-200">
          
          {/* Left Column: Form details */}
          <div className="lg:col-span-7 p-6 sm:p-10 space-y-10 bg-white">
            
            {/* Header info */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold tracking-widest text-brand-400 uppercase block">PanaCards Checkout</span>
              <h1 className="text-xl font-extrabold text-brand-950 uppercase tracking-wide">Paso de Pago Seguro</h1>
            </div>

            <form onSubmit={handlePayment} className="space-y-8">
              
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
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setShippingMethod('local')}
                    className={`p-4 border rounded text-left flex justify-between items-start transition-all ${
                      shippingMethod === 'local' ? 'border-brand-950 bg-brand-50' : 'border-brand-200 hover:bg-brand-50 bg-white'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs uppercase tracking-wide block text-brand-900">Panamá Centro</span>
                      <span className="text-[10px] text-brand-400">Oficina o Residencia (1-2 días)</span>
                    </div>
                    <span className="font-black text-xs text-brand-950">$3.75</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShippingMethod('uno')}
                    className={`p-4 border rounded text-left flex justify-between items-start transition-all ${
                      shippingMethod === 'uno' ? 'border-brand-950 bg-brand-50' : 'border-brand-200 hover:bg-brand-50 bg-white'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs uppercase tracking-wide block text-brand-900">Uno Express</span>
                      <span className="text-[10px] text-brand-400">Retiro en Sucursal Interior</span>
                    </div>
                    <span className="font-black text-xs text-brand-950">$6.50</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShippingMethod('servi')}
                    className={`p-4 border rounded text-left flex justify-between items-start transition-all ${
                      shippingMethod === 'servi' ? 'border-brand-950 bg-brand-50' : 'border-brand-200 hover:bg-brand-50 bg-white'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs uppercase tracking-wide block text-brand-900">Servientrega</span>
                      <span className="text-[10px] text-brand-400">A Domicilio en Provincias</span>
                    </div>
                    <span className="font-black text-xs text-brand-950">$7.50</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShippingMethod('office')}
                    className={`p-4 border rounded text-left flex justify-between items-start transition-all ${
                      shippingMethod === 'office' ? 'border-brand-950 bg-brand-50' : 'border-brand-200 hover:bg-brand-50 bg-white'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-xs uppercase tracking-wide block text-brand-900">Retiro Oficina</span>
                      <span className="text-[10px] text-brand-400">San Francisco, Panamá</span>
                    </div>
                    <span className="font-black text-xs text-brand-950">$3.00</span>
                  </button>
                </div>
              </div>

              {/* Payment details options */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-brand-950 border-b border-brand-100 pb-2">Método de Pago</h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('tarjeta')}
                    className={`p-4 border rounded flex items-center justify-center space-x-2 font-bold text-xs uppercase tracking-wider transition-all ${
                      paymentMethod === 'tarjeta' ? 'border-brand-950 bg-brand-50 text-brand-950' : 'border-brand-200 text-brand-500 hover:bg-brand-50 bg-white'
                    }`}
                  >
                    <CreditCard className="h-4 w-4" />
                    <span>Tarjeta Crédito</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('yappy')}
                    className={`p-4 border rounded flex items-center justify-center space-x-2 font-bold text-xs uppercase tracking-wider transition-all ${
                      paymentMethod === 'yappy' ? 'border-brand-950 bg-brand-50 text-brand-950' : 'border-brand-200 text-brand-500 hover:bg-brand-50 bg-white'
                    }`}
                  >
                    <span>⚡</span>
                    <span>Yappy Comercial</span>
                  </button>
                </div>

                {/* Card input forms */}
                {paymentMethod === 'tarjeta' && (
                  <div className="bg-brand-50 p-4 border border-brand-200 rounded space-y-3">
                    <div className="flex items-center space-x-2 text-[10px] text-brand-400 mb-2">
                      <ShieldCheck className="h-4.5 w-4.5 text-accent-600" />
                      <span>Pasarela PagueloFacil Simulada - Tarjetas de prueba aceptadas</span>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-brand-500 uppercase tracking-wider">Nombre del Tarjetahabiente</label>
                      <input
                        type="text"
                        placeholder="Carlos Mendoza"
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        className="w-full px-3 py-2 border border-brand-300 rounded bg-white text-xs outline-none focus:border-brand-950"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-brand-500 uppercase tracking-wider">Número de Tarjeta</label>
                      <input
                        type="text"
                        placeholder="4000 1234 5678 9010"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full px-3 py-2 border border-brand-300 rounded bg-white text-xs outline-none focus:border-brand-950"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-brand-500 uppercase tracking-wider">Vencimiento</label>
                        <input
                          type="text"
                          placeholder="MM/AA"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full px-3 py-2 border border-brand-300 rounded bg-white text-xs outline-none focus:border-brand-950"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-brand-500 uppercase tracking-wider">CVV</label>
                        <input
                          type="password"
                          placeholder="•••"
                          maxLength={3}
                          value={cardCvv}
                          onChange={(e) => setCardCvv(e.target.value)}
                          className="w-full px-3 py-2 border border-brand-300 rounded bg-white text-xs outline-none focus:border-brand-950"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Yappy Steps instructions */}
                {paymentMethod === 'yappy' && (
                  <div className="bg-brand-50 p-4 border border-brand-200 rounded space-y-4">
                    <div className="flex items-start space-x-2 text-[10px] text-brand-500 bg-white p-2.5 rounded border border-brand-200">
                      <Info className="h-4 w-4 text-brand-500 flex-shrink-0 mt-0.5" />
                      <span>
                        Envía el total de tu pedido a través de tu aplicación móvil de Banco General (Yappy).
                      </span>
                    </div>

                    <div className="text-center py-2 space-y-0.5 border border-brand-200 bg-white rounded">
                      <p className="text-[8px] text-brand-400 uppercase tracking-widest font-bold">Directorio Yappy</p>
                      <p className="text-base font-black text-brand-950 font-mono">@panacards</p>
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
            </form>
          </div>

          {/* Right Column: Order items summary (Classic Shopify split layout) */}
          <div className="lg:col-span-5 p-6 sm:p-10 bg-brand-100 space-y-8 border-t lg:border-t-0 lg:border-l border-brand-200">
            <h2 className="text-xs font-bold uppercase tracking-widest text-brand-950 border-b border-brand-200 pb-3">Resumen de tu Pedido</h2>
            
            {/* List items */}
            <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
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
                      <span className="text-[9px] text-brand-400 block truncate">{item.selected_color} • {item.business_name}</span>
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
                <span>Envío ({shippingMethod === 'office' ? 'Retiro en oficina' : 'Provincial'})</span>
                <span className="font-semibold text-brand-950">${getShippingCost().toFixed(2)}</span>
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
              onClick={handlePayment}
              type="submit"
              disabled={isProcessing}
              className="w-full shopify-btn-primary uppercase tracking-widest text-xs font-bold py-4.5 disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></span>
                  <span>Procesando pago seguro...</span>
                </>
              ) : (
                <span>Confirmar Pago • ${getGrandTotal().toFixed(2)}</span>
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
