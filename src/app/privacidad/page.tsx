import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, Lock, ArrowLeft, Mail, Phone, Building, CheckCircle2 } from 'lucide-react';

const BASE_URL = 'https://startap.com.pa';

export const metadata: Metadata = {
  title: 'Política de Privacidad y Protección de Datos | StarTAP Panamá',
  description: 'Política de privacidad y tratamiento de datos personales de StarTAP Panamá conforme a la Ley 81 de 2019. Operado por KoreNet Cloud & Web.',
  alternates: {
    canonical: `${BASE_URL}/privacidad`,
  },
};

export default function PrivacidadPage() {
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
          <div className="inline-flex items-center space-x-2 bg-emerald-100 text-emerald-900 border border-emerald-300 font-extrabold text-xs uppercase px-3.5 py-1.5 rounded-full">
            <Shield className="w-4 h-4 text-emerald-700" />
            <span>Ley 81 de 2019 — República de Panamá</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 uppercase tracking-tight">
            Política de Privacidad y Protección de Datos
          </h1>
          <p className="text-sm text-slate-600">
            Última actualización: 11 de septiembre de 2026 | KoreNet Cloud & Web
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 text-sm text-slate-700 leading-relaxed">
          
          {/* Sección 1 */}
          <section className="space-y-3 border-b border-slate-100 pb-6">
            <h2 className="text-lg font-bold text-slate-950 uppercase tracking-wide flex items-center gap-2">
              <Building className="w-5 h-5 text-emerald-600" />
              1. Responsable del Tratamiento de Datos
            </h2>
            <p>
              En cumplimiento con la <strong className="text-slate-900">Ley 81 de 26 de marzo de 2019 sobre Protección de Datos Personales</strong> de la República de Panamá y su Decreto Ejecutivo 285 de 2021, los datos recolectados en el sitio web <strong className="text-slate-900">StarTAP Panamá</strong> (<a href="https://startap.com.pa/" className="text-emerald-700 font-semibold underline">https://startap.com.pa/</a>) son tratados de forma confidencial bajo la responsabilidad de:
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1 text-xs">
              <p><strong className="text-slate-900">Razón Comercial:</strong> KoreNet Cloud & Web (StarTAP Panamá)</p>
              <p><strong className="text-slate-900">Titular Registrado:</strong> Fernando Contreras</p>
              <p><strong className="text-slate-900">Correo Electrónico de Privacidad:</strong> info@datakorex.com</p>
              <p><strong className="text-slate-900">Teléfono / WhatsApp de Atención:</strong> +507 6713-4341</p>
              <p><strong className="text-slate-900">Jurisdicción:</strong> República de Panamá</p>
            </div>
          </section>

          {/* Sección 2 */}
          <section className="space-y-3 border-b border-slate-100 pb-6">
            <h2 className="text-lg font-bold text-slate-950 uppercase tracking-wide">
              2. Datos Personales que Recopilamos
            </h2>
            <p>
              Recopilamos únicamente la información necesaria para procesar tus compras, despachar tus dispositivos NFC y brindarte el servicio de redirección web. Los datos incluyen:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              <li><strong className="text-slate-900">Datos de Identificación y Contacto:</strong> Nombre completo, nombre comercial del negocio, número de teléfono (WhatsApp), dirección de correo electrónico y dirección física de entrega (provincia, distrito y corregimiento).</li>
              <li><strong className="text-slate-900">Datos de Programación del Hardware:</strong> Enlace oficial a la ficha de Google Maps o WhatsApp comercial facilitado por el usuario para ser grabado en el chip NFC y código QR.</li>
              <li><strong className="text-slate-900">Datos de Facturación:</strong> Registro de transacciones y método de pago utilizado (Yappy, ACH o Tarjeta). <em className="text-slate-600">Nota: No almacenamos datos sensibles ni números completos de tarjetas de crédito; estos son procesados directamente por la pasarela bancaria.</em></li>
            </ul>
          </section>

          {/* Sección 3 */}
          <section className="space-y-3 border-b border-slate-100 pb-6">
            <h2 className="text-lg font-bold text-slate-950 uppercase tracking-wide">
              3. Finalidad del Tratamiento de los Datos
            </h2>
            <p>
              Tus datos personales son utilizados para la gestión operativa de compras y para la conformación de la base de datos oficial de clientes de StarTAP Panamá (KoreNet Cloud & Web). Las finalidades incluyen:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Gestión, confirmación y procesamiento de pedidos en línea.</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Programación previa del chip NFC y código QR antes del despacho.</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Coordinación de la entrega por mensajería local o Uno Express / Servientrega.</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>Creación de la base de datos interna de clientes para envío directo de ofertas exclusivas, descuentos, nuevos lanzamientos de hardware NFC y novedades del servicio.</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 pt-1">
              * El cliente podrá solicitar la suspensión o cancelación del envío de comunicaciones promocionales directas en cualquier momento a través de nuestras vías de contacto.
            </p>
          </section>

          {/* Sección 4 */}
          <section className="space-y-3 border-b border-slate-100 pb-6">
            <h2 className="text-lg font-bold text-slate-950 uppercase tracking-wide">
              4. Base de Datos Interna y Prohibición Absoluta de Reventa a Terceros
            </h2>
            <p className="font-semibold text-slate-900">
              Queda expresamente garantizado que KoreNet Cloud & Web / StarTAP Panamá NO vende, NO alquila, NO cede ni comercializa la base de datos de datos personales de sus clientes con ninguna otra empresa o entidad tercera.
            </p>
            <p>
              La información ingresada por nuestros clientes se almacena exclusivamente en nuestra base de datos interna para el control de pedidos y comunicaciones de ofertas propias de la marca. Tus datos solo se comparten de forma limitada con empresas de mensajería (como Uno Express o Servientrega) únicamente para la logística de entrega física de tus pedidos en Panamá.
            </p>
          </section>

          {/* Sección 5 */}
          <section className="space-y-3 border-b border-slate-100 pb-6">
            <h2 className="text-lg font-bold text-slate-950 uppercase tracking-wide">
              5. Derechos ARCO (Acceso, Rectificación, Cancelación y Oposición)
            </h2>
            <p>
              De conformidad con la Ley 81 de 2019 de Panamá, tienes derecho a acceder a tus datos personales almacenados en nuestros sistemas, solicitar su rectificación en caso de error, exigir su cancelación o ponerte a su tratamiento.
            </p>
            <p>
              Para ejercer cualquiera de tus derechos ARCO, debes enviar una solicitud por escrito adjuntando copia de tu documento de identidad personal (Cédula o Pasaporte) a la dirección de correo: <strong className="text-slate-900">info@datakorex.com</strong>. Atenderemos tu solicitud en los plazos fijados por la legislación panameña.
            </p>
          </section>

          {/* Sección 6 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950 uppercase tracking-wide">
              6. Seguridad y Almacenamiento
            </h2>
            <p>
              Implementamos medidas de seguridad técnicas, administrativas y digitales para proteger tus datos contra accesos no autorizados, alteración o divulgación. Las comunicaciones web en StarTAP cuentan con cifrado SSL (HTTPS).
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
