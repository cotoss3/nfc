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
            <h3 className="text-white font-bold text-xs uppercase tracking-wider">Productos & Plataforma</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/catalogo" className="hover:text-white transition-colors">Placas para Mostrador</Link></li>
              <li><Link href="/catalogo" className="hover:text-white transition-colors">Tarjetas NFC de Bolsillo</Link></li>
              <li><Link href="/catalogo" className="hover:text-white transition-colors">Placas Personalizadas con Logo</Link></li>
              <li><Link href="/corporativo" className="text-amber-400 font-bold hover:text-white transition-colors">Pedidos Corporativos B2B</Link></li>
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
                <span>San Francisco, Ciudad de Panamá</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span>+507 6523-9821</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span>soporte@startap.com.pa</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-800 text-center text-xs text-gray-500 flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
          <p>© {new Date().getFullYear()} StarTAP Panamá. Todos los derechos reservados.</p>
          <p className="flex items-center">
            Desarrollado para comercios y locales de Panamá.
          </p>
        </div>
      </div>
    </footer>
  );
}
