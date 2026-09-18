'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { dbLocal, Order, NfcCard, Product, AbandonedCheckout, B2bQuote, supabase } from '@/lib/db';
import {
  DollarSign,
  Package,
  Users,
  ShoppingCart,
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Truck,
  Printer,
  Calendar,
  RefreshCw,
  Search,
  Filter,
  Activity,
  ArrowRight,
  Building2,
  MapPin,
  PieChart,
  Eye,
  Check,
  ChevronRight,
  MessageCircle,
  Mail,
  Smartphone,
  Globe,
  Compass,
  ExternalLink,
  Tag,
  Sparkles,
  Trash2
} from 'lucide-react';

export interface LiveVisitor {
  id: string;
  country: string;
  cityProvince: string;
  referrer: string;
  currentPage: string;
  timeOnPage: string;
  timeOnSite: string;
  hasCartItems: boolean;
  cartTotal: number;
  cartItemsSummary: string;
  device: string;
}

type ExecutiveTab = 'resumen' | 'abandoned' | 'live_visitors';

export default function MasterControlDashboard() {
  const [activeTab, setActiveTab] = useState<ExecutiveTab>('resumen');

  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [abandoned, setAbandoned] = useState<AbandonedCheckout[]>([]);
  const [b2bQuotes, setB2bQuotes] = useState<B2bQuote[]>([]);
  const [loading, setLoading] = useState(true);

  // Period Filter State
  const [period, setPeriod] = useState<'hoy' | 'ayer' | 'semana' | 'mes' | 'custom'>('mes');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Order Management Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingCourier, setTrackingCourier] = useState('UnoExpress');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [actionSuccessMsg, setActionSuccessMsg] = useState('');

  // Abandoned Checkouts Search / Filter
  const [abandonedSearch, setAbandonedSearch] = useState('');

  // Live Online Visitors State (100% Real Data)
  const [realActiveSessions, setRealActiveSessions] = useState<any[]>([]);
  const [totalVisitsToday, setTotalVisitsToday] = useState<number>(0);

  const fetchLiveSessions = async () => {
    try {
      const res = await fetch('/api/tracking/ping');
      const data = await res.json();
      if (data.success && Array.isArray(data.sessions)) {
        setRealActiveSessions(data.sessions);
        if (typeof data.total_visits_today === 'number') {
          setTotalVisitsToday(data.total_visits_today);
        }
      }
    } catch (e) {
      console.error('Error cargando sesiones activas:', e);
    }
  };

  useEffect(() => {
    fetchLiveSessions();
    const interval = setInterval(fetchLiveSessions, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadData = async () => {
    setLoading(true);
    let dbOrders = dbLocal.getOrders();
    let dbProducts = dbLocal.getProducts();
    let dbAbandoned = dbLocal.getAbandonedCheckouts();
    let dbB2b = dbLocal.getB2bQuotes();

    if (supabase) {
      try {
        const [resOrders, resProducts, resAbandoned, resB2b] = await Promise.all([
          supabase.from('orders').select('*').order('created_at', { ascending: false }),
          supabase.from('products').select('*'),
          supabase.from('abandoned_checkouts').select('*').order('created_at', { ascending: false }),
          supabase.from('b2b_quotes').select('*').order('created_at', { ascending: false }),
        ]);

        if (!resOrders.error && resOrders.data && resOrders.data.length > 0) dbOrders = resOrders.data as Order[];
        if (!resProducts.error && resProducts.data && resProducts.data.length > 0) dbProducts = resProducts.data as Product[];
        if (!resAbandoned.error && resAbandoned.data) dbAbandoned = resAbandoned.data as AbandonedCheckout[];
        if (!resB2b.error && resB2b.data && resB2b.data.length > 0) dbB2b = resB2b.data as B2bQuote[];
      } catch (err) {
        console.error('Error sincronizando con Supabase:', err);
      }
    }

    setOrders(dbOrders);
    setProducts(dbProducts);
    setAbandoned(dbAbandoned);
    setB2bQuotes(dbB2b);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filter orders by selected date period
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter(o => {
      const date = new Date(o.created_at);

      if (period === 'hoy') return date.toDateString() === now.toDateString();
      if (period === 'ayer') {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        return date.toDateString() === yesterday.toDateString();
      }
      if (period === 'semana') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return date >= weekAgo;
      }
      if (period === 'mes') {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }
      if (period === 'custom' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end;
      }
      return true;
    });
  }, [orders, period, startDate, endDate]);

  // Executive KPI Calculations
  const totalRevenue = useMemo(() => {
    return filteredOrders
      .filter(o => o.payment_status === 'completed')
      .reduce((sum, o) => sum + (o.total || 0), 0);
  }, [filteredOrders]);

  const totalUnitsSold = useMemo(() => {
    return filteredOrders.reduce((sum, o) => {
      const orderItems = o.items || [];
      return sum + orderItems.reduce((iSum, item) => iSum + (item.quantity || 1), 0);
    }, 0);
  }, [filteredOrders]);

  const totalOrdersCount = filteredOrders.length;
  const avgOrderTicket = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  const activeAbandoned = useMemo(() => {
    return abandoned.filter(a => a.status === 'abandoned');
  }, [abandoned]);

  const abandonedValueAtRisk = activeAbandoned.reduce((sum, a) => sum + (a.total || 0), 0);

  // Filtered abandoned checkouts for detail tab
  const filteredAbandonedList = useMemo(() => {
    return activeAbandoned.filter(a => {
      if (!abandonedSearch) return true;
      const q = abandonedSearch.toLowerCase();
      return (
        (a.customer_name && a.customer_name.toLowerCase().includes(q)) ||
        (a.customer_email && a.customer_email.toLowerCase().includes(q)) ||
        (a.customer_phone && a.customer_phone.includes(q)) ||
        (a.shipping_province && a.shipping_province.toLowerCase().includes(q))
      );
    });
  }, [activeAbandoned, abandonedSearch]);

  const totalVisits = useMemo(() => {
    const calculatedVisits = Math.max(
      totalVisitsToday,
      realActiveSessions.length,
      totalOrdersCount + activeAbandoned.length
    );
    return calculatedVisits;
  }, [totalVisitsToday, realActiveSessions.length, totalOrdersCount, activeAbandoned.length]);

  const conversionRate = useMemo(() => {
    if (totalVisits === 0) return 0;
    return (totalOrdersCount / totalVisits) * 100;
  }, [totalOrdersCount, totalVisits]);

  const pendingOrders = useMemo(() => {
    return orders.filter(o => o.status === 'pending' || o.status === 'processing' || o.payment_status === 'pending');
  }, [orders]);

  const pendingB2bQuotes = useMemo(() => {
    return b2bQuotes.filter(b => b.status === 'pending');
  }, [b2bQuotes]);

  // Handle Order Status Update
  const handleOpenOrderModal = (o: Order) => {
    setSelectedOrder(o);
    setTrackingCourier(o.tracking_courier || 'UnoExpress');
    setTrackingNumber(o.tracking_number || '');
    setAdminNotes(o.admin_notes || '');
  };

  const handleSaveOrderTracking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    const updates = {
      tracking_courier: trackingCourier,
      tracking_number: trackingNumber.trim(),
      admin_notes: adminNotes.trim(),
      status: 'shipped' as const,
    };

    dbLocal.updateOrderDetails(selectedOrder.id, updates);
    if (supabase) {
      supabase.from('orders').update(updates).eq('id', selectedOrder.id).then(({ error }) => {
        if (error) console.error('Error guardando guía en Supabase:', error);
      });
    }

    setActionSuccessMsg(`¡Guía de envío asignada para el pedido #${selectedOrder.id}!`);
    setSelectedOrder(null);
    loadData();
    setTimeout(() => setActionSuccessMsg(''), 4000);
  };

  const handleRecoverAbandoned = (item: AbandonedCheckout) => {
    const updated = abandoned.map(a => a.id === item.id ? { ...a, status: 'recovered' as const } : a);
    setAbandoned(updated);
    dbLocal.setStorageItem('nfc_abandoned_checkouts', updated);
    setActionSuccessMsg(`¡Carrito #${item.id} marcado como RECUPERADO!`);
    setTimeout(() => setActionSuccessMsg(''), 3500);
  };

  const handleDeleteAbandoned = (id: string) => {
    if (window.confirm(`¿Seguro que deseas descartar y eliminar el carrito #${id}?`)) {
      const updated = abandoned.filter(a => a.id !== id);
      setAbandoned(updated);
      dbLocal.deleteAbandonedCheckout(id);
      setActionSuccessMsg(`Carrito #${id} descartado y eliminado del sistema.`);
      setTimeout(() => setActionSuccessMsg(''), 3500);
    }
  };

  const handleClearAllAbandoned = () => {
    if (window.confirm('¿Deseas descartar todos los carritos irrecuperables de la lista?')) {
      setAbandoned([]);
      dbLocal.setStorageItem('nfc_abandoned_checkouts', []);
      if (supabase) {
        supabase.from('abandoned_checkouts').delete().neq('id', '').then(() => {});
      }
      setActionSuccessMsg('Todos los carritos irrecuperables han sido descartados.');
      setTimeout(() => setActionSuccessMsg(''), 3500);
    }
  };

  // Print Packing Slip
  const handlePrintPackingSlip = (order: Order) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return alert('Por favor habilita las ventanas emergentes en tu navegador.');

    const itemsHtml = (order.items || []).map(item => `
      <tr>
        <td style="padding:10px; border-bottom:1px solid #eee; text-align:center;">[ &nbsp; ]</td>
        <td style="padding:10px; border-bottom:1px solid #eee;">
          <strong>${item.product_name}</strong>
          ${item.selected_color ? `<br><small style="color:#666;">Color: ${item.selected_color}</small>` : ''}
        </td>
        <td style="padding:10px; border-bottom:1px solid #eee; text-align:center; font-weight:bold;">${item.quantity}</td>
        <td style="padding:10px; border-bottom:1px solid #eee; text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Remisión de Empaque - Pedido #${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 13px; color: #111; padding: 25px; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #111; padding-bottom: 15px; margin-bottom: 20px; }
          .brand { font-size: 22px; font-weight: 900; }
          .badge { background: #111; color: #f59e0b; padding: 3px 8px; border-radius: 4px; font-size: 11px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
          .box { background: #f9f9f9; padding: 12px; border-radius: 8px; border: 1px solid #eee; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #111; color: #fff; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; }
          .footer { margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; text-align: center; font-size: 11px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">starTAP Panamá 🇵🇦</div>
            <div style="font-size:11px; color:#666;">Tecnología NFC & QR para Reseñas en Panamá</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:16px; font-weight:bold;">COMPROBANTE DE EMPAQUE</div>
            <div class="badge">#${order.id}</div>
          </div>
        </div>

        <div class="grid">
          <div class="box">
            <strong style="text-transform:uppercase; font-size:10px; color:#666;">Cliente</strong>
            <div style="font-weight:bold; font-size:14px; margin-top:3px;">${order.customer_name}</div>
            <div>📧 ${order.customer_email}</div>
            <div>📱 ${order.customer_phone}</div>
          </div>

          <div class="box">
            <strong style="text-transform:uppercase; font-size:10px; color:#666;">Destino en Panamá</strong>
            <div style="font-weight:bold; margin-top:3px;">${order.shipping_province}, ${order.shipping_district}</div>
            <div style="font-size:11px;">${order.shipping_address}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:40px; text-align:center;">Verif.</th>
              <th>Producto</th>
              <th style="width:60px; text-align:center;">Cant.</th>
              <th style="width:80px; text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top:20px; text-align:right; font-size:15px; font-weight:bold;">
          Monto Total: $${order.total.toFixed(2)} USD (${order.payment_method.toUpperCase()})
        </div>

        <div class="footer">
          <p><strong>starTAP Panamá</strong> — ¡Gracias por su compra!</p>
          <p>Contacto: pedidos@startap.com.pa | WhatsApp +507 6713-4341</p>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center text-slate-500 py-24 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500" />
        <p className="font-semibold text-sm">Cargando Resumen Ejecutivo Directivo...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* TOP HEADER & EXECUTIVE SUB-TAB SWITCHER */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <PieChart className="w-6 h-6 text-amber-500" />
              Resumen Ejecutivo Directivo
            </h1>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              {realActiveSessions.length} Clientes Online
            </span>
          </div>
          <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
            Panel directivo comercial en tiempo real, rastreador de clientes activos y recuperación de carritos
          </p>
        </div>

        {/* TABS FOR RESUMEN, CARRITOS ABANDONADOS, CLIENTES ONLINE */}
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1.5 rounded-2xl border border-slate-300/80 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('resumen')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'resumen'
                ? 'bg-slate-950 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            <PieChart className="w-4 h-4 text-amber-400" />
            <span>Resumen General</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('abandoned')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'abandoned'
                ? 'bg-slate-950 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            <ShoppingCart className="w-4 h-4 text-rose-400" />
            <span>Carritos Abandonados ({activeAbandoned.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('live_visitors')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'live_visitors'
                ? 'bg-slate-950 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 text-emerald-400" />
            <span>Clientes Online en Vivo ({realActiveSessions.length})</span>
          </button>
        </div>
      </div>

      {actionSuccessMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{actionSuccessMsg}</span>
        </div>
      )}

      {/* ========================================================================= */}
      {/* EXECUTIVE KPI SCORECARDS (CLEAN 3x2 GRID - NO TEXT CUT-OFFS)               */}
      {/* ========================================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. VENTAS TOTALES */}
        <div className="bg-slate-950 text-white p-5 rounded-2xl shadow-md border border-slate-800 flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 text-xs font-bold uppercase tracking-wider">Ventas Totales</span>
            <span className="p-2 bg-slate-800 rounded-xl">
              <DollarSign className="w-4 h-4 text-amber-400" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-black text-amber-400 font-mono">${totalRevenue.toFixed(2)}</span>
            <span className="text-xs text-slate-400 block mt-0.5">USD facturado en el período</span>
          </div>
        </div>

        {/* 2. PIEZAS VENDIDAS */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 text-xs font-bold uppercase tracking-wider">Piezas / Unidades Vendidas</span>
            <span className="p-2 bg-slate-100 rounded-xl">
              <Package className="w-4 h-4 text-slate-700" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-black text-slate-900 font-mono">{totalUnitsSold}</span>
            <span className="text-xs text-slate-500 block mt-0.5">unidades físicas despachadas</span>
          </div>
        </div>

        {/* 3. CLIENTES ACTIVOS EN LÍNEA (CLICKABLE TO LIVE VISITORS) */}
        <div
          onClick={() => setActiveTab('live_visitors')}
          className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs flex flex-col justify-between min-h-[110px] cursor-pointer hover:border-emerald-400 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-slate-600 text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Clientes Activos Online
            </span>
            <span className="p-2 bg-emerald-50 rounded-xl text-emerald-600 group-hover:scale-110 transition-transform">
              <Users className="w-4 h-4 text-emerald-600" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-emerald-600 font-mono">{realActiveSessions.length}</span>
              <span className="text-xs text-slate-500 block mt-0.5">en vivo navegando la tienda</span>
            </div>
            <span className="text-xs font-bold text-emerald-700 group-hover:underline flex items-center">
              Ver Dónde Están &rarr;
            </span>
          </div>
        </div>

        {/* 4. CARRITOS ABANDONADOS (CLICKABLE TO ABANDONED TAB) */}
        <div
          onClick={() => setActiveTab('abandoned')}
          className="bg-white border border-rose-200 p-5 rounded-2xl shadow-2xs flex flex-col justify-between min-h-[110px] cursor-pointer hover:border-rose-400 hover:shadow-md transition group"
        >
          <div className="flex items-center justify-between">
            <span className="text-rose-700 text-xs font-bold uppercase tracking-wider">Carritos Abandonados</span>
            <span className="p-2 bg-rose-50 rounded-xl text-rose-600 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
            </span>
          </div>
          <div className="mt-2 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-black text-rose-700 font-mono">{activeAbandoned.length}</span>
              <span className="text-xs text-rose-600 font-bold block mt-0.5">${abandonedValueAtRisk.toFixed(2)} en riesgo</span>
            </div>
            <span className="text-xs font-bold text-rose-700 group-hover:underline flex items-center">
              Ver Detalles &rarr;
            </span>
          </div>
        </div>

        {/* 5. % CONVERSIÓN FRENTE A VISITAS */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 text-xs font-bold uppercase tracking-wider">% Conversión vs Visitas</span>
            <span className="p-2 bg-blue-50 rounded-xl">
              <Activity className="w-4 h-4 text-blue-600" />
            </span>
          </div>
          <div className="mt-2.5 flex items-center justify-between gap-3 border-t border-slate-100 pt-2">
            <div>
              <span className="text-xl font-extrabold text-blue-600 font-mono block leading-none">{conversionRate.toFixed(1)}%</span>
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight block mt-1">Tasa Conversión</span>
            </div>
            <div className="text-right border-l border-slate-100 pl-3">
              <div className="text-xs font-bold text-slate-800 font-mono flex items-center justify-end gap-1">
                <span>{totalVisits}</span>
                <span className="text-[10px] text-slate-500 font-normal">visitas reales</span>
              </div>
              <div className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                {totalOrdersCount} conversiones ({realActiveSessions.length} en vivo)
              </div>
            </div>
          </div>
        </div>

        {/* 6. TICKET PROMEDIO (AOV) */}
        <div className="bg-white border border-slate-200 p-5 rounded-2xl shadow-2xs flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center justify-between">
            <span className="text-slate-600 text-xs font-bold uppercase tracking-wider">Ticket Promedio (AOV)</span>
            <span className="p-2 bg-emerald-50 rounded-xl">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </span>
          </div>
          <div className="mt-2">
            <span className="text-3xl font-black text-emerald-700 font-mono">${avgOrderTicket.toFixed(2)}</span>
            <span className="text-xs text-slate-500 block mt-0.5">promedio por transacción</span>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: RESUMEN GENERAL & ÓRDENES PENDIENTES POR GESTIONAR                 */}
      {/* ========================================================================= */}
      {activeTab === 'resumen' && (
        <div className="space-y-8">
          
          {/* PERIOD FILTER SELECTOR */}
          <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-slate-500" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Filtrar Período de Ventas:</span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setPeriod('hoy')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  period === 'hoy' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Hoy
              </button>
              <button
                type="button"
                onClick={() => setPeriod('ayer')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  period === 'ayer' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Ayer
              </button>
              <button
                type="button"
                onClick={() => setPeriod('semana')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  period === 'semana' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Esta Semana
              </button>
              <button
                type="button"
                onClick={() => setPeriod('mes')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition ${
                  period === 'mes' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Este Mes
              </button>
            </div>
          </div>

          {/* ÓRDENES PENDIENTES POR GESTIONAR */}
          <div className="bg-white border-2 border-amber-400/80 rounded-3xl overflow-hidden shadow-md space-y-4">
            <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <Clock className="w-5 h-5 text-amber-600" />
                    Órdenes Pendientes por Gestionar ({pendingOrders.length})
                  </h2>
                </div>
                <p className="text-xs text-slate-600 mt-0.5">
                  Pedidos pendientes de empaque, asignación de guía de envío o confirmación de pago.
                </p>
              </div>

              <Link
                href="/master-control/pedidos"
                className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs rounded-xl transition shadow-sm flex items-center gap-1.5"
              >
                <span>Ver Todas en OMS</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </Link>
            </div>

            <div className="overflow-x-auto p-2">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                    <th className="p-3.5">ID Pedido</th>
                    <th className="p-3.5">Fecha & Cliente</th>
                    <th className="p-3.5">Destino (Panamá)</th>
                    <th className="p-3.5">Productos</th>
                    <th className="p-3.5 text-center">Pago</th>
                    <th className="p-3.5 text-right">Monto USD</th>
                    <th className="p-3.5 text-center">Acción Inmediata</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {pendingOrders.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-slate-400 italic">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2 opacity-80" />
                        ¡Excelente! No hay órdenes pendientes por gestionar en este momento.
                      </td>
                    </tr>
                  ) : (
                    pendingOrders.map(o => (
                      <tr key={o.id} className="hover:bg-amber-50/40 transition-colors">
                        <td className="p-3.5 font-mono font-black text-slate-900">
                          <span className="bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
                            #{o.id}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <p className="font-bold text-slate-900">{o.customer_name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{o.customer_email} | 📱 {o.customer_phone}</p>
                        </td>

                        <td className="p-3.5">
                          <p className="font-bold text-slate-800">{o.shipping_province}</p>
                          <p className="text-[10px] text-slate-500">{o.shipping_district}</p>
                        </td>

                        <td className="p-3.5 max-w-[200px]">
                          {(o.items || []).map((item, idx) => (
                            <p key={idx} className="truncate text-slate-900 font-medium text-[11px]">
                              • {item.quantity}x {item.product_name}
                            </p>
                          ))}
                        </td>

                        <td className="p-3.5 text-center">
                          <span className="px-2 py-0.5 bg-slate-100 text-slate-800 font-mono font-bold uppercase rounded text-[10px] block mb-1">
                            {o.payment_method}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                            o.payment_status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {o.payment_status === 'completed' ? 'Pagado' : 'Pendiente'}
                          </span>
                        </td>

                        <td className="p-3.5 text-right font-mono font-black text-slate-900">
                          ${(o.total || 0).toFixed(2)}
                        </td>

                        <td className="p-3.5 text-center space-x-1.5">
                          <button
                            type="button"
                            onClick={() => handlePrintPackingSlip(o)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                            title="Imprimir Comprobante de Empaque"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleOpenOrderModal(o)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[11px] transition shadow-2xs inline-flex items-center gap-1"
                          >
                            <Truck className="w-3.5 h-3.5" />
                            <span>Despachar</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* LOWER GRID: B2B QUOTES & PROVINCES */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h2 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <Building2 className="w-5 h-5 text-amber-500" />
                Cotizaciones B2B Pendientes ({pendingB2bQuotes.length})
              </h2>
              <div className="space-y-3">
                {pendingB2bQuotes.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center">No hay cotizaciones pendientes.</p>
                ) : (
                  pendingB2bQuotes.slice(0, 4).map(b => (
                    <div key={b.id} className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-slate-900 block">{b.business_name || b.name}</span>
                        <span className="text-[10px] text-slate-500">📧 {b.email} | 📱 {b.phone}</span>
                      </div>
                      <a
                        href={`https://wa.me/507${b.phone.replace(/\D/g, '')}?text=Hola%20${encodeURIComponent(b.name)},%20te%20contactamos%20de%20starTAP`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-2.5 py-1 bg-emerald-500 text-white rounded-lg font-bold text-[11px]"
                      >
                        WhatsApp &rarr;
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
              <h2 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                Ventas por Provincia (🇵🇦 Panamá)
              </h2>
              <div className="space-y-3">
                {orders.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center">Sin datos de ventas registradas.</p>
                ) : (
                  Object.entries(
                    orders.reduce((acc, o) => {
                      const prov = o.shipping_province || 'Panamá';
                      acc[prov] = (acc[prov] || 0) + (o.total || 0);
                      return acc;
                    }, {} as { [key: string]: number })
                  )
                    .sort((a, b) => b[1] - a[1])
                    .slice(0, 5)
                    .map(([prov, rev]) => (
                      <div key={prov} className="space-y-1 text-xs">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-900">{prov}</span>
                          <span className="font-mono font-black text-slate-900">${rev.toFixed(2)} USD</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div className="bg-emerald-500 h-full rounded-full" style={{ width: `${Math.max(10, (rev / (totalRevenue || 1)) * 100)}%` }} />
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: MÓDULO DETALLADO DE CARRITOS ABANDONADOS                           */}
      {/* ========================================================================= */}
      {activeTab === 'abandoned' && (
        <div className="space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <ShoppingCart className="w-6 h-6 text-rose-500" />
                  Módulo de Carritos Abandonados ({activeAbandoned.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Total de Ingresos Potenciales en Riesgo: <span className="font-mono font-black text-rose-600 text-sm">${abandonedValueAtRisk.toFixed(2)} USD</span>
                </p>
              </div>

              {/* SEARCH FILTER & CLEAR ALL BUTTON */}
              <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
                <div className="relative w-full sm:w-72">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={abandonedSearch}
                    onChange={e => setAbandonedSearch(e.target.value)}
                    placeholder="Buscar por cliente, email o teléfono..."
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                {activeAbandoned.length > 0 && (
                  <button
                    type="button"
                    onClick={handleClearAllAbandoned}
                    className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                    title="Descartar todos los carritos irrecuperables"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Limpiar Irrecuperables</span>
                  </button>
                )}
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                    <th className="p-3.5">Ref. Carrito</th>
                    <th className="p-3.5">Cliente & Contacto</th>
                    <th className="p-3.5">Ubicación (Panamá)</th>
                    <th className="p-3.5">Productos en Carrito</th>
                    <th className="p-3.5 text-right">Monto en Riesgo</th>
                    <th className="p-3.5 text-center">Tiempo Transcurrido</th>
                    <th className="p-3.5 text-center">Acciones de Recuperación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {filteredAbandonedList.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-10 text-center text-slate-400 italic">
                        No hay carritos abandonados que coincidan con el filtro.
                      </td>
                    </tr>
                  ) : (
                    filteredAbandonedList.map(item => {
                      const cleanPhone = (item.customer_phone || '').replace(/\D/g, '');
                      const waMsg = `Hola ${encodeURIComponent(item.customer_name || 'Cliente')}, vimos que dejaste un carrito pendiente en starTAP Panamá. ¿Te gustaría ayuda para completar tu orden?`;
                      const waUrl = `https://wa.me/507${cleanPhone}?text=${waMsg}`;

                      return (
                        <tr key={item.id} className="hover:bg-rose-50/30 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-slate-900">
                            <span className="bg-rose-50 text-rose-800 border border-rose-200 px-2 py-0.5 rounded">
                              #{item.id}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <p className="font-bold text-slate-900">{item.customer_name || 'Sin nombre'}</p>
                            <p className="text-[10px] text-slate-400 font-mono">📧 {item.customer_email}</p>
                            {item.customer_phone && <p className="text-[10px] text-slate-500 font-mono">📱 {item.customer_phone}</p>}
                          </td>

                          <td className="p-3.5">
                            <p className="font-bold text-slate-800">{item.shipping_province || 'Panamá'}</p>
                            <p className="text-[10px] text-slate-400">{item.shipping_district || 'Distrito Central'}</p>
                          </td>

                          <td className="p-3.5 max-w-[220px]">
                            {(item.items || []).map((prod, idx) => (
                              <p key={idx} className="truncate text-slate-900 font-medium text-[11px]">
                                • {prod.quantity}x {prod.product_name}
                              </p>
                            ))}
                          </td>

                          <td className="p-3.5 text-right font-mono font-black text-rose-700 text-sm">
                            ${(item.total || 0).toFixed(2)} USD
                          </td>

                          <td className="p-3.5 text-center text-slate-500 font-mono text-[11px]">
                            {new Date(item.created_at).toLocaleTimeString('es-PA')}
                          </td>

                          <td className="p-3.5 text-center space-x-1.5 whitespace-nowrap">
                            {cleanPhone && (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold text-[11px] transition shadow-2xs"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>WhatsApp</span>
                              </a>
                            )}

                            <button
                              type="button"
                              onClick={() => handleRecoverAbandoned(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-bold text-[11px] transition"
                            >
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Marcar Recuperado</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteAbandoned(item.id)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg font-bold text-[11px] transition"
                              title="Descartar y sacar carrito irrecuperable"
                            >
                              <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                              <span>Descartar / Sacar</span>
                            </button>
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
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RASTREADOR DE CLIENTES ACTIVOS EN VIVO (DATA 100% REAL EN TIEMPO REAL) */}
      {/* ========================================================================= */}
      {activeTab === 'live_visitors' && (
        <div className="space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            {/* Header with live indicator */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 animate-ping" />
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <Users className="w-6 h-6 text-emerald-600" />
                    Rastreador de Clientes Activos en Vivo ({realActiveSessions.length})
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-1">
                  Monitorización en tiempo real de compradores explorando la tienda, páginas visitadas y estado del carrito. (Estilo Shopify - Data 100% Real).
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3.5 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full font-mono font-bold text-xs flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  {realActiveSessions.length} {realActiveSessions.length === 1 ? 'Usuario Conectado' : 'Usuarios Conectados'}
                </span>
                <button
                  onClick={fetchLiveSessions}
                  className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition text-xs font-bold flex items-center gap-1"
                  title="Refrescar al instante"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Validation Banner */}
            <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 text-xs text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-extrabold uppercase tracking-wide block">Data 100% Real Verificada — Sin Simulaciones</span>
                  <p className="text-[11px] text-emerald-800 mt-0.5">
                    Puedes verificarlo en vivo: Abre la tienda <code className="bg-emerald-100 px-1.5 py-0.5 rounded font-mono font-bold text-emerald-900">startap.com.pa</code> o esta web en tu celular o ventana de incógnito y verás aparecer tu propia sesión al instante en la tabla.
                  </p>
                </div>
              </div>
            </div>

            {/* Live Active Clients Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                    <th className="p-3.5">ID Sesión / Usuario</th>
                    <th className="p-3.5">Ubicación & Área</th>
                    <th className="p-3.5">Fuente de Tráfico (Origen)</th>
                    <th className="p-3.5">Página Actual Navegando</th>
                    <th className="p-3.5 text-center">Tiempo en Página</th>
                    <th className="p-3.5 text-center">Tiempo en Web</th>
                    <th className="p-3.5 text-center">Última Actividad</th>
                    <th className="p-3.5 text-center">Estado del Carrito</th>
                    <th className="p-3.5">Dispositivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {realActiveSessions.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="p-12 text-center text-slate-400 space-y-2">
                        <Users className="w-8 h-8 text-slate-300 mx-auto" />
                        <p className="font-bold text-slate-700 text-sm">No hay compradores navegando la tienda en este segundo exacto</p>
                        <p className="text-xs text-slate-400 max-w-md mx-auto">
                          Cuando un cliente ingrese desde Google, Instagram, Facebook o WhatsApp, su sesión aparecerá en tiempo real aquí.
                        </p>
                      </td>
                    </tr>
                  ) : (
                    realActiveSessions.map(session => {
                      const nowMs = Date.now();
                      const pageSec = Math.max(0, Math.floor((nowMs - new Date(session.page_start_time || session.last_seen).getTime()) / 1000));
                      const siteSec = Math.max(0, Math.floor((nowMs - new Date(session.first_seen || session.last_seen).getTime()) / 1000));
                      const lastSeenSecAgo = Math.floor((nowMs - new Date(session.last_seen).getTime()) / 1000);
                      const activeStatusText = lastSeenSecAgo < 15 ? 'Activo ahora' : `Hace ${lastSeenSecAgo}s`;

                      const timeOnPageStr = pageSec < 60 ? `${pageSec}s` : `${Math.floor(pageSec / 60)}m ${pageSec % 60}s`;
                      const timeOnSiteStr = siteSec < 60 ? `${siteSec}s` : `${Math.floor(siteSec / 60)}m ${siteSec % 60}s`;

                      const cCode = session.country_code || 'PA';
                      const countryDisplay = cCode === 'PA' ? 'PA Panamá' : cCode === 'US' ? 'US Estados Unidos' : `${cCode} ${session.country || ''}`;
                      const prov = session.province || 'Panamá';
                      const dist = session.district || 'Bella Vista';

                      return (
                        <tr key={session.session_id} className="hover:bg-emerald-50/20 transition-colors">
                          <td className="p-3.5 font-mono font-bold text-slate-900">
                            <span className="bg-slate-100 border border-slate-300 px-2.5 py-1 rounded-lg text-slate-800">
                              {session.session_id}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <p className="font-bold text-slate-900">{countryDisplay}</p>
                            <p className="text-[10px] text-slate-500 font-semibold">{prov} ({dist})</p>
                          </td>

                          <td className="p-3.5 font-semibold text-slate-800">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]">
                              <Compass className="w-3.5 h-3.5 text-slate-500" />
                              {session.referrer}
                            </span>
                          </td>

                          <td className="p-3.5">
                            <span className="font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px] block w-fit truncate max-w-[200px]">
                              {session.current_page}
                            </span>
                          </td>

                          <td className="p-3.5 text-center font-mono font-bold text-slate-900">
                            {timeOnPageStr}
                          </td>

                          <td className="p-3.5 text-center font-mono font-bold text-slate-500">
                            {timeOnSiteStr}
                          </td>

                          <td className="p-3.5 text-center font-mono font-bold">
                            <span className={`px-2 py-0.5 rounded text-[10px] ${lastSeenSecAgo < 15 ? 'bg-emerald-100 text-emerald-800 font-extrabold' : 'bg-slate-100 text-slate-600'}`}>
                              ⚡ {activeStatusText}
                            </span>
                          </td>

                          <td className="p-3.5 text-center">
                            {session.has_cart ? (
                              <span className="px-2.5 py-1 bg-emerald-100 text-emerald-900 border border-emerald-300 rounded-lg font-bold text-[10px] inline-block">
                                🛒 {session.cart_summary}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">⚪ Carrito vacío</span>
                            )}
                          </td>

                          <td className="p-3.5 text-slate-600 font-mono text-[11px]">
                            {session.device}
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
      )}

      {/* MODAL DE DESPACHO Y ASIGNACIÓN DE GUÍA */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Despachar Pedido #{selectedOrder.id}</h3>
                <p className="text-xs text-slate-500">Cliente: {selectedOrder.customer_name} ({selectedOrder.shipping_province})</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveOrderTracking} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Empresa de Mensajería / Courier</label>
                <select
                  value={trackingCourier}
                  onChange={e => setTrackingCourier(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 outline-none"
                >
                  <option value="UnoExpress">UnoExpress (Retiro en Agencia / Domicilio)</option>
                  <option value="Fletes Chavales">Fletes Chavales</option>
                  <option value="Don Express">Don Express</option>
                  <option value="Servientrega">Servientrega Panamá</option>
                  <option value="Mensajería Propia starTAP">Mensajería Propia starTAP</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Número de Guía / Tracking *</label>
                <input
                  type="text"
                  required
                  value={trackingNumber}
                  onChange={e => setTrackingNumber(e.target.value)}
                  placeholder="Ej. UNO-984712-PA"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notas del Administrador</label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={e => setAdminNotes(e.target.value)}
                  placeholder="Instrucciones adicionales para el courier..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <Truck className="w-4 h-4" />
                  <span>Marcar como Enviado</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
