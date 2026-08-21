'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { ShoppingBag, Menu, X, Shield, LayoutDashboard } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const { getItemCount } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const isActive = (path: string) => pathname === path;

  const navLinks = [
    { name: 'Inicio', href: '/' },
    { name: 'Catálogo', href: '/shop' },
    { name: 'Administrar Tarjetas', href: '/dashboard' },
  ];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-brand-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Navigation */}
          <div className="flex items-center space-x-12">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight text-brand-950">
                PANA<span className="font-light text-brand-500">CARDS</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-[13px] font-medium tracking-wide uppercase transition-colors py-1 ${
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
          <div className="flex items-center space-x-6">
            {/* Admin access (discreet link at the top right) */}
            <Link 
              href="/admin" 
              className="hidden sm:flex items-center space-x-1 text-xs text-brand-400 hover:text-brand-900 transition-colors uppercase tracking-wider"
            >
              <Shield className="h-3.5 w-3.5" />
              <span>Admin</span>
            </Link>

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-1 text-brand-700 hover:text-brand-950 transition-colors"
              aria-label="Ver carrito"
            >
              <ShoppingBag className="h-5 w-5 stroke-[1.8]" />
              {getItemCount() > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-950 text-[10px] font-bold text-white">
                  {getItemCount()}
                </span>
              )}
            </Link>

            {/* Mobile hamburger */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="md:hidden p-1 text-brand-700 hover:text-brand-950 focus:outline-none"
              aria-label="Abrir menú"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-brand-200 px-4 pt-2 pb-4 space-y-1">
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
          <Link
            href="/admin"
            onClick={() => setIsOpen(false)}
            className="block px-3 py-2.5 rounded text-sm font-medium tracking-wide uppercase text-brand-400 hover:bg-brand-50"
          >
            Panel Admin
          </Link>
        </div>
      )}
    </nav>
  );
}
