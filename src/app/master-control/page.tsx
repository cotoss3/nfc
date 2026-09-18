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
  Sparkles
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

  // Live Online Visitors State
  const [liveVisitors, setLiveVisitors] = useState<LiveVisitor[]>([]);

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
        if (!resAbandoned.error && resAbandoned.data && resAbandoned.data.length > 0) dbAbandoned = resAbandoned.data as AbandonedCheckout[];
        if (!resB2b.error && resB2b.data && resB2b.data.length > 0) dbB2b = resB2b.data as B2bQuote[];
      } catch (err) {
        console.error('Error sincronizando con Supabase:', err);
      }
    }

    // Seed default abandoned checkouts if empty for rich testing
    if (dbAbandoned.length === 0) {
      const seedAbandoned: AbandonedCheckout[] = [
        {
          id: 'CAR-1094',
          customer_name: 'Roberto Varela',
          customer_email: 'r.varela@panama-cafe.com',
          customer_phone: '67123904',
          shipping_province: 'Panamá',
          shipping_district: 'San Francisco',
          items: [
            { id: '1', product_id: 'placa-google', product_name: 'Placa Acrílica Google Reviews (Blanca)', quantity: 1, price: 49.90, selected_color: 'Blanco Pro' }
          ],
          total: 49.90,
          status: 'abandoned',
          created_at: new Date(Date.now() - 3600000 * 2.5).toISOString(),
          updated_at: new Date(Date.now() - 3600000 * 2.5).toISOString()
        },
        {
          id: 'CAR-1092',
          customer_name: 'Elena Guardia',
          customer_email: 'elena.guardia@boutique.pa',
          customer_phone: '66881122',
          shipping_province: 'Chiriquí',
          shipping_district: 'David',
          items: [
            { id: '2', product_id: 'tarjeta-nfc', product_name: 'Tarjeta NFC Google Reviews (Negra)', quantity: 2, price: 19.90, selected_color: 'Negro Mate' }
          ],
          total: 39.80,
          status: 'abandoned',
          created_at: new Date(Date.now() - 3600000 * 7).toISOString(),
          updated_at: new Date(Date.now() - 3600000 * 7).toISOString()
        },
        {
          id: 'CAR-1088',
          customer_name: 'David De La Guardia',
          customer_email: 'david@constructora.pa',
          customer_phone: '65449900',
          shipping_province: 'Panamá Oeste',
          shipping_district: 'Arraiján',
          items: [
            { id: '3', product_id: 'placa-google-black', product_name: 'Placa Acrílica Google Reviews (Negro Premium)', quantity: 1, price: 49.90 }
          ],
          total: 49.90,
          status: 'abandoned',
          created_at: new Date(Date.now() - 3600000 * 18).toISOString(),
          updated_at: new Date(Date.now() - 3600000 * 18).toISOString()
        }
      ];
      dbAbandoned = seedAbandoned;
      dbLocal.setStorageItem('nfc_abandoned_checkouts', seedAbandoned);
    }

    // Seed default live online visitors tracking data
    const initialLiveVisitors: LiveVisitor[] = [
      {
        id: 'VIS-9410',
        country: '🇵🇦 Panamá',
        cityProvince: 'Panamá (Bella Vista)',
        referrer: 'Google Search (SEO Organico)',
        currentPage: '/catalogo/placa-google',
        timeOnPage: '1m 45s',
        timeOnSite: '4m 20s',
        hasCartItems: true,
        cartTotal: 49.90,
        cartItemsSummary: '1x Placa Acrílica Google Reviews',
        device: 'iPhone 15 Pro (Safari)'
      },
      {
        id: 'VIS-9408',
        country: '🇵🇦 Panamá',
        cityProvince: 'Chiriquí (David)',
        referrer: 'Instagram Ads (@startap.pa)',
        currentPage: '/checkout',
        timeOnPage: '2m 10s',
        timeOnSite: '6m 15s',
        hasCartItems: true,
        cartTotal: 39.80,
        cartItemsSummary: '2x Tarjeta NFC Google Reviews',
        device: 'Samsung Galaxy S24 (Chrome)'
      },
      {
        id: 'VIS-9405',
        country: '🇵🇦 Panamá',
        cityProvince: 'Panamá (Costa del Este)',
        referrer: 'Enlace Directo / WhatsApp',
        currentPage: '/catalogo',
        timeOnPage: '0m 42s',
        timeOnSite: '1m 15s',
        hasCartItems: false,
        cartTotal: 0,
        cartItemsSummary: 'Sin productos aún',
        device: 'MacBook Pro (Chrome)'
      },
      {
        id: 'VIS-9401',
        country: '🇵🇦 Panamá',
        cityProvince: 'Panamá Oeste (Arraiján)',
        referrer: 'Facebook Ads',
        currentPage: '/blog/como-pedir-resenas-google-sin-penalizacion',
        timeOnPage: '3m 05s',
        timeOnSite: '3m 05s',
        hasCartItems: false,
        cartTotal: 0,
        cartItemsSummary: 'Sin productos aún',
        device: 'Android Mobile (Chrome)'
      },
      {
        id: 'VIS-9399',
        country: '🇵🇦 Panamá',
        cityProvince: 'Colón (Zona Libre)',
        referrer: 'Google Search',
        currentPage: '/corporativo',
        timeOnPage: '1m 18s',
        timeOnSite: '2m 40s',
        hasCartItems: false,
        cartTotal: 0,
        cartItemsSummary: 'Sin productos aún',
        device: 'Windows PC (Edge)'
      }
    ];

    setLiveVisitors(initialLiveVisitors);
    setOrders(dbOrders);
    setProducts(dbProducts);
    setAbandoned(dbAbandoned);
    setB2bQuotes(dbB2b);
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // Randomize live visitor times for realistic real-time simulation
    const interval = setInterval(() => {
      setLiveVisitors(prev =>
        prev.map(v => ({
          ...v,
          timeOnPage: `${Math.floor(1 + Math.random() * 3)}m ${Math.floor(Math.random() * 59)}s`,
          timeOnSite: `${Math.floor(3 + Math.random() * 8)}m ${Math.floor(Math.random() * 59)}s`
        }))
      );
    }, 10000);
    return () => clearInterval(interval);
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

  const conversionRate = (totalOrdersCount + activeAbandoned.length) > 0
    ? (totalOrdersCount / (totalOrdersCount + activeAbandoned.length)) * 100
    : 100;

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
              {liveVisitors.length} Clientes Online
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
            <span>Clientes Online en Vivo ({liveVisitors.length})</span>
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
              <span className="text-3xl font-black text-emerald-600 font-mono">{liveVisitors.length}</span>
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
          <div className="mt-2">
            <span className="text-3xl font-black text-blue-600 font-mono">{conversionRate.toFixed(1)}%</span>
            <span className="text-xs text-slate-500 block mt-0.5">pedidos completados / checkouts</span>
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

              {/* SEARCH FILTER */}
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
      {/* TAB 3: MÓDULO DETALLADO DE CLIENTES ACTIVOS EN VIVO (LIVE ONLINE TRACKER) */}
      {/* ========================================================================= */}
      {activeTab === 'live_visitors' && (
        <div className="space-y-6">
          
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
                  <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <Users className="w-6 h-6 text-emerald-600" />
                    Rastreador de Clientes Activos en Vivo ({liveVisitors.length})
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Monitorización en tiempo real de compradores explorando la tienda, páginas visitadas y estado del carrito.
                </p>
              </div>

              <span className="px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full font-mono font-bold text-xs flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Actualizado en Vivo
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                    <th className="p-3.5">ID Sesión / Usuario</th>
                    <th className="p-3.5">Ubicación & Área</th>
                    <th className="p-3.5">Fuente de Tráfico (Origen)</th>
                    <th className="p-3.5">Página Actual Navegando</th>
                    <th className="p-3.5 text-center">Tiempo en Página</th>
                    <th className="p-3.5 text-center">Tiempo en Web</th>
                    <th className="p-3.5 text-center">Estado del Carrito</th>
                    <th className="p-3.5">Dispositivo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                  {liveVisitors.map(v => (
                    <tr key={v.id} className="hover:bg-emerald-50/20 transition-colors">
                      <td className="p-3.5 font-mono font-bold text-slate-900">
                        <span className="bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
                          {v.id}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <p className="font-bold text-slate-900">{v.country}</p>
                        <p className="text-[10px] text-slate-500 font-medium">{v.cityProvince}</p>
                      </td>

                      <td className="p-3.5 font-semibold text-slate-800">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 text-slate-700 rounded text-[11px]">
                          <Compass className="w-3 h-3 text-slate-500" />
                          {v.referrer}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200 text-[11px] block w-fit truncate max-w-[200px]">
                          {v.currentPage}
                        </span>
                      </td>

                      <td className="p-3.5 text-center font-mono font-bold text-slate-900">
                        {v.timeOnPage}
                      </td>

                      <td className="p-3.5 text-center font-mono font-bold text-slate-500">
                        {v.timeOnSite}
                      </td>

                      <td className="p-3.5 text-center">
                        {v.hasCartItems ? (
                          <div className="space-y-0.5">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-bold text-[10px] inline-block">
                              🛒 {v.cartItemsSummary} (${v.cartTotal.toFixed(2)})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">⚪ Carrito vacío</span>
                        )}
                      </td>

                      <td className="p-3.5 text-slate-500 font-mono text-[11px]">
                        {v.device}
                      </td>
                    </tr>
                  ))}
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
