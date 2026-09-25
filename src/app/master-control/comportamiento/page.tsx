'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Activity,
  Search,
  RefreshCw,
  Clock,
  MousePointerClick,
  Megaphone,
  Eye,
  ExternalLink,
  CheckCircle2,
  ShieldCheck,
  Download,
  ArrowUpDown,
  Smartphone,
  QrCode,
} from 'lucide-react';

interface TapBehaviorItem {
  card_id: string;
  activation_code: string;
  business_name: string;
  label: string;
  group_name: string;
  owner_name: string;
  owner_email: string;
  target_url: string;
  type: string;
  is_active: boolean;
  claimed: boolean;
  total_reads: number;
  nfc_reads: number;
  qr_reads: number;
  auto_time_count: number;
  cta_click_count: number;
  ad_click_count: number;
  ad_close_count: number;
  last_read_at: string | null;
  created_at: string;
}

export default function ComportamientoPage() {
  const [items, setItems] = useState<TapBehaviorItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'active' | 'with_reads' | 'all'>('active');
  const [sortBy, setSortBy] = useState<'reads' | 'cta' | 'time' | 'ad' | 'code'>('reads');

  const fetchBehavior = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/r/event', { cache: 'no-store' });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setItems(data.items);
      }
    } catch (err) {
      console.error('Error cargando métricas de comportamiento:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBehavior();
  }, []);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    const list = items.filter((item) => {
      if (statusFilter === 'active' && !item.is_active) return false;
      if (statusFilter === 'with_reads' && item.total_reads === 0) return false;

      if (q) {
        const matchCode = item.card_id.toLowerCase().includes(q);
        const matchName = item.business_name.toLowerCase().includes(q);
        const matchLabel = (item.label || '').toLowerCase().includes(q);
        const matchGroup = (item.group_name || '').toLowerCase().includes(q);
        const matchOwner = (item.owner_email || '').toLowerCase().includes(q);
        return matchCode || matchName || matchLabel || matchGroup || matchOwner;
      }
      return true;
    });

    return list.sort((a, b) => {
      if (sortBy === 'reads') {
        if (b.total_reads !== a.total_reads) return b.total_reads - a.total_reads;
        return a.card_id.localeCompare(b.card_id);
      }
      if (sortBy === 'cta') {
        if (b.cta_click_count !== a.cta_click_count) return b.cta_click_count - a.cta_click_count;
        return b.total_reads - a.total_reads;
      }
      if (sortBy === 'time') {
        if (b.auto_time_count !== a.auto_time_count) return b.auto_time_count - a.auto_time_count;
        return b.total_reads - a.total_reads;
      }
      if (sortBy === 'ad') {
        if (b.ad_click_count !== a.ad_click_count) return b.ad_click_count - a.ad_click_count;
        return b.total_reads - a.total_reads;
      }
      return a.card_id.localeCompare(b.card_id);
    });
  }, [items, searchQuery, statusFilter, sortBy]);

  const totals = useMemo(() => {
    const base = statusFilter === 'active' ? items.filter((i) => i.is_active) : filteredItems;
    let totalReads = 0;
    let autoTime = 0;
    let ctaClick = 0;
    let adClick = 0;
    let adClose = 0;

    for (const i of base) {
      totalReads += i.total_reads;
      autoTime += i.auto_time_count;
      ctaClick += i.cta_click_count;
      adClick += i.ad_click_count;
      adClose += i.ad_close_count;
    }

    return {
      activeCount: items.filter((i) => i.is_active).length,
      totalReads,
      autoTime,
      ctaClick,
      adClick,
      adClose,
    };
  }, [items, filteredItems, statusFilter]);

  const exportCsv = () => {
    const headers = [
      'Nombre de Negocio',
      'Codigo de TAP',
      'Estado',
      'Plataforma',
      'Veces Leido (Total)',
      'Lecturas NFC',
      'Lecturas QR',
      'Redirigido por Tiempo (8s)',
      'Toco Boton de Resena',
      'Toco Publicidad',
      'Cerro Publicidad (X)',
      'Ultima Lectura',
    ];

    const rows = filteredItems.map((i) => [
      `"${(i.business_name || '').replace(/"/g, '""')}"`,
      i.card_id,
      i.is_active ? 'ACTIVO' : 'INACTIVO',
      i.type || 'google',
      i.total_reads,
      i.nfc_reads,
      i.qr_reads,
      i.auto_time_count,
      i.cta_click_count,
      i.ad_click_count,
      i.ad_close_count,
      i.last_read_at ? new Date(i.last_read_at).toLocaleString('es-PA') : 'Sin lecturas',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `comportamiento_taps_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatPercent = (part: number, total: number) => {
    if (!total || total <= 0) return '0%';
    const pct = Math.min(100, Math.round((part / total) * 100));
    return `${pct}%`;
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-2xs">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-amber-600" />
            Analítica de Página Puente (/r/[id])
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Comportamiento de TAPs Activos
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
            Monitorea cuántas veces fue leído cada TAP activo, cuántos usuarios esperaron la redirección automática de 8 segundos, cuántos tocaron el botón de reseña y cuántos tocaron la publicidad.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
          >
            <Download className="w-4 h-4" />
            Exportar CSV
          </button>
          <button
            onClick={fetchBehavior}
            disabled={loading}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar Datos
          </button>
        </div>
      </div>

      {/* BANNER CUMPLIMIENTO BETTER ADS / GOOGLE */}
      <div className="bg-emerald-50/80 border border-emerald-200 rounded-2xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700 shrink-0 mt-0.5 sm:mt-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-black text-emerald-950">
              Anuncio No Invasivo Activo (Estándares Google &amp; Coalition for Better Ads)
            </h2>
            <p className="text-xs text-emerald-800 mt-0.5 leading-relaxed">
              Carga asíncrona después del bloque principal • Altura controlada (&le; 26% de la pantalla vertical, bajo el límite del 30%) • Botón de cierre (✕) visible al instante • Sin pop-ups, sin bloqueo de cuenta atrás y sin sonido.
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-emerald-200 text-emerald-800 text-[11px] font-extrabold shrink-0">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          Cumplimiento Verificado
        </span>
      </div>

      {/* TARJETAS KPI RESUMEN */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>TAPs Activos</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {totals.activeCount}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">
            Habilitados para redirigir
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Veces Leído</span>
            <Eye className="w-4 h-4 text-sky-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
            {totals.totalReads}
          </p>
          <span className="text-[11px] text-slate-500 font-medium">
            Total aperturas NFC + QR
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Por Tiempo (8s)</span>
            <Clock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-2xl sm:text-3xl font-black text-indigo-700">
              {totals.autoTime}
            </p>
            <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
              {formatPercent(totals.autoTime, totals.totalReads)}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Redirección automática
          </span>
        </div>

        <div className="bg-white border border-amber-200 rounded-2xl p-4 shadow-2xs">
          <div className="flex items-center justify-between text-amber-800 text-xs font-bold">
            <span>Botón de Reseña</span>
            <MousePointerClick className="w-4 h-4 text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-2xl sm:text-3xl font-black text-amber-600">
              {totals.ctaClick}
            </p>
            <span className="text-xs font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
              {formatPercent(totals.ctaClick, totals.totalReads)}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Toque directo en botón
          </span>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
            <span>Tocaron Publicidad</span>
            <Megaphone className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <p className="text-2xl sm:text-3xl font-black text-emerald-600">
              {totals.adClick}
            </p>
            <span className="text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
              CTR {formatPercent(totals.adClick, totals.totalReads)}
            </span>
          </div>
          <span className="text-[11px] text-slate-500 font-medium">
            Clics hacia el catálogo ({totals.adClose} cierres ✕)
          </span>
        </div>
      </div>

      {/* BARRA DE FILTROS Y BÚSQUEDA */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-2xs">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar por nombre de negocio, código de TAP (ej. STT-1001) o correo..."
            className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-amber-500 focus:bg-white font-medium text-slate-900"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
            <button
              type="button"
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'active'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              TAPs Activos ({items.filter((i) => i.is_active).length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('with_reads')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'with_reads'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Con Lecturas ({items.filter((i) => i.total_reads > 0).length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({items.length})
            </button>
          </div>

          <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="bg-transparent text-xs font-bold text-slate-800 focus:outline-hidden"
            >
              <option value="reads">Ordenar: Más veces leído</option>
              <option value="cta">Ordenar: Más toques al botón</option>
              <option value="time">Ordenar: Más redirigidos por tiempo</option>
              <option value="ad">Ordenar: Más toques a publicidad</option>
              <option value="code">Ordenar: Código de TAP</option>
            </select>
          </div>
        </div>
      </div>

      {/* TABLA PRINCIPAL DE COMPORTAMIENTO */}
      <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-600">
                <th className="py-3.5 px-4">Nombre de Negocio</th>
                <th className="py-3.5 px-4">Código de TAP</th>
                <th className="py-3.5 px-4 text-center">Veces Leído</th>
                <th className="py-3.5 px-4 text-center">Redirigido por Tiempo (8s)</th>
                <th className="py-3.5 px-4 text-center">Tocó Botón de Reseña</th>
                <th className="py-3.5 px-4 text-center">Tocó la Publicidad</th>
                <th className="py-3.5 px-4 text-right">Última Lectura</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                    Cargando comportamiento de los TAPs...
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 font-medium">
                    No se encontraron dispositivos TAP con los filtros seleccionados.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.card_id} className="hover:bg-slate-50/80 transition-colors">
                    {/* 1. NOMBRE DE NEGOCIO */}
                    <td className="py-3.5 px-4">
                      <div className="font-black text-slate-900 leading-snug">
                        {item.business_name}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                        <span className="uppercase font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {item.type || 'google'}
                        </span>
                        {item.target_url && item.target_url !== 'https://google.com' && (
                          <a
                            href={item.target_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-amber-700 hover:underline font-semibold truncate max-w-[200px]"
                            title={item.target_url}
                          >
                            <span>Ver destino</span>
                            <ExternalLink className="w-3 h-3 shrink-0" />
                          </a>
                        )}
                      </div>
                    </td>

                    {/* 2. NÚMERO DE CÓDIGO DE TAP */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-slate-950 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-xs">
                          {item.card_id}
                        </span>
                        <Link
                          href={`/r/${encodeURIComponent(item.card_id)}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
                          title="Abrir página puente de este TAP"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                      <div className="mt-1">
                        {item.is_active ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            TAP Activo
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                            Inactivo
                          </span>
                        )}
                      </div>
                    </td>

                    {/* 3. CUÁNTAS VECES FUE LEÍDO */}
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center justify-center min-w-[44px] px-2.5 py-1 rounded-xl bg-slate-900 text-white font-black text-sm">
                        {item.total_reads}
                      </span>
                      <div className="flex items-center justify-center gap-2 mt-1 text-[10px] font-bold text-slate-500">
                        <span className="inline-flex items-center gap-0.5" title="Lecturas por Chip NFC">
                          <Smartphone className="w-3 h-3 text-slate-400" />
                          {item.nfc_reads} NFC
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-0.5" title="Lecturas por Código QR">
                          <QrCode className="w-3 h-3 text-slate-400" />
                          {item.qr_reads} QR
                        </span>
                      </div>
                    </td>

                    {/* 4. CUÁNTAS VECES SE REDIRIGIÓ POR TIEMPO (8s) */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 font-black text-sm">
                        <Clock className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{item.auto_time_count}</span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 mt-1">
                        {formatPercent(item.auto_time_count, item.total_reads)} de lecturas
                      </div>
                    </td>

                    {/* 5. CUÁNTAS VECES POR TOCAR EL BOTÓN DE IR A DAR LA RESEÑA */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-black text-sm">
                        <MousePointerClick className="w-3.5 h-3.5 text-amber-600" />
                        <span>{item.cta_click_count}</span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 mt-1">
                        {formatPercent(item.cta_click_count, item.total_reads)} de lecturas
                      </div>
                    </td>

                    {/* 6. CUÁNTAS VECES TOCARON LA PUBLICIDAD */}
                    <td className="py-3.5 px-4 text-center">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-black text-sm">
                        <Megaphone className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{item.ad_click_count}</span>
                      </div>
                      <div className="text-[10px] font-bold text-slate-500 mt-1">
                        CTR {formatPercent(item.ad_click_count, item.total_reads)}
                        {item.ad_close_count > 0 ? ` • ${item.ad_close_count} ✕` : ''}
                      </div>
                    </td>

                    {/* 7. ÚLTIMA LECTURA */}
                    <td className="py-3.5 px-4 text-right text-xs text-slate-500 font-medium whitespace-nowrap">
                      {item.last_read_at
                        ? new Date(item.last_read_at).toLocaleString('es-PA', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })
                        : 'Sin lecturas aún'}
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
