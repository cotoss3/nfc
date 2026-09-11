import type { Metadata } from 'next';
import Link from 'next/link';
import { Shield, FileText, ArrowLeft, Phone, Mail, Building } from 'lucide-react';

const BASE_URL = 'https://startap.com.pa';

export const metadata: Metadata = {
  title: 'Términos y Condiciones de Uso | StarTAP Panamá',
  description: 'Términos y condiciones legales de compra y uso de los dispositivos NFC y servicios de StarTAP en Panamá. Operado por KoreNet Cloud & Web.',
  alternates: {
    canonical: `${BASE_URL}/terminos`,
  },
};

export default function TerminosPage() {
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
            <FileText className="w-4 h-4 text-amber-700" />
            <span>Documento Legal Oficial</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-slate-950 uppercase tracking-tight">
            Términos y Condiciones de Uso
          </h1>
          <p className="text-sm text-slate-600">
            Última actualización: 11 de septiembre de 2026 | República de Panamá
          </p>
        </div>

        {/* Content Body */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-sm space-y-8 text-sm text-slate-700 leading-relaxed">
          
          {/* Sección 1 */}
          <section className="space-y-3 border-b border-slate-100 pb-6">
            <h2 className="text-lg font-bold text-slate-950 uppercase tracking-wide flex items-center gap-2">
              <Building className="w-5 h-5 text-amber-600" />
              1. Identificación del Titular y Empresa Operadora
            </h2>
            <p>
              El sitio web <strong className="text-slate-900">StarTAP Panamá</strong> (<a href="https://startap.com.pa/" className="text-amber-700 font-semibold underline">https://startap.com.pa/</a>) y los servicios de venta e integración de tecnología NFC y códigos QR son comercializados y operados comercialmente bajo la entidad registrada en Panamá a nombre de <strong className="text-slate-900">Fernando Contreras</strong> bajo la razón comercial <strong className="text-slate-900">KoreNet Cloud & Web</strong>.
            </p>
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-1 text-xs">
              <p><strong className="text-slate-900">Razón Comercial / Marca:</strong> KoreNet Cloud & Web / StarTAP Panamá</p>
              <p><strong className="text-slate-900">Titular Registrado:</strong> Fernando Contreras</p>
              <p><strong className="text-slate-900">Correo Electrónico de Contacto:</strong> info@datakorex.com</p>
              <p><strong className="text-slate-900">Atención Telefónica y WhatsApp:</strong> +507 6713-4341</p>
              <p><strong className="text-slate-900">Ubicación:</strong> Ciudad de Panamá, República de Panamá</p>
            </div>
          </section>

          {/* Sección 2 */}
          <section className="space-y-3 border-b border-slate-100 pb-6">
            <h2 className="text-lg font-bold text-slate-950 uppercase tracking-wide">
              2. Objeto del Servicio y Productos
            </h2>
            <p>
              StarTAP Panamá se dedica a la fabricación, configuración y venta de hardware físico de proximidad (tarjetas de PVC contactless, placas de acrílico para mostrador y stands autoportantes) equipados con chips NFC (13.56 MHz) y códigos QR dinámicos impresos.
            </p>
            <p>
              Los productos están diseñados para facilitar que los clientes de establecimientos comerciales en Panamá abran de forma directa la ficha de calificación en Google Maps u otros enlaces definidos por el usuario. Los productos se comercializan bajo la modalidad de <strong className="text-slate-900">pago único de por vida</strong>, sin cobros de mensualidades ni suscripciones obligatorias.
            </p>
          </section>

          {/* Sección 3 */}
          <section className="space-y-3 border-b border-slate-100 pb-6">
            <h2 className="text-lg font-bold text-slate-950 uppercase tracking-wide">
              3. Precios, Moneda y Métodos de Pago
            </h2>
            <p>
              Todos los precios de los productos y paquetes especiales expuestos en la plataforma se encuentran expresados en <strong className="text-slate-900">Dólares de los Estados Unidos de América (USD) / Balboas de Panamá ($)</strong>.
            </p>
            <p>
              Los métodos de pago oficiales procesados en la tienda incluyen:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              <li><strong className="text-slate-900">Yappy (Banco General):</strong> Procesamiento mediante código QR o directorio telefónico corporativo.</li>
              <li><strong className="text-slate-900">Transferencia Bancaria Directa (ACH):</strong> Hacia la cuenta de KoreNet Cloud & Web / Fernando Contreras.</li>
              <li><strong className="text-slate-900">Tarjetas de Crédito y Débito:</strong> Procesadas por pasarelas de pago cifradas (Visa y Mastercard).</li>
            </ul>
          </section>

          {/* Sección 4 */}
          <section className="space-y-3 border-b border-slate-100 pb-6">
            <h2 className="text-lg font-bold text-slate-950 uppercase tracking-wide">
              4. Despacho y Tiempos de Entrega en Panamá
            </h2>
            <p>
              Los envíos dentro de la <strong className="text-slate-900">Ciudad de Panamá</strong> se entregan en un periodo estimado de <strong className="text-slate-900">24 a 48 horas laborables</strong> tras confirmar el pago y la ficha de Google Maps a programar.
            </p>
            <p>
              Para entregas en <strong className="text-slate-900">Provincias Centrales, Chiriquí, Colón y resto del país</strong>, los paquetes se despachan mediante servicios de encomienda autorizados como <strong className="text-slate-900">Uno Express</strong> o <strong className="text-slate-900">Servientrega</strong>. El número de guía de rastreo es enviado al comprador por WhatsApp o correo electrónico.
            </p>
          </section>

          {/* Sección 5 */}
          <section className="space-y-3 border-b border-slate-100 pb-6">
            <h2 className="text-lg font-bold text-slate-950 uppercase tracking-wide">
              5. Garantía de Hardware y Reclamos
            </h2>
            <p>
              Todos nuestros dispositivos cuentan con una <strong className="text-slate-900">garantía limitada de noventa (90) días calendario</strong> a partir de la fecha de entrega, cubriendo únicamente defectos de fabricación en el chip NFC NTAG o legibilidad del código QR.
            </p>
            <p>
              Quedan excluidos de la garantía:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-slate-700">
              <li>Daños causados por caídas, quebraduras, rayaduras profundas o manipulación con solventes químicos.</li>
              <li>Modificaciones físicas o desensamble del acrílico o PVC por personal ajeno a StarTAP.</li>
              <li>Problemas derivados de cambios o bloqueos efectuados unilateralmente por Google Maps en la ficha del comercio del cliente.</li>
            </ul>
            <p>
              Para hacer efectiva una garantía, el cliente debe reportar el inconveniente adjuntando foto o video al correo <strong className="text-slate-900">info@datakorex.com</strong> o al WhatsApp <strong className="text-slate-900">+507 6713-4341</strong>.
            </p>
          </section>

          {/* Sección 6 */}
          <section className="space-y-3 border-b border-slate-100 pb-6">
            <h2 className="text-lg font-bold text-slate-950 uppercase tracking-wide">
              6. Responsabilidad del Cliente sobre Marcas y Enlaces
            </h2>
            <p>
              El comprador garantiza ser el propietario legítimo o contar con la debida autorización comercial para solicitar la impresión de logotipos, nombres de marca y enlaces URL programados en los dispositivos. KoreNet Cloud & Web no asume responsabilidad por infracciones a derechos de propiedad intelectual de terceros cometidas por el comprador.
            </p>
          </section>

          {/* Sección 7 */}
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-slate-950 uppercase tracking-wide">
              7. Ley Aplicable y Jurisdicción
            </h2>
            <p>
              Estos Términos y Condiciones se rigen bajo las leyes vigentes de la <strong className="text-slate-900">República de Panamá</strong>, en especial por la <strong className="text-slate-900">Ley 51 de 22 de julio de 2008</strong> sobre Comercio Electrónico y la <strong className="text-slate-900">Ley 45 de 31 de octubre de 2007</strong> de Protección al Consumidor. Cualquier controversia será sometida a los tribunales competentes de la Ciudad de Panamá.
            </p>
          </section>

        </div>
      </div>
    </div>
  );
}
