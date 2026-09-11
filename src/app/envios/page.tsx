import type { Metadata } from 'next';
import Link from 'next/link';
import { Truck, Clock, ArrowLeft, ShieldCheck, MapPin, Package, CheckCircle2, AlertCircle } from 'lucide-react';

const BASE_URL = 'https://startap.com.pa';

export const metadata: Metadata = {
  title: 'Política de Envíos y Tiempos de Entrega | StarTAP Panamá',
  description: 'Conoce los tiempos de configuración (24-48h), despacho y entrega de dispositivos NFC y QR en Ciudad de Panamá y Provincias por Uno Express y Servientrega.',
  alternates: {
    canonical: `${BASE_URL}/envios`,
  },
};

export default function EnviosPage() {
  return (
    <div className="bg-slate-50 text-slate-900 min-h-screen py-12 px-4 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        
        {/* Navigation back */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-slate-600 hover:text-slate-950 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>
        </div>

        {/* Document Header */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-4">
          <div className="inline-flex items-center space-x-2 bg-amber-100 text-amber-900 border border-amber-300 font-extrabold text-xs uppercase px-3.5 py-1.5 rounded-full">
            <Truck className="w-4 h-4 text-amber-700" />
            <span>Logística y Despachos en Panamá</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 uppercase tracking-tight">
            Política de Envíos y Tiempos de Entrega
          </h1>
          <p className="text-sm text-slate-600">
            StarTAP Panamá — KoreNet Cloud & Web (Fernando Contreras)
          </p>
        </div>

        {/* Highlight Banner */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-800 space-y-3">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wide">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>Claridad en nuestros tiempos de procesamiento</span>
          </div>
          <p className="text-sm text-slate-200 leading-relaxed">
            El plazo de <strong className="text-amber-300 font-bold">24 a 48 horas laborables</strong> corresponde al tiempo interno de StarTAP para verificar el pago, realizar la programación electrónica del chip NFC, validar el código QR e ingresar el paquete al proveedor de logística. El tiempo final de llegada a tu negocio depende de la empresa de transporte seleccionada.
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 text-sm text-slate-700 leading-relaxed">
          
          {/* Fases del Proceso */}
          <section className="space-y-4 border-b border-slate-100 pb-6">
            <h2 className="text-lg font-bold text-slate-950 uppercase tracking-wide flex items-center gap-2">
              <Package className="w-5 h-5 text-amber-600" />
              1. Fases del Pedido: Preparación vs Tránsito Logístico
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Fase 1 */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                <div className="inline-block bg-amber-500 text-white text-[11px] font-black uppercase px-2.5 py-0.5 rounded">
                  Fase 1: Configuración (24 - 48 Horas)
                </div>
                <h3 className="font-bold text-slate-950 text-base">Procesamiento y Preparación Física</h3>
                <ul className="text-xs space-y-1.5 text-slate-600 list-disc pl-4">
                  <li>Verificación de pago (Yappy, ACH o Tarjeta).</li>
                  <li>Grabado del chip NFC 13.56 MHz con la URL de tu ficha de Google Maps.</li>
                  <li>Verificación de impresión del código QR de respaldo.</li>
                  <li>Empaque seguro y entrega del paquete en el centro de acopio del proveedor logístico.</li>
                </ul>
              </div>

              {/* Fase 2 */}
              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                <div className="inline-block bg-slate-900 text-white text-[11px] font-black uppercase px-2.5 py-0.5 rounded">
                  Fase 2: Tránsito Logístico (Según Proveedor)
                </div>
                <h3 className="font-bold text-slate-950 text-base">Transporte y Entrega Final</h3>
                <ul className="text-xs space-y-1.5 text-slate-600 list-disc pl-4">
                  <li>El tiempo de traslado inicia una vez el transportista recibe el paquete.</li>
                  <li>Varía según la provincia y modalidad (Entrega a domicilio o Retiro en sucursal).</li>
                  <li>Enviamos el comprobante de envío o número de guía para rastreo directo.</li>
                </ul>
              </div>
            </div>
          </section>

          {/* Proveedores y Cobertura */}
          <section className="space-y-4 border-b border-slate-100 pb-6">
            <h2 className="text-lg font-bold text-slate-950 uppercase tracking-wide flex items-center gap-2">
              <MapPin className="w-5 h-5 text-amber-600" />
              2. Cobertura y Tiempos Estimados de Tránsito por Zonas
            </h2>

            <div className="space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Ciudad de Panamá y Área Metropolitana
                </h3>
                <p className="text-xs text-slate-600">
                  <strong className="text-slate-900">Transporte:</strong> Mensajería local directa / Delivery urbano.
                  <br />
                  <strong className="text-slate-900">Tiempo estimado de tránsito:</strong> Entregas procesadas generalmente dentro de las 24 a 48 horas laborables tras completar la fase de configuración.
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Provincias e Interior del País (Chiriquí, Provincias Centrales, Colón, Bocas del Toro)
                </h3>
                <p className="text-xs text-slate-600">
                  <strong className="text-slate-900">Transporte:</strong> Uno Express o Servientrega (a elección del cliente o disponibilidad de ruta).
                  <br />
                  <strong className="text-slate-900">Tiempo estimado de tránsito:</strong> Habitualmente de 24 a 72 horas hábiles adicionales a partir de la entrega del paquete en la sucursal del transportista.
                </p>
              </div>
            </div>
          </section>

          {/* Modalidades de Entrega */}
          <section className="space-y-3 border-b border-slate-100 pb-6">
            <h2 className="text-lg font-bold text-slate-950 uppercase tracking-wide">
              3. Modalidades de Recepción del Pedido
            </h2>
            <ul className="list-disc pl-5 space-y-2 text-slate-700">
              <li>
                <strong className="text-slate-900">Entrega en Local u Oficina (Domicilio):</strong> Disponible para direcciones claras en zonas con cobertura de mensajería directa o Servientrega. Es indispensable contar con personal en el local para recibir el paquete.
              </li>
              <li>
                <strong className="text-slate-900">Retiro en Sucursal (Encomienda Uno Express / Servientrega):</strong> Recomendado para provincias del interior. El paquete se envía a la oficina de Uno Express o Servientrega más cercana a tu localidad para que lo retires a tu conveniencia presentando tu cédula de identidad.
              </li>
            </ul>
          </section>

          {/* Rastreo y Contacto */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950 uppercase tracking-wide">
              4. Confirmación y Guía de Rastreo
            </h2>
            <p>
              Una vez que tu paquete ingresa al proveedor logístico seleccionado, nuestro equipo te enviará la foto de la guía oficial de envío por <strong className="text-slate-900">WhatsApp (+507 6713-4341)</strong> o al correo electrónico registrado (<strong className="text-slate-900">info@datakorex.com</strong>).
            </p>
            <p className="text-xs bg-amber-50 p-4 rounded-xl border border-amber-200 text-amber-950 font-medium">
              Si requieres alguna indicación especial para tu envío o necesitas coordinar el retiro en una sucursal específica de Uno Express, comunícate directamente con nuestro equipo al WhatsApp +507 6713-4341 antes del despacho.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
