'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/db';
import { useCart } from '@/context/CartContext';
import { Star, CheckCircle2, ChevronDown, ChevronUp, ArrowRight, CreditCard, ShieldCheck, Zap, Users, Upload, QrCode, Image as ImageIcon } from 'lucide-react';
import AutoConfigGuide from '@/components/AutoConfigGuide';

interface TarjetaLandingProps {
  product: Product;
}

export default function TarjetaLanding({ product }: TarjetaLandingProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  
  // Customization States for Checkout Section
  const [color, setColor] = useState('Negro Premium');
  const [businessName, setBusinessName] = useState('');
  const [hasCustomLogo, setHasCustomLogo] = useState(false);
  const [hasQrCode, setHasQrCode] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const colors = product.colors || ['Negro Premium', 'Blanco Premium', 'Madera Bambú', 'Madera Nogal'];

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
      logo_url: logoPreview || undefined
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      router.push('/cart');
    }, 1200);
  };

  const scrollToCheckout = () => {
    document.getElementById('checkout-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const faqs = [
    { q: '¿Puedo llevar la tarjeta en mi billetera o colgarla al cuello?', a: 'Sí. Tiene el tamaño estándar de una tarjeta de crédito (8.5 x 5.4 cm), súper fina y resistente. Muchos negocios en Panamá la usan con un lanyard/colgante para su personal de servicio.' },
    { q: '¿Necesito pagar alguna suscripción mensual?', a: 'No, la Tarjeta NFC starTAP es de pago único. No cobraremos jamás mensualidades por usar la tarjeta ni por acceder a tu panel de control.' },
    { q: '¿Qué pasa si cambio de empleo o de red social?', a: 'Desde tu panel web gratuito podrás cambiar el enlace hacia donde dirige tu tarjeta al instante cuantas veces quieras, sin comprar otra tarjeta.' },
    { q: '¿Funciona con cualquier teléfono inteligente?', a: 'Sí, es 100% compatible con iPhone y Android mediante chip NFC o con el código QR vectorizado grabado en el reverso.' },
  ];

  return (
    <div className="w-full bg-white font-sans text-brand-800">
      
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-br from-white via-accent-50 to-accent-100 border-b border-accent-200 pt-16 pb-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 order-2 lg:order-1">
            <div className="inline-flex items-center space-x-2 bg-white px-3 py-1 rounded-full shadow-sm text-xs font-bold text-accent-600 border border-accent-100">
              <CreditCard className="w-3.5 h-3.5 text-accent-500" />
              <span>Tarjeta Inteligente Personal & Portátil</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-950 leading-[1.1] tracking-tight">
              Cierra tratos y recolecta <br className="hidden sm:block"/> reseñas <span className="text-accent-500">donde vayas.</span>
            </h1>
            <p className="text-lg text-brand-600 max-w-lg leading-relaxed">
              Lleva el poder del SEO local y el networking en tu bolsillo. Ideal para meseros, vendedores, ejecutivos y emprendedores en Panamá que buscan impresionar al toque.
            </p>
            <div className="pt-4">
              <button onClick={scrollToCheckout} className="shopify-btn-primary w-full sm:w-auto text-lg py-4 px-10 rounded-full shadow-lg hover:scale-105 transition-transform font-bold">
                Comprar Tarjeta por ${product.price.toFixed(2)}
              </button>
            </div>
            <div className="flex items-center gap-4 text-sm font-semibold text-brand-500 pt-4">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500"/> Tamaño Tarjeta de Crédito</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500"/> Sin Mensualidades</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500"/> Envío Express</span>
            </div>
          </div>
          
          <div className="relative order-1 lg:order-2">
            <div className="aspect-[4/5] bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-white flex flex-col items-center justify-center text-center p-8">
              <div className="w-full h-full bg-brand-50 rounded-2xl border-2 border-dashed border-brand-300 flex flex-col items-center justify-center opacity-70 p-4">
                <span className="text-brand-400 font-bold mb-2 uppercase tracking-widest text-sm">Espacio para Imagen</span>
                <p className="text-xs text-brand-500">
                  [IMAGEN REFERENCIA: Foto elegante de la Tarjeta NFC en mate negro/madera saliendo de la billetera o sostenida por una persona en traje/uniforme]
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. BENEFITS SECTION */}
      <section className="py-24 px-4 bg-white">
        <div className="max-w-6xl mx-auto space-y-24">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="aspect-square bg-brand-50 rounded-3xl border-2 border-dashed border-brand-300 flex flex-col items-center justify-center p-8 text-center opacity-70">
                <span className="text-brand-400 font-bold mb-2 uppercase tracking-widest text-sm">Espacio para Imagen</span>
                <p className="text-xs text-brand-500">
                  [IMAGEN REFERENCIA: Una persona tocando la parte trasera del celular de un cliente con la tarjeta inteligente]
                </p>
            </div>
            <div className="space-y-6">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center text-accent-500 mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-black text-brand-950">Ideal para Equipos de Ventas y Personal de Servicio</h2>
              <p className="text-lg text-brand-600 leading-relaxed">
                Equipa a tus meseros o agentes comerciales con su propia Tarjeta starTAP. Tus clientes podrán dejarles propina o calificar su atención en Google Maps en cuestión de 3 segundos mientras conversan.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 order-2 lg:order-1">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center text-accent-500 mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-black text-brand-950">Materiales Premium: PVC Técnico y Madera Maciza</h2>
              <p className="text-lg text-brand-600 leading-relaxed">
                Elige entre PVC negro mate ultradurable de 0.76mm o acabados ecológicos en madera real (Bambú y Nogal). Grabadas con láser indeleble que jamás se borra con el roce diario.
              </p>
            </div>
            <div className="aspect-square bg-brand-50 rounded-3xl border-2 border-dashed border-brand-300 flex flex-col items-center justify-center p-8 text-center opacity-70 order-1 lg:order-2">
                <span className="text-brand-400 font-bold mb-2 uppercase tracking-widest text-sm">Espacio para Imagen</span>
                <p className="text-xs text-brand-500">
                  [IMAGEN REFERENCIA: Acercamiento macro mostrando las texturas de la tarjeta de madera y la tarjeta de PVC negro con acabado mate]
                </p>
            </div>
          </div>

        </div>
      </section>

      {/* 2.5 SOFTWARE SHOWCASE */}
      <section className="py-20 px-4 bg-brand-50 border-y border-brand-200">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center space-x-2 bg-accent-100 text-accent-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span>Software starTAP Cloud Incluido</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-950">
              Administra tus Tarjetas y Mide el Rendimiento de tu Personal
            </h2>
            <p className="text-brand-600 leading-relaxed">
              Cada Tarjeta viene con acceso ilimitado a tu panel de control starTAP. Puedes cambiar el enlace de cada mesero o vendedor de forma remota, ver qué tarjeta genera más escaneos y comparar resultados semana a semana.
            </p>
            <ul className="space-y-3 text-sm font-semibold text-brand-700">
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-accent-500" /> Edita la dirección destino en tiempo real</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-accent-500" /> ranking de escaneos entre tus colaboradores</li>
              <li className="flex items-center gap-2"><CheckCircle2 className="w-5 h-5 text-accent-500" /> Sin pagos mensuales ni renovación obligatoria</li>
            </ul>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-brand-200 shadow-xl space-y-4">
            <div className="bg-brand-950 rounded-2xl p-6 text-white space-y-4">
              <div className="flex justify-between items-center border-b border-brand-800 pb-3">
                <span className="text-xs font-bold text-accent-400 uppercase tracking-widest">Dashboard starTAP</span>
                <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded font-mono">Activo</span>
              </div>
              <div>
                <p className="text-xs text-brand-400">Tarjeta Vinculada:</p>
                <p className="font-bold text-sm text-white">Tarjeta Mesero #1 (#TAP-2004)</p>
              </div>
              <div className="bg-brand-900 p-3 rounded-lg flex justify-between items-center text-xs">
                <span>Enlace actual:</span>
                <span className="font-mono text-accent-300 truncate max-w-[180px]">instagram.com/mi_negocio</span>
              </div>
            </div>
            <div className="aspect-[16/9] bg-brand-50 rounded-2xl border-2 border-dashed border-brand-300 flex flex-col items-center justify-center p-4 text-center">
              <span className="text-brand-400 font-bold text-xs uppercase tracking-widest mb-1">Espacio para Capture</span>
              <p className="text-[11px] text-brand-500 max-w-[250px]">
                [IMAGEN REFERENCIA: Captura del panel móvil donde se ve la lista de tarjetas de empleados y el contador de toques]
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW IT WORKS */}
      <section className="py-20 bg-brand-950 text-white px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white">Networking y Reseñas en 3 Segundos</h2>
            <p className="text-brand-300 text-lg">Di adiós a las tarjetas de presentación impresas que terminan en la basura.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-brand-900 rounded-2xl p-8 border border-brand-800 text-center space-y-4">
              <div className="w-12 h-12 bg-accent-500 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold mb-6">1</div>
              <h3 className="text-xl font-bold text-white">Acerca la tarjeta</h3>
              <p className="text-brand-300 text-sm">Toca la parte trasera del smartphone del cliente con tu Tarjeta starTAP.</p>
            </div>
            <div className="bg-brand-900 rounded-2xl p-8 border border-brand-800 text-center space-y-4">
              <div className="w-12 h-12 bg-accent-500 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold mb-6">2</div>
              <h3 className="text-xl font-bold text-white">Se abre tu enlace</h3>
              <p className="text-brand-300 text-sm">Aparece automáticamente la página para calificar en Google Maps o tu tarjeta de contacto vCard.</p>
            </div>
            <div className="bg-brand-900 rounded-2xl p-8 border border-brand-800 text-center space-y-4">
              <div className="w-12 h-12 bg-accent-500 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold mb-6">3</div>
              <h3 className="text-xl font-bold text-white">¡Reseña o Contacto Guardado!</h3>
              <p className="text-brand-300 text-sm">El cliente guarda tu información al instante sin escribir números ni buscarte en redes.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3.5 AUTO CONFIG GUIDE */}
      <section className="py-12 px-4 bg-white border-b border-brand-200">
        <div className="max-w-5xl mx-auto">
          <AutoConfigGuide />
        </div>
      </section>

      {/* 4. CHECKOUT / BUY SECTION */}
      <section id="checkout-section" className="py-24 px-4 bg-brand-50">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-card border border-brand-200 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2">
            
            {/* Form Image */}
            <div className="bg-brand-100 flex flex-col items-center justify-center p-8 text-center min-h-[300px]">
                <span className="text-brand-400 font-bold mb-2 uppercase tracking-widest text-sm">Espacio para Imagen</span>
                <p className="text-xs text-brand-500 max-w-[200px]">
                  [IMAGEN REFERENCIA: Foto de la tarjeta inteligente en ángulo limpio sobre fondo blanco]
                </p>
            </div>
            
            {/* Form Fields */}
            <div className="p-8 md:p-12 space-y-8">
              <div>
                <h2 className="text-2xl font-black text-brand-950 mb-2">Configura tu Tarjeta</h2>
                <p className="text-sm text-brand-500">Selecciona tu acabado favorito y danos los datos.</p>
              </div>
              
              <form onSubmit={handleAddToCart} className="space-y-6">
                
                {/* Nombre de Negocio / Persona */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-950 block">Nombre del Negocio o Colaborador</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Ej. Clínica Dental Panamá / Juan Pérez"
                    required
                    className="shopify-input"
                  />
                </div>

                {/* Auto-Configurable Notice Box */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-1.5">
                  <div className="flex items-center space-x-2 text-amber-900 font-bold text-xs">
                    <Zap className="h-4 w-4 text-amber-600 flex-shrink-0" />
                    <span>⚡ 100% Auto-Configurable</span>
                  </div>
                  <p className="text-[11px] text-amber-800 leading-relaxed">
                    Tu Tarjeta llega lista y pre-programada. En tu primer toque la vinculas a tu perfil o negocio en 30 segundos sin necesidad de ingresar URLs previas.
                  </p>
                </div>

                {/* Acabado / Color */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-950 block">Acabado / Material</label>
                  <div className="grid grid-cols-2 gap-2">
                    {colors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`py-2 px-3 text-xs font-semibold rounded border transition-all ${
                          color === c 
                            ? 'border-accent-500 bg-accent-50 text-accent-700 ring-1 ring-accent-500' 
                            : 'border-brand-200 hover:border-brand-400 bg-white'
                        }`}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Add-ons Checkboxes */}
                <div className="space-y-3 pt-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-900 block">Personalización Opcional</label>
                  
                  {/* Logo Checkbox */}
                  <div className={`border rounded-xl p-4 transition-all ${hasCustomLogo ? 'border-brand-950 bg-brand-50/50' : 'border-brand-200 bg-white'}`}>
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
                        <p className="text-[11px] text-brand-500 mt-0.5">Grabado láser de tu logo oficial en la tarjeta.</p>
                      </div>
                    </label>

                    {hasCustomLogo && (
                      <div className="mt-4 pt-3 border-t border-brand-200 space-y-2">
                        <label className="text-[11px] font-bold text-brand-800 uppercase block">Subir Archivo de Logo (Obligatorio)</label>
                        <div className="border border-dashed border-brand-300 rounded-lg p-3 text-center cursor-pointer hover:border-brand-950 transition-colors relative bg-white">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleLogoUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          />
                          <Upload className="h-4 w-4 text-brand-400 mx-auto mb-1 stroke-[1.8]" />
                          <span className="text-[11px] text-brand-600 font-bold block">
                            {logoFile ? `Logo cargado: ${logoFile}` : 'Selecciona tu logo (PNG, SVG, JPG)'}
                          </span>
                        </div>
                        {logoPreview && (
                          <div className="mt-2 flex items-center space-x-3 bg-white p-2 rounded border border-brand-200">
                            <img src={logoPreview} alt="Logo Preview" className="h-8 w-8 object-contain rounded border" />
                            <span className="text-[10px] text-green-600 font-bold">✓ Logo adjuntado correctamente</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* QR Checkbox */}
                  <div className={`border rounded-xl p-4 transition-all ${hasQrCode ? 'border-brand-950 bg-brand-50/50' : 'border-brand-200 bg-white'}`}>
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
                        <p className="text-[11px] text-brand-500 mt-0.5">Grabado de respaldo para teléfonos sin NFC.</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Cantidad */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-950 block">Cantidad</label>
                  <div className="flex items-center space-x-4">
                    <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center rounded border border-brand-200 hover:bg-brand-50">-</button>
                    <span className="font-bold text-brand-950 w-8 text-center">{quantity}</span>
                    <button type="button" onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center rounded border border-brand-200 hover:bg-brand-50">+</button>
                  </div>
                </div>

                {/* Botón de Compra */}
                <div className="pt-4 border-t border-brand-100">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-brand-500 text-sm">Total a pagar:</span>
                    <span className="text-2xl font-black text-brand-950">${totalPrice.toFixed(2)}</span>
                  </div>
                  <button type="submit" className="shopify-btn-primary w-full text-lg py-4 rounded-xl shadow-lg relative overflow-hidden group">
                    <span className={`transition-opacity duration-300 ${isSuccess ? 'opacity-0' : 'opacity-100'}`}>
                      Añadir al Carrito <ArrowRight className="inline-block ml-2 w-5 h-5" />
                    </span>
                    <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isSuccess ? 'opacity-100' : 'opacity-0'}`}>
                      ¡Agregado con éxito! <CheckCircle2 className="inline-block ml-2 w-5 h-5" />
                    </span>
                  </button>
                  <p className="text-center text-xs text-brand-400 mt-4">Envío a domicilio en Ciudad de Panamá e Interior.</p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SEO FAQs */}
      <section className="py-20 px-4 bg-white border-t border-brand-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black text-brand-950">Preguntas Frecuentes</h2>
            <p className="text-sm text-brand-500 mt-2">Respuestas rápidas sobre la Tarjeta NFC Inteligente.</p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="border border-brand-200 rounded-lg overflow-hidden bg-white">
                <button
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full text-left px-6 py-4 flex justify-between items-center hover:bg-brand-50 transition-colors focus:outline-none"
                >
                  <span className="font-bold text-brand-900 pr-8">{faq.q}</span>
                  {activeFaq === idx ? (
                    <ChevronUp className="w-5 h-5 text-accent-500 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-brand-400 flex-shrink-0" />
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
