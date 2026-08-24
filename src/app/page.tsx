'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { dbLocal } from '@/lib/db';
import { ShieldCheck, Truck, RotateCcw, ArrowRight, Star, MapPin, Smartphone, Award, CheckCircle2 } from 'lucide-react';

export default function HomePage() {
  const products = dbLocal.getProducts().slice(0, 3);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: '¿Cómo funcionan las placas y tarjetas NFC en Panamá?',
      a: 'Nuestros dispositivos contienen un microchip NFC inteligente incorporado y un código QR de alta resolución. Cuando un cliente acerca su teléfono inteligente a la placa o tarjeta, se detecta el chip electromagnéticamente y se abre de forma automática el enlace de reseñas de tu negocio o tu perfil de contacto digital. El proceso tarda solo 2 segundos y no requiere la descarga de ninguna aplicación externa por parte del cliente.'
    },
    {
      q: '¿Qué es el código QR de respaldo y para qué sirve?',
      a: 'Aunque más del 95% de los celulares en Panamá cuentan con tecnología NFC de forma nativa, algunos modelos antiguos o dispositivos de gama baja no la tienen activa. Para garantizar una compatibilidad absoluta del 100%, todos nuestros productos incluyen un código QR vectorizado y grabado con láser de alta precisión. Si el cliente tiene un dispositivo antiguo, solo abre su cámara de fotos y escanea el código para calificar tu negocio.'
    },
    {
      q: '¿Cómo obtengo el enlace de opiniones de Google para mi negocio?',
      a: 'Es un proceso sencillo de un solo paso. Entra en el perfil de Google Business Profile (anteriormente Google My Business) de tu empresa, busca el botón que indica "Solicitar opiniones" o "Compartir formulario de opinión" y copia la URL corta generada (usualmente empieza por https://g.page/r/... o https://search.google.com/local/... ). Ese es el enlace que grabamos físicamente en tu placa. Si tienes dudas, nuestro equipo técnico en Ciudad de Panamá te guiará paso a paso.'
    },
    {
      q: '¿Puedo cambiar la dirección de redirección del enlace en el futuro?',
      a: '¡Por supuesto! Uno de los mayores valores agregados de PanaCards es la flexibilidad. Al realizar tu compra, tu dispositivo queda asociado a nuestro sistema de redirección. Podrás acceder de forma gratuita e ilimitada a tu dashboard personalizado para cambiar el enlace web tantas veces como desees. Si este mes deseas recolectar reseñas en Google, pero el próximo mes prefieres redirigir tráfico a un menú digital, a tu WhatsApp o a Instagram, lo puedes configurar en tiempo real y los cambios se aplican al instante sin necesidad de comprar otro producto físico.'
    },
    {
      q: '¿Nuestros dispositivos NFC requieren baterías o recargas?',
      a: 'No. Las placas y tarjetas inteligentes NFC de PanaCards son dispositivos completamente pasivos. Utilizan la tecnología de inducción electromagnética para obtener energía temporal de la antena emisora del teléfono del cliente al acercarlo. No requieren batería, cables, mantenimiento ni recargas eléctricas, lo que garantiza una vida útil ilimitada con más de 100,000 ciclos de lectura garantizados.'
    },
    {
      q: '¿Cómo se manejan los envíos en Ciudad de Panamá y provincias?',
      a: 'Contamos con una red logística optimizada para todo Panamá. Para la Ciudad de Panamá (área metropolitana), ofrecemos envíos express a oficina o residencia en 24-48 horas con tarifas económicas de $3.75 o retiro directo en nuestra sucursal de San Francisco por $3.00. Para el interior del país (Chiriquí, Colón, Coclé, Veraguas, Herrera, Los Santos, etc.), enviamos paquetes de forma segura vía Uno Express (tarifas de $6.50) y Servientrega (tarifas de $7.50).'
    },
    {
      q: '¿Cuáles son los plazos de producción y grabado láser?',
      a: 'Una vez que apruebas el diseño digital con el logotipo de tu establecimiento y el enlace web de redirección, el grabado láser de alta resolución y la programación del microchip NFC toma de 24 a 48 horas hábiles. Tu pedido es cuidadosamente inspeccionado para asegurar la calidad del acrílico pulido de 3mm o la madera maciza antes de ser despachado a la empresa de mensajería.'
    }
  ];

  const localBenefits = [
    {
      title: "Dominio de Google Maps (Local 3-Pack)",
      desc: "El 56% de las búsquedas locales en Panamá terminan en una visita al negocio físico. Google prioriza en su listado principal a los establecimientos que reciben opiniones constantes y positivas. Nuestras placas automatizan este flujo para posicionarte en la cima."
    },
    {
      title: "Eliminación del 100% de la Fricción",
      desc: "Buscar un negocio de forma manual en Google, ir a la sección de reseñas y presionar escribir requiere tiempo y esfuerzo. La tecnología contactless de PanaCards reduce este proceso a un solo toque en el mostrador del comercio."
    },
    {
      title: "Soporte Local y Cero Mensualidades",
      desc: "A diferencia de plataformas extranjeras con suscripciones costosas, ofrecemos un pago único de por vida. Además, cuentas con facturación fiscal panameña, soporte técnico local y envíos rápidos en todo el territorio."
    }
  ];

  return (
    <div className="space-y-24 pb-24 bg-brand-50">
      
      {/* Promo Bar / Trust Bar */}
      <section className="bg-brand-950 text-white text-xs py-2.5 text-center font-medium tracking-wider uppercase">
        ⚡ OPTIMIZA TU POSICIONAMIENTO EN PANAMÁ • ENVÍOS VÍA UNO EXPRESS, SERVIENTREGA O RETIRO EN SAN FRANCISCO
      </section>

      {/* Hero Section */}
      <section className="shopify-container max-w-6xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center py-6">
          {/* Left: Text Content */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-4">
              <span className="text-xs font-bold tracking-widest text-brand-400 uppercase block">Tecnología Inteligente Contactless</span>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-brand-950 leading-[1.1] tracking-tight">
                Impulsa el SEO Local de tu negocio en Panamá al instante.
              </h1>
              <p className="text-xs sm:text-sm text-brand-500 max-w-xl leading-relaxed">
                Aumenta tus valoraciones de 5 estrellas en Google Maps, Tripadvisor o multiplica tus seguidores en redes sociales con nuestras tarjetas y placas físicas NFC de acrílico premium. Sin mensualidades, pago único y personalización con tu logotipo corporativo.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/shop" className="shopify-btn-primary text-center py-4 px-8 tracking-wider text-xs uppercase font-bold">
                Comprar Colección NFC
              </Link>
              <Link href="/dashboard" className="shopify-btn-secondary text-center py-4 px-8 tracking-wider text-xs uppercase font-bold">
                Probar Simulador Web
              </Link>
            </div>

            {/* Micro proof */}
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] text-brand-400 font-bold uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-brand-950" /> Grabado Láser Permanente</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-brand-950" /> Sin Costos Ocultos</span>
              <span className="flex items-center gap-1.5"><CheckCircle2 className="h-3.5 w-3.5 text-brand-950" /> Envíos en 24-48 horas</span>
            </div>
          </div>

          {/* Right: Mockup Picture */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative group w-80 h-96 bg-brand-950 rounded-2xl p-8 shadow-card flex flex-col justify-between text-white border border-brand-950 card-glossy transition-all hover:scale-[1.01]">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[9px] font-bold tracking-widest text-brand-400 block uppercase">PanaCards Panamá</span>
                  <span className="text-sm font-bold text-white tracking-wide">Placa de Acrílico Premium</span>
                </div>
                <div className="w-2.5 h-2.5 rounded-full bg-accent-600 animate-pulse"></div>
              </div>

              {/* Graphic NFC Sign */}
              <div className="text-center space-y-2">
                <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto text-white text-lg">
                  📶
                </div>
                <p className="text-xs font-bold text-brand-200 tracking-wider uppercase">Toca con tu Celular</p>
              </div>

              <div className="flex justify-between items-end border-t border-white/10 pt-4">
                <div>
                  <p className="text-[10px] text-brand-400 uppercase tracking-wider">RESEÑAS AL INSTANTE</p>
                  <p className="text-xs font-bold">Chip NFC NTAG213</p>
                </div>
                {/* Simulated QR Code */}
                <div className="w-10 h-10 bg-white rounded p-0.5">
                  <div className="w-full h-full bg-brand-950 rounded-[2px] flex items-center justify-center text-[5px] text-white font-bold font-mono">
                    QR CODE
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Shopify Services Trust Section */}
      <section className="border-y border-brand-200 bg-white py-8">
        <div className="shopify-container max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="flex items-start space-x-4">
            <Truck className="h-6 w-6 text-brand-950 flex-shrink-0 stroke-[1.5]" />
            <div>
              <h4 className="text-xs font-bold text-brand-950 uppercase tracking-wider">Logística a Nivel Nacional</h4>
              <p className="text-xs text-brand-500 mt-1">Recibe en Ciudad de Panamá, o en sucursales del interior del país vía Uno Express y Servientrega.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 border-t md:border-t-0 md:border-x border-brand-200 pt-6 md:pt-0 md:px-8">
            <ShieldCheck className="h-6 w-6 text-brand-950 flex-shrink-0 stroke-[1.5]" />
            <div>
              <h4 className="text-xs font-bold text-brand-950 uppercase tracking-wider">Garantía Hardware de por Vida</h4>
              <p className="text-xs text-brand-500 mt-1">Chips NTAG213 originales sellados. Estructura resistente de acrílico de 3mm libre de fallas.</p>
            </div>
          </div>
          <div className="flex items-start space-x-4 border-t md:border-t-0 pt-6 md:pt-0">
            <RotateCcw className="h-6 w-6 text-brand-950 flex-shrink-0 stroke-[1.5]" />
            <div>
              <h4 className="text-xs font-bold text-brand-950 uppercase tracking-wider">Control Completo del Enlace</h4>
              <p className="text-xs text-brand-500 mt-1">Configura y actualiza el enlace de tus dispositivos de manera gratuita y las veces que quieras desde tu panel.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Collection Spotlight (Featured Products) */}
      <section className="shopify-container max-w-6xl space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold tracking-widest text-brand-400 uppercase block">Tecnología de Punta para tu Negocio</span>
          <h2 className="text-3xl font-black text-brand-950 uppercase tracking-wide">Placas NFC de Mostrador y Tarjetas Inteligentes</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {products.map((product) => (
            <div key={product.id} className="group flex flex-col h-full bg-white border border-brand-200 overflow-hidden hover:shadow-premium transition-shadow duration-300">
              <div className="relative aspect-square overflow-hidden bg-brand-100 border-b border-brand-200">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {product.category === 'plates' && (
                  <span className="absolute top-4 left-4 bg-brand-950 text-white text-[9px] font-bold tracking-widest uppercase px-2.5 py-1">
                    Acrílico Premium
                  </span>
                )}
              </div>

              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div className="space-y-1 text-center md:text-left">
                  <h3 className="text-xs font-bold text-brand-950 tracking-wider uppercase truncate">{product.name}</h3>
                  <p className="text-[10px] text-brand-400 font-bold uppercase">{product.category === 'plates' ? 'Placa de Mostrador' : 'Tarjeta de Contacto'}</p>
                  <p className="text-sm font-black text-brand-900 pt-1">${product.price.toFixed(2)}</p>
                </div>

                <Link
                  href={`/shop/${product.id}`}
                  className="w-full shopify-btn-secondary text-center tracking-wider text-xs uppercase py-3 border-brand-950 hover:bg-brand-950 hover:text-white"
                >
                  Personalizar y Comprar
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Local SEO Panama Editorial Guide (Targeting 1000+ words) */}
      <section className="shopify-container max-w-4xl py-6 space-y-12">
        <div className="border border-brand-200 bg-white p-8 sm:p-12 shadow-premium space-y-8">
          <div className="flex items-center space-x-2 text-accent-600 font-bold uppercase tracking-widest text-xs">
            <Award className="h-4 w-4" />
            <span>Guía de SEO Local y Reputación para Comercios Panameños</span>
          </div>
          
          <h2 className="text-2xl sm:text-3xl font-black text-brand-950 uppercase tracking-wide leading-tight">
            El Secreto para Posicionar tu Negocio en el "Local Pack" de Google en Panamá
          </h2>
          
          <div className="space-y-6 text-xs text-brand-600 leading-relaxed">
            <p>
              En la era digital actual, la competencia comercial en la Ciudad de Panamá (especialmente en zonas concurridas como San Francisco, Marbella, Costa del Este, Bella Vista, El Cangrejo y Condado del Rey) es más intensa que nunca. Cuando un usuario busca un término como <em>"clínica dental en Panamá"</em>, <em>"mejor café en Casco Viejo"</em> o <em>"salón de belleza en San Francisco"</em>, Google no muestra simplemente una lista de páginas web clásicas. En su lugar, presenta el llamado <strong>"Google Local Pack"</strong>: un recuadro destacado con un mapa y las 3 principales empresas recomendadas basadas en su ubicación geográfica y su puntuación.
            </p>
            
            <p>
              Aparecer en este codiciado "Top 3" de Google Maps puede marcar la diferencia entre un local repleto de clientes y uno vacío. Pero, ¿cómo decide el algoritmo de Google a qué negocios posicionar en los primeros puestos? Aunque factores como la cercanía del usuario y la optimización básica de la ficha técnica influyen, el elemento de conversión más poderoso y con mayor peso en el posicionamiento orgánico local son **las reseñas de los clientes** (especialmente la cantidad de opiniones de 5 estrellas, la frecuencia con la que se reciben y las respuestas del propietario).
            </p>
            
            <h3 className="font-bold text-brand-950 text-sm uppercase tracking-wide pt-2 flex items-center gap-1.5">
              <MapPin className="h-4 w-4 text-brand-950" /> 1. ¿Por qué los clientes no dejan reseñas de forma voluntaria?
            </h3>
            <p>
              La gran mayoría de los clientes en Panamá finalizan su compra, se retiran satisfechos del establecimiento y nunca vuelven a pensar en dejar un comentario. Esto no es por falta de aprecio, sino por **fricción**. El proceso tradicional de dejar una opinión requiere buscar el negocio en la barra de Google, desplazarse hacia abajo hasta encontrar el botón "Escribir reseña", abrir sesión en una cuenta de Gmail (si no está abierta), seleccionar el número de estrellas y redactar la opinión. 
            </p>
            <p>
              Nuestra tecnología de placas NFC para mostrador elimina el 100% de esta fricción. Al colocar una placa física interactiva cerca de la caja registradora, la barra de café o la recepción, los empleados solo deben sugerir amablemente: <em>"Si te gustó nuestro servicio, ¿podrías regalarnos un toque aquí con tu celular?"</em>. Con solo acercar el smartphone, la pantalla se desbloquea directamente en el formulario oficial de calificación de Google del negocio. Un proceso de un minuto se reduce a escasos dos segundos.
            </p>

            <h3 className="font-bold text-brand-950 text-sm uppercase tracking-wide pt-2 flex items-center gap-1.5">
              <Smartphone className="h-4 w-4 text-brand-950" /> 2. La Revolución de las Tarjetas de Presentación Digitales NFC
            </h3>
            <p>
              Esta optimización no se limita a placas de mostrador. En el ámbito corporativo de Panamá, las tarjetas de presentación impresas tradicionales están quedando obsoletas. Las empresas de bienes raíces, oficinas de abogados, agencias de marketing y consultores independientes en Vía España o Costa del Este gastan cientos de dólares anualmente imprimiendo tarjetas de cartón que terminan en la basura en menos de 24 horas.
            </p>
            <p>
              Una tarjeta inteligente NFC de PanaCards es una inversión única que reemplaza miles de tarjetas impresas. Al sostener una reunión en Panamá, simplemente tocas el teléfono del cliente potencial con tu tarjeta de PVC o madera ecológica para transferir de inmediato tus datos de contacto (nombre, teléfono, correo, sitio web corporativo, enlaces a LinkedIn o WhatsApp) a su agenda de contactos. No requiere teclear un número ni instalar aplicaciones especializadas.
            </p>

            <h3 className="font-bold text-brand-950 text-sm uppercase tracking-wide pt-2 flex items-center gap-1.5">
              <Star className="h-4 w-4 text-brand-950" /> 3. Casos de Éxito en Negocios Locales Panameños
            </h3>
            <p>
              El impacto comercial de implementar estas placas contactless se mide en resultados rápidos y tangibles:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Restaurantes y Cafeterías:</strong> Aumentan orgánicamente en un 300% sus opiniones mensuales, atrayendo a más comensales los fines de semana gracias a una reputación impecable en línea.
              </li>
              <li>
                <strong>Clínicas Dentales y Estéticas:</strong> Generan confianza en nuevos pacientes que buscan activamente profesionales con alta puntuación en Ciudad de Panamá.
              </li>
              <li>
                <strong>Hoteles y Centros Turísticos:</strong> Impulsan su clasificación en TripAdvisor de manera inmediata entre los turistas extranjeros que visitan el Canal de Panamá o el Casco Antiguo.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white border-y border-brand-200 py-16">
        <div className="shopify-container max-w-4xl text-center space-y-8">
          <span className="text-xs font-bold tracking-widest text-brand-400 uppercase block">Opiniones de Dueños de Negocios en Panamá</span>
          <p className="text-base md:text-lg font-semibold text-brand-800 italic leading-relaxed">
            "Colocamos la placa de Google en la caja de nuestro restaurante en San Francisco y pasamos de tener 45 opiniones a más de 350 en menos de dos meses. Los clientes lo escanean y se sorprenden de lo fácil y rápido que es calificar. Ha sido nuestra mejor inversión de marketing local este año."
          </p>
          <div>
            <h4 className="text-xs font-bold text-brand-950 uppercase tracking-wider">Alejandra Rodríguez</h4>
            <p className="text-[10px] text-brand-400 font-bold uppercase tracking-wider">Dueña de Bistro Café, Vía Argentina</p>
          </div>
        </div>
      </section>

      {/* FAQ Accordion */}
      <section className="shopify-container max-w-3xl space-y-12">
        <div className="text-center space-y-2">
          <span className="text-xs font-bold tracking-widest text-brand-400 uppercase block">Resuelve tus Dudas</span>
          <h2 className="text-2xl font-black text-brand-950 uppercase tracking-wider">Preguntas Frecuentes sobre el Servicio</h2>
        </div>

        <div className="divide-y divide-brand-200 border-y border-brand-200">
          {faqs.map((faq, index) => (
            <div key={index} className="py-4">
              <button
                onClick={() => setActiveFaq(activeFaq === index ? null : index)}
                className="w-full text-left py-2 font-bold text-xs tracking-wide text-brand-950 flex justify-between items-center focus:outline-none uppercase"
              >
                <span>{faq.q}</span>
                <span className="text-brand-500 font-light text-base">
                  {activeFaq === index ? '−' : '+'}
                </span>
              </button>
              {activeFaq === index && (
                <div className="pb-4 text-xs text-brand-500 leading-relaxed pt-2">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
