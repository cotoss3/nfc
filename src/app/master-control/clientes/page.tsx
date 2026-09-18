'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { dbLocal, CustomerSummary, supabase } from '@/lib/db';
import {
  ArrowLeft,
  Search,
  Users,
  MessageCircle,
  Mail,
  Download,
  Filter,
  X,
  TrendingUp,
  Award,
  ShoppingBag,
  RefreshCw,
  Clock
} from 'lucide-react';

export default function ClientesPage() {
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [segmentFilter, setSegmentFilter] = useState<'all' | 'vip' | 'single'>('all');

  const fetchCustomers = async () => {
    setLoading(true);
    // Trigger async order refresh so customer summary is updated with latest Supabase orders
    try {
      await dbLocal.getOrdersAsync();
    } catch (e) {}

    const summary = dbLocal.getCustomersSummary();
    setCustomers(summary);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const exportCustomersToCsv = () => {
    if (customers.length === 0) return alert('No hay clientes para exportar.');
    const headers = ['Nombre / Comercio', 'Email', 'Telefono', 'Provincia', 'Distrito', 'Cantidad Pedidos', 'Gasto Total USD', 'Dispositivos Activos', 'Ultima Compra'];
    const rows = customers.map(c => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${c.email || ''}"`,
      `"${c.phone || ''}"`,
      `"${(c.province || '').replace(/"/g, '""')}"`,
      `"${(c.district || '').replace(/"/g, '""')}"`,
      `"${c.ordersCount}"`,
      `"${c.totalSpent.toFixed(2)}"`,
      `"${c.cardCount}"`,
      `"${new Date(c.lastOrderDate).toLocaleDateString('es-PA')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `starTAP_Clientes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
  };

  const vipCustomers = customers.filter(c => c.ordersCount > 1);
  const singleCustomers = customers.filter(c => c.ordersCount <= 1);
  const totalRevenueAll = customers.reduce((sum, c) => sum + c.totalSpent, 0);
  const avgRevenuePerCustomer = customers.length > 0 ? totalRevenueAll / customers.length : 0;

  const filteredCustomers = customers.filter(c => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.province || '').toLowerCase().includes(q) ||
      (c.district || '').toLowerCase().includes(q);

    const matchSegment =
      segmentFilter === 'all' ||
      (segmentFilter === 'vip' && c.ordersCount > 1) ||
      (segmentFilter === 'single' && c.ordersCount <= 1);

    return matchSearch && matchSegment;
  });

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center text-slate-500 py-24 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500" />
        <p className="font-semibold text-sm">Cargando directorio CRM de clientes...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER & BREADCRUMB */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/master-control"
            className="p-2.5 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Users className="w-6 h-6 text-blue-600" />
              CRM & Directorio de Clientes
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Historial consolidado de compras, valor del cliente (LTV) y contacto por WhatsApp
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={exportCustomersToCsv}
          className="py-3 px-5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 shrink-0 active:scale-[0.98]"
        >
          <Download className="w-4 h-4 text-amber-400" />
          <span>Exportar Clientes CSV</span>
        </button>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Total Clientes</span>
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-slate-700" />
            <span className="text-2xl font-black text-slate-900">{customers.length}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Clientes VIP / Recurrentes</span>
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            <span className="text-2xl font-black text-slate-900">{vipCustomers.length}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Gasto Total Acumulado</span>
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-600" />
            <span className="text-2xl font-black text-slate-900">${totalRevenueAll.toFixed(2)}</span>
          </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs flex flex-col gap-1 text-white">
          <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Promedio / Cliente (LTV)</span>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-5 h-5 text-amber-400" />
            <span className="text-2xl font-black text-white">${avgRevenuePerCustomer.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Filtros del CRM
          </span>
          {(search || segmentFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setSegmentFilter('all');
              }}
              className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Limpiar Filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por cliente, correo, celular o provincia..."
              className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
            />
          </div>

          <select
            value={segmentFilter}
            onChange={e => setSegmentFilter(e.target.value as any)}
            className="bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2.5 text-slate-800 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all">Segmento: Todos ({customers.length})</option>
            <option value="vip">Clientes VIP / Recurrentes ({vipCustomers.length})</option>
            <option value="single">Primera Compra ({singleCustomers.length})</option>
          </select>
        </div>
      </div>

      {/* CUSTOMERS TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Directorio de Compradores ({filteredCustomers.length})
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold">
            Actualización automática desde órdenes y dispositivos registrados
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                <th className="p-4">Cliente / Comercio</th>
                <th className="p-4">Celular / WhatsApp</th>
                <th className="p-4">Ubicación</th>
                <th className="p-4 text-center">Pedidos</th>
                <th className="p-4 text-right">Gasto Acumulado (LTV)</th>
                <th className="p-4 text-center">Acción Directa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                    No hay clientes registrados que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map(c => {
                  const cleanPhoneDigits = (c.phone || '').replace(/\D/g, '');
                  const formattedWaNumber = cleanPhoneDigits.startsWith('507')
                    ? cleanPhoneDigits
                    : cleanPhoneDigits.length === 8
                    ? `507${cleanPhoneDigits}`
                    : cleanPhoneDigits;

                  const firstName = c.name ? c.name.split(' ')[0] : 'Estimado/a';
                  const waMessage = `¡Hola ${firstName}! Te saluda el equipo de starTAP Panamá. 🇵🇦\n\n¿Cómo ha sido tu experiencia con tus dispositivos TAP para reseñas de Google Maps?\n\nSi necesitas personalizar un nuevo equipo o agregar sucursales a tu cuenta, cuenta con nosotros.`;
                  const waUrl = formattedWaNumber
                    ? `https://wa.me/${formattedWaNumber}?text=${encodeURIComponent(waMessage)}`
                    : null;

                  return (
                    <tr key={c.email} className="hover:bg-slate-50 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-slate-900">{c.name}</p>
                        <p className="text-[10px] text-slate-400 font-mono mt-0.5">{c.email}</p>
                      </td>

                      <td className="p-4">
                        {c.phone ? (
                          <span className="font-mono font-semibold text-slate-800">📱 {c.phone}</span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Sin teléfono</span>
                        )}
                      </td>

                      <td className="p-4 font-medium text-slate-700">
                        {c.province
                          ? `${c.province}${c.district ? `, ${c.district}` : ''}`
                          : 'No registrada'}
                      </td>

                      <td className="p-4 text-center">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase border ${
                            c.ordersCount > 1
                              ? 'bg-blue-100 text-blue-800 border-blue-300'
                              : 'bg-slate-100 text-slate-700 border-slate-300'
                          }`}
                        >
                          {c.ordersCount} {c.ordersCount === 1 ? 'orden' : 'órdenes'}
                        </span>
                      </td>

                      <td className="p-4 text-right font-mono font-black text-slate-900 text-sm">
                        ${c.totalSpent.toFixed(2)} USD
                      </td>

                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          {waUrl ? (
                            <a
                              href={waUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl transition shadow-2xs"
                              title="Escribir por WhatsApp"
                            >
                              <MessageCircle className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>
                          ) : (
                            <span className="text-[10px] text-slate-400 italic">(Sin WhatsApp)</span>
                          )}

                          <a
                            href={`mailto:${c.email}?subject=${encodeURIComponent('Contacto starTAP Panamá')}`}
                            className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                            title="Enviar correo electrónico"
                          >
                            <Mail className="w-4 h-4" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}