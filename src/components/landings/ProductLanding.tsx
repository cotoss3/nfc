'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/db';
import { useCart } from '@/context/CartContext';
import {
  Star,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
  Zap,
  Sparkles,
  Upload,
  QrCode,
  Truck,
  CreditCard,
  Headset,
  MessageCircle,
  Image as ImageIcon,
} from 'lucide-react';
import AutoConfigGuide from '@/components/AutoConfigGuide';
import {
  CONDICIONES,
  TESTIMONIOS,
  WHATSAPP_URL,
  WHATSAPP_NUMERO,
  getLandingCopy,
  type LandingCopy,
} from '@/lib/landings';

const ICONOS = { zap: Zap, shield: ShieldCheck, sparkles: Sparkles };

/**
 * Muestra la imagen del producto cuando existe. Si todavía no hay foto cargada,
 * deja un marcador discreto en vez de romper el diseño.
 */
function Foto({
  src,
  alt,
  className = '',
  ratio = 'aspect-square',
}: {
  src?: string;
  alt: string;
  className?: string;
  ratio?: string;
}) {
  if (!src) {
    // Guía de producción: indica qué foto va en este espacio.
    // Al cargar la imagen al catálogo (product.images) el recuadro se reemplaza solo.
    return (
      <div
        className={`${ratio} ${className} bg-brand-50 rounded-3xl border-2 border-dashed border-brand-300 flex flex-col items-center justify-center text-center p-6 opacity-80`}
        aria-hidden="true"
      >
        <ImageIcon className="w-8 h-8 text-brand-300 mb-3" strokeWidth={1.2} />
        <span className="text-brand-400 font-bold mb-2 uppercase tracking-widest text-[11px]">
          Espacio para imagen
        </span>
        <p className="text-xs text-brand-500 leading-relaxed max-w-[260px]">{alt}</p>
      </div>
    );
  }
  return (
    <div className={`${ratio} ${className} rounded-3xl overflow-hidden bg-white`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="w-full h-full object-cover" loading="lazy" />
    </div>
  );
}

export default function ProductLanding({ product }: { product: Product }) {
  const router = useRouter();
  const { addToCart } = useCart();

  const copy: LandingCopy | undefined = getLandingCopy(product.id);

  const [color, setColor] = useState(
    (product.colors && product.colors[0]) || copy?.coloresPorDefecto[0] || 'Negro'
  );
  const [businessName, setBusinessName] = useState('');
  const [hasCustomLogo, setHasCustomLogo] = useState(false);
  const [hasQrCode, setHasQrCode] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  if (!copy) return null;

  const fotos = product.images && product.images.length ? product.images : product.image ? [product.image] : [];
  const colors = product.colors || copy.coloresPorDefecto;

  const logoPrice = hasCustomLogo ? 5 : 0;
  const qrPrice = hasQrCode ? 3 : 0;
  const unitPrice = product.price + logoPrice + qrPrice;
  const totalPrice = unitPrice * quantity;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setLogoPreview(reader.result as string);
      setLogoFile(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName) {
      alert('Por favor ingresa el nombre de tu negocio para continuar');
      return;
    }
    if (hasCustomLogo && !logoPreview) {
      alert('Por favor sube el archivo de tu logo personalizado');
      return;
    }

    addToCart({
      product_id: product.id,
      product_name: product.name,
      price: unitPrice,
      unit_price_base: product.price,
      has_custom_logo: hasCustomLogo,
      has_qr_code: hasQrCode,
      logo_price: logoPrice,
      qr_price: qrPrice,
      quantity,
      selected_color: color,
      business_name: businessName,
      logo_url: logoPreview || undefined,
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      router.push('/cart');
    }, 1200);
  };

  const scrollToCheckout = () =>
    document.getElementById('checkout-section')?.scrollIntoView({ behavior: 'smooth' });

  const whatsappProducto = `${WHATSAPP_URL}?text=${encodeURIComponent(
    `Hola, me interesa el ${product.name} de starTAP. ¿Me das más información?`
  )}`;

  return (
    <div className="w-full bg-white font-sans text-brand-800">
      {/* 1. HERO */}
      <section className="bg-gradient-to-br from-white via-accent-50 to-accent-100 border-b border-accent-200 pt-16 pb-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 order-2 lg:order-1">
            <div className="inline-flex items-center space-x-2 bg-white px-3 py-1 rounded-full shadow-sm text-xs font-bold text-accent-600 border border-accent-100">
              <Star className="fill-accent-500 w-3 h-3 text-accent-500" aria-hidden="true" />
              <span>{copy.etiqueta}</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-950 leading-[1.1] tracking-tight">
              {copy.h1} <span className="text-accent-500">{copy.h1Destacado}</span>
            </h1>

            <p className="text-lg text-brand-600 max-w-lg leading-relaxed">{copy.subtitulo}</p>

            <div className="pt-4 flex flex-col sm:flex-row gap-3">
              <button
                onClick={scrollToCheckout}
                className="shopify-btn-primary text-lg py-4 px-10 rounded-full shadow-lg hover:scale-105 transition-transform font-bold"
              >
                Comprar por ${product.price.toFixed(2)}
              </button>
              <a
                href={whatsappProducto}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Escribir por WhatsApp al ${WHATSAPP_NUMERO} sobre el ${product.name}`}
                className="inline-flex items-center justify-center gap-2 text-lg py-4 px-8 rounded-full font-bold border-2 border-brand-950 text-brand-950 hover:bg-brand-950 hover:text-white transition-colors"
              >
                <MessageCircle className="w-5 h-5" aria-hidden="true" />
                Escríbenos
              </a>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm font-semibold text-brand-500 pt-4">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" aria-hidden="true" /> Pago único
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" aria-hidden="true" /> Sin apps
              </span>
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4 text-green-500" aria-hidden="true" /> Envío a todo Panamá
              </span>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <Foto
              src={fotos[0]}
              alt={copy.heroImagenAlt}
              ratio="aspect-[4/5]"
              className="shadow-2xl border-4 border-white"
            />
          </div>
        </div>
      </section>

      {/* 1.5 BARRA DE CONFIANZA */}
      <section className="bg-white border-b border-brand-200 py-8 px-4" aria-label="Condiciones de compra">
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: Truck, ...CONDICIONES.envio },
            { icon: ShieldCheck, ...CONDICIONES.garantia },
            { icon: CreditCard, ...CONDICIONES.pago },
            { icon: Headset, ...CONDICIONES.soporte },
          ].map(({ icon: Icon, titulo, texto }) => (
            <div key={titulo} className="flex gap-3">
              <Icon className="w-5 h-5 text-accent-500 flex-shrink-0 mt-0.5" aria-hidden="true" />
              <div>
                <h2 className="text-sm font-bold text-brand-950">{titulo}</h2>
                <p className="text-xs text-brand-500 leading-relaxed mt-0.5">{texto}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 2. BENEFICIOS */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto space-y-24">
          {copy.beneficios.map((b, i) => {
            const Icon = ICONOS[b.icono];
            const imagenPrimero = i % 2 === 0;
            return (
              <div key={b.titulo} className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                <Foto
                  src={fotos[i + 1]}
                  alt={b.imagenAlt}
                  className={imagenPrimero ? '' : 'order-1 lg:order-2'}
                />
                <div className={`space-y-6 ${imagenPrimero ? '' : 'order-2 lg:order-1'}`}>
                  <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center text-accent-500">
                    <Icon className="w-6 h-6" aria-hidden="true" />
                  </div>
                  <h2 className="text-3xl font-black text-brand-950">{b.titulo}</h2>
                  <p className="text-lg text-brand-600 leading-relaxed">{b.texto}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 2.5 SOFTWARE */}
      <section className="py-20 px-4 bg-brand-50 border-y border-brand-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-accent-100 text-accent-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span>Panel starTAP incluido</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-950">
              Control de tus enlaces y estadísticas en tiempo real
            </h2>
            <p className="text-brand-600 leading-relaxed">
              Cada dispositivo viene con tu propia plataforma web, sin costo mensual. Reclamas tu equipo
              en el panel, cambias el enlace hacia donde dirige (Google Maps, WhatsApp, Instagram) en
              segundos y mides cuántas veces lo escanean tus clientes.
            </p>
            <ul className="space-y-3 text-sm font-semibold text-brand-700">
              {[
                'Cambio de enlace instantáneo sin reprogramar el chip',
                'Estadísticas de escaneos por día y tipo de teléfono',
                'Asigna dispositivos a distintos locales o empleados',
              ].map((t) => (
                <li key={t} className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-accent-500 flex-shrink-0" aria-hidden="true" />
                  {t}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-brand-200 shadow-xl space-y-4">
            <div className="bg-brand-950 rounded-2xl p-6 text-white space-y-4">
              <div className="flex justify-between items-center border-b border-brand-800 pb-3">
                <span className="text-xs font-bold text-accent-400 uppercase tracking-widest">
                  Panel starTAP
                </span>
                <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-mono">
                  Activo
                </span>
              </div>
              <div>
                <p className="text-xs text-brand-400">Dispositivo vinculado:</p>
                <p className="font-bold text-sm text-white">
                  {copy.nombreCorto} principal (STT-1001)
                </p>
              </div>
              <div className="bg-brand-900 p-3 rounded-lg flex justify-between items-center text-xs">
                <span>Enlace actual:</span>
                <span className="font-mono text-accent-300 truncate max-w-[180px]">
                  g.page/r/tu-negocio
                </span>
              </div>
            </div>
            <Foto
              src={fotos[3]}
              alt={`Panel de control starTAP mostrando los escaneos del ${product.name}`}
              ratio="aspect-[16/9]"
            />
          </div>
        </div>
      </section>

      {/* 3. CÓMO FUNCIONA */}
      <section className="py-20 bg-brand-950 text-white px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white">
              Consigue reseñas en 3 simples pasos
            </h2>
            <p className="text-brand-300 text-lg">Es tan fácil que tus clientes lo harán por instinto.</p>
          </div>
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {copy.pasos.map((p, i) => (
              <li
                key={p.titulo}
                className="bg-brand-900 rounded-2xl p-8 border border-brand-800 text-center space-y-4"
              >
                <div className="w-12 h-12 bg-accent-500 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold mb-6">
                  {i + 1}
                </div>
                <h3 className="text-xl font-bold text-white">{p.titulo}</h3>
                <p className="text-brand-300 text-sm">{p.texto}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 3.2 TESTIMONIOS — solo si hay reales */}
      {TESTIMONIOS.length > 0 && (
        <section className="py-20 px-4 bg-white border-b border-brand-200">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl font-black text-brand-950 text-center mb-12">
              Negocios panameños que ya lo usan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {TESTIMONIOS.map((t) => (
                <figure
                  key={t.negocio}
                  className="rounded-2xl border border-brand-200 p-6 bg-white"
                >
                  <div className="flex gap-0.5 mb-3" aria-label="5 de 5 estrellas">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-accent-500 text-accent-500" aria-hidden="true" />
                    ))}
                  </div>
                  <blockquote className="text-brand-600 text-sm leading-relaxed">{t.texto}</blockquote>
                  <figcaption className="mt-4 text-xs">
                    <span className="font-bold text-brand-950">{t.autor}</span>
                    <span className="text-brand-500"> · {t.negocio}, {t.ciudad}</span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 3.5 GUÍA DE AUTOCONFIGURACIÓN */}
      <section className="py-12 px-4 bg-white border-b border-brand-200">
        <div className="max-w-5xl mx-auto">
          <AutoConfigGuide />
        </div>
      </section>

      {/* 4. CHECKOUT */}
      <section id="checkout-section" className="py-12 sm:py-20 px-4 sm:px-6 bg-brand-50">
        <div className="max-w-6xl mx-auto bg-white rounded-3xl shadow-card border border-brand-200 overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left Column: Image / Gallery preview */}
            <div className="lg:col-span-5 bg-brand-100/70 flex flex-col items-center justify-center p-6 sm:p-10 min-h-[280px] sm:min-h-[380px]">
              <Foto
                src={fotos[fotos.length - 1]}
                alt={`${product.name} de starTAP, vista de producto`}
                ratio="aspect-square"
                className="w-full max-w-[340px] sm:max-w-[380px] mx-auto drop-shadow-md"
              />
              <div className="mt-4 flex items-center gap-2 text-xs font-semibold text-brand-600 bg-white/90 px-3.5 py-1.5 rounded-full border border-brand-200/80 shadow-sm backdrop-blur-sm">
                <CheckCircle2 className="w-4 h-4 text-accent-500 flex-shrink-0" />
                <span>Listo para usar en Panamá</span>
              </div>
            </div>

            {/* Right Column: Checkout Config Form */}
            <div className="lg:col-span-7 p-5 sm:p-8 md:p-10 space-y-6 sm:space-y-8 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent-50 text-accent-700 border border-accent-200 text-[11px] font-extrabold uppercase tracking-wide">
                  <Zap className="w-3.5 h-3.5" /> Configuración en 1 paso
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-brand-950 tracking-tight">
                  Personaliza y pide tu {copy.nombreCorto}
                </h2>
                <p className="text-xs sm:text-sm text-brand-500 leading-relaxed">
                  Nosotros lo grabamos y programamos. Tú solo ingresas el nombre de tu negocio.
                </p>
              </div>

              <form onSubmit={handleAddToCart} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="businessName" className="text-xs sm:text-sm font-bold text-brand-950 block">
                    Nombre del negocio <span className="text-brand-400 font-normal">(como aparece en Google Maps)</span>
                  </label>
                  <input
                    id="businessName"
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Ej. Restaurante El Bodegón"
                    required
                    className="shopify-input text-base sm:text-sm py-3 px-4 rounded-xl border-brand-300 focus:border-brand-950 focus:ring-brand-950 w-full"
                  />
                </div>

                <div className="bg-amber-50/90 border border-amber-200/80 rounded-2xl p-4 space-y-1.5">
                  <p className="flex items-center space-x-2 text-amber-900 font-bold text-xs sm:text-sm">
                    <Zap className="h-4 w-4 text-amber-600 flex-shrink-0" aria-hidden="true" />
                    <span>100% auto-configurable</span>
                  </p>
                  <p className="text-xs text-amber-800 leading-relaxed">
                    Llega listo y pre-programado. En el primer toque lo vinculas a tu negocio en 30
                    segundos, sin tener que darnos URLs por adelantado.
                  </p>
                </div>

                <fieldset className="space-y-2.5">
                  <legend className="text-xs sm:text-sm font-bold text-brand-950 mb-1">
                    Color o Acabado del {copy.nombreCorto.toLowerCase()}
                  </legend>
                  <div className="flex flex-wrap gap-2.5">
                    {colors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        aria-pressed={color === c}
                        className={`py-2.5 px-4 text-xs font-bold rounded-xl border transition-all flex items-center gap-2 ${
                          color === c
                            ? 'border-brand-950 bg-brand-950 text-white shadow-md'
                            : 'border-brand-200 hover:border-brand-400 bg-white text-brand-800 hover:bg-brand-50'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          c.toLowerCase().includes('negro') ? 'bg-black border border-white/20' :
                          c.toLowerCase().includes('blanco') ? 'bg-white border border-brand-400' :
                          c.toLowerCase().includes('dorado') ? 'bg-amber-400' :
                          c.toLowerCase().includes('plata') ? 'bg-slate-300' :
                          c.toLowerCase().includes('bambú') || c.toLowerCase().includes('bambu') ? 'bg-amber-200' :
                          c.toLowerCase().includes('nogal') ? 'bg-amber-900' : 'bg-brand-400'
                        }`} />
                        {c}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="space-y-3 pt-2">
                  <p className="text-xs font-bold uppercase tracking-wider text-brand-900">
                    Personalización opcional
                  </p>

                  <div
                    className={`border rounded-2xl p-4 sm:p-5 transition-all ${
                      hasCustomLogo ? 'border-brand-950 bg-brand-50/60 shadow-sm' : 'border-brand-200 bg-white'
                    }`}
                  >
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasCustomLogo}
                        onChange={(e) => setHasCustomLogo(e.target.checked)}
                        className="mt-0.5 h-4 w-4 accent-brand-950 rounded cursor-pointer"
                      />
                      <span className="flex-1">
                        <span className="flex justify-between items-center flex-wrap gap-1">
                          <span className="text-xs sm:text-sm font-bold text-brand-950 uppercase flex items-center gap-1.5">
                            <ImageIcon className="h-4 w-4 text-brand-600" aria-hidden="true" />
                            Agregar logo personalizado
                          </span>
                          <span className="text-xs font-black text-brand-950 bg-white px-2 py-0.5 rounded-md border border-brand-200">+ $5.00 USD</span>
                        </span>
                        <span className="block text-xs text-brand-500 mt-1">
                          Impresión de tu logo oficial en el frontal (Opcional si lo requieres).
                        </span>
                      </span>
                    </label>

                    {hasCustomLogo && (
                      <div className="mt-4 pt-3 border-t border-brand-200 space-y-2">
                        <p className="text-[11px] font-bold text-brand-800 uppercase">
                          Subir archivo de logo (obligatorio)
                        </p>
                        <div className="border border-dashed border-brand-300 rounded-xl p-4 text-center cursor-pointer hover:border-brand-950 transition-colors relative bg-white">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            aria-label="Subir archivo de logo"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Upload className="h-5 w-5 text-brand-400 mx-auto mb-1 stroke-[1.8]" aria-hidden="true" />
                          <span className="text-xs text-brand-600 font-bold block">
                            {logoFile ? `Logo cargado: ${logoFile}` : 'Selecciona o arrastra tu logo (PNG, SVG, JPG)'}
                          </span>
                        </div>
                        {logoPreview && (
                          <div className="mt-2 flex items-center space-x-3 bg-white p-2.5 rounded-xl border border-brand-200">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={logoPreview}
                              alt="Vista previa del logo que subiste"
                              className="h-9 w-9 object-contain rounded border"
                            />
                            <span className="text-xs text-green-600 font-bold">
                              ✓ Logo adjuntado correctamente
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div
                    className={`border rounded-2xl p-4 sm:p-5 transition-all ${
                      hasQrCode ? 'border-brand-950 bg-brand-50/60 shadow-sm' : 'border-brand-200 bg-white'
                    }`}
                  >
                    <label className="flex items-start space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={hasQrCode}
                        onChange={(e) => setHasQrCode(e.target.checked)}
                        className="mt-0.5 h-4 w-4 accent-brand-950 rounded cursor-pointer"
                      />
                      <span className="flex-1">
                        <span className="flex justify-between items-center flex-wrap gap-1">
                          <span className="text-xs sm:text-sm font-bold text-brand-950 uppercase flex items-center gap-1.5">
                            <QrCode className="h-4 w-4 text-brand-600" aria-hidden="true" />
                            Agregar código QR impreso HD
                          </span>
                          <span className="text-xs font-black text-brand-950 bg-white px-2 py-0.5 rounded-md border border-brand-200">+ $3.00 USD</span>
                        </span>
                        <span className="block text-xs text-brand-500 mt-1">
                          Respaldo impreso HD para teléfonos sin lector NFC.
                        </span>
                      </span>
                    </label>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-xs sm:text-sm font-bold text-brand-950">Cantidad</p>
                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      aria-label="Reducir cantidad"
                      className="w-11 h-11 flex items-center justify-center rounded-xl border border-brand-200 hover:bg-brand-100 font-extrabold text-lg text-brand-800 transition-colors"
                    >
                      −
                    </button>
                    <span className="font-black text-lg text-brand-950 w-10 text-center" aria-live="polite">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQuantity(quantity + 1)}
                      aria-label="Aumentar cantidad"
                      className="w-11 h-11 flex items-center justify-center rounded-xl border border-brand-200 hover:bg-brand-100 font-extrabold text-lg text-brand-800 transition-colors"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="pt-6 border-t border-brand-200/80 space-y-4">
                  <div className="flex justify-between items-baseline bg-brand-50/80 p-4 rounded-2xl border border-brand-100">
                    <div>
                      <span className="text-brand-500 text-xs sm:text-sm block">Total a pagar</span>
                      <span className="text-[11px] text-green-700 font-semibold">Envío a Panamá incluido</span>
                    </div>
                    <span className="text-3xl font-black text-brand-950">
                      ${totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <button
                    type="submit"
                    className="shopify-btn-primary w-full text-base sm:text-lg py-4 rounded-2xl shadow-xl hover:shadow-2xl relative overflow-hidden transition-all transform active:scale-[0.99]"
                  >
                    <span className={`flex items-center justify-center gap-2 transition-opacity duration-300 ${isSuccess ? 'opacity-0' : 'opacity-100'}`}>
                      Añadir al carrito <ArrowRight className="w-5 h-5" aria-hidden="true" />
                    </span>
                    <span
                      className={`absolute inset-0 flex items-center justify-center gap-2 transition-opacity duration-300 bg-accent-600 text-white font-bold ${
                        isSuccess ? 'opacity-100' : 'opacity-0'
                      }`}
                    >
                      ¡Agregado! <CheckCircle2 className="w-5 h-5" aria-hidden="true" />
                    </span>
                  </button>

                  <p className="text-center text-xs text-brand-400 mt-4">
                    {CONDICIONES.garantia.titulo} · {CONDICIONES.envio.titulo}
                  </p>

                  <p className="text-center text-xs text-brand-500 mt-3">
                    ¿Dudas antes de comprar?{' '}
                    <a
                      href={whatsappProducto}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-bold text-accent-600 hover:underline"
                    >
                      Escríbenos al {WHATSAPP_NUMERO}
                    </a>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 5. FAQs */}
      <section className="py-20 px-4 bg-white border-t border-brand-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black text-brand-950">Preguntas frecuentes</h2>
            <p className="text-sm text-brand-500 mt-2">
              Lo que necesitas saber sobre tu SEO local en Panamá.
            </p>
          </div>

          <div className="space-y-4">
            {copy.faqs.map((faq, idx) => (
              <div key={faq.q} className="border border-brand-200 rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  aria-expanded={activeFaq === idx}
                  className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-brand-50 transition-colors focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <span className="font-bold text-brand-900 pr-8">{faq.q}</span>
                  {activeFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-accent-500 flex-shrink-0" aria-hidden="true" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-brand-400 flex-shrink-0" aria-hidden="true" />
                  )}
                </button>
                <div
                  className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${
                    activeFaq === idx ? 'max-h-96 py-4 border-t border-brand-100' : 'max-h-0'
                  }`}
                >
                  <p className="text-brand-600 text-sm leading-relaxed">{faq.a}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
