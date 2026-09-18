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
  ChevronLeft,
  ChevronDown,
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
  getDiscountAmount,
  type Coupon,
  type ShippingMethodId,
} from '@/config/shipping';
import { PRODUCTS } from '@/config/products';
import confetti from 'canvas-confetti';
import { track, itemsParaMeta } from '@/lib/fbpixel';
import { trackTikTok, itemsParaTikTok } from '@/lib/tiktokpixel';
import { trackGA, itemsParaGA } from '@/lib/googleanalytics';
import TilopayCardForm, { type TilopayCardFormHandle } from '@/components/checkout/TilopayCardForm';
import YappyButton from '@/components/checkout/YappyButton';

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
  const [abandonedId, setAbandonedId] = useState<string>('');

  const syncAbandonedCheckout = (emailVal: string, phoneVal: string, nameVal?: string) => {
    if ((emailVal && emailVal.includes('@')) || (phoneVal && phoneVal.length >= 6)) {
      const id = abandonedId || `AB-${Date.now().toString().slice(-6)}`;
      if (!abandonedId) setAbandonedId(id);
      dbLocal.saveAbandonedCheckout({
        id,
        customer_email: emailVal || 'Sin correo',
        customer_name: nameVal || name || 'Cliente interesado',
        customer_phone: phoneVal || phone || '',
        shipping_province: province,
        shipping_district: district,
        items: cart,
        total: getGrandTotal(),
        status: 'abandoned',
      });
    }
  };
  const [showMobileSummary, setShowMobileSummary] = useState(false);

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
      item.product_name?.toLowerCase().includes('pack')
  );

  const getShippingCost = () => {
    const base = calculateShippingCost(getCartTotal(), shippingMethod, isPackInCart);
    return applyShippingCoupon(base, appliedCoupon);
  };

  const envioGratis = isPackInCart || qualifiesForFreeShipping(getCartTotal()) || (appliedCoupon?.type === 'free_shipping');

  const getDiscount = () => {
    return getDiscountAmount(getCartTotal(), appliedCoupon);
  };

  const getGrandTotal = () => {
    return Math.max(0, getCartTotal() + getShippingCost() - getDiscount());
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

    trackGA('begin_checkout', {
      currency: 'USD',
      value: getGrandTotal(),
      items: itemsParaGA(cart),
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
              price: i.price,
              is_upsell: i.product_id === 'tarjeta-nfc-bolsillo' && (i.price === 15 || i.product_name?.includes('Oferta Especial')),
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

      trackGA('purchase', {
        transaction_id: orderNumber,
        value: getGrandTotal(),
        currency: 'USD',
        shipping: getShippingCost(),
        items: itemsParaGA(cart),
      });

      if (typeof window !== 'undefined') {
        window.open(generateCheckoutWhatsAppMessage(), '_blank');
      }

      setIsProcessing(false);
      setIsSuccess(true);
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      clearCart();
      dbLocal.markAbandonedCheckoutCompleted(email);
      if (phone) dbLocal.markAbandonedCheckoutCompleted(phone);
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
        /* Full Shopify style checkout experience */
        <div className="min-h-screen bg-slate-50/60 pb-16">
          
          {/* Mobile Collapsible Order Summary Bar (Shopify Standard) */}
          <div className="lg:hidden border-b border-slate-200 bg-slate-100/90 px-4 py-3.5 sticky top-16 z-20 backdrop-blur-md">
            <div className="max-w-xl mx-auto flex items-center justify-between">
              <button
                type="button"
                onClick={() => setShowMobileSummary(!showMobileSummary)}
                className="flex items-center gap-2 text-xs font-bold text-slate-800 hover:text-slate-950 transition-colors"
              >
                <ShoppingBag className="w-4 h-4 text-emerald-600" />
                <span>{showMobileSummary ? 'Ocultar resumen del pedido' : 'Mostrar resumen del pedido'}</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${showMobileSummary ? 'rotate-180' : ''}`} />
              </button>
              <span className="font-black text-slate-900 text-sm font-mono">
                ${getGrandTotal().toFixed(2)} USD
              </span>
            </div>

            {/* Collapsible drawer */}
            {showMobileSummary && (
              <div className="max-w-xl mx-auto pt-4 pb-2 border-t border-slate-200 mt-3 space-y-4">
                <div className="space-y-3 max-h-60 overflow-y-auto pr-1">
                  {cart.map((item) => {
                    const prod = PRODUCTS.find((p) => p.id === item.product_id);
                    const imgUrl = prod?.image || '/logos/startap-logo.webp';
                    return (
                      <div key={item.id} className="flex items-center gap-3 text-xs">
                        <div className="relative w-14 h-14 rounded-xl border border-slate-200 bg-white p-1 flex-shrink-0 flex items-center justify-center shadow-xs">
                          <img src={imgUrl} alt={item.product_name} className="w-full h-full object-contain" />
                          <span className="absolute -top-1.5 -right-1.5 bg-slate-700 text-white rounded-full text-[10px] w-4.5 h-4.5 flex items-center justify-center font-bold">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="font-semibold text-slate-900 block truncate">{item.product_name}</span>
                          <span className="text-[11px] text-slate-500 block truncate">
                            {item.selected_color || ''}{item.business_name ? ` • ${item.business_name}` : ''}
                          </span>
                        </div>
                        <span className="font-bold text-slate-900 flex-shrink-0">
                          ${(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="border-t border-slate-200 pt-3 space-y-1.5 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span className="font-semibold text-slate-900">${getCartTotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Envío</span>
                    <span className="font-semibold text-slate-900">{envioGratis ? 'Gratis' : `$${getShippingCost().toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between font-bold text-sm text-slate-900 pt-2 border-t border-slate-200">
                    <span>Total</span>
                    <span>${getGrandTotal().toFixed(2)} USD</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Main Two-Column Layout */}
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">

              {/* LEFT COLUMN: SHOPIFY STEP-BY-STEP CHECKOUT FORM */}
              <div className="lg:col-span-7 space-y-8">
                
                {/* Brand & Breadcrumbs */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black tracking-widest text-emerald-700 uppercase bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                      PAGO SEGURO
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                    Finalizar tu Pedido
                  </h1>
                  
                  {/* Breadcrumb Steps */}
                  <nav aria-label="Progreso de compra" className="flex items-center gap-2 text-xs text-slate-400 font-medium">
                    <Link href="/cart" className="text-emerald-600 hover:underline">Carrito</Link>
                    <span>/</span>
                    <span className="text-slate-900 font-bold">Información de Entrega</span>
                    <span>/</span>
                    <span className="text-slate-900 font-bold">Pago</span>
                  </nav>
                </div>

                {errorMessage && (
                  <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-xl text-xs flex items-start gap-3 shadow-xs">
                    <AlertCircle className="h-5 w-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold text-sm">No se pudo procesar la transacción</p>
                      <p className="mt-0.5">{errorMessage}</p>
                    </div>
                  </div>
                )}

                <form id="checkout-form" onSubmit={handlePayment} className="space-y-6">
                  
                  {/* STEP 1: CONTACTO */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">1</span>
                        Contacto
                      </h2>
                      <span className="text-[11px] text-slate-400">Recibirás recibo y guía de rastreo</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Correo Electrónico *</label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          onBlur={() => syncAbandonedCheckout(email, phone, name)}
                          placeholder="tu@correo.com"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Teléfono Móvil (WhatsApp) *</label>
                        <input
                          type="tel"
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          onBlur={() => syncAbandonedCheckout(email, phone, name)}
                          placeholder="6523-9821"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* STEP 2: DIRECCION DE ENTREGA */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">2</span>
                        Dirección de Entrega
                      </h2>
                      <span className="text-[11px] text-slate-400">Envíos a todo Panamá</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-700">Nombre Completo o Razón Social *</label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          onBlur={() => syncAbandonedCheckout(email, phone, name)}
                          placeholder="Carlos Mendoza o Nombre de tu Negocio"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Provincia *</label>
                        <select
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition cursor-pointer"
                        >
                          {provincesPanama.map((prov) => (
                            <option key={prov} value={prov}>{prov}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700">Distrito / Corregimiento / Ciudad *</label>
                        <input
                          type="text"
                          required
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          placeholder="Ej. San Francisco, Vía Porras"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition"
                        />
                      </div>

                      <div className="space-y-1.5 sm:col-span-2">
                        <label className="text-xs font-semibold text-slate-700">Dirección Exacta (Local, Edificio, Apartamento) *</label>
                        <input
                          type="text"
                          required
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          placeholder="Calle 74 Este, Edificio Sunset Place, Local 3"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition"
                        />
                      </div>
                    </div>
                  </div>

                  {/* STEP 3: METODO DE ENVIO */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">3</span>
                        Método de Envío
                      </h2>
                    </div>

                    {envioGratis && (
                      <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-3.5 rounded-xl text-xs flex items-center gap-2.5">
                        <CheckCircle2 className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                        <span className="font-semibold">
                          {isPackInCart
                            ? '¡Envío gratis a todo Panamá incluido con tu pedido!'
                            : `¡Envío gratis aplicado! Tu orden supera los $${FREE_SHIPPING_THRESHOLD}.`}
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
                          className={`p-4 border rounded-xl text-left flex justify-between items-start transition-all ${
                            shippingMethod === m.id
                              ? 'border-slate-900 bg-slate-50/80 ring-1 ring-slate-900 shadow-xs'
                              : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/40 bg-white'
                          }`}
                        >
                          <div>
                            <span className="font-bold text-xs uppercase tracking-wide block text-slate-900">
                              {m.label}
                            </span>
                            <span className="text-[11px] text-slate-500 mt-0.5 block">{m.detail}</span>
                          </div>
                          <span className="font-black text-xs text-slate-900 ml-2">
                            {envioGratis ? 'Gratis' : `$${m.cost.toFixed(2)}`}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* STEP 4: METODO DE PAGO (SHOPIFY ACCORDION BOX) */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-slate-900 text-white text-[10px] flex items-center justify-center font-bold">4</span>
                        Pago
                      </h2>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Lock className="w-3.5 h-3.5 text-emerald-600" /> Cifrado 256-bit
                      </span>
                    </div>

                    <p className="text-xs text-slate-500">
                      Selecciona cómo prefieres pagar tu orden:
                    </p>

                    {/* Contenedor estilo acordeón Shopify */}
                    <div className="border border-slate-300 rounded-xl overflow-hidden divide-y divide-slate-200 bg-white shadow-xs">
                      
                      {/* Fila 1: Tarjeta Bancaria */}
                      <div>
                        <div
                          onClick={() => setPaymentMethod('tarjeta')}
                          className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                            paymentMethod === 'tarjeta' ? 'bg-slate-50/90' : 'hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="paymentMethodSelect"
                              checked={paymentMethod === 'tarjeta'}
                              onChange={() => setPaymentMethod('tarjeta')}
                              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-sm font-bold text-slate-900">Tarjeta de crédito o débito</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Image
                              src="/logos/visa-logo.svg"
                              alt="Visa"
                              width={36}
                              height={24}
                              className="h-5 w-auto object-contain rounded shadow-2xs"
                            />
                            <Image
                              src="/logos/mastercard-logo.svg"
                              alt="Mastercard"
                              width={36}
                              height={24}
                              className="h-5 w-auto object-contain rounded shadow-2xs"
                            />
                          </div>
                        </div>

                        {paymentMethod === 'tarjeta' && (
                          <div className="p-4 sm:p-5 bg-slate-50/40 border-t border-slate-200 space-y-4">
                            <div className="flex items-center gap-2.5 text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200 shadow-xs">
                              <ShieldCheck className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                              <span>Pagas directamente sin salir de starTAP con validación bancaria 3D Secure.</span>
                            </div>

                            <TilopayCardForm ref={tarjetaRef} visible={true} />
                          </div>
                        )}
                      </div>

                      {/* Fila 2: Yappy Panamá */}
                      <div>
                        <div
                          onClick={() => setPaymentMethod('yappy')}
                          className={`flex items-center justify-between p-4 cursor-pointer transition-colors ${
                            paymentMethod === 'yappy' ? 'bg-slate-50/90' : 'hover:bg-slate-50/50'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <input
                              type="radio"
                              name="paymentMethodSelect"
                              checked={paymentMethod === 'yappy'}
                              onChange={() => setPaymentMethod('yappy')}
                              className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
                            />
                            <span className="text-sm font-bold text-slate-900">Yappy Panamá (WhatsApp)</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Image
                              src="/logos/yappy-logo.png"
                              alt="Yappy"
                              width={70}
                              height={18}
                              className="h-5 w-auto object-contain"
                            />
                          </div>
                        </div>

                        {paymentMethod === 'yappy' && (
                          <div className="p-4 sm:p-5 bg-slate-50/40 border-t border-slate-200 space-y-4">
                            <div className="flex items-start gap-2.5 text-xs text-slate-600 bg-blue-50/70 p-3.5 rounded-xl border border-blue-100">
                              <Info className="h-4 w-4 text-blue-600 flex-shrink-0 mt-0.5" />
                              <span>
                                Paga al instante sin ingresar datos de tarjeta, de manera segura y directa con el Botón de Pago Yappy oficial.
                              </span>
                            </div>

                            <div className="w-full">
                              <YappyButton 
                                onInitiatePayment={async () => {
                                  if (!name || !email || !phone || !address || !district) {
                                    alert('Por favor completa todos los campos de información de envío');
                                    return { success: false, error: 'Faltan campos' };
                                  }

                                  const orderNumber = `STP-${Date.now().toString().slice(-8)}`;

                                  const baseOrder = {
                                    customer_name: name,
                                    customer_email: email,
                                    customer_phone: phone,
                                    shipping_province: province,
                                    shipping_district: district,
                                    shipping_address: address,
                                    payment_method: 'yappy' as const,
                                    payment_status: 'pending' as const,
                                    status: 'pending' as const,
                                    total: getGrandTotal(),
                                    items: cart,
                                  };

                                  dbLocal.createOrder({ ...baseOrder, id: orderNumber } as any);
                                  sessionStorage.setItem('current_user_email', email);
                                  sessionStorage.setItem('current_user_name', name);

                                  const res = await fetch('/api/yappy/checkout', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({
                                      orderNumber,
                                      total: getGrandTotal(),
                                      name,
                                      email,
                                      phone
                                    })
                                  });
                                  
                                  const data = await res.json();
                                  if(data.success) {
                                    data.orderId = orderNumber;
                                  }
                                  return data;
                                }}
                                onSuccess={(orderId) => {
                                  setCompletedOrder({ id: orderId, paymentMethod: 'yappy', email });
                                  setIsProcessing(false);
                                  setIsSuccess(true);
                                  confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
                                  clearCart();
                                  dbLocal.markAbandonedCheckoutCompleted(email);
                                  if (phone) dbLocal.markAbandonedCheckoutCompleted(phone);
                                }}
                                onError={(err) => {
                                  console.error('[YAPPY_PAYMENT_ERROR]', err);
                                  setErrorMessage(typeof err === 'string' ? err : 'Ocurrió un error al procesar el pago con Yappy.');
                                }}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fallback hidden instance to keep Tilopay inputs available in DOM if Yappy is selected */}
                  {paymentMethod !== 'tarjeta' && (
                    <TilopayCardForm ref={tarjetaRef} visible={false} />
                  )}

                  {/* SUBMIT BUTTON ROW (SHOPIFY STYLE) */}
                  <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <Link
                      href="/cart"
                      className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1.5 order-2 sm:order-1 transition"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Volver al carrito</span>
                    </Link>

                    <button
                      form="checkout-form"
                      type="submit"
                      disabled={isProcessing}
                      className="w-full sm:w-auto sm:min-w-[280px] py-4 px-8 bg-slate-950 hover:bg-slate-900 text-white font-bold text-sm rounded-xl shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2 order-1 sm:order-2"
                    >
                      {isProcessing ? (
                        <>
                          <span className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full inline-block align-middle"></span>
                          <span>Procesando pedido...</span>
                        </>
                      ) : paymentMethod === 'tarjeta' ? (
                        <span>Pagar ahora • ${getGrandTotal().toFixed(2)} USD</span>
                      ) : (
                        <>
                          <MessageCircle className="w-4 h-4" />
                          <span>Confirmar pedido por Yappy</span>
                        </>
                      )}
                    </button>
                  </div>

                  <div className="pt-2 text-center text-[11px] text-slate-400">
                    Al confirmar tu compra aceptas nuestros{' '}
                    <Link href="/terminos" className="underline hover:text-slate-600">Términos y Condiciones</Link> y{' '}
                    <Link href="/privacidad" className="underline hover:text-slate-600">Política de Privacidad</Link>.
                  </div>
                </form>
              </div>

              {/* RIGHT COLUMN: STICKY ORDER SUMMARY SIDEBAR (SHOPIFY AESTHETIC) */}
              <div className="hidden lg:block lg:col-span-5">
                <div className="sticky top-28 bg-white border border-slate-200 rounded-3xl p-7 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                    <h2 className="text-base font-bold text-slate-900">Resumen del Pedido</h2>
                    <span className="text-xs font-semibold px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                      {cart.reduce((n, i) => n + i.quantity, 0)} {cart.reduce((n, i) => n + i.quantity, 0) === 1 ? 'artículo' : 'artículos'}
                    </span>
                  </div>

                  {/* List of items with real thumbnails & quantity badges */}
                  <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                    {cart.map((item) => {
                      const prod = PRODUCTS.find((p) => p.id === item.product_id);
                      const imgUrl = prod?.image || '/logos/startap-logo.webp';
                      return (
                        <div key={item.id} className="flex items-center gap-3.5 text-xs">
                          <div className="relative w-16 h-16 rounded-xl border border-slate-200 bg-slate-50/50 p-1 flex-shrink-0 flex items-center justify-center">
                            <img src={imgUrl} alt={item.product_name} className="w-full h-full object-contain" />
                            <span className="absolute -top-2 -right-2 bg-slate-700 text-white rounded-full text-[11px] w-5 h-5 flex items-center justify-center font-bold shadow-xs">
                              {item.quantity}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="font-semibold text-slate-900 text-xs block truncate">{item.product_name}</span>
                            <span className="text-[11px] text-slate-500 block truncate mt-0.5">
                              {item.selected_color || ''}{item.business_name ? ` • ${item.business_name}` : ''}
                              {item.has_custom_logo ? ' • Con Logo' : ''}
                              {item.has_qr_code ? ' • Con QR' : ''}
                            </span>
                          </div>
                          <span className="font-bold text-slate-900 text-xs flex-shrink-0">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Coupon input */}
                  <div className="border-t border-slate-100 pt-4 space-y-2">
                    {!appliedCoupon ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleApplyCoupon())}
                          placeholder="Código de cupón"
                          className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase tracking-wider font-semibold focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none transition"
                          maxLength={20}
                        />
                        <button
                          type="button"
                          onClick={handleApplyCoupon}
                          className="px-4 py-2.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-bold rounded-xl transition-colors flex-shrink-0"
                        >
                          Aplicar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-xl px-3.5 py-2.5">
                        <div className="flex items-center gap-2 text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                          <span className="font-bold text-emerald-800">Cupón <span className="font-black">{appliedCoupon.code}</span> aplicado</span>
                        </div>
                        <button
                          type="button"
                          onClick={handleRemoveCoupon}
                          className="text-[11px] text-slate-500 hover:text-rose-600 font-bold underline"
                        >
                          Quitar
                        </button>
                      </div>
                    )}
                    {couponError && (
                      <p className="text-[11px] text-rose-600 font-semibold flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" /> {couponError}
                      </p>
                    )}
                  </div>

                  {/* Subtotal, Shipping, Routing lines */}
                  <div className="border-t border-slate-100 pt-4 space-y-2.5 text-xs text-slate-600">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span className="font-semibold text-slate-900">${getCartTotal().toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>
                        Envío
                        {isPackInCart
                          ? ' (incluido)'
                          : appliedCoupon?.type === 'free_shipping'
                          ? ' (envío gratis)'
                          : qualifiesForFreeShipping(getCartTotal())
                          ? ` (gratis sobre $${FREE_SHIPPING_THRESHOLD})`
                          : ''}
                      </span>
                      <span className="font-semibold text-slate-900">
                        {envioGratis ? (
                          <span className="text-emerald-600 font-bold uppercase text-[11px]">Gratis</span>
                        ) : (
                          `$${getShippingCost().toFixed(2)}`
                        )}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Programación y Ruteo NFC</span>
                      <span className="text-emerald-600 font-bold uppercase text-[11px]">Gratuito</span>
                    </div>
                    {getDiscount() > 0 && (
                      <div className="flex justify-between text-emerald-700 font-bold bg-emerald-50/80 p-2 rounded-lg border border-emerald-200">
                        <span>Descuento ({appliedCoupon?.code})</span>
                        <span>-${getDiscount().toFixed(2)}</span>
                      </div>
                    )}
                  </div>

                  {/* Grand total */}
                  <div className="border-t border-slate-200 pt-4 flex justify-between items-baseline">
                    <span className="font-bold text-sm text-slate-900">Total a pagar</span>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 font-normal mr-1.5">USD</span>
                      <span className="text-2xl font-black text-slate-950 tracking-tight">
                        ${getGrandTotal().toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Trust guarantees box */}
                  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 space-y-2.5 text-xs text-slate-600">
                    <div className="flex items-center gap-2 font-bold text-slate-800">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span>Compra protegida starTAP</span>
                    </div>
                    <ul className="space-y-1.5 text-[11px] text-slate-500">
                      <li>• Reposición garantizada por 90 días ante cualquier falla.</li>
                      <li>• Dispositivos auto-configurables al llegar, sin apps y listos para usar.</li>
                      <li>• Soporte personalizado por WhatsApp en Panamá.</li>
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
}
