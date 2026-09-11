import React from 'react';
import Link from 'next/link';
import { CreditCard, Heart, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-950 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 sm:gap-10">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center text-white">
              <img src="/logos/negativo.jpeg" alt="starTAP Logo" className="h-9 w-auto object-contain invert mix-blend-screen opacity-90" />
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed">
              Placas y tarjetas NFC contactless en Panamá. Multiplica tus reseñas de 5 estrellas en Google Maps y TripAdvisor directamente en tu mostrador.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider">Productos & Legales</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/catalogo" className="hover:text-white transition-colors">Placas para Mostrador</Link></li>
              <li><Link href="/catalogo" className="hover:text-white transition-colors">Tarjetas NFC de Bolsillo</Link></li>
              <li><Link href="/corporativo" className="text-amber-400 font-bold hover:text-white transition-colors">Pedidos Corporativos B2B</Link></li>
              <li><Link href="/envios" className="hover:text-white transition-colors text-amber-300 font-medium">Política de Envíos</Link></li>
              <li><Link href="/terminos" className="hover:text-white transition-colors text-gray-300">Términos y Condiciones</Link></li>
              <li><Link href="/privacidad" className="hover:text-white transition-colors text-gray-300">Política de Privacidad</Link></li>
            </ul>
          </div>

          {/* Panama Shipping & Payments */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider">Envíos en Panamá</h3>
            <ul className="space-y-2 text-xs text-gray-400">
              <li className="flex items-center space-x-2 text-white font-semibold">
                <span>🇵🇦 Envíos a todo el país</span>
              </li>
              <li>• Entregas en 24-48h en Ciudad de Panamá</li>
              <li>• Envíos al interior por Uno Express y Servientrega</li>
            </ul>

            {/* Legible Payment Badges */}
            <div className="pt-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Métodos de Pago Aceptados</p>
              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2.5 py-1 rounded-md">
                  ⚡ Yappy
                </span>
                <span className="bg-blue-500/20 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-md">
                  Visa
                </span>
                <span className="bg-orange-500/20 text-orange-300 border border-orange-500/30 px-2.5 py-1 rounded-md">
                  Mastercard
                </span>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-md">
                  ACH
                </span>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider">Contacto Directo</h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span>Ciudad de Panamá, Panamá</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span>+507 6713-4341</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span>info@datakorex.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 text-center text-xs text-gray-400 flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
          <div className="space-y-1 text-center md:text-left">
            <p>© {new Date().getFullYear()} StarTAP Panamá. Todos los derechos reservados.</p>
            <p className="text-[11px] text-gray-400">
              Desarrollo Web por{' '}
              <a
                href="https://datakorex.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 font-bold hover:text-white transition-colors"
              >
                DataKorex (datakorex.com)
              </a>
            </p>
          </div>
          <div className="flex items-center space-x-4">
            <Link href="/envios" className="hover:text-gray-200 underline">Envíos</Link>
            <Link href="/terminos" className="hover:text-gray-200 underline">Términos</Link>
            <Link href="/privacidad" className="hover:text-gray-200 underline">Privacidad</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
