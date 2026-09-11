'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  ShieldCheck, 
  Zap, 
  Users, 
  Sparkles, 
  FileText, 
  PhoneCall, 
  CheckCircle2, 
  ArrowRight, 
  CreditCard, 
  Layers, 
  BarChart3, 
  Globe, 
  Mail, 
  Briefcase 
} from 'lucide-react';
import AutoConfigGuide from '@/components/AutoConfigGuide';

export default function CorporativoClient() {
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [quantity, setQuantity] = useState('25-50');
  const [notes, setNotes] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const whatsappPhone = '50767134341';

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const textMessage = `Hola starTAP Corporativo, solicito cotización para mi empresa:
- *Empresa*: ${companyName}
- *Contacto*: ${contactName}
- *Email*: ${email}
- *Teléfono*: ${phone}
- *Cantidad de Dispositivos*: ${quantity}
- *Detalles/Requerimientos*: ${notes || 'Sin notas adicionales'}`;

    const encoded = encodeURIComponent(textMessage);
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encoded}`;
    
    setIsSubmitted(true);
    setTimeout(() => {
      window.open(whatsappUrl, '_blank');
    }, 800);
  };

  return (
    <div className="w-full bg-white font-sans text-brand-900">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-gradient-to-br from-brand-950 via-brand-900 to-slate-900 text-white pt-16 pb-24 px-4 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none"></div>
        
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            <div className="inline-flex items-center space-x-2 bg-amber-400/10 border border-amber-400/30 px-3.5 py-1.5 rounded-full text-xs font-bold text-amber-300 uppercase tracking-widest">
              <Building2 className="w-3.5 h-3.5 text-amber-400" />
              <span>Soluciones B2B & Proyectos Corporativos en Panamá</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15]">
              Equipa a tu Empresa con <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">
                Tecnología NFC Inteligente
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-300 max-w-2xl leading-relaxed">
              Diseños corporativos 100% personalizados con el logo de tu marca. Ideal para tarjetas ejecutivas de ventas, placas de reseñas para redes de sucursales y control centralizado desde la nube.
            </p>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
              <a
                href={`https://wa.me/${whatsappPhone}?text=${encodeURIComponent('Hola starTAP, quisiera cotizar tecnología NFC corporativa para mi empresa')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-brand-950 font-black text-sm uppercase tracking-wider py-4 px-8 rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2"
              >
                <PhoneCall className="w-4 h-4" />
                Cotizar por WhatsApp (+507 6713-4341)
              </a>

              <a
                href="#cotizacion-form"
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold text-sm uppercase tracking-wider py-4 px-8 rounded-xl border border-white/20 transition-all text-center"
              >
                Solicitar Propuesta Formal
              </a>
            </div>

            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-800 text-xs text-slate-400 font-semibold">
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Branding 100% Personalizado</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Factura Fiscal Panamá</span>
              </div>
              <div className="flex items-center justify-center lg:justify-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Descuento por Volumen</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="bg-white/5 border border-white/10 p-8 rounded-3xl backdrop-blur-md shadow-2xl space-y-6">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-lg font-bold text-white uppercase tracking-wider">Beneficios Corporativos</h3>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] font-extrabold px-2.5 py-1 rounded uppercase">B2B Panamá</span>
              </div>

              <ul className="space-y-4 text-sm text-slate-200">
                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0 font-bold">1</div>
                  <div>
                    <strong className="block text-white">Tarjetas Ejecutivas Reutilizables</strong>
                    <p className="text-xs text-slate-400">Sustituye tarjetas de papel por tarjetas NFC eternas de PVC técnico.</p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0 font-bold">2</div>
                  <div>
                    <strong className="block text-white">Gestión Centralizada</strong>
                    <p className="text-xs text-slate-400">Asigna o cambia el destino de cada tarjeta desde un solo panel administrativo.</p>
                  </div>
                </li>

                <li className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-400/20 text-amber-400 flex items-center justify-center flex-shrink-0 font-bold">3</div>
                  <div>
                    <strong className="block text-white">Placas para Puntos de Venta</strong>
                    <p className="text-xs text-slate-400">Placas de acrílico de 3mm para mostradores, cajas de cobro y recepción.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CORPORATE USE CASES */}
      <section className="py-24 px-4 bg-slate-50">
        <div className="max-w-6xl mx-auto space-y-16">
          <div className="text-center space-y-4 max-w-3xl mx-auto">
            <span className="text-xs font-black uppercase tracking-widest text-brand-600 block">Soluciones Adaptadas</span>
            <h2 className="text-3xl sm:text-4xl font-black text-brand-950">
              Transforma la Experiencia de tu Empresa en Panamá
            </h2>
            <p className="text-brand-600 text-sm sm:text-base leading-relaxed">
              Diseñamos dispositivos NFC corporativos adaptados a la estructura y necesidades comerciales de tu organización.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Case 1 */}
            <div className="bg-white rounded-2xl p-8 border border-brand-200 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 bg-brand-950 text-amber-400 rounded-xl flex items-center justify-center">
                <Briefcase className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-brand-950">Equipos de Ventas & Ejecutivos</h3>
              <p className="text-xs text-brand-600 leading-relaxed">
                Reemplaza las tarjetas físicas de cartón. Al tocar la tarjeta contra el teléfono de un cliente, se guardan el contacto (vCard), catálogo PDF, WhatsApp y presentación corporativa en segundos.
              </p>
              <ul className="text-xs space-y-1.5 font-semibold text-brand-700 pt-2">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Ahorro 100% en reimpresiones</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Imagen innovadora y moderna</li>
              </ul>
            </div>

            {/* Case 2 */}
            <div className="bg-white rounded-2xl p-8 border border-brand-200 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 bg-brand-950 text-amber-400 rounded-xl flex items-center justify-center">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-brand-950">Cadenas, Hoteles & Restaurantes</h3>
              <p className="text-xs text-brand-600 leading-relaxed">
                Placas acrílicas fijas en mostradores o mesas de recepción. Recolecta reseñas de 5 estrellas en Google Maps y TripAdvisor orgánicamente para todas tus sucursales en Panamá.
              </p>
              <ul className="text-xs space-y-1.5 font-semibold text-brand-700 pt-2">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Multiplica tus estrellas en Google</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Material acrílico ultrarresistente</li>
              </ul>
            </div>

            {/* Case 3 */}
            <div className="bg-white rounded-2xl p-8 border border-brand-200 shadow-sm hover:shadow-md transition-shadow space-y-4">
              <div className="w-12 h-12 bg-brand-950 text-amber-400 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-brand-950">Congresos & Eventos Masivos</h3>
              <p className="text-xs text-brand-600 leading-relaxed">
                Gafetes y badges NFC personalizados para conferencias, ferias y lanzamientos de productos. Facilita el intercambio instantáneo de información entre asistentes y expositores.
              </p>
              <ul className="text-xs space-y-1.5 font-semibold text-brand-700 pt-2">
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Medición en tiempo real de escaneos</li>
                <li className="flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5 text-green-600" /> Entrega rápida en Panamá</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. TIER PRICING / VOLUME DISCOUNTS */}
      <section className="py-20 px-4 bg-white border-y border-brand-200">
        <div className="max-w-5xl mx-auto space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-2xl sm:text-3xl font-black text-brand-950 uppercase tracking-tight">Descuentos Especiales por Volumen</h2>
            <p className="text-sm text-brand-600">Precios preferenciales para compras corporativas al por mayor.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="border border-brand-200 rounded-2xl p-6 text-center space-y-3 bg-brand-50/50">
              <span className="text-xs font-bold text-brand-500 uppercase tracking-wider">Pequeño Equipo</span>
              <div className="text-3xl font-black text-brand-950">10 – 49 <span className="text-xs font-normal text-brand-500">uds</span></div>
              <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase">15% de Descuento</span>
              <p className="text-[11px] text-brand-500">Incluye impresión de logo corporativo y configuración pre-envío.</p>
            </div>

            <div className="border-2 border-brand-950 rounded-2xl p-6 text-center space-y-3 bg-white shadow-xl relative">
              <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-brand-950 text-white text-[10px] font-extrabold uppercase px-3 py-0.5 rounded-full">Más Solicitado</span>
              <span className="text-xs font-bold text-brand-500 uppercase tracking-wider">Flotas Comerciales</span>
              <div className="text-3xl font-black text-brand-950">50 – 199 <span className="text-xs font-normal text-brand-500">uds</span></div>
              <span className="inline-block bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full uppercase">25% de Descuento</span>
              <p className="text-[11px] text-brand-500">Incluye branding full a medida y acceso al portal de administración.</p>
            </div>

            <div className="border border-brand-200 rounded-2xl p-6 text-center space-y-3 bg-brand-50/50">
              <span className="text-xs font-bold text-brand-500 uppercase tracking-wider">Enterprise & Franquicias</span>
              <div className="text-3xl font-black text-brand-950">200+ <span className="text-xs font-normal text-brand-500">uds</span></div>
              <span className="inline-block bg-amber-100 text-amber-900 text-xs font-bold px-3 py-1 rounded-full uppercase">Tarifa Enterprise</span>
              <p className="text-[11px] text-brand-500">Atención ejecutiva personalizada, muestras físicas y facturación a crédito.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. AUTO CONFIG GUIDE */}
      <section className="py-16 px-4 bg-brand-50">
        <div className="max-w-5xl mx-auto">
          <AutoConfigGuide />
        </div>
      </section>

      {/* 5. FORMULARIO DE COTIZACION */}
      <section id="cotizacion-form" className="py-24 px-4 bg-white">
        <div className="max-w-4xl mx-auto bg-brand-950 rounded-3xl shadow-2xl overflow-hidden text-white border border-brand-800">
          <div className="grid grid-cols-1 md:grid-cols-12">
            
            {/* Info Side */}
            <div className="md:col-span-5 p-8 sm:p-10 bg-brand-900 space-y-8 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="inline-flex items-center space-x-2 text-amber-400 text-xs font-bold uppercase tracking-widest">
                  <Mail className="w-4 h-4" />
                  <span>Contacto Directo B2B</span>
                </div>
                <h3 className="text-2xl font-black text-white">Solicita tu Propuesta Comercial</h3>
                <p className="text-xs text-brand-300 leading-relaxed">
                  Completa tus datos para recibir una cotización detallada con factura fiscal de Panamá y muestras de diseños corporativos.
                </p>
              </div>

              <div className="space-y-4 text-xs text-brand-300">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-800 flex items-center justify-center text-amber-400 font-bold">
                    <PhoneCall className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold text-white">WhatsApp Corporativo</span>
                    <span>+507 6713-4341</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-800 flex items-center justify-center text-amber-400 font-bold">
                    <Mail className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold text-white">Correo Electrónico</span>
                    <span>soporte@startap.com.pa</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-brand-800 flex items-center justify-center text-amber-400 font-bold">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="block font-bold text-white">Oficinas Principales</span>
                    <span>San Francisco, Ciudad de Panamá</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Side */}
            <div className="md:col-span-7 p-8 sm:p-10 space-y-6">
              {isSubmitted ? (
                <div className="text-center py-16 space-y-4">
                  <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white">¡Solicitud Enviada!</h4>
                  <p className="text-xs text-brand-300 max-w-sm mx-auto">
                    Te estamos redirigiendo a nuestro canal oficial de WhatsApp corporativo (+507 6713-4341) para atenderte de inmediato.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleQuoteSubmit} className="space-y-4 text-xs">
                  <h3 className="text-base font-bold uppercase tracking-wider text-white mb-2">Formulario de Cotización Rápida</h3>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-brand-300">Nombre de la Empresa / Negocio</label>
                    <input
                      type="text"
                      required
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      placeholder="Ej. Banco / Hotel / Grupo Comercial Panamá"
                      className="w-full px-3 py-2.5 rounded bg-brand-900 border border-brand-700 text-white placeholder-brand-500 focus:outline-none focus:border-amber-400"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-300">Nombre de Contacto</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        placeholder="Ej. María González"
                        className="w-full px-3 py-2.5 rounded bg-brand-900 border border-brand-700 text-white placeholder-brand-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-300">Teléfono Celular (WhatsApp)</label>
                      <input
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="6713-4341"
                        className="w-full px-3 py-2.5 rounded bg-brand-900 border border-brand-700 text-white placeholder-brand-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-300">Correo Empresarial</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contacto@empresa.com"
                        className="w-full px-3 py-2.5 rounded bg-brand-900 border border-brand-700 text-white placeholder-brand-500 focus:outline-none focus:border-amber-400"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-brand-300">Cantidad Estimada</label>
                      <select
                        value={quantity}
                        onChange={(e) => setQuantity(e.target.value)}
                        className="w-full px-3 py-2.5 rounded bg-brand-900 border border-brand-700 text-white focus:outline-none focus:border-amber-400"
                      >
                        <option value="10-24">10 a 24 unidades</option>
                        <option value="25-50">25 a 50 unidades</option>
                        <option value="50-100">50 a 100 unidades</option>
                        <option value="100+">Más de 100 unidades</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-brand-300">Requerimientos Específicos (Opcional)</label>
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Detalla si necesitas tarjetas ejecutivas, placas para sucursales o impresión de logo específico."
                      className="w-full px-3 py-2.5 rounded bg-brand-900 border border-brand-700 text-white placeholder-brand-500 focus:outline-none focus:border-amber-400"
                    ></textarea>
                  </div>

                  <button
                    type="submit"
                    className="w-full bg-amber-500 hover:bg-amber-400 text-brand-950 font-black text-xs uppercase tracking-widest py-3.5 rounded transition-colors shadow-lg mt-2"
                  >
                    Enviar Cotización por WhatsApp (+507 6713-4341)
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}
