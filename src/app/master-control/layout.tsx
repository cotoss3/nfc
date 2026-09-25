'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  CreditCard, Package, Users, Tag, BarChart2, QrCode, 
  LogOut, ShoppingCart, Layers, Menu, X, ChevronRight, Activity 
} from 'lucide-react';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import { authService } from '@/lib/auth';

const navItems = [
  { id: 'dashboard', label: 'Resumen Ejecutivo', shortLabel: 'Resumen', icon: BarChart2, href: '/master-control' },
  { id: 'comportamiento', label: 'Comportamiento', shortLabel: 'Comport.', icon: Activity, href: '/master-control/comportamiento' },
  { id: 'inventario', label: 'Inventario & Lotes', shortLabel: 'Inventario', icon: Layers, href: '/master-control/inventario' },
  { id: 'tag-scanner', label: 'Scanner & APK NFC', shortLabel: 'NFC APK', icon: QrCode, href: '/master-control/tag-scanner' },
  { id: 'pedidos', label: 'Pedidos (OMS)', shortLabel: 'Pedidos', icon: ShoppingCart, href: '/master-control/pedidos' },
  { id: 'productos', label: 'Productos', shortLabel: 'Productos', icon: Package, href: '/master-control/productos' },
  { id: 'clientes', label: 'Clientes & CRM', shortLabel: 'Clientes', icon: Users, href: '/master-control/clientes' },
  { id: 'cards', label: 'Dispositivos TAG', shortLabel: 'TAGs', icon: CreditCard, href: '/master-control/cards' },
  { id: 'cupones', label: 'Cupones', shortLabel: 'Cupones', icon: Tag, href: '/master-control/cupones' },
];

export default function MasterControlLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    if (window.confirm('¿Seguro que deseas salir del Master Control?')) {
      try {
        await authService.signOut();
      } catch (e) {
        console.error('Error cerrando sesión de Supabase:', e);
      }
      sessionStorage.removeItem('admin_auth_code');
      sessionStorage.removeItem('current_user_email');
      localStorage.removeItem('admin_authenticated_email');
      router.push('/catalogo');
    }
  };

  return (
    <AdminAuthGuard>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row pb-20 md:pb-0">
        
        {/* MOBILE TOP HEADER BAR WITH HAMBURGER MENU (LIGHT THEME) */}
        <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-1.5 rounded-xl bg-slate-100 text-slate-800 hover:bg-slate-200 transition-colors"
              aria-label="Abrir menú de navegación"
            >
              <Menu className="w-5 h-5 text-slate-800" />
            </button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-amber-500 text-slate-950 font-black rounded-xl flex items-center justify-center text-xs shadow-2xs">
                MC
              </div>
              <span className="font-bold text-sm tracking-tight text-slate-900">Master Control</span>
            </div>
          </div>

          <button 
            onClick={handleLogout}
            className="text-slate-500 hover:text-red-600 transition-colors p-1.5 rounded-lg hover:bg-red-50"
            title="Cerrar Sesión"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* MOBILE SLIDE-OVER DRAWER MENU (100% LIGHT EXECUTIVE THEME) */}
        {isMobileMenuOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-slate-500/30 backdrop-blur-xs transition-opacity"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer Container */}
            <aside className="relative w-80 max-w-[85vw] bg-white text-slate-900 border-r border-slate-200 flex flex-col h-full shadow-2xl z-50">
              {/* Drawer Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2.5">
                    <img
                      src="/logos/Logo.webp"
                      alt="starTAP Logo"
                      className="h-7 w-auto object-contain"
                    />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 block mt-1">
                    Master Control Panel
                  </span>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Items */}
              <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
                {navItems.map((tab) => {
                  const isActive = Boolean(pathname && (pathname === tab.href || (tab.href !== '/master-control' && pathname.startsWith(tab.href))));
                  const Icon = tab.icon;
                  return (
                    <Link
                      key={tab.id}
                      href={tab.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all duration-200 ${
                        isActive
                          ? 'bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                        <span>{tab.label}</span>
                      </div>
                      <ChevronRight className={`w-4 h-4 opacity-60 ${isActive ? 'text-amber-700' : 'text-slate-400'}`} />
                    </Link>
                  );
                })}
              </nav>

              {/* Drawer Footer */}
              <div className="p-4 border-t border-slate-100 bg-slate-50">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 transition-colors border border-rose-200"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión de Administrador
                </button>
              </div>
            </aside>
          </div>
        )}

        {/* DESKTOP SIDEBAR (100% LIGHT EXECUTIVE THEME) */}
        <aside className="hidden md:flex w-64 bg-white text-slate-800 border-r border-slate-200 flex-col sticky top-0 h-screen overflow-y-auto">
          <div className="p-6 border-b border-slate-100">
            <Link href="/master-control" className="block group">
              <div className="flex items-center gap-3">
                <img
                  src="/logos/Logo.webp"
                  alt="starTAP Logo"
                  className="h-9 w-auto object-contain group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-600 block mt-1.5">
                Master Control Panel
              </span>
            </Link>
          </div>
          
          <nav className="flex-1 px-4 py-4 space-y-1.5 overflow-y-auto">
            {navItems.map((tab) => {
              const isActive = pathname === tab.href || (tab.href !== '/master-control' && pathname.startsWith(tab.href));
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-bold transition-all duration-200 group ${
                    isActive
                      ? 'bg-amber-50 text-amber-900 border border-amber-200 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-amber-600' : 'text-slate-400 group-hover:text-slate-700'}`} />
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 mt-auto border-t border-slate-100 bg-slate-50/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-bold text-slate-600 hover:text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* MOBILE BOTTOM NAVIGATION BAR */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-40 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
          <div className="flex items-center overflow-x-auto no-scrollbar py-1.5 px-2 gap-1.5 scroll-smooth">
            {navItems.map((tab) => {
              const isActive = pathname === tab.href || (tab.href !== '/master-control' && pathname.startsWith(tab.href));
              const Icon = tab.icon;
              return (
                <Link
                  key={tab.id}
                  href={tab.href}
                  className={`flex flex-col items-center justify-center min-w-[64px] px-2 py-1 rounded-xl transition-all flex-shrink-0 ${
                    isActive ? 'text-amber-600 font-bold' : 'text-slate-500'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-amber-100 text-amber-600' : 'bg-transparent text-slate-400'}`}>
                    <Icon className={`w-4 h-4 ${isActive ? 'text-amber-600' : 'text-slate-500'}`} />
                  </div>
                  <span className={`text-[9px] tracking-tight mt-0.5 whitespace-nowrap ${isActive ? 'text-amber-700 font-bold' : 'text-slate-500 font-medium'}`}>
                    {tab.shortLabel}
                  </span>
                </Link>
              );
            })}

            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="flex flex-col items-center justify-center min-w-[56px] px-2 py-1 rounded-xl text-slate-500 flex-shrink-0"
            >
              <div className="p-1.5 rounded-lg bg-slate-100 text-slate-600">
                <Menu className="w-4 h-4 text-slate-700" />
              </div>
              <span className="text-[9px] font-bold text-slate-600 tracking-tight mt-0.5 whitespace-nowrap">
                Menú
              </span>
            </button>
          </div>
        </nav>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 max-w-[100vw] overflow-x-hidden md:max-w-none md:min-w-0 pb-20 md:pb-0">
          {children}
        </main>
      </div>
    </AdminAuthGuard>
  );
}
