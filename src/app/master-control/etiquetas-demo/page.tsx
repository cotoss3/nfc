'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { dbLocal, NfcCard, supabase } from '@/lib/db';
import {
  Gift,
  QrCode,
  Search,
  RefreshCw,
  Plus,
  Boxes,
  ExternalLink,
  Copy,
  Check,
  Edit2,
  Trash2,
  Eye,
  Activity,
  CheckCircle2,
  Sparkles,
  Sliders,
  Globe,
  Smartphone,
  Save,
  X,
  AlertCircle,
  Download,
  Filter
} from 'lucide-react';

export default function EtiquetasDemoPage() {
  const [cards, setCards] = useState<NfcCard[]>([]);
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Filtros y búsqueda
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [urlFilter, setUrlFilter] = useState<'all' | 'configured' | 'unconfigured'>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');

  // Formulario nueva demo
  const [newCardId, setNewCardId] = useState('STTD-1001');
  const [newLabel, setNewLabel] = useState('');
  const [newTargetUrl, setNewTargetUrl] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newType, setNewType] = useState('google');
  const [newChannels, setNewChannels] = useState<'both' | 'nfc' | 'qr'>('both');
  const [newIsActive, setNewIsActive] = useState(true);
  const [createSuccessMsg, setCreateSuccessMsg] = useState('');

  // Tabs de creación: Individual o En Lote
  const [createTab, setCreateTab] = useState<'single' | 'bulk'>('single');

  // Modal de edición rápida
  const [editingCard, setEditingCard] = useState<NfcCard | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editTargetUrl, setEditTargetUrl] = useState('');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editOwnerEmail, setEditOwnerEmail] = useState('');
  const [editType, setEditType] = useState('google');
  const [editChannels, setEditChannels] = useState<'both' | 'nfc' | 'qr'>('both');
  const [editIsActive, setEditIsActive] = useState(true);

  // Edición inline rápida de URL por fila
  const [inlineEditingId, setInlineEditingId] = useState<string | null>(null);
  const [inlineUrlVal, setInlineUrlVal] = useState('');

  // Configuración de creación en lote
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkQuantity, setBulkQuantity] = useState(10);
  const [bulkStartPrefix, setBulkStartPrefix] = useState('STTD-');
  const [bulkDefaultUrl, setBulkDefaultUrl] = useState('');
  const [bulkType, setBulkType] = useState('google');
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState('');

  // Modal QR
  const [qrModalCard, setQrModalCard] = useState<NfcCard | null>(null);

  // Feedback de copiado
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    let dbCards = dbLocal.getCards();
    let dbScans = dbLocal.getStorageItem<any[]>('nfc_scans', []);

    if (supabase) {
      try {
        const [resCards, resScans] = await Promise.all([
          supabase.from('nfc_cards').select('*').order('created_at', { ascending: false }),
          supabase.from('scans').select('*').order('created_at', { ascending: false }).limit(200),
        ]);

        if (!resCards.error && resCards.data && resCards.data.length > 0) {
          dbCards = resCards.data as NfcCard[];
          dbLocal.setStorageItem('nfc_cards', dbCards);
        }
        if (!resScans.error && resScans.data && resScans.data.length > 0) {
          dbScans = resScans.data as any[];
        }
      } catch (err) {
        console.error('Error cargando demos desde Supabase:', err);
      }
    }

    setCards(dbCards);
    setScans(dbScans);

    const nextCode = dbLocal.getNextStickerCode('demo');
    setNewCardId(nextCode);
    setNewLabel(`Muestra Demo (${nextCode})`);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtrar solo las tarjetas Demo (STTD- o tipo_activacion === 'prueba')
  const demoCards = useMemo(() => {
    return cards.filter(card => {
      const codeUpper = (card.card_id || card.activation_code || '').toUpperCase();
      const isDemo = codeUpper.startsWith('STTD-') || card.tipo_activacion === 'prueba' || card.type === 'demo';
      return isDemo;
    });
  }, [cards]);

  // Lista filtrada para la tabla
  const filteredDemoCards = useMemo(() => {
    return demoCards.filter(card => {
      const q = searchQuery.toLowerCase().trim();
      const code = (card.card_id || '').toLowerCase();
      const label = (card.label || '').toLowerCase();
      const owner = (card.owner_name || '').toLowerCase();
      const email = (card.owner_email || '').toLowerCase();
      const url = (card.target_url || '').toLowerCase();

      const matchSearch =
        !q ||
        code.includes(q) ||
        label.includes(q) ||
        owner.includes(q) ||
        email.includes(q) ||
        url.includes(q);

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && card.is_active) ||
        (statusFilter === 'inactive' && !card.is_active);

      const hasValidUrl = card.target_url && !card.target_url.includes('...') && card.target_url.trim().length > 10;
      const matchUrl =
        urlFilter === 'all' ||
        (urlFilter === 'configured' && hasValidUrl) ||
        (urlFilter === 'unconfigured' && !hasValidUrl);

      const matchPlatform =
        platformFilter === 'all' || (card.type || 'google') === platformFilter;

      return matchSearch && matchStatus && matchUrl && matchPlatform;
    });
  }, [demoCards, searchQuery, statusFilter, urlFilter, platformFilter]);

  // Estadísticas KPI de Demos
  const stats = useMemo(() => {
    const total = demoCards.length;
    const active = demoCards.filter(c => c.is_active).length;
    const inactive = demoCards.filter(c => !c.is_active).length;
    const configured = demoCards.filter(c => c.target_url && !c.target_url.includes('...') && c.target_url.trim().length > 10).length;
    const unconfigured = total - configured;

    const demoCodes = new Set(demoCards.map(c => (c.card_id || '').toUpperCase()));
    const demoScansCount = scans.filter(s => demoCodes.has((s.card_id || '').toUpperCase())).length;

    return { total, active, inactive, configured, unconfigured, demoScansCount };
  }, [demoCards, scans]);

  // Previsualización de correlativo en lote
  const bulkPreviewRange = useMemo(() => {
    let maxNum = 1000;
    cards.forEach(c => {
      const codeId = (c.activation_code || c.card_id || '').toUpperCase();
      const match = codeId.match(/^STTD-(\d+)/i);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });
    const qty = Math.max(1, bulkQuantity);
    return {
      startCode: `STTD-${maxNum + 1}`,
      endCode: `STTD-${maxNum + qty}`,
    };
  }, [cards, bulkQuantity]);

  // Copiar al portapapeles
  const copyToClipboard = (text: string, id: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  // Alternar estado activo / inactivo
  const handleToggleActive = (cardId: string, currentStatus: boolean) => {
    const nextStatus = !currentStatus;
    const updated = cards.map(c => (c.card_id === cardId ? { ...c, is_active: nextStatus } : c));
    setCards(updated);
    dbLocal.setStorageItem('nfc_cards', updated);

    if (supabase) {
      supabase.from('nfc_cards').update({ is_active: nextStatus }).eq('card_id', cardId).then(({ error }) => {
        if (error) console.error('Error actualizando estado en Supabase:', error);
      });
    }
  };

  // Crear nueva demo individual
  const handleCreateDemoCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardId.trim()) return alert('Por favor ingresa un código serial para la etiqueta Demo (ej. STTD-1001)');

    const cleanCode = newCardId.trim().toUpperCase();
    const cleanEmail = newOwnerEmail.trim().toLowerCase() || 'demo@startap.com.pa';
    const cleanName = newOwnerName.trim() || 'Prospecto / Muestra Regalo';

    const newCardObj: NfcCard = {
      card_id: cleanCode,
      activation_code: cleanCode,
      owner_id: 'demo-sample',
      owner_name: cleanName,
      owner_email: cleanEmail,
      label: newLabel.trim() || `Muestra Demo (${cleanCode})`,
      target_url: newTargetUrl.trim() || 'https://search.google.com/local/writereview?placeid=...',
      nfc_target_url: newTargetUrl.trim() || 'https://search.google.com/local/writereview?placeid=...',
      qr_target_url: newTargetUrl.trim() || 'https://search.google.com/local/writereview?placeid=...',
      is_active: newIsActive,
      claimed: true,
      estado: newTargetUrl.trim() ? 'configurado' : 'asignado',
      tipo_activacion: 'prueba',
      precio_venta: 0,
      type: newType,
      channels: newChannels,
      created_at: new Date().toISOString(),
    };

    const existingIdx = cards.findIndex(c => c.card_id === cleanCode);
    let updated: NfcCard[];
    if (existingIdx !== -1) {
      updated = [...cards];
      updated[existingIdx] = newCardObj;
    } else {
      updated = [newCardObj, ...cards];
    }

    setCards(updated);
    dbLocal.setStorageItem('nfc_cards', updated);

    if (supabase) {
      supabase.from('nfc_cards').upsert([newCardObj]).then(({ error }) => {
        if (error) console.error('Error guardando etiqueta demo en Supabase:', error);
      });
    }

    setCreateSuccessMsg(`¡Etiqueta Demo "${cleanCode}" creada con éxito!`);
    const nextCode = dbLocal.getNextStickerCode('demo');
    setNewCardId(nextCode);
    setNewLabel(`Muestra Demo (${nextCode})`);
    setNewTargetUrl('');
    setNewOwnerName('');
    setNewOwnerEmail('');
    setTimeout(() => setCreateSuccessMsg(''), 4000);
  };

  // Guardar edición rápida inline de URL
  const handleSaveInlineUrl = (cardId: string) => {
    const cleanUrl = inlineUrlVal.trim();
    if (!cleanUrl) return;

    const targetCard = cards.find(c => c.card_id === cardId);
    if (!targetCard) return;

    const updatedCard: NfcCard = {
      ...targetCard,
      target_url: cleanUrl,
      nfc_target_url: cleanUrl,
      qr_target_url: cleanUrl,
      estado: 'configurado',
    };

    const updatedList = cards.map(c => (c.card_id === cardId ? updatedCard : c));
    setCards(updatedList);
    dbLocal.setStorageItem('nfc_cards', updatedList);

    if (supabase) {
      supabase.from('nfc_cards').update({
        target_url: cleanUrl,
        nfc_target_url: cleanUrl,
        qr_target_url: cleanUrl,
      }).eq('card_id', cardId).then(({ error }) => {
        if (error) console.error('Error actualizando URL inline en Supabase:', error);
      });
    }

    setInlineEditingId(null);
    setInlineUrlVal('');
  };

  // Abrir modal de edición completa
  const handleOpenEditModal = (card: NfcCard) => {
    setEditingCard(card);
    setEditLabel(card.label || '');
    setEditTargetUrl(card.target_url || '');
    setEditOwnerName(card.owner_name || '');
    setEditOwnerEmail(card.owner_email || '');
    setEditType(card.type || 'google');
    setEditChannels(card.channels || 'both');
    setEditIsActive(card.is_active);
  };

  // Guardar edición modal
  const handleSaveCardEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    const cleanUrl = editTargetUrl.trim();
    const updatedCard: NfcCard = {
      ...editingCard,
      label: editLabel.trim(),
      target_url: cleanUrl,
      nfc_target_url: cleanUrl,
      qr_target_url: cleanUrl,
      type: editType,
      channels: editChannels,
      owner_name: editOwnerName.trim() || 'Prospecto / Muestra Regalo',
      owner_email: editOwnerEmail.trim().toLowerCase() || 'demo@startap.com.pa',
      is_active: editIsActive,
      estado: cleanUrl ? 'configurado' : 'asignado',
    };

    const updatedList = cards.map(c => (c.card_id === editingCard.card_id ? updatedCard : c));
    setCards(updatedList);
    dbLocal.setStorageItem('nfc_cards', updatedList);

    if (supabase) {
      supabase.from('nfc_cards').upsert([updatedCard]).then(({ error }) => {
        if (error) console.error('Error guardando cambios en Supabase:', error);
      });
    }

    setEditingCard(null);
  };

  // Generar lote de etiquetas demo consecutivas
  const handleGenerateBulk = (e: React.FormEvent) => {
    e.preventDefault();
    const qty = Math.min(50, Math.max(1, bulkQuantity));
    const newDemoList: NfcCard[] = [];
    const now = new Date().toISOString();

    // Obtener número máximo actual STTD
    let maxNum = 1000;
    cards.forEach(c => {
      const codeId = (c.activation_code || c.card_id || '').toUpperCase();
      const match = codeId.match(/^STTD-(\d+)/i);
      if (match && match[1]) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) maxNum = num;
      }
    });

    for (let i = 1; i <= qty; i++) {
      const serialNum = maxNum + i;
      const serialCode = `STTD-${serialNum}`;
      const newCard: NfcCard = {
        card_id: serialCode,
        activation_code: serialCode,
        owner_id: 'demo-sample',
        owner_name: 'Muestra de Regalo Disponible',
        owner_email: 'demo@startap.com.pa',
        label: `Muestra Demo (${serialCode})`,
        target_url: bulkDefaultUrl.trim() || 'https://search.google.com/local/writereview?placeid=...',
        nfc_target_url: bulkDefaultUrl.trim() || 'https://search.google.com/local/writereview?placeid=...',
        qr_target_url: bulkDefaultUrl.trim() || 'https://search.google.com/local/writereview?placeid=...',
        is_active: true,
        claimed: true,
        estado: bulkDefaultUrl.trim() ? 'configurado' : 'asignado',
        tipo_activacion: 'prueba',
        precio_venta: 0,
        type: bulkType,
        channels: 'both',
        created_at: now,
      };
      newDemoList.push(newCard);
    }

    const merged = [...newDemoList, ...cards];
    setCards(merged);
    dbLocal.setStorageItem('nfc_cards', merged);

    if (supabase) {
      supabase.from('nfc_cards').upsert(newDemoList).then(({ error }) => {
        if (error) console.error('Error insertando lote en Supabase:', error);
      });
    }

    setBulkSuccessMsg(`¡Lote de ${qty} etiquetas Demo creadas exitosamente (${newDemoList[0]?.card_id} a ${newDemoList[newDemoList.length - 1]?.card_id})!`);
    const nextCode = dbLocal.getNextStickerCode('demo');
    setNewCardId(nextCode);
    setTimeout(() => {
      setBulkSuccessMsg('');
      setIsBulkModalOpen(false);
    }, 2500);
  };

  // Exportar etiquetas demo a CSV
  const handleExportCSV = () => {
    if (demoCards.length === 0) return alert('No hay etiquetas demo para exportar.');

    const headers = ['Serial STTD', 'Etiqueta / Negocio', 'Plataforma', 'URL Redireccion', 'Prospecto', 'Email', 'Estado', 'Enlace Redirect'];
    const rows = demoCards.map(c => [
      c.card_id,
      `"${(c.label || '').replace(/"/g, '""')}"`,
      c.type || 'google',
      `"${(c.target_url || '').replace(/"/g, '""')}"`,
      `"${(c.owner_name || '').replace(/"/g, '""')}"`,
      c.owner_email || '',
      c.is_active ? 'Activo' : 'Inactivo',
      `https://startap.com.pa/r/${c.card_id}`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `etiquetas_demo_sttd_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center text-slate-500 py-24 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500" />
        <p className="font-semibold text-sm">Cargando módulo de Etiquetas Demo (STTD-1001)...</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 font-sans">
      
      {/* HEADER PRINCIPAL */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-md">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Control de Etiquetas Demo & Regalos
              </h1>
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-mono font-black">
                STTD-1001+
              </span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Gestión ágil de etiquetas para prospectos. <strong>Sin redirección automática forzada</strong> (el cliente interactúa con el botón de prueba).
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setIsBulkModalOpen(true)}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition flex items-center gap-1.5 shadow-xs"
          >
            <Boxes className="w-4 h-4 text-amber-400" />
            <span>Generar Lote STTD</span>
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-2xs"
            title="Exportar listado a Excel / CSV"
          >
            <Download className="w-4 h-4 text-slate-500" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={loadData}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-1.5 shadow-2xs"
          >
            <RefreshCw className="w-4 h-4 text-amber-500" />
            <span>Sincronizar</span>
          </button>
        </div>
      </div>

      {createSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{createSuccessMsg}</span>
        </div>
      )}

      {/* KPI METRICS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl shadow-2xs">
          <span className="text-amber-900 text-[10px] font-bold uppercase tracking-wider block">Total Etiquetas Demo</span>
          <span className="text-2xl font-black text-amber-700 font-mono mt-1 block">{stats.total}</span>
          <span className="text-[10px] text-amber-800/80 block mt-0.5">con prefijo STTD-XXXX</span>
        </div>

        <div className="bg-white border border-emerald-200 p-4 rounded-2xl shadow-2xs">
          <span className="text-emerald-700 text-[10px] font-bold uppercase tracking-wider block">Demos Activas</span>
          <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">{stats.active}</span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">listas para escanear y probar</span>
        </div>

        <div className="bg-white border border-blue-200 p-4 rounded-2xl shadow-2xs">
          <span className="text-blue-700 text-[10px] font-bold uppercase tracking-wider block">Con URL Asignada</span>
          <span className="text-2xl font-black text-blue-700 font-mono mt-1 block">{stats.configured}</span>
          <span className="text-[10px] text-blue-600 block mt-0.5">{stats.unconfigured} en blanco disponibles</span>
        </div>

        <div className="bg-white border border-purple-200 p-4 rounded-2xl shadow-2xs">
          <span className="text-purple-700 text-[10px] font-bold uppercase tracking-wider block">Lecturas Registradas</span>
          <span className="text-2xl font-black text-purple-700 font-mono mt-1 block">{stats.demoScansCount}</span>
          <span className="text-[10px] text-purple-600 block mt-0.5">escaneos NFC/QR en demos</span>
        </div>
      </div>

      {/* TWO-COLUMN: CREAR NUEVA DEMO (IZQ) & LISTADO CON EDICIÓN RÁPIDA (DER) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: CREAR NUEVA DEMO (INDIVIDUAL O EN LOTE) */}
        <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3">
            <h2 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
              <Gift className="w-4 h-4 text-amber-500" />
              Crear Muestras Demo
            </h2>
            <p className="text-xs text-slate-500">Crea etiquetas para regalar a prospectos y clientes.</p>

            {/* TABS SELECTOR */}
            <div className="grid grid-cols-2 gap-1.5 mt-3 bg-slate-100 p-1 rounded-2xl">
              <button
                type="button"
                onClick={() => setCreateTab('single')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  createTab === 'single'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Plus className="w-3.5 h-3.5 text-amber-500" />
                <span>Individual</span>
              </button>

              <button
                type="button"
                onClick={() => setCreateTab('bulk')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                  createTab === 'bulk'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>En Lote (Tanda)</span>
              </button>
            </div>
          </div>

          {createTab === 'single' ? (
            <form onSubmit={handleCreateDemoCard} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Serial Demo *</label>
                <input
                  type="text"
                  required
                  value={newCardId}
                  onChange={e => setNewCardId(e.target.value)}
                  placeholder="Ej. STTD-1001"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nombre del Local / Prospecto *</label>
                <input
                  type="text"
                  required
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  placeholder="Ej. Café Bella Vista (Muestra)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">URL de Redirección (Destino Final)</label>
                <input
                  type="url"
                  value={newTargetUrl}
                  onChange={e => setNewTargetUrl(e.target.value)}
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                />
                <span className="text-[10px] text-slate-400 block mt-0.5">Puedes dejarlo en blanco y editarlo luego en 1 clic.</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tipo de Red</label>
                  <select
                    value={newType}
                    onChange={e => setNewType(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="google">Google Reviews ⭐</option>
                    <option value="instagram">Instagram 📸</option>
                    <option value="tiktok">TikTok 🎵</option>
                    <option value="whatsapp">WhatsApp 💬</option>
                    <option value="facebook">Facebook 👍</option>
                    <option value="tripadvisor">TripAdvisor 🦉</option>
                    <option value="vcard">vCard / Contacto 👤</option>
                    <option value="custom">Personalizado 🔗</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Canales</label>
                  <select
                    value={newChannels}
                    onChange={e => setNewChannels(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="both">NFC + QR (Ambos)</option>
                    <option value="nfc">Solo NFC</option>
                    <option value="qr">Solo QR</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Contacto / Negocio</label>
                  <input
                    type="text"
                    value={newOwnerName}
                    onChange={e => setNewOwnerName(e.target.value)}
                    placeholder="Persona de contacto"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email o Celular</label>
                  <input
                    type="text"
                    value={newOwnerEmail}
                    onChange={e => setNewOwnerEmail(e.target.value)}
                    placeholder="email@local.com"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <Plus className="w-4 h-4" />
                <span>Guardar Etiqueta Demo</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleGenerateBulk} className="space-y-4 text-xs">
              <div className="p-3.5 bg-amber-50/80 border border-amber-200 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-amber-950 text-xs">Cantidad en Lote *</span>
                  <div className="flex gap-1">
                    {[10, 20, 50].map(qty => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => setBulkQuantity(qty)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                          bulkQuantity === qty
                            ? 'bg-slate-950 text-amber-400 border-slate-950'
                            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        +{qty}
                      </button>
                    ))}
                  </div>
                </div>

                <input
                  type="number"
                  min="1"
                  max="100"
                  required
                  value={bulkQuantity}
                  onChange={e => setBulkQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-sm outline-none focus:ring-2 focus:ring-amber-500"
                />

                <div className="pt-1 flex items-center justify-between text-[11px] text-amber-900">
                  <span className="font-medium">Rango Correlativo:</span>
                  <span className="font-mono font-black">{bulkPreviewRange.startCode} → {bulkPreviewRange.endCode}</span>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tipo de Destino Inicial</label>
                <select
                  value={bulkType}
                  onChange={e => setBulkType(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="google">Google Reviews ⭐</option>
                  <option value="instagram">Instagram 📸</option>
                  <option value="whatsapp">WhatsApp 💬</option>
                  <option value="vcard">vCard / Contacto 👤</option>
                  <option value="custom">Personalizado 🔗</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">URL por Defecto (Opcional)</label>
                <input
                  type="url"
                  value={bulkDefaultUrl}
                  onChange={e => setBulkDefaultUrl(e.target.value)}
                  placeholder="Dejar en blanco para asignar después en 1 clic"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-[0.99]"
              >
                <Boxes className="w-4 h-4" />
                <span>Generar Lote de {bulkQuantity} Demos ({bulkPreviewRange.startCode} a {bulkPreviewRange.endCode})</span>
              </button>
            </form>
          )}
        </div>

        {/* RIGHT: TABLA DE GESTIÓN Y EDICIÓN RÁPIDA */}
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs space-y-4">
          
          {/* HEADER DE LA TABLA CON BÚSQUEDA Y FILTROS */}
          <div className="p-5 bg-slate-50 border-b border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-slate-700" />
                  Listado de Etiquetas Demo ({filteredDemoCards.length})
                </h2>
                <p className="text-xs text-slate-500">Edita la redirección o el estado de cada muestra en segundos.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-1">
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar por STTD-, nombre del local o URL..."
                  className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="sm:col-span-3">
                <select
                  value={urlFilter}
                  onChange={e => setUrlFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="all">Todas las URLs</option>
                  <option value="configured">✅ Con URL Configurada</option>
                  <option value="unconfigured">⚪ En Blanco / Sin URL</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value as any)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 outline-none cursor-pointer"
                >
                  <option value="all">Todos los Estados</option>
                  <option value="active">🟢 Activos</option>
                  <option value="inactive">🔴 Inactivos</option>
                </select>
              </div>
            </div>
          </div>

          {/* TABLA DE ETIQUETAS DEMO */}
          <div className="overflow-x-auto p-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <th className="p-3">Serial STTD</th>
                  <th className="p-3">Local / Prospecto</th>
                  <th className="p-3 min-w-[260px]">URL de Redirección (Editar)</th>
                  <th className="p-3 text-center">Estado</th>
                  <th className="p-3 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredDemoCards.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-400 italic">
                      <Gift className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                      No hay etiquetas demo que coincidan con los filtros. Crea la primera con el formulario.
                    </td>
                  </tr>
                ) : (
                  filteredDemoCards.map(c => {
                    const redirectUrl = `https://startap.com.pa/r/${c.card_id}`;
                    const isConfigured = c.target_url && !c.target_url.includes('...') && c.target_url.trim().length > 10;
                    const isEditingThis = inlineEditingId === c.card_id;

                    return (
                      <tr key={c.card_id} className="hover:bg-slate-50 transition-colors">
                        
                        {/* Serial TAG */}
                        <td className="p-3 font-mono font-black text-slate-900">
                          <div className="flex items-center gap-1.5">
                            <span className="bg-amber-100 border border-amber-300 text-amber-900 px-2 py-0.5 rounded-lg">
                              {c.card_id}
                            </span>
                            <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded font-bold uppercase">
                              {c.type || 'google'}
                            </span>
                          </div>
                        </td>

                        {/* Local / Prospecto */}
                        <td className="p-3">
                          <p className="font-bold text-slate-900">{c.label || 'Muestra Demo'}</p>
                          <p className="text-[10px] text-slate-400">{c.owner_name || 'Sin asignar'}</p>
                        </td>

                        {/* URL de Redirección con Edición Rápida */}
                        <td className="p-3">
                          {isEditingThis ? (
                            <div className="flex items-center gap-1.5">
                              <input
                                type="url"
                                value={inlineUrlVal}
                                onChange={e => setInlineUrlVal(e.target.value)}
                                placeholder="https://..."
                                className="w-full px-2.5 py-1.5 bg-white border-2 border-amber-400 rounded-lg text-xs font-mono text-slate-900 outline-none shadow-xs"
                                autoFocus
                                onKeyDown={e => {
                                  if (e.key === 'Enter') handleSaveInlineUrl(c.card_id);
                                  if (e.key === 'Escape') setInlineEditingId(null);
                                }}
                              />
                              <button
                                type="button"
                                onClick={() => handleSaveInlineUrl(c.card_id)}
                                className="p-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-2xs"
                                title="Guardar URL"
                              >
                                <Save className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => setInlineEditingId(null)}
                                className="p-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg"
                                title="Cancelar"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between group">
                              <div className="max-w-[200px] truncate text-[11px] font-mono">
                                {isConfigured ? (
                                  <span className="text-slate-800" title={c.target_url}>
                                    {c.target_url}
                                  </span>
                                ) : (
                                  <span className="text-amber-600 italic font-sans font-medium">
                                    ⚪ Sin URL (En blanco)
                                  </span>
                                )}
                              </div>
                              <button
                                type="button"
                                onClick={() => {
                                  setInlineEditingId(c.card_id);
                                  setInlineUrlVal(c.target_url && !c.target_url.includes('...') ? c.target_url : '');
                                }}
                                className="opacity-70 group-hover:opacity-100 p-1 hover:bg-amber-100 text-amber-800 rounded transition text-[10px] font-bold flex items-center gap-1 ml-2"
                                title="Editar URL en 1 clic"
                              >
                                <Edit2 className="w-3 h-3 text-amber-600" />
                                <span>Cambiar</span>
                              </button>
                            </div>
                          )}
                        </td>

                        {/* Estado */}
                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(c.card_id, c.is_active)}
                            className={`px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition ${
                              c.is_active
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 hover:bg-emerald-200'
                                : 'bg-rose-100 text-rose-800 border border-rose-300 hover:bg-rose-200'
                            }`}
                            title="Haz clic para alternar estado"
                          >
                            {c.is_active ? '🟢 Activo' : '🔴 Pausado'}
                          </button>
                        </td>

                        {/* Acciones */}
                        <td className="p-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {/* Copiar enlace */}
                            <button
                              type="button"
                              onClick={() => copyToClipboard(redirectUrl, c.card_id)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition flex items-center gap-1"
                              title="Copiar enlace de redirección"
                            >
                              {copiedId === c.card_id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-600" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-slate-500" />
                              )}
                            </button>

                            {/* Probar en nueva pestaña */}
                            <a
                              href={`/r/${c.card_id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 rounded-lg text-xs font-bold transition flex items-center gap-1"
                              title="Probar pantalla interactiva de la demo"
                            >
                              <ExternalLink className="w-3.5 h-3.5 text-amber-700" />
                            </a>

                            {/* Ver QR */}
                            <button
                              type="button"
                              onClick={() => setQrModalCard(c)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                              title="Ver código QR para sticker"
                            >
                              <QrCode className="w-3.5 h-3.5 text-slate-600" />
                            </button>

                            {/* Editar completo */}
                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(c)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                              title="Editar todos los campos"
                            >
                              <Edit2 className="w-3.5 h-3.5 text-slate-600" />
                            </button>
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

      {/* MODAL DE EDICIÓN COMPLETA */}
      {editingCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Gift className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Editar Demo {editingCard.card_id}</h3>
                  <p className="text-xs text-slate-500">Actualiza la URL de destino o el destinatario.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingCard(null)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCardEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nombre / Etiqueta del Local *</label>
                <input
                  type="text"
                  required
                  value={editLabel}
                  onChange={e => setEditLabel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">URL de Redirección (Destino Final) *</label>
                <input
                  type="url"
                  required
                  value={editTargetUrl}
                  onChange={e => setEditTargetUrl(e.target.value)}
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-medium text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tipo de Red</label>
                  <select
                    value={editType}
                    onChange={e => setEditType(e.target.value)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
                  >
                    <option value="google">Google Reviews ⭐</option>
                    <option value="instagram">Instagram 📸</option>
                    <option value="tiktok">TikTok 🎵</option>
                    <option value="whatsapp">WhatsApp 💬</option>
                    <option value="facebook">Facebook 👍</option>
                    <option value="tripadvisor">TripAdvisor 🦉</option>
                    <option value="vcard">vCard / Contacto 👤</option>
                    <option value="custom">Personalizado 🔗</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Canales Habilitados</label>
                  <select
                    value={editChannels}
                    onChange={e => setEditChannels(e.target.value as any)}
                    className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
                  >
                    <option value="both">NFC + QR (Ambos)</option>
                    <option value="nfc">Solo NFC</option>
                    <option value="qr">Solo QR</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nombre del Prospecto</label>
                  <input
                    type="text"
                    value={editOwnerName}
                    onChange={e => setEditOwnerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email o Contacto</label>
                  <input
                    type="text"
                    value={editOwnerEmail}
                    onChange={e => setEditOwnerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsActiveCheckbox"
                  checked={editIsActive}
                  onChange={e => setEditIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400"
                />
                <label htmlFor="editIsActiveCheckbox" className="font-bold text-slate-800 cursor-pointer">
                  Etiqueta Demo Activa (Permitir escaneo y redirección)
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white font-bold shadow-md flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-amber-400" />
                  <span>Guardar Cambios</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE GENERACIÓN EN LOTE */}
      {isBulkModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Boxes className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 text-base">Generar Lote de Demos</h3>
                  <p className="text-xs text-slate-500">Crea múltiples etiquetas STTD correlativas.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsBulkModalOpen(false)}
                className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {bulkSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{bulkSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleGenerateBulk} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Cantidad de Etiquetas a Crear (1 a 50) *</label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  required
                  value={bulkQuantity}
                  onChange={e => setBulkQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Prefijo Serial</label>
                <input
                  type="text"
                  disabled
                  value={bulkStartPrefix}
                  className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-xl font-mono font-bold text-slate-600"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tipo de Red por Defecto</label>
                <select
                  value={bulkType}
                  onChange={e => setBulkType(e.target.value)}
                  className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800"
                >
                  <option value="google">Google Reviews ⭐</option>
                  <option value="instagram">Instagram 📸</option>
                  <option value="whatsapp">WhatsApp 💬</option>
                  <option value="vcard">vCard / Contacto 👤</option>
                  <option value="custom">Personalizado 🔗</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">URL por Defecto (Opcional)</label>
                <input
                  type="url"
                  value={bulkDefaultUrl}
                  onChange={e => setBulkDefaultUrl(e.target.value)}
                  placeholder="Dejar en blanco para configurar después"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsBulkModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black shadow-md flex items-center gap-1.5"
                >
                  <Boxes className="w-4 h-4" />
                  <span>Crear Lote de {bulkQuantity} Demos</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL VER CÓDIGO QR */}
      {qrModalCard && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl space-y-4 animate-scaleUp">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-900 font-mono font-black text-xs rounded-lg">
                {qrModalCard.card_id}
              </span>
              <button
                type="button"
                onClick={() => setQrModalCard(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <h3 className="font-black text-slate-900 text-base">{qrModalCard.label || 'Muestra Demo'}</h3>
            <p className="text-xs text-slate-500">Escanea con la cámara de tu celular para probar el enlace.</p>

            <div className="bg-white p-4 rounded-2xl border border-slate-200 flex justify-center shadow-inner">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`https://startap.com.pa/r/${qrModalCard.card_id}?m=qr`)}`}
                alt={`Código QR ${qrModalCard.card_id}`}
                className="w-48 h-48 object-contain rounded-lg"
              />
            </div>

            <p className="text-[11px] font-mono text-slate-500 truncate">
              startap.com.pa/r/{qrModalCard.card_id}
            </p>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => copyToClipboard(`https://startap.com.pa/r/${qrModalCard.card_id}`, 'qr_modal')}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs flex items-center justify-center gap-1"
              >
                {copiedId === 'qr_modal' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copiar URL</span>
                  </>
                )}
              </button>
              <a
                href={`/r/${qrModalCard.card_id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Probar</span>
              </a>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
