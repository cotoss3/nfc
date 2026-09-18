'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { dbLocal, Order, NfcCard, Product, AbandonedCheckout, supabase } from '@/lib/db';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  ShoppingBag,
  ShoppingCart,
  Users,
  AlertTriangle,
  QrCode,
  CreditCard,
  Layers,
  MapPin,
  TrendingUp,
  Package,
  Plus,
  RefreshCw,
  Copy,
  Check,
  Filter,
  ExternalLink,
  Activity,
  PieChart
} from 'lucide-react';

export default function InventarioPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [cards, setCards] = useState<NfcCard[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [abandoned, setAbandoned] = useState<AbandonedCheckout[]>([]);
  const [loading, setLoading] = useState(true);

  // Period Filter State
  const [period, setPeriod] = useState<'hoy' | 'ayer' | 'semana' | 'mes' | 'custom'>('mes');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // TAG Creation State
  const [tagCode, setTagCode] = useState('');
  const [tagLabel, setTagLabel] = useState('');
  const [tagUrl, setTagUrl] = useState('');
  const [tagType, setTagType] = useState('google');
  const [tagChannels, setTagChannels] = useState<'both' | 'nfc' | 'qr'>('both');
  const [tagOwnerEmail, setTagOwnerEmail] = useState('');
  const [tagOwnerName, setTagOwnerName] = useState('');
  const [tagSuccessMsg, setTagSuccessMsg] = useState('');

  // Live online users count simulation (2-8 active shoppers)
  const [onlineUsers, setOnlineUsers] = useState(4);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    let dbOrders = dbLocal.getOrders();
    let dbCards = dbLocal.getCards();
    let dbProducts = dbLocal.getProducts();
    let dbAbandoned = dbLocal.getAbandonedCheckouts();

    if (supabase) {
      try {
        const [resOrders, resCards, resProducts, resAbandoned] = await Promise.all([
          supabase.from('orders').select('*').order('created_at', { ascending: false }),
          supabase.from('nfc_cards').select('*').order('created_at', { ascending: false }),
          supabase.from('products').select('*'),
          supabase.from('abandoned_checkouts').select('*').order('created_at', { ascending: false }),
        ]);

        if (!resOrders.error && resOrders.data && resOrders.data.length > 0) dbOrders = resOrders.data as Order[];
        if (!resCards.error && resCards.data && resCards.data.length > 0) dbCards = resCards.data as NfcCard[];
        if (!resProducts.error && resProducts.data && resProducts.data.length > 0) dbProducts = resProducts.data as Product[];
        if (!resAbandoned.error && resAbandoned.data && resAbandoned.data.length > 0) dbAbandoned = resAbandoned.data as AbandonedCheckout[];
      } catch (err) {
        console.error('Error sincronizando con Supabase:', err);
      }
    }

    setOrders(dbOrders);
    setCards(dbCards);
    setProducts(dbProducts);
    setAbandoned(dbAbandoned);
    setTagCode(dbLocal.getNextStickerCode());
    setLoading(false);
  };

  useEffect(() => {
    loadData();

    // Randomize live online users simulation
    const interval = setInterval(() => {
      setOnlineUsers(Math.floor(3 + Math.random() * 6));
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  // Filter orders by selected date period
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter(o => {
      const date = new Date(o.created_at);

      if (period === 'hoy') {
        return date.toDateString() === now.toDateString();
      }
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
      if (period === 'custom') {
        if (startDate && endDate) {
          const start = new Date(startDate);
          const end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
          return date >= start && date <= end;
        }
      }
      return true;
    });
  }, [orders, period, startDate, endDate]);

  // Financial Metrics Calculation
  const totalRevenue = useMemo(() => {
    return filteredOrders
      .filter(o => o.payment_status === 'completed')
      .reduce((sum, o) => sum + (o.total || 0), 0);
  }, [filteredOrders]);

  const totalProductsSold = useMemo(() => {
    return filteredOrders.reduce((sum, o) => {
      const orderItems = o.items || [];
      return sum + orderItems.reduce((iSum, item) => iSum + (item.quantity || 1), 0);
    }, 0);
  }, [filteredOrders]);

  const totalOrdersCount = filteredOrders.length;
  const avgOrderTicket = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  // Abandoned Checkouts metrics
  const activeAbandoned = useMemo(() => {
    return abandoned.filter(a => a.status === 'abandoned');
  }, [abandoned]);
  const abandonedValueAtRisk = activeAbandoned.reduce((sum, a) => sum + (a.total || 0), 0);

  // Breakdown by Product (% share)
  const productShareList = useMemo(() => {
    const map: { [prodId: string]: { name: string; qty: number; revenue: number } } = {};

    filteredOrders.forEach(o => {
      (o.items || []).forEach(item => {
        const key = item.product_id || item.product_name || 'desconocido';
        if (!map[key]) {
          map[key] = {
            name: item.product_name || key,
            qty: 0,
            revenue: 0,
          };
        }
        map[key].qty += item.quantity || 1;
        map[key].revenue += (item.price || 0) * (item.quantity || 1);
      });
    });

    return Object.values(map)
      .map(p => ({
        ...p,
        percentRevenue: totalRevenue > 0 ? (p.revenue / totalRevenue) * 100 : 0,
      }))
      .sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders, totalRevenue]);

  // Breakdown by Province (% share)
  const provinceShareList = useMemo(() => {
    const map: { [province: string]: { qty: number; revenue: number } } = {};

    filteredOrders.forEach(o => {
      const prov = o.shipping_province || 'Panamá';
      if (!map[prov]) {
        map[prov] = { qty: 0, revenue: 0 };
      }
      map[prov].qty += 1;
      map[prov].revenue += o.total || 0;
    });

    return Object.entries(map)
      .map(([name, data]) => ({
        name,
        qty: data.qty,
        revenue: data.revenue,
        percent: totalOrdersCount > 0 ? (data.qty / totalOrdersCount) * 100 : 0,
      }))
      .sort((a, b) => b.qty - a.qty);
  }, [filteredOrders, totalOrdersCount]);

  // Create new TAG/Link handler
  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagCode.trim()) return alert('Por favor ingresa el código del dispositivo (ej. STT-1050)');

    const cleanEmail = tagOwnerEmail.trim().toLowerCase() || 'admin@startap.com.pa';
    const cleanName = tagOwnerName.trim() || 'Cliente starTAP';

    const newCardObj: NfcCard = {
      card_id: tagCode.trim().toUpperCase(),
      activation_code: tagCode.trim().toUpperCase(),
      owner_id: 'user-session',
      owner_name: cleanName,
      owner_email: cleanEmail,
      label: tagLabel.trim() || `Dispositivo TAP (${tagCode.trim().toUpperCase()})`,
      target_url: tagUrl.trim() || 'https://search.google.com/local/writereview?placeid=...',
      nfc_target_url: tagUrl.trim() || 'https://search.google.com/local/writereview?placeid=...',
      is_active: true,
      claimed: true,
      type: tagType,
      channels: tagChannels,
      created_at: new Date().toISOString(),
    };

    const updated = [newCardObj, ...cards];
    setCards(updated);
    dbLocal.setStorageItem('nfc_cards', updated);

    if (supabase) {
      supabase.from('nfc_cards').upsert([newCardObj]).then(({ error }) => {
        if (error) console.error('Error insertando tarjeta en Supabase:', error);
      });
    }

    setTagSuccessMsg(`¡Dispositivo "${newCardObj.card_id}" creado exitosamente!`);
    setTagLabel('');
    setTagUrl('');
    setTagOwnerEmail('');
    setTagOwnerName('');
    setTagCode(dbLocal.getNextStickerCode());
    setTimeout(() => setTagSuccessMsg(''), 4000);
  };

  const copyToClipboard = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center text-slate-500 py-24 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500" />
        <p className="font-semibold text-sm">Cargando módulo de inventario & analíticas financieras...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* HEADER & TOP CONTROL BAR */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div className="flex items-center gap-3">
          <Link
            href="/master-control"
            className="p-2.5 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <Layers className="w-6 h-6 text-amber-500" />
                Inventario & Analíticas Financieras
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {onlineUsers} Usuarios Online
              </span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Gestión de enlaces TAG, volumen de ventas por provincia, desglose por producto e indicadores clave
            </p>
          </div>
        </div>

        {/* PERIOD SELECTOR BUTTONS */}
        <div className="flex flex-wrap items-center gap-2 bg-white p-1.5 rounded-2xl border border-slate-200 shadow-2xs">
          <button
            type="button"
            onClick={() => setPeriod('hoy')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              period === 'hoy' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Hoy
          </button>
          <button
            type="button"
            onClick={() => setPeriod('ayer')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              period === 'ayer' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Ayer
          </button>
          <button
            type="button"
            onClick={() => setPeriod('semana')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              period === 'semana' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Esta Semana
          </button>
          <button
            type="button"
            onClick={() => setPeriod('mes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              period === 'mes' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Este Mes
          </button>
          <button
            type="button"
            onClick={() => setPeriod('custom')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
              period === 'custom' ? 'bg-slate-950 text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Rango Personalizado
          </button>
        </div>
      </div>

      {/* CUSTOM DATE RANGE PICKER (IF CUSTOM SELECTED) */}
      {period === 'custom' && (
        <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-4 flex flex-wrap items-center gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-amber-700" />
            <span className="font-bold text-amber-900">Fecha Inicio:</span>
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="bg-white border border-amber-300 rounded-xl px-3 py-1.5 font-medium outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="font-bold text-amber-900">Fecha Fin:</span>
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className="bg-white border border-amber-300 rounded-xl px-3 py-1.5 font-medium outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      )}

      {/* FINANCIAL KPI CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-slate-950 text-white p-4 rounded-2xl shadow-md border border-slate-800 flex flex-col justify-between">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Venta Total</span>
          <div className="mt-2">
            <span className="text-2xl font-black text-amber-400 font-mono">${totalRevenue.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">USD en periodo</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs flex flex-col justify-between">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Productos Vendidos</span>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{totalProductsSold}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">unidades</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs flex flex-col justify-between">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Total Órdenes</span>
          <div className="mt-2">
            <span className="text-2xl font-black text-slate-900 font-mono">{totalOrdersCount}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">pedidos procesados</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs flex flex-col justify-between">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Ticket Promedio</span>
          <div className="mt-2">
            <span className="text-2xl font-black text-emerald-600 font-mono">${avgOrderTicket.toFixed(2)}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">por orden</span>
          </div>
        </div>

        <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs flex flex-col justify-between">
          <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Usuarios Online</span>
          <div className="mt-2">
            <span className="text-2xl font-black text-blue-600 font-mono">{onlineUsers}</span>
            <span className="text-[10px] text-slate-400 block mt-0.5">activos ahora</span>
          </div>
        </div>

        <div className="bg-white border border-rose-200 p-4 rounded-2xl shadow-2xs flex flex-col justify-between">
          <span className="text-rose-600 text-[10px] font-bold uppercase tracking-wider block">Carritos Abandonados</span>
          <div className="mt-2">
            <span className="text-2xl font-black text-rose-700 font-mono">{activeAbandoned.length}</span>
            <span className="text-[10px] text-rose-500 font-bold block mt-0.5">${abandonedValueAtRisk.toFixed(2)} en riesgo</span>
          </div>
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT: TAG CREATION & GEOGRAPHIC DEMAND */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: NUEVA CREACIÓN Y ASIGNACIÓN DE TAG NFC/QR */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-500" />
                Crear & Asignar Dispositivo TAG (NFC/QR)
              </h2>
              <p className="text-xs text-slate-500">Programa un nuevo código de pegatina STT-XXXX a una URL de destino.</p>
            </div>
          </div>

          {tagSuccessMsg && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
              <Check className="w-4 h-4 text-emerald-600" />
              <span>{tagSuccessMsg}</span>
            </div>
          )}

          <form onSubmit={handleCreateTag} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Código de Pegatina (TAG ID) *</label>
                <input
                  type="text"
                  required
                  value={tagCode}
                  onChange={e => setTagCode(e.target.value)}
                  placeholder="Ej. STT-1050"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Etiqueta / Nombre del Local *</label>
                <input
                  type="text"
                  required
                  value={tagLabel}
                  onChange={e => setTagLabel(e.target.value)}
                  placeholder="Ej. Placa Mostrador - Café Panamá"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">URL de Destino (Redirección NFC / QR) *</label>
              <input
                type="url"
                required
                value={tagUrl}
                onChange={e => setTagUrl(e.target.value)}
                placeholder="https://search.google.com/local/writereview?placeid=..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tipo de Ficha / Red</label>
                <select
                  value={tagType}
                  onChange={e => setTagType(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="google">Google Reviews ⭐</option>
                  <option value="tripadvisor">TripAdvisor 🦉</option>
                  <option value="instagram">Instagram 📸</option>
                  <option value="vcard">vCard / Contacto 👤</option>
                  <option value="airbnb">Airbnb 🏠</option>
                  <option value="custom">Personalizado 🔗</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Canales Habilitados</label>
                <select
                  value={tagChannels}
                  onChange={e => setTagChannels(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="both">NFC + Código QR (Ambos)</option>
                  <option value="nfc">Solo NFC Contactless</option>
                  <option value="qr">Solo Código QR</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Email del Propietario</label>
                <input
                  type="email"
                  value={tagOwnerEmail}
                  onChange={e => setTagOwnerEmail(e.target.value)}
                  placeholder="cliente@correo.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nombre del Propietario</label>
                <input
                  type="text"
                  value={tagOwnerName}
                  onChange={e => setTagOwnerName(e.target.value)}
                  placeholder="Nombre de la empresa o cliente"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 text-amber-400" />
              <span>Crear y Registrar Dispositivo TAG</span>
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: COBERTURA POR ÁREA Y PROVINCIA DE PANAMÁ */}
        <div className="lg:col-span-6 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <MapPin className="w-5 h-5 text-emerald-600" />
                Ventas y Cobertura por Área (🇵🇦 Panamá)
              </h2>
              <p className="text-xs text-slate-500">Distribución de demanda por provincia en el periodo seleccionado.</p>
            </div>
            <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {provinceShareList.length} provincias
            </span>
          </div>

          <div className="space-y-3.5">
            {provinceShareList.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-8 text-center">No hay datos de ventas en este periodo.</p>
            ) : (
              provinceShareList.map(prov => (
                <div key={prov.name} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-900">{prov.name}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-500">{prov.qty} {prov.qty === 1 ? 'orden' : 'órdenes'}</span>
                      <span className="font-mono font-black text-slate-900">${prov.revenue.toFixed(2)}</span>
                      <span className="font-mono font-bold text-emerald-600 min-w-[42px] text-right">
                        {prov.percent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(4, prov.percent)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* PRODUCT PERFORMANCE & MARKET SHARE TABLE */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs space-y-4">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <PieChart className="w-5 h-5 text-amber-500" />
              Desglose de Ventas por Producto & % del Comercio Total
            </h2>
            <p className="text-xs text-slate-500">Participación porcentual sobre el volumen total de ventas en Panamá.</p>
          </div>
        </div>

        <div className="overflow-x-auto p-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                <th className="p-3.5">Producto</th>
                <th className="p-3.5 text-center">Unidades Vendidas</th>
                <th className="p-3.5 text-right">Ingreso Generado ($ USD)</th>
                <th className="p-3.5">% Participación Comercio</th>
                <th className="p-3.5 text-center">Barra de Cobertura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {productShareList.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                    No se registran ventas de productos en el periodo seleccionado.
                  </td>
                </tr>
              ) : (
                productShareList.map(prod => (
                  <tr key={prod.name} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-bold text-slate-900 max-w-xs truncate">
                      {prod.name}
                    </td>

                    <td className="p-3.5 text-center font-mono font-bold text-slate-800">
                      {prod.qty} ud.
                    </td>

                    <td className="p-3.5 text-right font-mono font-black text-slate-900">
                      ${prod.revenue.toFixed(2)} USD
                    </td>

                    <td className="p-3.5 font-mono font-bold text-amber-700">
                      {prod.percentRevenue.toFixed(1)}%
                    </td>

                    <td className="p-3.5 text-center min-w-[140px]">
                      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-amber-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(5, prod.percentRevenue)}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DISPOSITIVOS EN INVENTARIO (LISTA DE TAGS CREADOS) */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs space-y-4">
        <div className="p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <QrCode className="w-5 h-5 text-slate-700" />
              Inventario de Dispositivos TAG Registrados ({cards.length})
            </h2>
            <p className="text-xs text-slate-500">Listado de códigos de pegatinas STT-XXXX programados y activos.</p>
          </div>
        </div>

        <div className="overflow-x-auto p-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                <th className="p-3.5">Código TAG</th>
                <th className="p-3.5">Etiqueta / Nombre</th>
                <th className="p-3.5">Red / Tipo</th>
                <th className="p-3.5">Propietario / Cliente</th>
                <th className="p-3.5 text-center">Canales</th>
                <th className="p-3.5 text-center">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {cards.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400 italic">
                    No hay dispositivos TAG registrados en inventario.
                  </td>
                </tr>
              ) : (
                cards.slice(0, 15).map(c => {
                  const redirectUrl = `https://startap.com.pa/r/${c.card_id}`;
                  return (
                    <tr key={c.card_id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3.5 font-mono font-black text-slate-900">
                        <span className="bg-slate-100 border border-slate-300 px-2 py-0.5 rounded-md">
                          {c.card_id}
                        </span>
                      </td>

                      <td className="p-3.5 font-bold text-slate-900 max-w-xs truncate">
                        {c.label || 'Sin etiqueta'}
                      </td>

                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded font-bold uppercase text-[10px] border border-amber-200">
                          {c.type || 'google'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <p className="font-semibold text-slate-800">{c.owner_name || 'Sin asignar'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">{c.owner_email}</p>
                      </td>

                      <td className="p-3.5 text-center font-bold text-[10px] uppercase">
                        {c.channels === 'both' ? 'NFC + QR' : c.channels === 'nfc' ? 'Solo NFC' : 'Solo QR'}
                      </td>

                      <td className="p-3.5 text-center">
                        <button
                          type="button"
                          onClick={() => copyToClipboard(redirectUrl, c.card_id)}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold transition"
                        >
                          {copiedId === c.card_id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span className="text-emerald-700">¡Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-slate-500" />
                              <span>Copiar Enlace</span>
                            </>
                          )}
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
  );
}
