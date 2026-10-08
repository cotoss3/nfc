'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { CreditCard, Heart, MapPin, Phone, Mail, Send, CheckCircle2, Loader2, Instagram, Facebook } from 'lucide-react';

export default function Footer() {
  const pathname = usePathname();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  if (pathname?.startsWith('/master-control')) {
    return null;
  }

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

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-8">
          {/* Brand Column */}
          <div className="space-y-4">
            <Link href="/" className="inline-block w-full max-w-[200px]">
              <img
                src="/logos/negativo.webp"
                alt="starTAP Logo"
                width="200"
                height="67"
                loading="lazy"
                decoding="async"
                className="w-full h-auto object-contain invert mix-blend-screen opacity-95 block"
              />
            </Link>
            <p className="text-xs text-gray-400 leading-relaxed">
              Dispositivos NFC y QR inteligentes en Panamá. Multiplica tus reseñas de 5 estrellas en Google Maps sin suscripciones ni mensualidades.
            </p>

            {/* Google Maps Review Badge */}
            <div>
              <a
                href="https://maps.app.goo.gl/MG3YyRykfUTvL4B79"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Ver perfil y reseñas de starTAP Panamá en Google Maps"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 hover:border-amber-400/60 hover:bg-gray-850 text-gray-300 hover:text-white transition-all text-xs font-semibold group shadow-xs"
              >
                <span className="text-amber-400">★ 5.0</span>
                <span>Google Maps (6 reseñas)</span>
              </a>
            </div>

            {/* Social Icons Row */}
            <div className="pt-1">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Síguenos en Redes</p>
              <div className="flex items-center gap-2">
                <a
                  href="https://www.instagram.com/startap507"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram @startap507"
                  className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-pink-400 hover:border-pink-500/50 hover:bg-gray-850 transition-all group"
                >
                  <Instagram className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="https://www.tiktok.com/@startap507"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok @startap507"
                  className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-white hover:border-amber-400/50 hover:bg-gray-850 transition-all group"
                >
                  <svg className="w-4 h-4 fill-current group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 3 15.68a6.34 6.34 0 0 0 10.86 4.46A6.29 6.29 0 0 0 15.82 16V8.5a8.28 8.28 0 0 0 4.84 1.56V6.69h-.07z" />
                  </svg>
                </a>
                <a
                  href="https://www.facebook.com/startap507"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook @startap507"
                  className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-blue-400 hover:border-blue-500/50 hover:bg-gray-850 transition-all group"
                >
                  <Facebook className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
                <a
                  href="https://wa.me/50764839004"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp starTAP Panamá"
                  className="w-8 h-8 rounded-lg bg-gray-900 border border-gray-800 flex items-center justify-center text-gray-400 hover:text-emerald-400 hover:border-emerald-500/50 hover:bg-gray-850 transition-all group"
                >
                  <Phone className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Links / Dispositivos NFC */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider">Dispositivos NFC</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/catalogo/placa-nfc-mostrador" className="hover:text-white transition-colors">Placas para Mostrador</Link></li>
              <li><Link href="/catalogo/stand-nfc-mesa" className="hover:text-white transition-colors">Stands NFC de Mesa</Link></li>
              <li><Link href="/catalogo/tarjeta-nfc-bolsillo" className="hover:text-white transition-colors">Tarjetas de Bolsillo</Link></li>
              <li><Link href="/catalogo/pack-trio-comercial" className="hover:text-white transition-colors">Pack Comercio (3 en 1)</Link></li>
              <li>
                <Link href="/corporativo" className="text-amber-400 font-bold hover:text-amber-300 transition-colors inline-flex items-center gap-1.5">
                  <span>Pedidos B2B al Mayor</span>
                </Link>
              </li>
              <li><Link href="/shop" className="hover:text-white transition-colors text-gray-400">Ver Catálogo Completo →</Link></li>
            </ul>
          </div>

          {/* Industries Links (SEO Internal Linking) */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider">Por Industria</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/resenas-google/restaurantes" className="hover:text-white transition-colors">Restaurantes y Cafés</Link></li>
              <li><Link href="/resenas-google/clinicas" className="hover:text-white transition-colors">Clínicas y Consultorios</Link></li>
              <li><Link href="/resenas-google/barberias-y-salones" className="hover:text-white transition-colors">Barberías y Salones</Link></li>
              <li><Link href="/resenas-google/talleres-y-mecanicas" className="hover:text-white transition-colors">Talleres y Mecánicas</Link></li>
              <li><Link href="/resenas-google/hoteles-y-hospedajes" className="hover:text-white transition-colors">Hoteles y Hospedajes</Link></li>
              <li><Link href="/resenas-google/tiendas-y-comercios" className="hover:text-white transition-colors">Tiendas y Comercios</Link></li>
              <li><Link href="/resenas-google" className="text-amber-300 font-semibold hover:text-white transition-colors">Guía General de Reseñas →</Link></li>
            </ul>
          </div>

          {/* Information & Guides */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider">Información</h3>
            <ul className="space-y-2 text-xs">
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog y Guías Google Maps</Link></li>
              <li><Link href="/app" className="hover:text-white transition-colors">Plataforma & Funciones</Link></li>
              <li><Link href="/envios" className="hover:text-white transition-colors">Cobertura de Envíos</Link></li>
              <li><Link href="/terminos" className="hover:text-white transition-colors text-gray-400">Términos del Servicio</Link></li>
              <li><Link href="/privacidad" className="hover:text-white transition-colors text-gray-400">Política de Privacidad</Link></li>
            </ul>
          </div>

          {/* Contact & Payments */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-xs uppercase tracking-wider">Atención & Pagos</h3>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <span>Ciudad de Panamá, Panamá</span>
              </li>
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <a href="https://wa.me/50764839004" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
                  +507 6483-9004
                </a>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-amber-400 flex-shrink-0" />
                <a href="mailto:info@startap.com.pa" className="hover:text-white transition-colors">
                  info@startap.com.pa
                </a>
              </li>
              <li className="text-[11px] text-gray-400 pt-1 border-t border-gray-850">
                🇵🇦 Envíos 24-48h a todo Panamá (Uno Express y Servientrega).
              </li>
            </ul>

            {/* Payment Logos */}
            <div className="pt-2">
              <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2">Métodos de Pago</p>
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
        </div>

        <div className="mt-12 pt-6 border-t border-gray-800 text-center text-xs text-gray-400 flex flex-col md:flex-row justify-between items-center space-y-3 md:space-y-0">
          <div className="space-y-1 text-center md:text-left">
            <p>© {new Date().getFullYear()} starTAP Panamá. Todos los derechos reservados.</p>
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
          <div className="flex items-center space-x-4 text-xs">
            <Link href="/envios" className="hover:text-gray-200 transition-colors">Envíos</Link>
            <Link href="/terminos" className="hover:text-gray-200 transition-colors">Términos</Link>
            <Link href="/privacidad" className="hover:text-gray-200 transition-colors">Privacidad</Link>
            <a
              href="https://maps.app.goo.gl/MG3YyRykfUTvL4B79"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-400 hover:text-amber-300 transition-colors"
            >
              Google Maps
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

