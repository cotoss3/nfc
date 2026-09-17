'use client';

import React, { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { dbLocal, Product } from '@/lib/db';
import { useCart } from '@/context/CartContext';
import { ArrowLeft, Upload, Check, Info, Zap, QrCode, ChevronLeft, ChevronRight, Image as ImageIcon, MapPin, CheckCircle2 } from 'lucide-react';
import ProductLanding from '@/components/landings/ProductLanding';
import { getLandingCopy } from '@/lib/landings';
import AutoConfigGuide from '@/components/AutoConfigGuide';
import { trackGA } from '@/lib/googleanalytics';

function isColorDisabled(productId: string, colorName: string): boolean {
  const normColor = (colorName || '').toLowerCase();
  // Las variaciones en color Negro están agotadas
  if (normColor.includes('negro')) {
    return true;
  }
  return false;
}

export default function ProductDetailClient({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  
  // Customization & Add-on States
  const [color, setColor] = useState('Blanco Premium');
  const [businessName, setBusinessName] = useState('');
  const [hasCustomLogo, setHasCustomLogo] = useState(false);
  const [hasQrCode, setHasQrCode] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);

  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    const found = dbLocal.getProductById(params.id);
    if (!found) {
      notFound();
    } else {
      setProduct(found);
      setSelectedImage(found.image);
      
      const landingCopy = getLandingCopy(found.id);
      const defaultColors = found.colors || (landingCopy?.coloresPorDefecto) || (found.category === 'cards' 
        ? ['Blanco Premium', 'Negro Premium'] 
        : found.category === 'plates'
        ? ['Acrílico Transparente', 'Acrílico Blanco', 'Acrílico Negro']
        : ['Blanco Brillante', 'Negro Mate']);
      const validColor = defaultColors.find((c) => !isColorDisabled(found.id, c)) || defaultColors[0];
      setColor(validColor);

      trackGA('view_item', {
        currency: 'USD',
        value: found.price,
        items: [
          {
            item_id: found.id,
            item_name: found.name,
            price: found.price,
            quantity: 1,
            item_variant: validColor,
          },
        ],
      });
    }
  }, [params.id]);

  if (!product) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm text-brand-400">Cargando producto...</div>;
  }

  if (getLandingCopy(product.id)) {
    return <ProductLanding product={product} />;
  }

  const landingCopy = getLandingCopy(product.id);
  const colors = product.colors || landingCopy?.coloresPorDefecto || (product.category === 'cards' 
    ? ['Blanco Premium', 'Negro Premium'] 
    : product.category === 'plates'
    ? ['Acrílico Transparente', 'Acrílico Blanco', 'Acrílico Negro']
    : ['Blanco Brillante', 'Negro Mate']);

  const logoPrice = hasCustomLogo ? 5 : 0;
  const qrPrice = hasQrCode ? 3 : 0;
  const unitPrice = product.price + logoPrice + qrPrice;
  const totalPrice = unitPrice * quantity;

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setLogoFile(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (isColorDisabled(product.id, color)) {
      alert('La variación de color seleccionada se encuentra agotada temporalmente. Por favor selecciona una opción disponible.');
      return;
    }
    if (!businessName) {
      alert('Por favor ingresa el nombre de tu negocio para continuar');
      return;
    }

    if (hasCustomLogo && !logoPreview) {
      alert('Por favor sube el archivo de tu logo personalizado para continuar');
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
      logo_url: logoPreview || undefined
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      router.push('/cart');
    }, 1200);
  };

  return (
    <div className="shopify-container max-w-6xl w-full px-4 sm:px-6 py-8 sm:py-12">
      {/* Back Button */}
      <Link href="/catalogo" className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-brand-400 hover:text-brand-950 transition-colors mb-8 sm:mb-10">
        <ArrowLeft className="h-4 w-4" />
        <span>Volver al Catálogo</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Side: Mockup & Images */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Physical Photo Gallery Carousel */}
          <div className="space-y-4">
            <div className="relative bg-white border border-brand-200 rounded-2xl p-4 sm:p-6 shadow-premium flex items-center justify-center aspect-square overflow-hidden group">
              <img src={selectedImage || product.image} alt={product.name} className="max-h-full max-w-full object-contain transition-all duration-300" />

              {product.images && product.images.length > 1 && (
                <>
                  <span className="absolute top-3 right-3 bg-brand-950/80 backdrop-blur-md text-white text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full shadow border border-white/20">
                    {(product.images.indexOf(selectedImage || product.image) + 1 || 1)} / {product.images.length}
                  </span>

                  <button
                    type="button"
                    onClick={() => {
                      const all = product.images || [product.image];
                      const currIdx = all.indexOf(selectedImage || product.image);
                      const prevIdx = currIdx <= 0 ? all.length - 1 : currIdx - 1;
                      setSelectedImage(all[prevIdx]);
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-brand-950 shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110 active:scale-95"
                  >
                    <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const all = product.images || [product.image];
                      const currIdx = all.indexOf(selectedImage || product.image);
                      const nextIdx = currIdx >= all.length - 1 ? 0 : currIdx + 1;
                      setSelectedImage(all[nextIdx]);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white/90 hover:bg-white text-brand-950 shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110 active:scale-95"
                  >
                    <ChevronRight className="w-5 h-5 stroke-[2.5]" />
                  </button>
                </>
              )}
            </div>
            
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {product.images.map((img, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square border rounded-xl overflow-hidden bg-brand-50 hover:border-brand-950 transition-colors ${
                      (selectedImage || product.image) === img ? 'border-brand-950 ring-2 ring-brand-950' : 'border-brand-200'
                    }`}
                  >
                    <img src={img} alt={`Miniatura ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="bg-white border border-brand-200 rounded-2xl p-5 sm:p-6 space-y-4 shadow-card">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-950">Especificaciones</h3>
            <ul className="text-xs text-brand-500 space-y-2.5">
              <li className="flex justify-between"><span>Material</span><span className="font-semibold text-brand-800">{product.material || 'PVC Técnico / Acrílico Premium'}</span></li>
              <li className="flex justify-between"><span>Chip Interno</span><span className="font-semibold text-brand-800">NTAG213 (Alta velocidad)</span></li>
              <li className="flex justify-between"><span>Ciclo de Vida</span><span className="font-semibold text-brand-800">100,000 lecturas / Reutilizable</span></li>
              <li className="flex justify-between"><span>Fulfillment</span><span className="font-semibold text-brand-800">Programación y Configuración en Panamá</span></li>
            </ul>
          </div>
        </div>

        {/* Right Side: Product Details & Config */}
        <div className="lg:col-span-7 bg-white border border-brand-200 rounded-3xl p-5 sm:p-8 md:p-10 shadow-card">
          <form onSubmit={handleAddToCart} className="space-y-6 sm:space-y-8">
            {/* Header info */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest block">Colección Oficial</span>
              <h2 className="text-2xl sm:text-3xl font-black text-brand-950 uppercase tracking-wide">{product.name}</h2>
              <div className="flex items-center space-x-3 flex-wrap gap-2">
                <span className="text-2xl font-black text-brand-950">${unitPrice.toFixed(2)}</span>
                <span className="text-xs text-green-700 bg-green-50 px-2.5 py-1 font-bold uppercase rounded-lg border border-green-200">Pago único • Sin Suscripción</span>
              </div>
              {product.description && (
                <p className="text-xs sm:text-sm text-brand-600 pt-2 leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            <hr className="border-brand-200" />

            {/* Customization Options */}
            <div className="space-y-6">
              {/* Option: Color */}
              <div className="space-y-2.5">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-900 block">Acabado / Material</label>
                <div className="flex flex-wrap gap-2.5">
                  {colors.map((c) => {
                    const isDisabled = isColorDisabled(product.id, c);
                    const isTransparente = c.toLowerCase().includes('transparente');
                    const isBlack = c.toLowerCase().includes('negro');
                    return (
                      <button
                        type="button"
                        key={c}
                        disabled={isDisabled}
                        onClick={() => !isDisabled && setColor(c)}
                        title={isDisabled ? `Variación ${c} agotada` : c}
                        className={`py-2.5 px-4 text-xs font-bold uppercase tracking-wider border rounded-xl transition-all flex items-center gap-2 ${
                          isDisabled
                            ? 'opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200 line-through'
                            : color === c
                            ? 'border-brand-950 bg-brand-950 text-white shadow-md'
                            : 'border-brand-200 hover:bg-brand-100 hover:text-brand-950 text-brand-600 bg-white'
                        }`}
                      >
                        <span className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${
                          isTransparente ? 'bg-sky-100/90 border border-sky-400/80 shadow-inner' :
                          isBlack ? 'bg-black opacity-50' :
                          c.toLowerCase().includes('blanco') ? 'bg-white border border-brand-400' :
                          c.toLowerCase().includes('dorado') ? 'bg-amber-400' :
                          c.toLowerCase().includes('plata') ? 'bg-slate-300' :
                          c.toLowerCase().includes('bambú') || c.toLowerCase().includes('bambu') ? 'bg-amber-200' :
                          c.toLowerCase().includes('nogal') ? 'bg-amber-900' : 'bg-brand-400'
                        }`} />
                        <span>{c.replace(/\s*\(Agotado\)/i, '')}</span>
                        {isDisabled && (
                          <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-red-100 text-red-700 normal-case no-underline">
                            Agotado
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Option: Name or Link (DESTACADO) */}
              <div className="bg-gradient-to-br from-amber-500/10 via-amber-400/10 to-amber-500/20 border-2 border-amber-400/90 rounded-2xl p-5 shadow-md relative space-y-3">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="inline-flex items-center gap-1.5 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md shadow-sm">
                    <MapPin className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                    <span>Paso 1: Enlace o Nombre de tu Negocio</span>
                  </div>
                  <span className="text-[10px] font-extrabold text-amber-900 bg-amber-200/80 border border-amber-400/70 px-2 py-0.5 rounded uppercase">
                    Requerido para programar
                  </span>
                </div>

                <div>
                  <label htmlFor="businessName" className="text-sm font-black text-slate-950 block mb-1">
                    Enlace de Google Maps o Nombre del negocio <span className="text-amber-900 font-bold">(para tu chip NFC y QR)</span>
                  </label>
                  <p className="text-xs text-slate-600 mb-2.5 font-medium leading-snug">
                    Pega aquí el enlace de tu perfil en Google Maps (o escribe el nombre exacto de tu local). Lo programamos de fábrica en tu chip NFC.
                  </p>

                  <div className="relative">
                    <input
                      id="businessName"
                      type="text"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="Ej: https://maps.app.goo.gl/xxx o Pizzería Roma Panamá"
                      required
                      className="w-full text-base sm:text-sm py-3.5 px-4 rounded-xl bg-white border-2 border-amber-400 font-bold text-slate-950 placeholder:text-slate-400 placeholder:font-normal transition-all shadow-inner focus:border-slate-950 focus:ring-2 focus:ring-slate-950 focus:outline-none"
                    />
                    {businessName.trim().length > 0 && (
                      <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-emerald-700 text-xs font-black flex items-center gap-1 bg-emerald-100 px-2 py-1 rounded border border-emerald-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Listo
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Auto-Configurable Notice Box */}
              <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 space-y-1.5">
                <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs sm:text-sm">
                  <Zap className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>100% Auto-Configurable</span>
                </div>
                <p className="text-xs text-amber-800 leading-relaxed">
                  Tu dispositivo es auto-configurable al llegar. En tu primer toque lo vinculas a tu negocio en 30 segundos sin necesidad de ingresar URLs ahora.
                </p>
              </div>

              {/* Add-ons Checkboxes */}
              <div className="space-y-3 pt-2">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-950">Personalización y Opciones (Opcionales)</p>
                
                {/* Logo Checkbox */}
                <div className={`border rounded-2xl p-4 sm:p-5 transition-all ${hasCustomLogo ? 'border-brand-950 bg-brand-50/60 shadow-sm' : 'border-brand-200 bg-white'}`}>
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasCustomLogo}
                      onChange={(e) => setHasCustomLogo(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-brand-950 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center flex-wrap gap-1">
                        <span className="text-xs sm:text-sm font-bold text-brand-950 uppercase flex items-center gap-1.5">
                          <ImageIcon className="h-4 w-4 text-brand-600" />
                          Agregar logo personalizado
                        </span>
                        <span className="text-xs font-black text-brand-950 bg-white px-2 py-0.5 rounded-md border border-brand-200">+ $5.00 USD</span>
                      </div>
                      <p className="text-xs text-brand-500 mt-1">Impresión de tu logo oficial en el frontal (Opcional si el cliente lo solicita).</p>
                    </div>
                  </label>

                  {hasCustomLogo && (
                    <div className="mt-4 pt-3 border-t border-brand-200 space-y-2">
                      <label className="text-[11px] font-bold text-brand-800 uppercase block">Subir Archivo de Logo (Obligatorio)</label>
                      <div className="border border-dashed border-brand-300 rounded-xl p-4 text-center cursor-pointer hover:border-brand-950 transition-colors relative bg-white">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="h-5 w-5 text-brand-400 mx-auto mb-1 stroke-[1.8]" />
                        <span className="text-xs text-brand-600 font-bold block">
                          {logoFile ? `Logo cargado: ${logoFile}` : 'Selecciona o arrastra tu logo (PNG, SVG, JPG)'}
                        </span>
                      </div>
                      {logoPreview && (
                        <div className="mt-2 flex items-center space-x-3 bg-white p-2.5 rounded-xl border border-brand-200">
                          <img src={logoPreview} alt="Logo Preview" className="h-9 w-9 object-contain rounded border" />
                          <span className="text-xs text-green-600 font-bold">✓ Vista previa de logo cargada</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* QR Checkbox */}
                <div className={`border rounded-2xl p-4 sm:p-5 transition-all ${hasQrCode ? 'border-brand-950 bg-brand-50/60 shadow-sm' : 'border-brand-200 bg-white'}`}>
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasQrCode}
                      onChange={(e) => setHasQrCode(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-brand-950 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center flex-wrap gap-1">
                        <span className="text-xs sm:text-sm font-bold text-brand-950 uppercase flex items-center gap-1.5">
                          <QrCode className="h-4 w-4 text-brand-600" />
                          Agregar Código QR Impreso HD
                        </span>
                        <span className="text-xs font-black text-brand-950 bg-white px-2 py-0.5 rounded-md border border-brand-200">+ $3.00 USD</span>
                      </div>
                      <p className="text-xs text-brand-500 mt-1">Respaldo impreso HD para teléfonos sin lector NFC.</p>
                    </div>
                  </label>
                </div>
              </div>

            </div>

            <hr className="border-brand-200" />

            {/* Quantity and Checkout Add button */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              {/* Quantity */}
              <div className="flex items-center border border-brand-300 rounded-xl bg-white w-full sm:w-auto justify-between p-1">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-10 h-10 flex items-center justify-center font-extrabold text-lg text-brand-700 hover:bg-brand-100 rounded-lg transition-colors"
                >
                  −
                </button>
                <span className="px-4 font-black text-base text-brand-950">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-10 h-10 flex items-center justify-center font-extrabold text-lg text-brand-700 hover:bg-brand-100 rounded-lg transition-colors"
                >
                  +
                </button>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={isSuccess}
                className={`shopify-btn-primary flex-grow text-xs sm:text-sm tracking-wider uppercase font-bold py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all ${
                  isSuccess ? 'bg-accent-600 hover:bg-accent-600' : ''
                }`}
              >
                {isSuccess ? (
                  <span className="flex items-center justify-center gap-2">
                    <Check className="h-5 w-5" />
                    <span>¡Agregado al Carrito!</span>
                  </span>
                ) : (
                  <span>Añadir al Carrito • ${totalPrice.toFixed(2)}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* AutoConfigGuide 3 Step Visual Component */}
      <div className="mt-16">
        <AutoConfigGuide />
      </div>

      {/* SEO & Extra Information Block */}
      <div className="mt-24 pt-16 border-t border-brand-200">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-black text-brand-950 uppercase tracking-tight">Preguntas Frecuentes sobre la {product.name}</h2>
            <p className="text-brand-600 text-sm">Todo lo que necesitas saber antes de potenciar tu SEO local en Panamá.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-brand-700">
            <div className="space-y-3">
              <h3 className="font-bold text-brand-950 text-base">¿En qué negocios funciona mejor?</h3>
              <p className="leading-relaxed">
                Ideal para negocios con mostrador o pared donde fijarla: restaurantes, bares, hoteles, recepciones, clínicas, peluquerías y cualquier local de atención al público. Su diseño se adapta a cualquier superficie comercial.
              </p>
            </div>
            
            <div className="space-y-3">
              <h3 className="font-bold text-brand-950 text-base">¿Cómo se instala?</h3>
              <p className="leading-relaxed">
                La instalación es muy sencilla: limpia la superficie, despega el adhesivo de alta fijación de la parte trasera y pégala en el lugar que elijas. No necesitas herramientas ni perforar la pared. En menos de un minuto está lista.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-brand-950 text-base">¿Necesito una app para que funcione?</h3>
              <p className="leading-relaxed">
                No. La placa funciona directamente con el lector NFC integrado en la mayoría de smartphones modernos. Tus clientes solo necesitan acercar su teléfono y tener sesión iniciada en su cuenta de Google.
              </p>
            </div>

            <div className="space-y-3">
              <h3 className="font-bold text-brand-950 text-base">¿Por qué elegir esta solución?</h3>
              <p className="leading-relaxed">
                Aumentar tus reseñas en Google Maps orgánicamente es la mejor inversión en marketing local. Más estrellas atraen a más clientes todos los días, mejorando tu posicionamiento sobre tus competidores en el mapa de Panamá.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
