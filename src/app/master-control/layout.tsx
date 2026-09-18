'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  CreditCard, Package, Users, Tag, BarChart2, QrCode, 
  LogOut, AlertCircle, ShoppingCart, Layers 
} from 'lucide-react';
import AdminAuthGuard from '@/components/AdminAuthGuard';

const navItems = [
  { id: 'dashboard', label: 'Resumen', icon: BarChart2, href: '/master-control' },
  { id: 'inventario', label: 'Inventario & Financials', icon: Layers, href: '/master-control/inventario' },
  { id: 'pedidos', label: 'Pedidos (OMS)', icon: ShoppingCart, href: '/master-control/pedidos' },
  { id: 'cards', label: 'Tarjetas NFC', icon: CreditCard, href: '/master-control/cards' },
  { id: 'productos', label: 'Productos', icon: Package, href: '/master-control/productos' },
  { id: 'clientes', label: 'Clientes & CRM', icon: Users, href: '/master-control/clientes' },
  { id: 'cupones', label: 'Cupones', icon: Tag, href: '/master-control/cupones' },
  { id: 'stickers', label: 'Lotes QR', icon: QrCode, href: '/master-control/stickers' },
];

export default function MasterControlLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    if (window.confirm('¿Seguro que deseas salir del Master Control?')) {
      sessionStorage.removeItem('admin_auth_code');
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
          <div className="p-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-500 text-slate-900 font-black rounded-xl flex items-center justify-center text-sm shadow-lg border border-amber-300/20">
                MC
              </div>
              <div>
                <h1 className="font-bold text-lg leading-tight tracking-tight text-white">starTAP</h1>
                <p className="text-slate-400 text-[10px] uppercase font-bold tracking-widest">Master Control</p>
              </div>
            </div>
          </div>
          
          <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
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
            <div className="bg-slate-800/50 rounded-xl p-3.5 mb-3 border border-slate-700/50">
              <div className="flex items-center gap-2 text-xs text-amber-500 font-semibold mb-1">
                <AlertCircle className="w-3.5 h-3.5" /> Nivel de Acceso
              </div>
              <div className="text-[10px] text-slate-400 leading-relaxed">
                Estás operando en la base de datos de producción local.
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
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
