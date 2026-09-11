'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Cpu, 
  Wifi, 
  QrCode, 
  Zap, 
  ShoppingBag,
  MessageCircle, 
  CheckCircle2, 
  Truck, 
  ShieldCheck,
  Star,
  ArrowRight,
  Tag
} from 'lucide-react';
import { ProductConfig, getMainHardwareProducts, getSpecialPacks } from '@/config/products';
import { useCart } from '@/context/CartContext';

export default function CatalogoClient() {
  const router = useRouter();
  const { addToCart } = useCart();
  const hardwareProducts = getMainHardwareProducts();
  const specialPacks = getSpecialPacks();

  const handleAddToCartPack = (product: ProductConfig) => {
    addToCart({
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity: 1,
      selected_color: 'Acrílico 3mm + PVC 0.76mm',
      business_name: 'Mi Negocio'
    });
    router.push('/checkout');
  };

  const getWhatsAppLink = (productName: string) => {
    const text = encodeURIComponent(`Hola, me interesa pedir el producto: ${productName} de StarTAP.`);
    return `https://wa.me/50767134341?text=${text}`;
  };

  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen pb-24 font-sans">
      {/* Header Banner */}
      <section className="bg-white border-b border-slate-200 py-12 sm:py-16 px-4">
        <div className="max-w-6xl mx-auto text-center space-y-4">
          <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-amber-900 border border-amber-300 font-extrabold text-xs uppercase px-3.5 py-1.5 rounded-full">
            <Cpu className="w-4 h-4 text-amber-600" />
            <span>Tecnología Contactless de Proximidad 13.56 MHz</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-950 uppercase tracking-tight">
            Catálogo de Dispositivos NFC & QR
          </h1>

          <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Hardware de captación directa de valoraciones en Google Maps para tu negocio en Panamá. <strong className="text-slate-900 font-bold">Pago único de por vida, sin contratos y sin mensualidades.</strong>
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-semibold text-slate-700">
            <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <Wifi className="w-4 h-4 text-brand-600" /> Chip NFC NTAG Integrado
            </span>
            <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <QrCode className="w-4 h-4 text-brand-600" /> Código QR HD Respaldo 100%
            </span>
            <span className="flex items-center gap-1.5 bg-slate-100 px-3 py-1.5 rounded-full border border-slate-200">
              <Zap className="w-4 h-4 text-brand-600" /> Lectura Instantánea en 2 Segundos
            </span>
          </div>
        </div>
      </section>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 pt-10 space-y-12">
        
        {/* Banner del Pack Especial (Upsell Directo al Carrito sin Landing) */}
        {specialPacks.length > 0 && (
          <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-slate-800 relative overflow-hidden">
            <div className="absolute top-4 right-4 bg-amber-400 text-slate-950 font-black text-xs uppercase px-3 py-1 rounded-full flex items-center gap-1 shadow">
              <Star className="w-3.5 h-3.5 fill-slate-950" /> Pack Recomendado
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
              <div className="md:col-span-7 space-y-4">
                <div className="inline-flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider">
                  <Tag className="w-4 h-4" /> {specialPacks[0].categoryLabel}
                </div>
                
                <h2 
                  onClick={() => handleAddToCartPack(specialPacks[0])}
                  className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight cursor-pointer hover:text-amber-400 transition-colors"
                >
                  {specialPacks[0].name}
                </h2>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
                  {specialPacks[0].description}
                </p>

                <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 space-y-2">
                  <p className="text-xs font-semibold text-slate-300 uppercase tracking-wide">Incluye:</p>
                  <ul className="text-xs sm:text-sm text-slate-200 space-y-1.5">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span><strong>1 Placa NFC de Mostrador (Acrílico 3mm)</strong> para la caja de cobro</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
                      <span><strong>2 Tarjetas NFC de Bolsillo (PVC 0.76mm)</strong> para personal en movimiento</span>
                    </li>
                    <li className="flex items-center gap-2 text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Configuración previa incluida + ENVÍO GRATIS A TODO PANAMÁ</span>
                    </li>
                  </ul>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                  <div className="flex flex-wrap items-baseline gap-2.5">
                    <span className="text-3xl sm:text-4xl font-black text-amber-400">${specialPacks[0].price}.00</span>
                    <span className="text-sm text-slate-400 line-through font-semibold">$70.00</span>
                    <span className="text-xs font-black text-slate-950 bg-amber-400 px-2.5 py-1 rounded-md shadow-sm">
                      28% OFF
                    </span>
                    <span className="text-xs font-bold text-amber-300 bg-amber-400/20 px-2.5 py-1 rounded-md">
                      Ahorras $20.00
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => handleAddToCartPack(specialPacks[0])}
                      className="flex-1 sm:flex-none bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-sm uppercase px-6 py-3.5 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <ShoppingBag className="w-4 h-4" />
                      <span>Comprar Pack Ahora (Envío Gratis)</span>
                    </button>
                    <a
                      href={getWhatsAppLink(specialPacks[0].name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 p-3.5 rounded-xl transition-all"
                      title="Consultar por WhatsApp"
                    >
                      <MessageCircle className="w-5 h-5 text-emerald-400" />
                    </a>
                  </div>
                </div>
              </div>

              <div className="md:col-span-5 flex justify-center">
                <div 
                  onClick={() => handleAddToCartPack(specialPacks[0])}
                  className="relative w-full max-w-sm aspect-square bg-slate-800 rounded-2xl overflow-hidden border border-slate-700 p-4 cursor-pointer group"
                >
                  <Image
                    src={specialPacks[0].image}
                    alt={specialPacks[0].name}
                    fill
                    className="object-cover rounded-xl group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Sección de Productos Individuales */}
        <div className="space-y-6">
          <div className="border-b border-slate-200 pb-4 flex items-center justify-between">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">
              Dispositivos Individuales
            </h2>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Pago único | Sin mensualidades
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {hardwareProducts.map((product) => (
              <div 
                key={product.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Badge de Material */}
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md">
                      {product.categoryLabel}
                    </span>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {product.badge}
                    </span>
                  </div>

                  {/* Imagen del Producto redirige a la Landing */}
                  <Link 
                    href={`/catalogo/${product.id}`}
                    className="aspect-square relative bg-slate-100 overflow-hidden block group"
                  >
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  </Link>

                  {/* Información del Producto */}
                  <div className="p-5 space-y-3">
                    <Link href={`/catalogo/${product.id}`} className="block group">
                      <h3 className="text-lg font-bold text-slate-900 leading-snug group-hover:text-amber-600 transition-colors">
                        {product.name}
                      </h3>
                    </Link>
                    <p className="text-xs text-slate-600 leading-relaxed min-h-[48px]">
                      {product.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-700">
                      <p><strong className="text-slate-900">Material:</strong> {product.material}</p>
                      <p><strong className="text-slate-900">Uso:</strong> {product.useCase}</p>
                    </div>
                  </div>
                </div>

                {/* Footer de Tarjeta con Precio y Botón a la Landing */}
                <div className="p-5 pt-0 space-y-3">
                  <div className="flex items-baseline justify-between pt-3 border-t border-slate-100">
                    <div>
                      <span className="text-2xl font-black text-slate-900">${product.price}.00</span>
                      <span className="text-[10px] text-slate-500 block uppercase font-medium">USD | Pago único</span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Listo para usar
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/catalogo/${product.id}`}
                      className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs uppercase px-4 py-3 rounded-xl transition-all shadow-sm flex items-center justify-center gap-1.5 text-center"
                    >
                      <span>Ver Producto</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <a
                      href={getWhatsAppLink(product.name)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 p-3 rounded-xl transition-all"
                      title="Consultar por WhatsApp"
                    >
                      <MessageCircle className="w-4 h-4 text-emerald-600" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Sección de Métodos de Pago y Logística en Panamá */}
        <section className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-8 space-y-6">
          <h2 className="text-lg sm:text-xl font-black text-slate-900 uppercase tracking-tight text-center sm:text-left">
            Condiciones de Venta y Logística en Panamá
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <Truck className="w-5 h-5 text-amber-500" />
                <span>Envíos Locales y Nacionales</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Entregas en Ciudad de Panamá en 24 a 48 horas laborables. Envíos a provincias centrales, Chiriquí y Colón por Uno Express o Servientrega.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <ShieldCheck className="w-5 h-5 text-amber-500" />
                <span>Métodos de Pago Directos</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Pagos seguros por Yappy, transferencias bancarias ACH directas o tarjetas de crédito y débito Visa / Mastercard.
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                <CheckCircle2 className="w-5 h-5 text-amber-500" />
                <span>Configuración Incluida</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Recibes tus dispositivos programados con el enlace directo a tu ficha de Google Maps. Los sacas del paquete y están listos para capturar reseñas.
              </p>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
