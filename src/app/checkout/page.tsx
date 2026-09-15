'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { dbLocal } from '@/lib/db';
import Link from 'next/link';
import {
  ShieldCheck,
  Check,
  CheckCircle2,
  Info,
  CreditCard,
  AlertCircle,
  Lock,
  Truck,
  ArrowRight,
  BookOpen,
  MessageCircle,
  Settings,
  ExternalLink,
  Package,
  Mail,
  Sparkles,
  ChevronRight,
  ShoppingBag,
} from 'lucide-react';
import {
  SHIPPING_METHODS,
  calculateShippingCost,
  qualifiesForFreeShipping,
  amountMissingForFreeShipping,
  FREE_SHIPPING_THRESHOLD,
  YAPPY,
  validateCoupon,
  applyShippingCoupon,
  type Coupon,
  type ShippingMethodId,
} from '@/config/shipping';
import { PRODUCTS } from '@/config/products';
import confetti from 'canvas-confetti';
import { track, itemsParaMeta } from '@/lib/fbpixel';
import { trackTikTok, itemsParaTikTok } from '@/lib/tiktokpixel';
import TilopayCardForm, { type TilopayCardFormHandle } from '@/components/checkout/TilopayCardForm';

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


  // Coupon State
  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponSuccess, setCouponSuccess] = useState('');
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  const [mounted, setMounted] = useState(false);

  // El formulario de tarjeta del SDK de Tilopay vive en esta pagina.
  const tarjetaRef = useRef<TilopayCardFormHandle>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const status = params.get('status');
      if (status === 'success') {
        const orderId = params.get('order');
        // El carrito todavia no esta hidratado aqui, asi que los datos del
        // evento salen del pedido guardado, no del estado de React.
        const pedido = orderId ? dbLocal.getOrderById(orderId) : undefined;
        if (pedido) {
          track('Purchase', {
            ...itemsParaMeta(pedido.items),
            value: pedido.total,
            currency: 'USD',
            order_id: pedido.id,
          });
          trackTikTok('CompletePayment', {
            ...itemsParaTikTok(pedido.items),
            value: pedido.total,
            currency: 'USD',
          });
          setCompletedOrder(pedido);
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

  const getShippingCost = () => {
    const base = calculateShippingCost(getCartTotal(), shippingMethod, isPackInCart);
    return applyShippingCoupon(base, appliedCoupon);
  };

  const envioGratis = isPackInCart || qualifiesForFreeShipping(getCartTotal()) || (appliedCoupon?.type === 'free_shipping');

  const getGrandTotal = () => {
    return getCartTotal() + getShippingCost();
  };

  const handleApplyCoupon = () => {
    setCouponError('');
    setCouponSuccess('');
    const coupon = validateCoupon(couponInput);
    if (!coupon) {
      setCouponError('Cupon no valido. Verifica el codigo e intentalo de nuevo.');
      setAppliedCoupon(null);
      return;
    }
    setAppliedCoupon(coupon);
    setCouponSuccess(`Cupon "${coupon.code}" aplicado: ${coupon.description}`);
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponInput('');
    setCouponError('');
    setCouponSuccess('');
  };

  const generateCheckoutWhatsAppMessage = () => {
    const itemsList = cart
      .map((item) => {
        const extras = [
          item.has_custom_logo ? 'Logo personalizado' : '',
          item.has_qr_code ? 'Código QR' : '',
          item.selected_color ? `Acabado: ${item.selected_color}` : '',
          item.business_name ? `Negocio: ${item.business_name}` : '',
        ]
          .filter(Boolean)
          .join(', ');

        const extrasText = extras ? ` (${extras})` : '';
        return `- ${item.quantity}x ${item.product_name}${extrasText} : $${(item.price * item.quantity).toFixed(2)}`;
      })
      .join('\n');

    const envioTxt = envioGratis ? 'GRATIS' : `$${getShippingCost().toFixed(2)} USD`;
    const datosCliente = name
      ? `\n*DATOS DE ENTREGA:*\n- Nombre: ${name}\n- Correo: ${email || 'N/A'}\n- Teléfono: ${phone || 'N/A'}\n- Dirección: ${address || 'N/A'}, ${district || ''}, ${province || 'Panamá'}`
      : '';

    const lines = [
      'Hola starTAP Panamá, quiero confirmar mi pedido y pagar mediante Yappy.',
      datosCliente,
      '',
      '*PEDIDO:*',
      itemsList,
      '',
      `*SUBTOTAL:* $${getCartTotal().toFixed(2)} USD`,
      `*ENVÍO:* ${envioTxt}`,
      `*TOTAL A PAGAR:* $${getGrandTotal().toFixed(2)} USD`,
      '*GARANTÍA:* 90 días incluida',
      '',
      'Por favor indicarme los datos para transferir por Yappy. ¡Muchas gracias!',
    ].filter(Boolean);

    return `https://wa.me/50767134341?text=${encodeURIComponent(lines.join('\n'))}`;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!name || !email || !phone || !address || !district) {
      alert('Por favor completa todos los campos de información de envío');
      return;
    }

    setIsProcessing(true);

    track('InitiateCheckout', {
      ...itemsParaMeta(cart),
      value: getGrandTotal(),
      currency: 'USD',
    });

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
        // Tarjeta: el formulario vive aqui, pero los datos van del navegador
        // directo a Tilopay. El servidor solo abre la sesion y dice el monto.
        dbLocal.createOrder({ ...baseOrder, id: orderNumber } as any);
        sessionStorage.setItem('current_user_email', email);
        sessionStorage.setItem('current_user_name', name);

        const res = await fetch('/api/tilopay/sdk-session', {
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
            couponCode: appliedCoupon?.code,
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

        if (!res.ok || !data.success || !data.token) {
          throw new Error(data.error || 'No pudimos iniciar el pago con tarjeta. Intenta de nuevo o paga con Yappy.');
        }

        const partes = name.trim().split(' ');

        // A partir de aqui manda el SDK: hace el 3DS en #responseTilopay y
        // navega solo a /api/tilopay/callback, que confirma contra /consult.
        await tarjetaRef.current?.pagar(
          {
            token: data.token,
            key: data.key,
            amount: data.amount,
            orderNumber: data.orderNumber,
            redirect: data.redirect,
          },
          {
            nombre: partes[0] || 'Cliente',
            apellidos: partes.slice(1).join(' ') || 'StarTAP',
            email,
            telefono: phone,
            direccion: address,
            ciudad: district || province,
            provincia: province,
            pais: 'PA',
          }
        );
        return;
      }

      const triggerOrderEmail = (orderIdStr: string) => {
        fetch('/api/email/order-confirmation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            orderId: orderIdStr,
            customerName: name,
            customerEmail: email,
            customerPhone: phone,
            address,
            district,
            province,
            paymentMethod,
            paymentStatus: paymentMethod === 'yappy' ? 'pending' : 'completed',
            subtotal: getCartTotal(),
            shipping: getShippingCost(),
            total: getGrandTotal(),
            items: cart.map(i => ({
              product_name: i.product_name,
              quantity: i.quantity,
              price: i.price,
              selected_color: i.selected_color,
              business_name: i.business_name,
              has_custom_logo: i.has_custom_logo,
              has_qr_code: i.has_qr_code,
            })),
          }),
        }).catch(e => console.error('[ORDER_EMAIL_TRIGGER_ERROR]', e));
      };

      // Yappy: queda registrado y se coordina por WhatsApp
      const orderObj = {
        ...baseOrder,
        id: orderNumber,
        yappy_reference: 'Yappy WhatsApp',
        items: cart.map(i => ({
          product_name: i.product_name,
          quantity: i.quantity,
          price: i.price,
          selected_color: i.selected_color,
          business_name: i.business_name,
        })),
      };
      dbLocal.createOrder(orderObj as any);
      setCompletedOrder(orderObj);
      sessionStorage.setItem('current_user_email', email);
      sessionStorage.setItem('current_user_name', name);
      triggerOrderEmail(orderNumber);

      track('Purchase', {
        ...itemsParaMeta(cart),
        value: getGrandTotal(),
        currency: 'USD',
        order_id: orderNumber,
      });

      trackTikTok('CompletePayment', {
        ...itemsParaTikTok(cart),
        value: getGrandTotal(),
        currency: 'USD',
      });

      if (typeof window !== 'undefined') {
        window.open(generateCheckoutWhatsAppMessage(), '_blank');
      }

      setIsProcessing(false);
      setIsSuccess(true);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      clearCart();
    } catch (err: any) {
      console.error('[CHECKOUT_ERROR]', err);
      setErrorMessage(err.message || 'Ocurrió un error al procesar tu pedido.');
      setIsProcessing(false);
    }
  };

  const displayEmail =
    completedOrder?.email ||
    email ||
    (typeof window !== 'undefined' ? sessionStorage.getItem('current_user_email') || '' : '');
  const displayOrderId =
    completedOrder?.id ||
    (typeof window !== 'undefined' ? new URLSearchParams(window.location.search).get('order') || '' : '');
  const displayMethod = completedOrder?.paymentMethod || paymentMethod;
  const crossSellProducts = PRODUCTS.filter((p) => !p.isPack && p.type !== 'test').slice(0, 2);

  if (cart.length === 0 && !isSuccess) return null;

  return (
    <div className="bg-brand-50 min-h-screen">
      {isSuccess ? (
        <div className="max-w-4xl mx-auto py-12 px-4 sm:px-6 space-y-8">
          {/* Main Success Hero Header */}
          <div className="bg-white border border-brand-200 rounded-2xl p-6 sm:p-10 shadow-sm text-center space-y-6">
            <div className="w-20 h-20 bg-accent-100 rounded-full flex items-center justify-center mx-auto text-accent-600 border-2 border-accent-200 shadow-inner">
              <CheckCircle2 className="h-10 w-10 text-accent-600" />
            </div>

            <div className="space-y-3 max-w-xl mx-auto">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-accent-50 text-accent-700 border border-accent-200 uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                {displayMethod === 'yappy' ? 'Pedido Registrado Exitosamente' : '¡Pago Confirmado!'}
              </span>

              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-brand-950 uppercase">
                {displayMethod === 'yappy' ? '¡Gracias por tu pedido!' : '¡Gracias por tu compra!'}
              </h1>

              <p className="text-sm text-brand-600 leading-relaxed">
                {displayMethod === 'yappy'
                  ? `Registramos tu pedido con la referencia de Yappy. Verificaremos tu pago al ${YAPPY.numero} y te contactaremos por WhatsApp.`
                  : `Tu pago fue procesado con éxito. Hemos enviado un correo de confirmación a `}
                <strong className="text-brand-900">{displayEmail || 'tu correo'}</strong>.
              </p>

              {displayOrderId && (
                <div className="inline-block bg-brand-50 border border-brand-200 px-4 py-1.5 rounded-lg text-xs font-mono text-brand-800 font-bold">
                  Número de Pedido: <span className="text-accent-600">{displayOrderId}</span>
                </div>
              )}
            </div>
          </div>

          {/* SECTION 1: ADMIN PANEL ONBOARDING CTA CARD */}
          <div className="bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 text-white rounded-2xl p-6 sm:p-8 shadow-xl border border-brand-800 space-y-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-accent-500/10 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
              <div className="space-y-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="bg-accent-500/20 text-accent-400 border border-accent-500/30 text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded">
                    Paso Obligatorio para Configuración
                  </span>
                </div>
                <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                  Crea o Accede a tu Panel de Administración
                </h2>
                <p className="text-xs sm:text-sm text-brand-200 leading-relaxed">
                  Ingresa tu enlace de Google Maps en el panel para que programemos la información NFC y los códigos QR de tus dispositivos antes del despacho.
                </p>
              </div>

              <div className="flex-shrink-0">
                <Link
                  href={`/dashboard?email=${encodeURIComponent(displayEmail)}`}
                  className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-accent-500 hover:bg-accent-600 text-brand-950 font-extrabold rounded-xl transition-all shadow-lg hover:shadow-accent-500/25 text-sm tracking-wide uppercase group"
                >
                  <Settings className="w-4 h-4 group-hover:rotate-45 transition-transform" />
                  <span>Configurar mis Enlaces NFC</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            </div>

            <div className="pt-4 border-t border-brand-800/80 text-[11px] text-brand-300 flex items-center gap-2">
              <Info className="w-3.5 h-3.5 text-accent-400 flex-shrink-0" />
              <span>
                ¿Primera vez? Solo ingresa con el correo <strong>{displayEmail || 'utilizado en la compra'}</strong> para vincular tus placas automáticamente.
              </span>
            </div>
          </div>

          {/* SECTION 2: ORDER DETAILS & WHATSAPP SUPPORT */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Order Items & Shipping Summary */}
            <div className="md:col-span-2 bg-white border border-brand-200 rounded-2xl p-6 shadow-sm space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-950 border-b border-brand-100 pb-3 flex items-center justify-between">
                <span>Resumen de la Orden</span>
                <Package className="w-4 h-4 text-brand-400" />
              </h3>

              {completedOrder?.items && completedOrder.items.length > 0 ? (
                <div className="divide-y divide-brand-100 space-y-3">
                  {completedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="pt-3 flex items-center justify-between text-xs">
                      <div>
                        <p className="font-bold text-brand-900">{item.product_name || item.name || 'Producto starTAP'}</p>
                        {item.selected_color && (
                          <p className="text-[11px] text-brand-500">Color: {item.selected_color}</p>
                        )}
                        {item.business_name && (
                          <p className="text-[11px] text-brand-500">Grabado: {item.business_name}</p>
                        )}
                        <p className="text-[10px] text-brand-400">Cantidad: {item.quantity}</p>
                      </div>
                      <div className="font-bold text-brand-950 font-mono">
                        ${((item.price || 0) * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}

                  <div className="pt-4 border-t border-brand-200 flex justify-between items-center text-sm font-extrabold text-brand-950">
                    <span>Total Pagado:</span>
                    <span className="text-accent-600 font-mono text-base">${(completedOrder.total || 0).toFixed(2)}</span>
                  </div>
                </div>
              ) : (
                <p className="text-xs text-brand-500 italic">
                  Detalles del pedido enviados a tu correo electrónico ({displayEmail}).
                </p>
              )}
            </div>

            {/* Direct WhatsApp Support Box */}
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-4">
              <div className="space-y-2">
                <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-emerald-950 uppercase tracking-wide">
                  Soporte por WhatsApp
                </h4>
                <p className="text-xs text-emerald-800 leading-relaxed">
                  ¿Tienes dudas sobre la entrega de tu pedido o el grabado con tu logo? Escríbenos directamente.
                </p>
              </div>

              <a
                href={`https://wa.me/50767134341?text=${encodeURIComponent(`Hola, acabo de realizar el pedido ${displayOrderId} a nombre de ${completedOrder?.name || name || 'Comercio'}. Tengo una consulta.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-colors uppercase tracking-wider"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Chatear en WhatsApp</span>
              </a>
            </div>
          </div>

          {/* SECTION 3: CROSS-SELL PRODUCTS */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-brand-200 pb-3">
              <div>
                <h3 className="text-base font-bold text-brand-950 uppercase tracking-wide">
                  Equipa más puntos de tu negocio
                </h3>
                <p className="text-xs text-brand-500">
                  Agrega tarjetas adicionales para tus meseros o placas secundarias para otras cajas.
                </p>
              </div>
              <Link href="/catalogo" className="text-xs font-bold text-accent-600 hover:text-accent-700 flex items-center gap-1">
                Ver catálogo <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {crossSellProducts.map((product) => (
                <div key={product.id} className="bg-white border border-brand-200 rounded-2xl p-5 shadow-sm flex items-center gap-4 hover:border-brand-300 transition-all">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-20 h-20 object-contain rounded-lg bg-brand-50 p-2 flex-shrink-0"
                  />
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <span className="text-[9px] font-bold text-accent-600 uppercase tracking-wider bg-accent-50 px-2 py-0.5 rounded border border-accent-100">
                      {product.badge}
                    </span>
                    <h4 className="text-xs font-bold text-brand-950 truncate">
                      {product.name}
                    </h4>
                    <p className="text-[11px] font-bold text-brand-900 font-mono">
                      {product.priceFormatted}
                    </p>
                    <Link
                      href={`/catalogo?producto=${product.id}`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-accent-600 hover:underline pt-1"
                    >
                      <span>Ver detalles</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SECTION 4: EDUCATIONAL BLOG GUIDES */}
          <div className="bg-white border border-brand-200 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="border-b border-brand-100 pb-4">
              <span className="text-[10px] font-bold text-accent-600 uppercase tracking-widest block mb-1">
                Aprende y Crece con starTAP
              </span>
              <h3 className="text-lg font-bold text-brand-950 uppercase tracking-wide">
                Guías de SEO Local y Reseñas en Panamá
              </h3>
              <p className="text-xs text-brand-500">
                Aprovecha al máximo tu nuevo dispositivo NFC con nuestros artículos especializados.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <Link
                href="/blog/como-pedir-resenas-google-sin-penalizacion"
                className="group border border-brand-200 hover:border-accent-400 rounded-xl p-5 transition-all bg-brand-50/50 hover:bg-white hover:shadow-md space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-accent-100 text-accent-700 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-brand-950 group-hover:text-accent-600 transition-colors line-clamp-2">
                    Cómo pedir reseñas en Google Maps en Panamá sin penalización
                  </h4>
                  <p className="text-[11px] text-brand-600 leading-relaxed line-clamp-3">
                    Aprende las mejores prácticas y evita cometer errores comunes que puedan afectar la reputación de tu ficha de Google.
                  </p>
                </div>
                <div className="flex items-center text-[11px] font-bold text-accent-600 gap-1 pt-2">
                  <span>Leer artículo</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>

              <Link
                href="/blog"
                className="group border border-brand-200 hover:border-accent-400 rounded-xl p-5 transition-all bg-brand-50/50 hover:bg-white hover:shadow-md space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="w-8 h-8 bg-brand-200 text-brand-800 rounded-lg flex items-center justify-center">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <h4 className="text-xs font-bold text-brand-950 group-hover:text-accent-600 transition-colors line-clamp-2">
                    Estrategias de Posicionamiento Local en Panamá
                  </h4>
                  <p className="text-[11px] text-brand-600 leading-relaxed line-clamp-3">
                    Explora todos nuestros artículos para optimizar tu perfil comercial y posicionar tu local en los primeros lugares.
                  </p>
                </div>
                <div className="flex items-center text-[11px] font-bold text-accent-600 gap-1 pt-2">
                  <span>Ver todas las guías</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            </div>
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

          {/* Right Column: Order Summary & Payment Methods */}
          <div className="lg:col-span-5 p-6 sm:p-10 bg-brand-100 space-y-8 border-t lg:border-t-0 lg:border-l border-brand-200">
            
            {/* 1. ORDER SUMMARY SECTION (PRIMERO: RESUMEN DE PEDIDO) */}
            <div className="space-y-6">
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

              {/* CUPON */}
              <div className="space-y-2">
                {!appliedCoupon ? (
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                      placeholder="Código de cupón"
                      className="shopify-input flex-1 uppercase tracking-widest text-xs"
                      maxLength={20}
                    />
                    <button
                      type="button"
                      onClick={handleApplyCoupon}
                      className="px-4 py-2 bg-brand-950 text-white text-xs font-bold uppercase tracking-wider rounded hover:bg-brand-800 transition-colors flex-shrink-0"
                    >
                      Aplicar
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded px-3 py-2">
                    <div className="flex items-center gap-2 text-xs">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span className="font-bold text-emerald-800">Cupón <span className="font-black">{appliedCoupon.code}</span> aplicado</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveCoupon}
                      className="text-[10px] text-brand-400 hover:text-brand-700 font-bold uppercase underline"
                    >
                      Quitar
                    </button>
                  </div>
                )}
                {couponError && (
                  <p className="text-[11px] text-red-600 font-semibold flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {couponError}
                  </p>
                )}
              </div>

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
                      : appliedCoupon?.type === 'free_shipping'
                      ? ' (envío gratis)'
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
            </div>

            {/* 2. PAYMENT METHODS SECTION (LUEGO: METODO DE PAGO) */}
            <div className="space-y-5 pt-6 border-t border-brand-200">
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

              {/* Tarjeta: el formulario vive aqui. El SDK de Tilopay toma control
                  de los inputs tlpy_* y manda los datos cifrados directo a
                  Tilopay; nuestro servidor no los ve nunca. */}
              {paymentMethod === 'tarjeta' && (
                <div className="space-y-4">
                  <div className="bg-white p-4 border border-brand-200 rounded space-y-3 shadow-sm">
                    <div className="flex items-center space-x-2 text-[10px] text-brand-500">
                      <Lock className="h-3.5 w-3.5 text-accent-600" />
                      <span className="font-semibold">Pago seguro con Tilopay (Visa / Mastercard)</span>
                    </div>
                    <div className="flex items-start space-x-2 text-[10px] text-brand-500 bg-brand-50 p-2.5 rounded border border-brand-200">
                      <ShieldCheck className="h-4 w-4 text-accent-600 flex-shrink-0 mt-0.5" />
                      <span>Pagas sin salir de starTAP. Si tu banco pide verificación 3D Secure, se abre aquí mismo.</span>
                    </div>
                  </div>

                  <TilopayCardForm ref={tarjetaRef} visible={true} />

                  <button
                    form="checkout-form"
                    type="submit"
                    disabled={isProcessing}
                    className="w-full shopify-btn-primary uppercase tracking-widest text-xs font-bold py-4.5 disabled:opacity-50"
                  >
                    {isProcessing ? (
                      <>
                        <span className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle"></span>
                        <span>Procesando el pago...</span>
                      </>
                    ) : (
                      <span>Pagar con tarjeta • ${getGrandTotal().toFixed(2)}</span>
                    )}
                  </button>
                </div>
              )}

              {/* Montado en background cuando no se ve para preservar inputs de Tilopay en el DOM */}
              {paymentMethod !== 'tarjeta' && (
                <TilopayCardForm ref={tarjetaRef} visible={false} />
              )}

              {/* Yappy: Boton Yappy enviando a WhatsApp (como en el carrito) */}
              {paymentMethod === 'yappy' && (
                <div className="space-y-4">
                  <div className="bg-white p-5 border border-brand-200 rounded-2xl space-y-4 shadow-sm">
                    <div className="flex items-start space-x-2.5 text-xs text-brand-600 bg-blue-50/70 p-3 rounded-xl border border-blue-100">
                      <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                      <span>
                        Paga sin tarjeta bancaria: confirma tu pedido enviando los detalles directamente a nuestro <strong>WhatsApp</strong> para transferir por <strong>Yappy</strong>.
                      </span>
                    </div>

                    {/* Boton Yappy / WhatsApp mejorado (identico al carrito) */}
                    <a
                      href={generateCheckoutWhatsAppMessage()}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        track('Contact', { method: 'yappy_checkout_whatsapp' });
                        trackTikTok('Contact', { method: 'yappy_checkout_whatsapp' });
                      }}
                      className="w-full bg-[#005CE6] hover:bg-[#0052cc] text-white font-black text-sm normal-case tracking-normal py-4 px-5 rounded-xl shadow-lg transition-all flex flex-col items-center justify-center gap-2 group hover:shadow-xl hover:scale-[1.01] active:scale-100"
                    >
                      {/* Row: Yappy badge + WhatsApp icon */}
                      <div className="flex items-center gap-3">
                        <Image
                          src="/logos/yappy-logo.webp"
                          alt="Pagar con Yappy"
                          width={100}
                          height={56}
                          className="h-7 w-auto object-contain"
                          priority
                        />
                        <span className="text-white/40 text-lg font-light">+</span>
                        <div className="flex items-center gap-1.5 bg-[#25D366] px-2.5 py-1 rounded-md">
                          <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                            <path d="M11.999 2C6.477 2 2 6.477 2 12c0 1.821.487 3.532 1.338 5.017L2.01 22l5.123-1.32A9.96 9.96 0 0012 22c5.523 0 10-4.478 10-10S17.523 2 12 2zm0 18.18a8.147 8.147 0 01-4.16-1.143l-.298-.177-3.039.783.81-2.96-.195-.306A8.177 8.177 0 013.82 12c0-4.508 3.671-8.18 8.18-8.18 4.508 0 8.18 3.672 8.18 8.18 0 4.509-3.672 8.18-8.18 8.18z"/>
                          </svg>
                          <span className="text-white font-black text-sm">WhatsApp</span>
                        </div>
                      </div>
                      <span className="text-white/80 text-xs font-semibold normal-case">
                        Pagar con Yappy por WhatsApp • ${getGrandTotal().toFixed(2)} USD
                      </span>
                    </a>
                  </div>

                  {/* Boton para registrar la orden en el sistema y abrir WhatsApp con la direccion guardada */}
                  <button
                    form="checkout-form"
                    type="submit"
                    disabled={isProcessing}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white uppercase tracking-widest text-xs font-bold py-4 rounded-xl shadow transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isProcessing ? (
                      <>
                        <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle"></span>
                        <span>Guardando pedido...</span>
                      </>
                    ) : (
                      <>
                        <MessageCircle className="w-4 h-4" />
                        <span>Confirmar datos y pagar por Yappy</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
