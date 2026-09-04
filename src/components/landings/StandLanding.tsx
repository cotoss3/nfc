'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/lib/db';
import { useCart } from '@/context/CartContext';
import { Star, CheckCircle2, ChevronDown, ChevronUp, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

interface StandLandingProps {
  product: Product;
}

export default function StandLanding({ product }: StandLandingProps) {
  const router = useRouter();
  const { addToCart } = useCart();
  
  // Customization States for Checkout Section
  const [color, setColor] = useState('Negro Mate');
  const [businessName, setBusinessName] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const colors = product.colors || ['Negro Mate', 'Blanco Brillante', 'Dorado Espejo', 'Plata Cepillado'];

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName) {
      alert('Por favor ingresa el nombre de tu negocio para continuar');
      return;
    }

    addToCart({
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity,
      selected_color: color,
      business_name: businessName,
      initial_redirect_url: 'https://search.google.com/local/writereview?placeid=...',
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
    { q: '¿Necesito pagar alguna mensualidad o suscripción?', a: 'No, el pago es único. Compras tu Stand NFC una vez y te funciona para siempre sin cobros ocultos ni mantenimiento.' },
    { q: '¿Funciona con iPhone y Android?', a: 'Sí, es 100% compatible. Todos los smartphones modernos tienen lector NFC integrado. Para modelos antiguos, el Stand incluye un código QR grabado.' },
    { q: '¿Cómo configuran el enlace hacia mi negocio?', a: 'Al procesar tu pedido, nosotros nos encargamos de programar el chip interno para que apunte directamente a tu perfil de Google Maps. Te lo entregamos listo para usar.' },
    { q: '¿Si cambio la ubicación de mi local, debo comprar otro Stand?', a: 'No es necesario. Tendrás acceso a nuestro panel donde podrás actualizar el enlace hacia donde dirige tu Stand en tiempo real, sin costo adicional.' },
  ];

  return (
    <div className="w-full bg-white font-sans text-brand-800">
      
      {/* 1. HERO SECTION */}
      <section className="bg-gradient-to-br from-white via-accent-50 to-accent-100 border-b border-accent-200 pt-16 pb-16 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 order-2 lg:order-1">
            <div className="inline-flex items-center space-x-2 bg-white px-3 py-1 rounded-full shadow-sm text-xs font-bold text-accent-600 border border-accent-100">
              <Star className="fill-accent-500 w-3 h-3 text-accent-500" />
              <span>El producto #1 para negocios en Panamá</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-950 leading-[1.1] tracking-tight">
              Multiplica tus <br className="hidden sm:block"/> reseñas en Google. <br className="hidden sm:block"/>
              <span className="text-accent-500">Sin esfuerzo.</span>
            </h1>
            <p className="text-lg text-brand-600 max-w-lg leading-relaxed">
              El Stand NFC es tu vendedor silencioso. Colócalo en tu mostrador o mesa y observa cómo tus clientes satisfechos te dejan reseñas de 5 estrellas en segundos.
            </p>
            <div className="pt-4">
              <button onClick={scrollToCheckout} className="shopify-btn-primary w-full sm:w-auto text-lg py-4 px-10 rounded-full shadow-lg hover:scale-105 transition-transform font-bold">
                Comprar Stand por ${product.price.toFixed(2)}
              </button>
            </div>
            <div className="flex items-center gap-4 text-sm font-semibold text-brand-500 pt-4">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500"/> Pago único</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500"/> Sin Apps</span>
              <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4 text-green-500"/> Envío a todo Panamá</span>
            </div>
          </div>
          
          <div className="relative order-1 lg:order-2">
            <div className="aspect-[4/5] bg-white rounded-3xl overflow-hidden shadow-2xl border-4 border-white flex flex-col items-center justify-center text-center p-8">
              <div className="w-full h-full bg-brand-50 rounded-2xl border-2 border-dashed border-brand-300 flex flex-col items-center justify-center opacity-70 p-4">
                <span className="text-brand-400 font-bold mb-2 uppercase tracking-widest text-sm">Espacio para Imagen</span>
                <p className="text-xs text-brand-500">
                  [IMAGEN REFERENCIA: Foto profesional del Stand NFC real sobre un mostrador de madera o mármol, viéndose muy elegante]
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
                  [IMAGEN REFERENCIA: Una mano sosteniendo un celular acercándolo al Stand para mostrar la rapidez y tecnología NFC]
                </p>
            </div>
            <div className="space-y-6">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center text-accent-500 mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-black text-brand-950">Más rápido que un QR de papel. Más premium que nunca.</h2>
              <p className="text-lg text-brand-600 leading-relaxed">
                Olvídate de pedirle al cliente que abra la cámara y enfoque un código arrugado. Con tecnología NFC de última generación (como la que usas para pagar con el móvil), tu cliente solo debe acercar su teléfono al Stand y un pop-up aparecerá mágicamente en su pantalla pidiéndole la reseña.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6 order-2 lg:order-1">
              <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center text-accent-500 mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h2 className="text-3xl font-black text-brand-950">Fabricado en Acrílico de Alta Resistencia</h2>
              <p className="text-lg text-brand-600 leading-relaxed">
                Diseñamos el Stand pensando en el tráfico constante de comercios, restaurantes y clínicas. Soporta rayones, líquidos y caídas ligeras. Su base pesada evita que se caiga con facilidad en mostradores concurridos. Una inversión que dura años.
              </p>
            </div>
            <div className="aspect-square bg-brand-50 rounded-3xl border-2 border-dashed border-brand-300 flex flex-col items-center justify-center p-8 text-center opacity-70 order-1 lg:order-2">
                <span className="text-brand-400 font-bold mb-2 uppercase tracking-widest text-sm">Espacio para Imagen</span>
                <p className="text-xs text-brand-500">
                  [IMAGEN REFERENCIA: Detalle macro (zoom) al material del Stand, mostrando el acabado brillante y premium, o resistiendo alguna salpicadura de agua]
                </p>
            </div>
          </div>

        </div>
      </section>

      {/* 3. HOW IT WORKS (3 STEPS) */}
      <section className="py-20 bg-brand-950 text-white px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-white">Consigue reseñas en 3 simples pasos</h2>
            <p className="text-brand-300 text-lg">Es tan fácil que tus clientes lo harán por instinto.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-brand-900 rounded-2xl p-8 border border-brand-800 text-center space-y-4">
              <div className="w-12 h-12 bg-accent-500 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold mb-6">1</div>
              <h3 className="text-xl font-bold text-white">Colócalo a la vista</h3>
              <p className="text-brand-300 text-sm">Pon el Stand en tu caja registradora, recepción o mesas. Su diseño llamará la atención.</p>
            </div>
            <div className="bg-brand-900 rounded-2xl p-8 border border-brand-800 text-center space-y-4">
              <div className="w-12 h-12 bg-accent-500 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold mb-6">2</div>
              <h3 className="text-xl font-bold text-white">El cliente acerca su móvil</h3>
              <p className="text-brand-300 text-sm">Con un solo toque (tecnología NFC), el celular reaccionará al instante, sin bajar ninguna App.</p>
            </div>
            <div className="bg-brand-900 rounded-2xl p-8 border border-brand-800 text-center space-y-4">
              <div className="w-12 h-12 bg-accent-500 text-white rounded-full flex items-center justify-center mx-auto text-xl font-bold mb-6">3</div>
              <h3 className="text-xl font-bold text-white">Recibes tus 5 Estrellas</h3>
              <p className="text-brand-300 text-sm">El cliente es enviado directo a tu página de Google Maps con las estrellas listas para enviar.</p>
            </div>
          </div>
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
                  [IMAGEN REFERENCIA: Foto del producto solo, fondo blanco o transparente, como en un e-commerce tradicional]
                </p>
            </div>
            
            {/* Form Fields */}
            <div className="p-8 md:p-12 space-y-8">
              <div>
                <h2 className="text-2xl font-black text-brand-950 mb-2">Configura tu Stand</h2>
                <p className="text-sm text-brand-500">Nosotros lo programamos, tú solo nos das los datos.</p>
              </div>
              
              <form onSubmit={handleAddToCart} className="space-y-6">
                
                {/* Nombre de Negocio */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-950 block">Nombre del Negocio (Como aparece en Google)</label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Ej. Restaurante El Bodegón"
                    required
                    className="shopify-input"
                  />
                  <p className="text-xs text-brand-400">Lo buscaremos para encriptar tu enlace NFC de forma segura.</p>
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-brand-950 block">Color del Stand</label>
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
                    <span className="text-2xl font-black text-brand-950">${(product.price * quantity).toFixed(2)}</span>
                  </div>
                  <button type="submit" className="shopify-btn-primary w-full text-lg py-4 rounded-xl shadow-lg relative overflow-hidden group">
                    <span className={`transition-opacity duration-300 ${isSuccess ? 'opacity-0' : 'opacity-100'}`}>
                      Añadir al Carrito <ArrowRight className="inline-block ml-2 w-5 h-5" />
                    </span>
                    <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isSuccess ? 'opacity-100' : 'opacity-0'}`}>
                      ¡Agregado con éxito! <CheckCircle2 className="inline-block ml-2 w-5 h-5" />
                    </span>
                  </button>
                  <p className="text-center text-xs text-brand-400 mt-4">Compra 100% segura. Envío a todo Panamá.</p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* 5. SEO FAQs (Hidden from main visual flow to prioritize sales) */}
      <section className="py-20 px-4 bg-white border-t border-brand-100">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-black text-brand-950">Preguntas Frecuentes</h2>
            <p className="text-sm text-brand-500 mt-2">Todo lo que necesitas saber sobre cómo mejorar tu SEO Local en Panamá.</p>
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
