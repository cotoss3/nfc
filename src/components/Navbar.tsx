'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Menu, X, Shield, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { getItemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  if (pathname?.startsWith('/master-control')) {
    return null;
  }

  useEffect(() => {
    setMounted(true);
  }, []);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Catálogo', href: '/catalogo' },
    { name: 'Más Reseñas', href: '/resenas-google' },
    { name: 'Blog', href: '/blog' },
    { name: 'Corporativo', href: '/corporativo' },
    { name: 'App Pro ⚡', href: '/app' },
    { name: 'Administrar Tarjetas', href: '/dashboard' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-brand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Navigation */}
          <div className="flex items-center space-x-6 xl:space-x-10">
            <Link href="/" className="flex items-center flex-shrink-0">
              <img src="/logos/Logo.webp" alt="starTAP Logo" className="h-8 sm:h-9 lg:h-10 w-auto object-contain" />
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-4 xl:space-x-7">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-xs xl:text-[13px] font-medium tracking-wide uppercase transition-colors py-1 whitespace-nowrap ${
                    isActive(link.href)
                      ? 'text-brand-950 border-b-2 border-brand-950 font-bold'
                      : 'text-brand-500 hover:text-brand-950'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center space-x-3 sm:space-x-5">
            {/* Cart Button */}
            <Link
              href="/cart"
              className="relative p-2 rounded-lg text-brand-700 hover:text-brand-950 hover:bg-brand-100 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-accent-500"
              aria-label={
                mounted && getItemCount() > 0
                  ? `Ver carrito, ${getItemCount()} ${getItemCount() === 1 ? 'producto' : 'productos'}`
                  : 'Ver carrito de compras'
              }
            >
              {/* SVG de Carrito visible, con viewBox estándar y dimensiones fijas para SSR */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 min-w-[20px] min-h-[20px] text-brand-800 shrink-0"
                aria-hidden="true"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              <span className="sr-only">
                {mounted && getItemCount() > 0
                  ? `Carrito con ${getItemCount()} productos`
                  : 'Carrito de compras'}
              </span>
              {mounted && getItemCount() > 0 && (
                <span
                  aria-hidden="true"
                  className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1 flex items-center justify-center rounded-full bg-accent-500 text-[11px] font-black text-white ring-2 ring-white shadow-sm"
                >
                  {getItemCount() > 99 ? '99+' : getItemCount()}
                </span>
              )}
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-1 text-brand-700 hover:text-brand-950 focus:outline-none"
              aria-label="Abrir menú"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="lg:hidden bg-white border-b border-brand-200 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className={`block px-3 py-2.5 rounded text-sm font-medium tracking-wide uppercase transition-colors ${
                isActive(link.href)
                  ? 'bg-brand-100 text-brand-950 font-bold'
                  : 'text-brand-600 hover:bg-brand-50 hover:text-brand-950'
              }`}
            >
              {link.name}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
}
