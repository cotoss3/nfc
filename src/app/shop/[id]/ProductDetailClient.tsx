'use client';

import React, { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { dbLocal, Product } from '@/lib/db';
import { useCart } from '@/context/CartContext';
import { ArrowLeft, Upload, Check, Info, Zap, QrCode, Image as ImageIcon } from 'lucide-react';
import ProductLanding from '@/components/landings/ProductLanding';
import { getLandingCopy } from '@/lib/landings';
import AutoConfigGuide from '@/components/AutoConfigGuide';

export default function ProductDetailClient({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  
  // Customization & Add-on States
  const [color, setColor] = useState('Negro Premium');
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
      
      const defaultColors = found.colors || (found.category === 'cards' 
        ? ['Negro Premium', 'Blanco Premium', 'Madera Bambú', 'Madera Nogal'] 
        : ['Negro Mate', 'Blanco Brillante', 'Dorado Espejo', 'Plata Cepillado']);
      setColor(defaultColors[0]);
    }
  }, [params.id]);

  if (!product) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm text-brand-400">Cargando producto...</div>;
  }

  if (getLandingCopy(product.id)) {
    return <ProductLanding product={product} />;
  }

  const colors = product.colors || (product.category === 'cards' 
    ? ['Negro Premium', 'Blanco Premium', 'Madera Bambú', 'Madera Nogal'] 
    : ['Negro Mate', 'Blanco Brillante', 'Dorado Espejo', 'Plata Cepillado']);

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
    <div className="shopify-container max-w-5xl py-12">
      {/* Back Button */}
      <Link href="/shop" className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-brand-400 hover:text-brand-950 transition-colors mb-10">
        <ArrowLeft className="h-4 w-4" />
        <span>Volver a Colecciones</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Side: Mockup & Images */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Physical Photo Gallery */}
          <div className="space-y-4">
            <div className="bg-white border border-brand-200 rounded-lg p-4 shadow-premium flex items-center justify-center aspect-square overflow-hidden">
              <img src={selectedImage || product.image} alt={product.name} className="max-h-full max-w-full object-contain" />
            </div>
            
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((img, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square border rounded overflow-hidden bg-brand-50 hover:border-brand-950 transition-colors ${
                      (selectedImage || product.image) === img ? 'border-brand-950 ring-1 ring-brand-950' : 'border-brand-200'
                    }`}
                  >
                    <img src={img} alt={`Miniatura ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="bg-white border border-brand-200 rounded-lg p-6 space-y-4 shadow-premium">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-950">Especificaciones</h3>
            <ul className="text-xs text-brand-500 space-y-2">
              <li className="flex justify-between"><span>Material</span><span className="font-semibold text-brand-800">{product.material || (product.category === 'plates' ? 'Acrílico Premium 3mm' : 'PVC / Madera Maciza')}</span></li>
              <li className="flex justify-between"><span>Chip Interno</span><span className="font-semibold text-brand-800">NTAG213 (Alta velocidad)</span></li>
              <li className="flex justify-between"><span>Ciclo de Vida</span><span className="font-semibold text-brand-800">100,000 lecturas / Grabado Permanente</span></li>
              <li className="flex justify-between"><span>Fulfillment</span><span className="font-semibold text-brand-800">Grabado láser en Panamá</span></li>
            </ul>
          </div>
        </div>

        {/* Right Side: Product Details & Config */}
        <div className="lg:col-span-7 bg-white border border-brand-200 rounded-lg p-8 shadow-premium">
          <form onSubmit={handleAddToCart} className="space-y-8">
            {/* Header info */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest block">Colección Oficial</span>
              <h2 className="text-2xl font-black text-brand-950 uppercase tracking-wide">{product.name}</h2>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black text-brand-950">${unitPrice.toFixed(2)}</span>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 font-bold uppercase rounded">Pago único • Sin Suscripción</span>
              </div>
              {product.description && (
                <p className="text-sm text-brand-600 pt-2 leading-relaxed">
                  {product.description}
                </p>
              )}
            </div>

            <hr className="border-brand-200" />

            {/* Customization Options */}
            <div className="space-y-6">
              {/* Option: Color */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-900 block">Acabado / Material</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColor(c)}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border rounded transition-all ${
                        color === c
                          ? 'border-brand-950 bg-brand-950 text-white shadow-sm'
                          : 'border-brand-200 hover:bg-brand-100 hover:text-brand-950 text-brand-600 bg-white'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option: Name */}
              <div className="space-y-1">
                <label htmlFor="businessName" className="text-xs font-bold uppercase tracking-wider text-brand-900 block">Nombre del Establecimiento</label>
                <input
                  type="text"
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ej: PIZZERÍA ROMA"
                  className="shopify-input uppercase"
                  required
                />
              </div>

              {/* Auto-Configurable Notice Box */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-1.5">
                <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                  <Zap className="h-4 w-4 text-amber-600 flex-shrink-0" />
                  <span>100% Auto-Configurable</span>
                </div>
                <p className="text-[11px] text-amber-800 leading-relaxed">
                  Tu dispositivo llega listo y pre-programado. En tu primer toque lo vinculas a tu negocio en 30 segundos sin necesidad de ingresar URLs complicadas ahora.
                </p>
              </div>

              {/* Add-ons Checkboxes */}
              <div className="space-y-3 pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-900 block">Personalización Opcional</label>
                
                {/* Logo Checkbox */}
                <div className={`border rounded-lg p-4 transition-all ${hasCustomLogo ? 'border-brand-950 bg-brand-50/50' : 'border-brand-200 bg-white'}`}>
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasCustomLogo}
                      onChange={(e) => setHasCustomLogo(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-brand-950 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-brand-950 uppercase flex items-center gap-1.5">
                          <ImageIcon className="h-3.5 w-3.5 text-brand-600" />
                          Agregar Logo Personalizado
                        </span>
                        <span className="text-xs font-black text-brand-950">+ $5.00 USD</span>
                      </div>
                      <p className="text-[11px] text-brand-500 mt-0.5">Grabamos el logo vectorizado de tu marca en el frontal del producto.</p>
                    </div>
                  </label>

                  {hasCustomLogo && (
                    <div className="mt-4 pt-3 border-t border-brand-200 space-y-2">
                      <label className="text-[11px] font-bold text-brand-800 uppercase block">Subir Archivo de Logo (Obligatorio)</label>
                      <div className="border border-dashed border-brand-300 rounded p-3 text-center cursor-pointer hover:border-brand-950 transition-colors relative bg-white">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                        <Upload className="h-4 w-4 text-brand-400 mx-auto mb-1 stroke-[1.8]" />
                        <span className="text-[11px] text-brand-600 font-bold block">
                          {logoFile ? `Logo cargado: ${logoFile}` : 'Selecciona o arrastra tu logo (PNG, SVG, JPG)'}
                        </span>
                      </div>
                      {logoPreview && (
                        <div className="mt-2 flex items-center space-x-3 bg-white p-2 rounded border border-brand-200">
                          <img src={logoPreview} alt="Logo Preview" className="h-8 w-8 object-contain rounded border" />
                          <span className="text-[10px] text-green-600 font-bold">✓ Vista previa de logo cargada</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* QR Checkbox */}
                <div className={`border rounded-lg p-4 transition-all ${hasQrCode ? 'border-brand-950 bg-brand-50/50' : 'border-brand-200 bg-white'}`}>
                  <label className="flex items-start space-x-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={hasQrCode}
                      onChange={(e) => setHasQrCode(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-brand-950 rounded cursor-pointer"
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-brand-950 uppercase flex items-center gap-1.5">
                          <QrCode className="h-3.5 w-3.5 text-brand-600" />
                          Agregar Código QR Grabado
                        </span>
                        <span className="text-xs font-black text-brand-950">+ $3.00 USD</span>
                      </div>
                      <p className="text-[11px] text-brand-500 mt-0.5">Grabado láser de respaldo para teléfonos sin lector NFC.</p>
                    </div>
                  </label>
                </div>
              </div>

            </div>

            <hr className="border-brand-200" />

            {/* Quantity and Checkout Add button */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              {/* Quantity */}
              <div className="flex items-center border border-brand-300 rounded bg-white w-full sm:w-auto justify-between">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 font-bold text-brand-500 hover:bg-brand-100"
                >
                  −
                </button>
                <span className="px-5 font-bold text-xs text-brand-950">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 font-bold text-brand-500 hover:bg-brand-100"
                >
                  +
                </button>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={isSuccess}
                className={`shopify-btn-primary flex-grow text-xs tracking-widest uppercase font-bold py-4 transition-all ${
                  isSuccess ? 'bg-accent-600 hover:bg-accent-600' : ''
                }`}
              >
                {isSuccess ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    <span>¡Agregado al Carrito!</span>
                  </>
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
