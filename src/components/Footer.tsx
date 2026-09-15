'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { CreditCard, Heart, MapPin, Phone, Mail, Send, CheckCircle2, Loader2 } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setStatus('error');
      setErrorMessage('Por favor ingresa un correo válido.');
      return;
    }

    setStatus('loading');
    setErrorMessage('');

    try {
      const res = await fetch('/api/email/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json();
      if (data.success) {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
        setErrorMessage(data.error || 'Ocurrió un error al procesar tu suscripción.');
      }
    } catch (err: any) {
      console.error('[FOOTER_SUBSCRIBE_ERROR]', err);
      setStatus('error');
      setErrorMessage('Error de conexión. Inténtalo nuevamente.');
    }
  };

  return (
    <footer className="bg-gray-950 text-gray-300 border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 sm:py-16">
        
        {/* Newsletter Subscription Banner */}
        <div className="mb-12 p-6 sm:p-8 bg-gradient-to-r from-slate-900 via-gray-900 to-slate-950 border border-amber-500/30 rounded-2xl shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-7 space-y-2">
              <span className="inline-block text-[11px] font-extrabold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/30 px-3 py-1 rounded-full">
                ⭐ Ofertas y Novedades NFC
              </span>
              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Suscríbete y Recibe Guías para Aumentar tus Reseñas
              </h3>
              <p className="text-xs sm:text-sm text-gray-300">
                Únete a más de 500 negocios en Panamá. Recibirás trucos de SEO local y lanzamientos de nuevos productos NFC.
              </p>
            </div>

            <div className="md:col-span-5">
              {status === 'success' ? (
                <div className="bg-emerald-500/20 border border-emerald-500/40 p-4 rounded-xl text-center space-y-1">
                  <div className="flex items-center justify-center space-x-2 text-emerald-400 font-bold text-sm">
                    <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                    <span>¡Suscripción confirmada!</span>
                  </div>
                  <p className="text-xs text-gray-300">Te hemos enviado un correo de bienvenida.</p>
                </div>
              ) : (
                <form onSubmit={handleSubscribe} className="space-y-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="tu.correo@negocio.com"
                      className="px-4 py-3 rounded-xl bg-gray-950/80 border border-gray-700 text-white placeholder-gray-500 text-xs focus:outline-none focus:border-amber-400 flex-grow"
                    />
                    <button
                      type="submit"
                      disabled={status === 'loading'}
                      className="bg-amber-500 hover:bg-amber-400 text-gray-950 font-black text-xs uppercase tracking-wider px-5 py-3 rounded-xl transition-all shadow-lg flex items-center justify-center space-x-1.5 flex-shrink-0 disabled:opacity-50"
                    >
                      {status === 'loading' ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Suscribirme</span>
                        </>
                      )}
                    </button>
                  </div>
                  {status === 'error' && (
                    <p className="text-xs text-red-400 font-semibold">{errorMessage}</p>
                  )}
                </form>
              )}
            </div>
          </div>
        </div>

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

            {/* Legible Payment Logos (Visa, Mastercard, Yappy) */}
            <div className="pt-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2.5">Métodos de Pago Aceptados</p>
              <div className="flex items-center gap-2">
                <div className="bg-white px-2 py-1 rounded-md flex items-center justify-center h-7 shadow-xs">
                  <Image
                    src="/logos/visa-logo.svg"
                    alt="Visa"
                    width={34}
                    height={22}
                    className="h-4 w-auto object-contain"
                  />
                </div>
                <div className="bg-white px-2 py-1 rounded-md flex items-center justify-center h-7 shadow-xs">
                  <Image
                    src="/logos/mastercard-logo.svg"
                    alt="Mastercard"
                    width={34}
                    height={22}
                    className="h-4 w-auto object-contain"
                  />
                </div>
                <div className="bg-white px-2.5 py-1 rounded-md flex items-center justify-center h-7 shadow-xs">
                  <Image
                    src="/logos/yappy-logo.png"
                    alt="Yappy"
                    width={55}
                    height={14}
                    className="h-3.5 w-auto object-contain"
                  />
                </div>
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
