'use client';

import React, { useState } from 'react';
import Link from 'next/link';
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
  Lock
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
      setErrorMsg('Por favor completa todos los campos requeridos.');
      return;
    }

    if (!formData.acepta_contacto) {
      setErrorMsg('Debes aceptar los términos de contacto (Ley 81).');
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
      setErrorMsg('Error de conexión. Por favor intenta más tarde o contáctanos por WhatsApp.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      {/* Hero Header */}
      <section className="bg-slate-950 text-white pt-14 pb-16 px-4 sm:px-6 lg:px-8 border-b border-slate-800">
        <div className="max-w-5xl mx-auto text-center space-y-5">
          <div className="inline-flex items-center space-x-2 bg-amber-400/20 text-amber-300 px-3.5 py-1 rounded-full text-xs font-extrabold border border-amber-400/30">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Programa Oficial para Socios Comerciales en Panamá</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight">
            Distribuye Dispositivos NFC de Reseñas para tus Clientes Comerciales 🇵🇦
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-3xl mx-auto font-medium">
            Integra a tu catálogo la tecnología que los negocios de mostrador necesitan para capturar reseñas de 5 estrellas en Google Maps. Márgenes mayoristas atractivos, soporte técnico integral y plataforma en la nube sin suscripciones.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-xs font-semibold text-slate-400">
            <span className="flex items-center gap-1.5"><Check className="text-emerald-400 w-4 h-4" /> Pedido mínimo 25 unidades</span>
            <span className="flex items-center gap-1.5"><Check className="text-emerald-400 w-4 h-4" /> Sin cobros mensuales para el cliente</span>
            <span className="flex items-center gap-1.5"><Check className="text-emerald-400 w-4 h-4" /> Cobertura y soporte en Panamá</span>
          </div>
        </div>
      </section>

      {/* Target Audience Section */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
              <Sparkles className="w-5 h-5 text-cyan-600" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Agencias de Marketing</h3>
            <p className="text-xs text-slate-600">Completa tus estrategias de SEO local con el puente físico al mostrador.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
              <Printer className="w-5 h-5 text-cyan-600" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Imprentas y Rotulación</h3>
            <p className="text-xs text-slate-600">Ofrece material POP interactivo de alta gama a tus clientes actuales.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
              <Laptop className="w-5 h-5 text-cyan-600" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Sistemas POS y Caja</h3>
            <p className="text-xs text-slate-600">Vende un complemento de alto valor para restaurantes y tiendas al pagar.</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-2">
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-700 flex items-center justify-center font-bold">
              <Users className="w-5 h-5 text-cyan-600" />
            </div>
            <h3 className="font-bold text-sm text-slate-900">Consultores Gastronómicos</h3>
            <p className="text-xs text-slate-600">Aumenta la reputación y facturación de bares, salones y locales.</p>
          </div>
        </div>
      </section>

      {/* Main Content & Form */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* Left Column: Requirements & Benefits */}
        <div className="lg:col-span-6 space-y-8">
          <div>
            <h2 className="text-2xl font-black text-slate-950 tracking-tight">
              Ventajas del Programa Mayorista starTAP
            </h2>
            <p className="text-sm text-slate-600 mt-2">
              Buscamos socios comerciales estratégicos que asesoren directamente a negocios en Panamá. No intermediarios de ocasión.
            </p>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white rounded-xl border border-slate-200 flex gap-3.5">
              <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg h-fit">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Márgenes Mayoristas Escalonados</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Acceso a tabla de precios preferenciales para compras de 25 a 99 unidades, y nivel mayorista para pedidos de 100+ unidades.
                </p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 flex gap-3.5">
              <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg h-fit">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Hardware Listo para Configurar</h4>
                <p className="text-xs text-slate-600 mt-1">
                  Placas acrílicas, stands de madera y tarjetas de bolsillo de alta resistencia con chips NFC NTAG213 y código QR sincronizado.
                </p>
              </div>
            </div>

            <div className="p-4 bg-white rounded-xl border border-slate-200 flex gap-3.5">
              <div className="p-2 bg-cyan-50 text-cyan-600 rounded-lg h-fit">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900">Soporte Técnico y Garantía Local</h4>
                <p className="text-xs text-slate-600 mt-1">
                  starTAP respalda la plataforma en la nube y asume el soporte técnico de vinculación para que tú solo te enfoques en la venta.
                </p>
              </div>
            </div>
          </div>

          {/* Requisitos y Políticas */}
          <div className="p-5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3">
            <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600" /> Requisitos y Condiciones Obligatorias
            </h3>
            <ul className="text-xs text-slate-700 space-y-2 list-disc pl-4 font-medium">
              <li><strong>Volumen mínimo:</strong> Pedido inicial mínimo de 25 unidades surtidas o por modelo.</li>
              <li><strong>Condición de pago:</strong> 100% por adelantado al emitir la orden de fabricación o despacho.</li>
              <li><strong>Precio mínimo de reventa:</strong> El distribuidor debe respetar los precios de venta al detal oficiales para proteger el valor de mercado.</li>
              <li><strong>Canales autorizados:</strong> Exclusivo para venta directa a clientes, propuestas corporativas o paquetes de agencia. Queda prohibida la reventa en plataformas de subasta o marketplaces abiertos (Amazon, MercadoLibre, Encuentra24).</li>
              <li><strong>Acuerdo formal:</strong> Firma previa del Acuerdo de Distribución Comercial starTAP.</li>
            </ul>
          </div>
        </div>

        {/* Right Column: Application Form */}
        <div className="lg:col-span-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl space-y-6">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-cyan-700 block">
                Postulación Comercial
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-slate-950 mt-1">
                Solicita tu Incorporación al Programa
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Completa el formulario para evaluar tu perfil. Te contactaremos formalmente por WhatsApp y correo electrónico.
              </p>
            </div>

            {success ? (
              <div className="p-6 bg-emerald-50 border border-emerald-300 rounded-2xl text-center space-y-3">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-black text-lg text-slate-900">¡Solicitud Recibida con Éxito!</h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                  Revisamos tu solicitud y te escribimos en un plazo máximo de <strong>2 días hábiles</strong> para coordinar la revisión del acuerdo y enviarte la lista de precios mayorista.
                </p>
                <div className="pt-2">
                  <Link
                    href="/"
                    className="inline-block text-xs font-bold text-cyan-600 hover:text-cyan-700 underline"
                  >
                    Volver a la página principal
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
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
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{errorMsg}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Empresa o Nombre Comercial *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ej. Creativa Agencia"
                      value={formData.empresa}
                      onChange={(e) => setFormData({ ...formData, empresa: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      RUC y DV (Opcional)
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 155689452-2-2023 DV 45"
                      value={formData.ruc}
                      onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Persona de Contacto *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Nombre y apellido"
                      value={formData.contacto}
                      onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      WhatsApp Comercial *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="+507 6000-0000"
                      value={formData.whatsapp}
                      onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Correo Electrónico Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="contacto@empresa.com"
                    value={formData.correo}
                    onChange={(e) => setFormData({ ...formData, correo: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Giro o Actividad *
                    </label>
                    <select
                      value={formData.giro}
                      onChange={(e) => setFormData({ ...formData, giro: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none bg-white"
                    >
                      <option value="agencia">Agencia de Marketing</option>
                      <option value="imprenta">Imprenta / Rotulación</option>
                      <option value="pos_software">Software / POS / Facturación</option>
                      <option value="consultoria">Consultoría Gastronómica</option>
                      <option value="otro">Otro rubro B2B</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Clientes Actuales
                    </label>
                    <input
                      type="number"
                      min="0"
                      placeholder="Ej. 30"
                      value={formData.clientes_aprox}
                      onChange={(e) => setFormData({ ...formData, clientes_aprox: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Unidades / Mes Est.
                    </label>
                    <input
                      type="number"
                      min="25"
                      placeholder="Mín. 25"
                      value={formData.unidades_mes}
                      onChange={(e) => setFormData({ ...formData, unidades_mes: e.target.value })}
                      className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-cyan-500 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Checkbox Ley 81 */}
                <div className="pt-2">
                  <label className="flex items-start gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      required
                      checked={formData.acepta_contacto}
                      onChange={(e) => setFormData({ ...formData, acepta_contacto: e.target.checked })}
                      className="mt-0.5 rounded border-slate-300 text-cyan-600 focus:ring-cyan-500"
                    />
                    <span className="text-[11px] text-slate-600 leading-tight">
                      Acepto que starTAP me contacte por estos medios para evaluar mi postulación comercial y presentarme el acuerdo de distribución (Ley 81 de Protección de Datos Personales de Panamá).
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3.5 px-6 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Procesando postulación...</span>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>Enviar Solicitud de Distribuidor</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

      </section>
    </div>
  );
}
