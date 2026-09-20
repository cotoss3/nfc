'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  CreditCard, Package, Users, Tag, BarChart2, QrCode, 
  LogOut, AlertCircle, ShoppingCart, Layers 
} from 'lucide-react';
import AdminAuthGuard from '@/components/AdminAuthGuard';
import { authService } from '@/lib/auth';

const navItems = [
  { id: 'dashboard', label: 'Resumen Ejecutivo', icon: BarChart2, href: '/master-control' },
  { id: 'inventario', label: 'Inventario & Lotes', icon: Layers, href: '/master-control/inventario' },
  { id: 'pedidos', label: 'Pedidos (OMS)', icon: ShoppingCart, href: '/master-control/pedidos' },
  { id: 'productos', label: 'Productos', icon: Package, href: '/master-control/productos' },
  { id: 'clientes', label: 'Clientes & CRM', icon: Users, href: '/master-control/clientes' },
  { id: 'cards', label: 'Dispositivos TAG', icon: CreditCard, href: '/master-control/cards' },
  { id: 'cupones', label: 'Cupones', icon: Tag, href: '/master-control/cupones' },
];

export default function MasterControlLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    if (window.confirm('¿Seguro que deseas salir del Master Control?')) {
      // Cierra la sesion real de Supabase, no solo la marca del navegador.
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
        
        {/* MOBILE TOP HEADER BAR */}
        <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-slate-900 text-amber-500 font-black rounded-xl flex items-center justify-center text-xs shadow-sm">
              MC
            </div>
            <span className="font-bold text-sm tracking-tight text-slate-800">Master Control</span>
          </div>
          <button 
            onClick={handleLogout}
            className="text-slate-400 hover:text-red-500 transition-colors p-1.5 rounded-lg hover:bg-red-50"
          >
            <LogOut className="w-5 h-5" />
          </button>
        </header>

        {/* DESKTOP SIDEBAR */}
        <aside className="hidden md:flex w-64 bg-slate-900 text-white flex-col sticky top-0 h-screen overflow-y-auto">
          <div className="p-6 border-b border-slate-800/80">
            <Link href="/master-control" className="block group">
              <div className="flex items-center gap-3">
                <img
                  src="/logos/Logo.webp"
                  alt="starTAP Logo"
                  className="h-9 w-auto object-contain brightness-0 invert group-hover:scale-105 transition-transform"
                />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 block mt-1.5">
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
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-amber-500 text-slate-900 shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-slate-900' : 'text-slate-500 group-hover:text-slate-300'}`} />
                  {tab.label}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 mt-auto border-t border-slate-800/50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </button>
          </div>
        </aside>

        {/* MOBILE BOTTOM NAVIGATION BAR */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center p-2 z-40 pb-safe shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
          {navItems.slice(0, 5).map((tab) => {
            const isActive = pathname === tab.href || (tab.href !== '/master-control' && pathname.startsWith(tab.href));
            const Icon = tab.icon;
            return (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
                  isActive ? 'text-amber-600' : 'text-slate-400'
                }`}
              >
                <div className={`p-1.5 rounded-lg transition-colors ${isActive ? 'bg-amber-100' : 'transparent'}`}>
                  <Icon className={`w-5 h-5 ${isActive ? 'text-amber-600' : 'text-slate-400'}`} />
                </div>
                <span className={`text-[9px] font-bold tracking-tight ${isActive ? 'text-amber-700' : 'text-slate-500'}`}>
                  {tab.label.split(' ')[0]}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* MAIN CONTENT AREA */}
        <main className="flex-1 max-w-[100vw] overflow-x-hidden md:max-w-none md:min-w-0 pb-16 md:pb-0">
          {children}
        </main>
      </div>
    </AdminAuthGuard>
  );
}
