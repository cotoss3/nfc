import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, RotateCcw, Clock, ShieldCheck, CheckCircle2, AlertTriangle, Truck } from 'lucide-react';

const BASE_URL = 'https://startap.com.pa';

export const metadata: Metadata = {
  title: 'Política de Devoluciones y Reembolsos | starTAP Panamá',
  description:
    'Conoce las condiciones, plazos de 7 días, tarifas de reposición de B/. 4 y proceso de reembolso de dispositivos NFC en starTAP Panamá.',
  alternates: {
    canonical: `${BASE_URL}/devoluciones`,
  },
};

export default function DevolucionesPage() {
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
            <RotateCcw className="w-4 h-4 text-amber-700" />
            <span>Términos Comerciales y Devoluciones</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 uppercase tracking-tight">
            Política de Devoluciones y Reembolsos
          </h1>
          <p className="text-sm text-slate-600">
            starTAP Panamá — Dispositivos Contactless y Soluciones de Reseñas Google (Ciudad de Panamá)
          </p>
        </div>

        {/* Resumen de Política (Alineado con Google Merchant Center) */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-md border border-slate-800 space-y-4">
          <div className="flex items-center gap-2 text-amber-400 font-bold text-sm uppercase tracking-wide">
            <Clock className="w-5 h-5 text-amber-400" />
            <span>Resumen oficial de condiciones</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2">
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <span className="block text-[11px] font-bold text-slate-400 uppercase">Plazo de devolución</span>
              <span className="text-base font-black text-white">7 días naturales</span>
              <p className="text-xs text-slate-300 mt-1">Desde la fecha de recepción del producto.</p>
            </div>
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <span className="block text-[11px] font-bold text-slate-400 uppercase">Condición del producto</span>
              <span className="text-base font-black text-white">Solo nuevo</span>
              <p className="text-xs text-slate-300 mt-1">Sin rayones, en empaque original y sin usar.</p>
            </div>
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <span className="block text-[11px] font-bold text-slate-400 uppercase">Tarifa de reposición</span>
              <span className="text-base font-black text-amber-400">B/. 4.00</span>
              <p className="text-xs text-slate-300 mt-1">Costo administrativo por reingreso a taller.</p>
            </div>
            <div className="bg-slate-800/80 p-4 rounded-2xl border border-slate-700">
              <span className="block text-[11px] font-bold text-slate-400 uppercase">Plazo de reembolso</span>
              <span className="text-base font-black text-emerald-400">10 días</span>
              <p className="text-xs text-slate-300 mt-1">Tras inspección física del producto.</p>
            </div>
          </div>
        </div>

        {/* Detailed Sections */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 text-sm text-slate-700 leading-relaxed">
          
          {/* Sección 1: Elegibilidad */}
          <section className="space-y-3 border-b border-slate-100 pb-6">
            <h2 className="text-lg font-bold text-slate-950 uppercase tracking-wide flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              1. Plazo y Condiciones de Aceptación
            </h2>
            <p>
              El cliente dispone de un plazo de <strong>7 días naturales</strong> contados a partir de la fecha de entrega certificada por el proveedor de envíos (o recepción en mano) para solicitar la devolución de un dispositivo estándar.
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li>El producto debe estar en condición <strong>completamente nueva</strong>, sin signos de uso, sin manchas, sin rayaduras en el acrílico o PVC y con todos sus adhesivos o accesorios intactos.</li>
              <li>Debe devolverse con su embalaje y protectores originales.</li>
              <li>Aplica para dispositivos estándar de catálogo (placas de mostrador, stands y tarjetas en configuración base).</li>
            </ul>
          </section>

          {/* Sección 2: Envíos de devolución */}
          <section className="space-y-3 border-b border-slate-100 pb-6">
            <h2 className="text-lg font-bold text-slate-950 uppercase tracking-wide flex items-center gap-2">
              <Truck className="w-5 h-5 text-amber-600" />
              2. Costos de Envío de la Devolución
            </h2>
            <p>
              El costo del envío de retorno hasta nuestro taller o punto de recepción en Ciudad de Panamá corre <strong>por cuenta exclusiva del cliente</strong>.
            </p>
            <p className="text-xs text-slate-600">
              El cliente puede realizar el envío a través de Uno Express, Servientrega o mensajería local previa coordinación con nuestro equipo de atención. starTAP no asume el flete del envío de retorno salvo que se trate de un reemplazo por garantía de chip defectuoso de fábrica.
            </p>
          </section>

          {/* Sección 3: Tarifa de reposición y reembolso */}
          <section className="space-y-3 border-b border-slate-100 pb-6">
            <h2 className="text-lg font-bold text-slate-950 uppercase tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-accent-600" />
              3. Tarifa de Reposición y Plazo de Reembolso
            </h2>
            <p>
              Toda devolución aprobada aplica una <strong>tarifa de reposición administrativa fija de B/. 4.00 (cuatro balboas)</strong> por producto, la cual cubre los costos de revisión técnica, borrado y desconfiguración electrónica del chip NFC, inspección de calidad e inventario.
            </p>
            <p>
              Una vez recibido el paquete en nuestras instalaciones e inspeccionado el estado del dispositivo:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-xs text-slate-600">
              <li>El reembolso del monto pagado (menos la tarifa de reposición de B/. 4.00 y el costo del flete inicial si aplicara) se procesará en un plazo máximo de <strong>10 días hábiles</strong>.</li>
              <li>El reembolso se emitirá por el mismo medio de pago original (Yappy Comercial de Banco General o acreditación directa a la tarjeta Visa / Mastercard procesada).</li>
            </ul>
          </section>

          {/* Sección 4: Excepciones (Personalizados) y Garantía */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950 uppercase tracking-wide flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
              4. Excepciones: Productos Personalizados con Logo
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              De acuerdo con las normativas comerciales de productos a medida, aquellos dispositivos fabricados con <strong>impresión de logotipo personalizado o diseño exclusivo del cliente</strong> no son susceptibles de devolución comercial por retracto, ya que han sido elaborados a la medida de su empresa.
            </p>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Garantía de Hardware de 12 Meses:</strong> Todos nuestros dispositivos cuentan con 12 meses de garantía directa. Si el microchip NFC presenta algún fallo electrónico de fábrica, starTAP repondrá el dispositivo sin costo para el cliente.
            </p>
          </section>

          {/* Contacto para devoluciones */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-950 text-xs">¿Necesitas gestionar una devolución o garantía?</p>
              <p className="text-xs text-slate-500">Escríbenos directamente con tu número de pedido o comprobante de pago.</p>
            </div>
            <a
              href="https://wa.me/50764839004?text=Hola%2C%20necesito%20coordinar%20una%20devoluci%C3%B3n%20o%20garant%C3%ADa%20de%20mi%20pedido%20starTAP."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all shadow-sm"
            >
              Contactar Soporte por WhatsApp
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
