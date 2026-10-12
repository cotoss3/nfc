'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Briefcase,
  CheckCircle2,
  Building2,
  Send,
  ShieldCheck,
  Package,
  Layers,
  Sparkles,
  Users,
  Printer,
  ShoppingBag,
  Laptop,
  Check,
  AlertCircle,
  Clock,
  Lock,
  ArrowRight,
  PhoneCall,
  QrCode,
  CreditCard,
  FileText,
  BadgeCheck
} from 'lucide-react';

export default function DistribuidoresClient() {
  const [formData, setFormData] = useState({
    empresa: '',
    ruc: '',
    contacto: '',
    whatsapp: '',
    correo: '',
    giro: 'agencia',
    clientes_aprox: '',
    unidades_mes: '',
    acepta_contacto: false,
    website: '' // Honeypot antispam
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!formData.empresa || !formData.contacto || !formData.whatsapp || !formData.correo) {
      setErrorMsg('Por favor completa todos los campos requeridos marcados con (*).');
      return;
    }

    if (!formData.acepta_contacto) {
      setErrorMsg('Debes aceptar el consentimiento de contacto comercial (Ley 81).');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/distribuidores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          clientes_aprox: parseInt(formData.clientes_aprox, 10) || 0,
          unidades_mes: parseInt(formData.unidades_mes, 10) || 0
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
      } else {
        setErrorMsg(data.error || 'Ocurrió un error al enviar tu postulación. Intenta nuevamente.');
      }
    } catch (err) {
      setErrorMsg('Error de conexión. Por favor intenta más tarde o escríbenos directamente por WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full bg-slate-50 font-sans text-slate-900">
      
      {/* 1. HERO SECTION PREMIUM */}
      <section className="relative bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white pt-16 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden border-b border-slate-800">
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none"></div>
        <div className="absolute top-1/4 -left-32 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-10 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6 relative z-10">
          <div className="inline-flex items-center space-x-2 bg-amber-400/10 border border-amber-400/30 px-4 py-1.5 rounded-full text-xs font-bold text-amber-300 uppercase tracking-widest shadow-sm">
            <Briefcase className="w-4 h-4 text-amber-400" />
            <span>Canal Mayorista & Socios Comerciales en Panamá</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] text-white">
            Distribuye Hardware NFC para <br className="hidden sm:block" />
            <span className="bg-gradient-to-r from-amber-300 via-amber-400 to-amber-200 bg-clip-text text-transparent">
              Reseñas en Google Maps
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed font-normal">
            Suma a tu catálogo la tecnología que los negocios físicos de Panamá necesitan para multiplicar sus calificaciones de 5 estrellas en mostrador. Márgenes mayoristas escalonados, hardware listo para vincular y plataforma en la nube sin costos mensuales para tus clientes.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="#formulario-postulacion"
              className="w-full sm:w-auto bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider py-4 px-8 rounded-xl shadow-lg transition-transform hover:scale-105 flex items-center justify-center gap-2"
            >
              <span>Solicitar Ingreso como Distribuidor</span>
              <ArrowRight className="w-4 h-4" />
            </a>

            <a
              href={`https://wa.me/50764839004?text=${encodeURIComponent('Hola starTAP, me interesa información sobre el programa de distribuidores mayoristas de dispositivos NFC')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider py-4 px-8 rounded-xl border border-white/20 transition-all text-center flex items-center justify-center gap-2"
            >
              <PhoneCall className="w-4 h-4 text-emerald-400" />
              <span>Consultar por WhatsApp (+507 6483-9004)</span>
            </a>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-slate-800/80 text-xs text-slate-300 max-w-3xl mx-auto">
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Pedido mínimo desde 25 unidades</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Sin mensualidades para el cliente final</span>
            </div>
            <div className="flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-amber-400 shrink-0" />
              <span>Garantía y soporte técnico local</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2. DISPOSITIVOS QUE DISTRIBUYES (PRODUCT SHOWCASE) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-black uppercase tracking-widest text-amber-600 block">
            Catálogo Disponible para Reventa
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
            Hardware Contactless Listo para Configurar
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
            Todos nuestros dispositivos integran chip NFC NTAG de alta sensibilidad compatible con iPhone y Android, código QR de alta resolución grabado y enlace canónico editable.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Placa de Mostrador */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-44 bg-slate-100 rounded-xl relative overflow-hidden flex items-center justify-center">
                <Image
                  src="/products/NFC_10001/NFC_10001_Placa.webp"
                  alt="Placa Acrílica Adhesiva NFC starTAP"
                  fill
                  className="object-contain p-4"
                />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md">
                  Más Vendido en Mostradores
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">Placa Acrílica para Mostrador</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Acrílico ultrarresistente de 3 mm con adhesivo de grado industrial. Ideal para cajas registradoras, barras de cobro y puntos de atención rápida.
                </p>
              </div>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-4 border-t border-slate-100 mt-4">
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Resiste desinfectantes y agua</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Chip NFC + QR sincronizado</li>
            </ul>
          </div>

          {/* Card 2: Stand de Mesa */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-44 bg-slate-100 rounded-xl relative overflow-hidden flex items-center justify-center">
                <Image
                  src="/products/NFC10002/NFC_10002_Stan.webp"
                  alt="Stand NFC de Mesa starTAP"
                  fill
                  className="object-contain p-4"
                />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-md">
                  Ideal Restaurantes y Hoteles
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">Stand Autoportante de Mesa</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  Estructura premium estable para mesas, salones de espera, recepciones y barras. Doble cara interactiva para captura inmediata al sentarse.
                </p>
              </div>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-4 border-t border-slate-100 mt-4">
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Formato autoportante de mesa</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Ángulo óptimo de toque móvil</li>
            </ul>
          </div>

          {/* Card 3: Tarjeta de Bolsillo */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="h-44 bg-slate-100 rounded-xl relative overflow-hidden flex items-center justify-center">
                <Image
                  src="/products/tarjeta-nfc/tarjeta-nfc-bolsillo-principal.webp"
                  alt="Tarjeta NFC de Bolsillo starTAP"
                  fill
                  className="object-contain p-4"
                />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                  Ventas & Ejecutivos
                </span>
                <h3 className="text-lg font-bold text-slate-900 mt-2">Tarjeta NFC de Bolsillo</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                  PVC laminado mate tamaño estándar de tarjeta de crédito. Para técnicos de servicio a domicilio, gerentes de tienda y ejecutivos de campo.
                </p>
              </div>
            </div>
            <ul className="text-xs text-slate-600 space-y-1.5 pt-4 border-t border-slate-100 mt-4">
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Cabe en cualquier billetera o gafete</li>
              <li className="flex items-center gap-1.5"><Check className="w-3.5 h-3.5 text-emerald-600" /> Durabilidad superior al desgaste</li>
            </ul>
          </div>
        </div>
      </section>

      {/* 3. A QUIÉN BUSCAMOS (SOCIOS COMERCIALES) */}
      <section className="py-16 bg-white border-y border-slate-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <span className="text-xs font-black uppercase tracking-widest text-slate-500 block">
              Perfil de Aliados
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
              ¿Quién Califica para el Programa Mayorista?
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mx-auto">
              Buscamos empresas, profesionales y agencias con cartera activa de comercios que deseen ampliar su oferta de soluciones presenciales con un producto físico probado.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Agencias de Marketing & SEO</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                El complemento perfecto para clientes de gestión de redes y SEO local: lleva los resultados digitales al mostrador físico.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Printer className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Imprentas & Material POP</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ofrece señalética inteligente interactiva a clientes recurrentes que ya te compran menús, rótulos o papelería comercial.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Laptop className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Software POS & Cajas</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Vende un accesorio de alta demanda junto al punto de venta que ayuda a fidelizar y captar reseñas en el momento del pago.
              </p>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Users className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">Consultores Comerciales</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Asesores de restaurantes, clínicas, talleres y retail que buscan resolver la reputación online de sus clientes de forma directa.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CONDICIONES COMERCIALES CLARAS (TARJETAS MODERNAS) */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-amber-600 block">
            Transparencia & Reglas Claras
          </span>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-950">
            Condiciones del Programa de Distribución
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            Protegemos el mercado para que cada distribuidor trabaje con márgenes saludables y respaldo absoluto.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Volumen Mínimo Accesible</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              El pedido inicial parte de <strong>25 unidades</strong> surtidas entre tarjetas, placas o stands. Descuentos superiores a partir de <strong>100 unidades</strong>.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Precio Mínimo de Reventa</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              El distribuidor se compromete a respetar los precios públicos oficiales al detal de starTAP para evitar guerras de precios desleales.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Canales Directos Autorizados</h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Venta directa a tus clientes presenciales o en propuestas cerradas. Queda restringida la venta en marketplaces de subasta pública.
            </p>
          </div>
        </div>
      </section>

      {/* 5. FORMULARIO DE POSTULACION B2B */}
      <section id="formulario-postulacion" className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-900 text-white">
        <div className="max-w-4xl mx-auto space-y-10">
          <div className="text-center space-y-3">
            <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-amber-300 px-3 py-1 rounded-full text-xs font-bold border border-amber-400/30">
              <BadgeCheck className="w-3.5 h-3.5" />
              <span>Evaluación de Postulaciones</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white">
              Postula para Acceder a la Lista Mayorista
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
              Completa los datos de tu empresa. Evaluamos tu solicitud y te contactamos en menos de <strong>48 horas hábiles</strong> con el PDF confidencial de precios y el acuerdo de distribución.
            </p>
          </div>

          <div className="bg-white text-slate-900 p-6 sm:p-10 rounded-3xl shadow-2xl border border-slate-200">
            {success ? (
              <div className="p-8 text-center space-y-4">
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-9 h-9" />
                </div>
                <h3 className="font-black text-2xl text-slate-950">¡Solicitud Registrada con Éxito!</h3>
                <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                  Gracias por tu interés en representar a <strong>starTAP Panamá</strong>. Nuestro equipo comercial revisará tu postulación y te contactará por WhatsApp y correo electrónico para compartirte la lista mayorista privada.
                </p>
                <div className="pt-4">
                  <Link
                    href="/"
                    className="inline-block bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider px-6 py-3 rounded-xl transition"
                  >
                    Volver al Inicio
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Honeypot Invisible */}
                <input
                  type="text"
                  name="website"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  style={{ display: 'none' }}
                  tabIndex={-1}
                  autoComplete="off"
                />

                {errorMsg && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Empresa o Nombre Comercial *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Creativa Agencia / Imprenta Studio"
                      value={formData.empresa}
                      onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      RUC y DV (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 155689452-2-2023 DV 45"
                      value={formData.ruc}
                      onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Persona de Contacto *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nombre y apellido del solicitante"
                      value={formData.contacto}
                      onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      WhatsApp Comercial *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+507 6000-0000"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Correo Electrónico Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contacto@tuempresa.com"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50 focus:bg-white"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Giro o Actividad *
                    </label>
                    <select
                      value={formData.giro}
                      onChange={(e) => setFormData({ ...formData, giro: e.target.value })}
                      className="w-full px-3 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50 focus:bg-white"
                    >
                      <option value="agencia">Agencia de Marketing / Publicidad</option>
                      <option value="imprenta">Imprenta / Rotulación</option>
                      <option value="pos">Sistemas POS / Cajas Registradoras</option>
                      <option value="consultor">Consultor Comercial / Gastronómico</option>
                      <option value="otro">Otro Rubro B2B</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Clientes Actuales (Aprox.)
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Ej. 25 negocios"
                      value={formData.clientes_aprox}
                      onChange={(e) => setFormData({ ...formData, clientes_aprox: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50 focus:bg-white"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Unidades / Mes Estimadas
                    </label>
                    <input
                      type="number"
                      min="25"
                      placeholder="Mínimo 25 uds"
                      value={formData.unidades_mes}
                      onChange={(e) => setFormData({ ...formData, unidades_mes: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 text-xs sm:text-sm focus:ring-2 focus:ring-amber-500 focus:outline-none bg-slate-50 focus:bg-white"
                    />
                  </div>
                </div>

                {/* Checkbox Consentimiento Ley 81 */}
                <div className="pt-2">
                  <label className="flex items-start gap-3 cursor-pointer text-xs text-slate-600 select-none">
                    <input
                      type="checkbox"
                      checked={formData.acepta_contacto}
                      onChange={(e) => setFormData({ ...formData, acepta_contacto: e.target.checked })}
                      className="mt-0.5 rounded border-slate-300 text-amber-500 focus:ring-amber-400 w-4 h-4 cursor-pointer"
                    />
                    <span className="leading-relaxed">
                      Acepto que starTAP Panamá se comunique conmigo por WhatsApp y correo electrónico para evaluar mi postulación y presentarme el acuerdo comercial confidencial (Cumplimiento Ley 81 de Protección de Datos Personales de Panamá).
                    </span>
                  </label>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-slate-950 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-wider py-4 px-6 rounded-xl transition shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {loading ? (
                      <span>Procesando Solicitud...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-amber-400" />
                        <span>Enviar Postulación Comercial</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* 6. FAQ DE DISTRIBUCIÓN */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center space-y-3 mb-10">
          <span className="text-xs font-black uppercase tracking-widest text-slate-500 block">
            Preguntas Frecuentes
          </span>
          <h2 className="text-2xl font-black text-slate-950">
            Dudas Comunes sobre la Distribución
          </h2>
        </div>

        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-sm text-slate-900">¿Cómo entrego los dispositivos a mis clientes?</h4>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Recibes el hardware físico en Panamá listo y probado. Puedes vincularlo tú mismo en menos de 1 minuto con el celular del cliente escaneando el dispositivo o solicitar pre-vinculación con el enlace de Google Maps de cada negocio.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-sm text-slate-900">¿Qué soporte técnico brinda starTAP al cliente final?</h4>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Nosotros mantenemos activa y sincronizada la infraestructura cloud de redirección y garantizamos la durabilidad del hardware. Tú manejas la relación comercial y la entrega con tu cliente.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200">
            <h4 className="font-bold text-sm text-slate-900">¿Puedo personalizar los dispositivos con mi marca?</h4>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
              Sí. A partir del nivel de pedidos mayoristas (100+ unidades) ofrecemos esquemas con personalización de marca o acabado neutro para que integres tu propia identidad visual.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
}
