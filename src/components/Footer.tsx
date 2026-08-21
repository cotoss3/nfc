import React from 'react';
import Link from 'next/link';
import { CreditCard, Heart, MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="flex items-center space-x-2 text-white">
              <span className="p-1.5 gradient-bg rounded-lg text-white">
                <CreditCard className="h-5 w-5" />
              </span>
              <span className="font-bold text-lg tracking-tight">
                Pana<span className="text-primary-400">Cards</span>
              </span>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed">
              Soluciones NFC de alta calidad para digitalizar negocios en Panamá. Aumenta tus reseñas en Google Maps y TripAdvisor con un toque.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Productos</h3>
            <ul className="space-y-2 text-sm">
              <li><Link href="/shop" className="hover:text-white transition-colors">Placas para Mostrador</Link></li>
              <li><Link href="/shop" className="hover:text-white transition-colors">Tarjetas de PVC</Link></li>
              <li><Link href="/shop" className="hover:text-white transition-colors">Tarjetas de Madera</Link></li>
              <li><Link href="/shop" className="hover:text-white transition-colors">Llaveros y Accesorios</Link></li>
            </ul>
          </div>

          {/* Panama Shipping & Payments */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Envíos y Pagos</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-center space-x-2">
                <span>🇵🇦 Envíos a todo Panamá</span>
              </li>
              <li>• Uno Express / Servientrega</li>
              <li>• Entregas rápidas en Ciudad de Panamá</li>
              <li className="mt-4 text-xs bg-gray-800 p-2 rounded text-gray-300">
                Paga de forma segura con <span className="font-bold text-primary-400">Yappy</span> o <span className="font-bold text-white">Tarjeta de Crédito</span>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold text-sm uppercase tracking-wider mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-primary-400" />
                <span>San Francisco, Ciudad de Panamá</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-primary-400" />
                <span>+507 6523-9821</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-primary-400" />
                <span>soporte@panacards.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 text-center text-xs text-gray-500 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p>© {new Date().getFullYear()} PanaCards NFC. Todos los derechos reservados.</p>
          <p className="flex items-center">
            Desarrollado con <Heart className="h-3 w-3 text-red-500 mx-1 fill-current" /> para negocios locales de Panamá.
          </p>
        </div>
      </div>
    </footer>
  );
}
