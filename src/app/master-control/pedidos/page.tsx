'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { dbLocal, Order } from '@/lib/db';
import { 
  Search, Filter, Package, AlertCircle, TrendingUp, CheckCircle, Clock, Truck
} from 'lucide-react';

export default function PedidosPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const data = dbLocal.getOrders();
    // Sort descending by date
    data.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    setOrders(data);
    setLoading(false);
  }, []);

  const filteredOrders = orders.filter(o => {
    const q = search.toLowerCase();
    const matchSearch = !q || 
      o.id.toLowerCase().includes(q) || 
      o.customer_name?.toLowerCase().includes(q) || 
      o.customer_email?.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const pendingCount = orders.filter(o => o.status === 'pending').length;
  const processingCount = orders.filter(o => o.status === 'processing').length;
  const shippedCount = orders.filter(o => o.status === 'shipped').length;
  const totalRevenue = orders.filter(o => o.payment_status === 'delivered').reduce((acc, o) => acc + o.total, 0);

  if (loading) return <div className="p-8 text-center text-slate-500">Cargando pedidos...</div>;

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER & KPIs (ADMIN VIEW) */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Pedidos (OMS)</h1>
          <p className="text-slate-500 text-sm mt-1">Gestión de órdenes y fulfillment</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Pendientes</span>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-amber-500" />
            <span className="text-2xl font-black text-slate-900">{pendingCount}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Por Empacar</span>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-500" />
            <span className="text-2xl font-black text-slate-900">{processingCount}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1">
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">Enviados</span>
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-emerald-500" />
            <span className="text-2xl font-black text-slate-900">{shippedCount}</span>
          </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-sm flex flex-col gap-1">
          <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Ingresos Netos</span>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-amber-400" />
            <span className="text-2xl font-black text-white">${totalRevenue.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* FILTER BAR */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input 
            type="text"
            placeholder="Buscar por ID, cliente, correo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 focus:border-slate-900 outline-none transition-all"
          />
        </div>
        <div className="flex items-center gap-2 min-w-max">
          <Filter className="w-4 h-4 text-slate-400" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-slate-900"
          >
            <option value="all">Todos los estados</option>
            <option value="pending">Pendientes de Pago</option>
            <option value="processing">Procesando (Pick & Pack)</option>
            <option value="shipped">Enviados</option>
            <option value="delivered">Completados</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>
      </div>

      {/* TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider font-bold text-slate-500">
                <th className="p-4">Pedido</th>
                <th className="p-4">Fecha</th>
                <th className="p-4">Cliente</th>
                <th className="p-4">Estado</th>
                <th className="p-4">Pago</th>
                <th className="p-4 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">No se encontraron pedidos.</td>
                </tr>
              ) : (
                filteredOrders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="p-4 font-bold text-slate-900">
                      <Link href={`/master-control/pedidos/${order.id}`} className="hover:text-amber-600 hover:underline">
                        #{order.id}
                      </Link>
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(order.created_at).toLocaleDateString('es-PA')}
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900">{order.customer_name || 'Sin nombre'}</div>
                      <div className="text-xs text-slate-500">{order.shipping_province || 'Local'}</div>
                    </td>
                    <td className="p-4">
                      {order.status === 'pending' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200"><Clock className="w-3.5 h-3.5" /> Pendiente</span>}
                      {order.status === 'processing' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200"><Package className="w-3.5 h-3.5" /> Procesando</span>}
                      {order.status === 'shipped' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-700 text-xs font-bold border border-purple-200"><Truck className="w-3.5 h-3.5" /> Enviado</span>}
                      {order.status === 'delivered' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200"><CheckCircle className="w-3.5 h-3.5" /> Completado</span>}
                      {order.status === 'cancelled' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-red-50 text-red-700 text-xs font-bold border border-red-200"><AlertCircle className="w-3.5 h-3.5" /> Cancelado</span>}
                    </td>
                    <td className="p-4">
                      {order.payment_status === 'delivered' 
                        ? <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-emerald-100 text-emerald-800">Pagado</span>
                        : <span className="inline-flex px-2 py-0.5 rounded text-xs font-bold bg-slate-100 text-slate-600">Pendiente</span>
                      }
                      <div className="text-[10px] text-slate-400 mt-0.5 uppercase font-bold">{order.payment_method}</div>
                    </td>
                    <td className="p-4 text-right font-black text-slate-900">
                      ${order.total.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
