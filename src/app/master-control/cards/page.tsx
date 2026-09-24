'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { dbLocal, NfcCard, ScanRecord, supabase } from '@/lib/db';
import BulkAddBatchModal from '@/components/admin/BulkAddBatchModal';
import {
  CreditCard,
  QrCode,
  Search,
  Filter,
  Plus,
  Check,
  Copy,
  Edit3,
  Trash2,
  Power,
  ExternalLink,
  Globe,
  RefreshCw,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Eye,
  Download,
  Layers,
  Sparkles,
  Radio,
  User,
  Activity,
  Boxes,
  X
} from 'lucide-react';
import { trackGA, itemsParaGA } from '@/lib/googleanalytics';

export default function CardsManagementPage() {
  const [cards, setCards] = useState<NfcCard[]>([]);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  // Total de escaneos traido como conteo del servidor (sin bajar el historico)
  const [scansCount, setScansCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'claimed' | 'unclaimed' | 'active' | 'inactive'>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | 'both' | 'nfc' | 'qr'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [hardwareFilter, setHardwareFilter] = useState<'all' | 'stand' | 'plate' | 'card'>('all');

  // Create Tag Form States
  const [newHardwareType, setNewHardwareType] = useState<'stand' | 'plate' | 'card'>('stand');
  const [newCardId, setNewCardId] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState('google');
  const [newChannels, setNewChannels] = useState<'both' | 'nfc' | 'qr'>('both');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newIsActive, setNewIsActive] = useState(true);
  const [newTipoActivacion, setNewTipoActivacion] = useState<'venta' | 'regalia' | 'prueba'>('venta');
  const [newPrecioVenta, setNewPrecioVenta] = useState<string>('35.00');
  const [newMetodoPago, setNewMetodoPago] = useState<'Yappy' | 'Efectivo' | 'ACH' | 'Tarjeta / POS'>('Yappy');
  const [createSuccessMsg, setCreateSuccessMsg] = useState('');

  // Edit Card Modal States
  const [editingCard, setEditingCard] = useState<NfcCard | null>(null);
  const [editLabel, setEditLabel] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [editType, setEditType] = useState('google');
  const [editChannels, setEditChannels] = useState<'both' | 'nfc' | 'qr'>('both');
  const [editOwnerName, setEditOwnerName] = useState('');
  const [editOwnerEmail, setEditOwnerEmail] = useState('');
  const [editIsActive, setEditIsActive] = useState(true);

  // QR Modal State
  const [qrModalCard, setQrModalCard] = useState<NfcCard | null>(null);

  // Clipboard Copied State
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Bulk Add Modal State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

  const handleSelectHardwareType = (hw: 'stand' | 'plate' | 'card') => {
    setNewHardwareType(hw);
    const code = dbLocal.getNextStickerCode(hw);
    setNewCardId(code);
    if (!newLabel || newLabel.startsWith('Stand') || newLabel.startsWith('Placa') || newLabel.startsWith('Tarjeta')) {
      const defaultName =
        hw === 'stand' ? `Stand NFC de Mesa (${code})` :
        hw === 'card' ? `Tarjeta NFC de Bolsillo (${code})` :
        `Placa NFC de Mostrador (${code})`;
      setNewLabel(defaultName);
    }
  };

  const loadData = async () => {
    setLoading(true);
    let dbCards = dbLocal.getCards();
    let dbScans = dbLocal.getStorageItem<ScanRecord[]>('nfc_scans', []);
    let totalScansRemoto: number | null = null;

    if (supabase) {
      try {
        const [resCards, resScans] = await Promise.all([
          supabase.from('nfc_cards').select('*').order('created_at', { ascending: false }),
          // La tabla se llama 'scans' (antes se leia 'nfc_scans', que no existe).
          // Solo hace falta el total, asi que se pide el conteo sin traer las filas.
          supabase.from('scans').select('*', { count: 'exact', head: true }),
        ]);

        if (!resCards.error && resCards.data && resCards.data.length > 0) {
          dbCards = resCards.data as NfcCard[];
          dbLocal.setStorageItem('nfc_cards', dbCards);
        }
        if (!resScans.error && typeof resScans.count === 'number') {
          totalScansRemoto = resScans.count;
        }
      } catch (err) {
        console.error('Error cargando tarjetas desde Supabase:', err);
      }
    }

    setCards(dbCards);
    setScans(dbScans);
    setScansCount(totalScansRemoto);
    const initialCode = dbLocal.getNextStickerCode('stand');
    setNewCardId(initialCode);
    setNewLabel(`Stand NFC de Mesa (${initialCode})`);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered Cards Memo
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        card.card_id.toLowerCase().includes(q) ||
        (card.activation_code && card.activation_code.toLowerCase().includes(q)) ||
        (card.label && card.label.toLowerCase().includes(q)) ||
        (card.owner_name && card.owner_name.toLowerCase().includes(q)) ||
        (card.owner_email && card.owner_email.toLowerCase().includes(q)) ||
        (card.target_url && card.target_url.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'claimed' && card.claimed) ||
        (statusFilter === 'unclaimed' && !card.claimed) ||
        (statusFilter === 'active' && card.is_active) ||
        (statusFilter === 'inactive' && !card.is_active);

      const matchChannel =
        channelFilter === 'all' || card.channels === channelFilter;

      const matchType =
        typeFilter === 'all' || (card.type || 'google') === typeFilter;

      const codeUpper = (card.card_id || card.activation_code || '').toUpperCase();
      const isStand = codeUpper.startsWith('STTS-') || (card.label && card.label.toLowerCase().includes('stand'));
      const isCard = codeUpper.startsWith('STTT-') || (card.label && card.label.toLowerCase().includes('tarjeta'));
      const isPlate = !isStand && !isCard;

      const matchHardware =
        hardwareFilter === 'all' ||
        (hardwareFilter === 'stand' && isStand) ||
        (hardwareFilter === 'card' && isCard) ||
        (hardwareFilter === 'plate' && isPlate);

      return matchSearch && matchStatus && matchChannel && matchType && matchHardware;
    });
  }, [cards, searchQuery, statusFilter, channelFilter, typeFilter, hardwareFilter]);

  // Statistics Summary
  const stats = useMemo(() => {
    const total = cards.length;
    const claimed = cards.filter(c => c.claimed).length;
    const active = cards.filter(c => c.is_active).length;
    const inactive = cards.filter(c => !c.is_active).length;
    const unclaimed = cards.filter(c => !c.claimed).length;
    const totalScans = scansCount !== null ? scansCount : scans.length;
    return { total, claimed, active, inactive, unclaimed, totalScans };
  }, [cards, scans, scansCount]);

  // Toggle Card Active State Directly
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

  // Create New TAG Handler
  const handleCreateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardId.trim()) return alert('Por favor ingresa un código serial para el TAG (ej. STTT-1050)');

    const cleanCode = newCardId.trim().toUpperCase();
    const cleanEmail = newOwnerEmail.trim().toLowerCase();
    const isClientEmail = Boolean(cleanEmail && cleanEmail !== 'admin@startap.com.pa' && cleanEmail !== 'info@startap.com.pa');
    const cleanName = newOwnerName.trim() || (isClientEmail ? cleanEmail.split('@')[0] : 'Cliente starTAP');
    const numericPrice = newTipoActivacion === 'venta' ? (parseFloat(newPrecioVenta) || 0) : 0;

    const newCardObj: NfcCard = {
      card_id: cleanCode,
      activation_code: cleanCode,
      owner_id: isClientEmail ? 'user-assigned' : 'unassigned',
      owner_name: cleanName,
      owner_email: cleanEmail || 'admin@startap.com.pa',
      label: newLabel.trim() || `Dispositivo TAP (${cleanCode})`,
      target_url: newUrl.trim() || 'https://search.google.com/local/writereview?placeid=...',
      nfc_target_url: newUrl.trim() || 'https://search.google.com/local/writereview?placeid=...',
      is_active: newIsActive,
      claimed: isClientEmail || newTipoActivacion === 'venta' || newTipoActivacion === 'regalia',
      estado: isClientEmail || newTipoActivacion === 'venta' || newTipoActivacion === 'regalia' ? (newUrl.trim() ? 'configurado' : 'asignado') : 'en_stock',
      tipo_activacion: newTipoActivacion,
      precio_venta: numericPrice,
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
        if (error) console.error('Error guardando tarjeta en Supabase:', error);
      });
    }

    // Si está activo, sincronizar orden presencial en OMS e Inventario + Disparar Analítica GA4
    if (newIsActive) {
      if (newTipoActivacion === 'venta' && numericPrice > 0) {
        const resVenta = dbLocal.registrarVentaVisita({
          cardId: cleanCode,
          precioVenta: numericPrice,
          customerName: cleanName,
          customerEmail: cleanEmail || undefined,
          label: newCardObj.label,
          targetUrl: newCardObj.target_url,
          tipoActivacion: 'venta',
        });

        const txId = resVenta.order?.id || `PED-VISITA-${cleanCode.replace(/[^A-Za-z0-9]/g, '')}`;
        const prodId = cleanCode.startsWith('STTS-')
          ? 'stand-nfc-mesa'
          : cleanCode.startsWith('STTT-')
          ? 'tarjeta-nfc-bolsillo'
          : 'placa-nfc-mostrador';
        const prodName = cleanCode.startsWith('STTS-')
          ? 'Stand NFC de Mesa'
          : cleanCode.startsWith('STTT-')
          ? 'Tarjeta NFC de Bolsillo'
          : 'Placa NFC para Reseñas de Google';

        trackGA('purchase', {
          transaction_id: txId,
          value: numericPrice,
          currency: 'USD',
          affiliation: 'Venta Física Presencial',
          payment_type: newMetodoPago,
          items: itemsParaGA([
            {
              product_id: prodId,
              product_name: prodName,
              quantity: 1,
              price: numericPrice,
            },
          ]),
        });
      } else {
        if (newTipoActivacion === 'regalia') {
          dbLocal.registrarVentaVisita({
            cardId: cleanCode,
            precioVenta: 0,
            customerName: cleanName,
            customerEmail: cleanEmail || undefined,
            label: newCardObj.label,
            targetUrl: newCardObj.target_url,
            tipoActivacion: 'regalia',
          });
        }

        // Filtro de Regalías y Demos (total === 0): NO disparar 'purchase'
        trackGA('regalia_demo', {
          card_id: cleanCode,
          tipo_activacion: newTipoActivacion,
        });
      }
    }

    setCreateSuccessMsg(`¡Dispositivo TAG "${cleanCode}" registrado con éxito!`);
    setNewLabel('');
    setNewUrl('');
    setNewOwnerEmail('');
    setNewOwnerName('');
    setNewCardId(dbLocal.getNextStickerCode());
    setTimeout(() => setCreateSuccessMsg(''), 4000);
  };

  // Open Full Edit Modal
  const handleOpenEditModal = (card: NfcCard) => {
    setEditingCard(card);
    setEditLabel(card.label || '');
    setEditUrl(card.target_url || '');
    setEditType(card.type || 'google');
    setEditChannels(card.channels || 'both');
    setEditOwnerName(card.owner_name || '');
    setEditOwnerEmail(card.owner_email || '');
    setEditIsActive(card.is_active);
  };

  // Save Full Edit Modal
  const handleSaveCardEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCard) return;

    const cleanEmail = editOwnerEmail.trim().toLowerCase();
    const isClientEmail = Boolean(cleanEmail && cleanEmail !== 'admin@startap.com.pa' && cleanEmail !== 'info@startap.com.pa');

    const updatedCard: NfcCard = {
      ...editingCard,
      label: editLabel.trim(),
      target_url: editUrl.trim(),
      nfc_target_url: editUrl.trim(),
      type: editType,
      channels: editChannels,
      owner_name: editOwnerName.trim() || (isClientEmail ? cleanEmail.split('@')[0] : 'Cliente starTAP'),
      owner_email: cleanEmail || 'admin@startap.com.pa',
      is_active: editIsActive,
      claimed: isClientEmail ? true : editingCard.claimed,
      estado: isClientEmail ? (editUrl.trim() ? 'configurado' : 'asignado') : editingCard.estado,
    };

    const updatedList = cards.map(c => (c.card_id === editingCard.card_id ? updatedCard : c));
    setCards(updatedList);
    dbLocal.setStorageItem('nfc_cards', updatedList);

    if (supabase) {
      supabase.from('nfc_cards').upsert([updatedCard]).then(({ error }) => {
        if (error) console.error('Error actualizando TAG en Supabase:', error);
      });
    }

    setEditingCard(null);
  };

  // Delete Card Handler
  const handleDeleteCard = (cardId: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar permanentemente el TAG "${cardId}"?`)) {
      const updated = cards.filter(c => c.card_id !== cardId);
      setCards(updated);
      dbLocal.setStorageItem('nfc_cards', updated);

      if (supabase) {
        supabase.from('nfc_cards').delete().eq('card_id', cardId).then(({ error }) => {
          if (error) console.error('Error eliminando TAG en Supabase:', error);
        });
      }
    }
  };

  // Copy URL to Clipboard
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
        <p className="font-semibold text-sm">Cargando Módulo de Gestión de Dispositivos TAG...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* HEADER & TOP BAR */}
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
                <CreditCard className="w-6 h-6 text-amber-500" />
                Gestión & Edición de Dispositivos TAG (STTT-XXXX)
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-900 border border-amber-300">
                {stats.total} Registrados
              </span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Administración centralizada de redirecciones NFC/QR, asignación a clientes y control de activación
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start lg:self-auto">
          <button
            type="button"
            onClick={() => setIsBulkModalOpen(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs transition flex items-center gap-2 shadow-xs"
          >
            <Boxes className="w-4 h-4" />
            <span>➕ Agregar en Lote (+Stock & Tags)</span>
          </button>

          <button
            onClick={loadData}
            className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-2 shadow-2xs"
          >
            <RefreshCw className="w-4 h-4 text-amber-500" />
            <span>Sincronizar</span>
          </button>
        </div>
      </div>

      {createSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{createSuccessMsg}</span>
        </div>
      )}

      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-amber-50/70 text-slate-900 p-4.5 rounded-2xl shadow-2xs border border-amber-200">
          <span className="text-amber-900 text-[10px] font-bold uppercase tracking-wider block">Total Dispositivos TAG</span>
          <span className="text-2xl font-black text-amber-700 font-mono mt-1 block">{stats.total}</span>
          <span className="text-[10px] text-amber-800/80 block mt-0.5">en base de datos</span>
        </div>

        <div className="bg-white border border-emerald-200 p-4.5 rounded-2xl shadow-2xs">
          <span className="text-emerald-700 text-[10px] font-bold uppercase tracking-wider block">TAGs Activos en Uso</span>
          <span className="text-2xl font-black text-emerald-700 font-mono mt-1 block">{stats.active}</span>
          <span className="text-[10px] text-emerald-600 block mt-0.5">redireccionando a clientes</span>
        </div>

        <div className="bg-white border border-rose-200 p-4.5 rounded-2xl shadow-2xs">
          <span className="text-rose-700 text-[10px] font-bold uppercase tracking-wider block">TAGs Desactivados</span>
          <span className="text-2xl font-black text-rose-700 font-mono mt-1 block">{stats.inactive}</span>
          <span className="text-[10px] text-rose-500 block mt-0.5">pausados temporalmente</span>
        </div>

        <div className="bg-white border border-amber-200 p-4.5 rounded-2xl shadow-2xs">
          <span className="text-amber-800 text-[10px] font-bold uppercase tracking-wider block">En Stock (Sin Asignar)</span>
          <span className="text-2xl font-black text-amber-700 font-mono mt-1 block">{stats.unclaimed}</span>
          <span className="text-[10px] text-amber-600 block mt-0.5">disponibles para programar</span>
        </div>
      </div>

      {/* TWO-COLUMN LAYOUT: REGISTRAR TAG & TABLA DE GESTIÓN DE TAGS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT: FORMULARIO DE REGISTRO Y ASIGNACIÓN DE NUEVO TAG */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                <QrCode className="w-5 h-5 text-amber-500" />
                Registrar & Programar Dispositivo TAG
              </h2>
              <p className="text-xs text-slate-500">Crea o actualiza el código serial STTT-XXXX asignando la URL final.</p>
            </div>
          </div>

          <form onSubmit={handleCreateCard} className="space-y-4 text-xs">
            {/* SELECTOR DE FORMATO DE HARDWARE */}
            <div className="space-y-1.5 pb-1">
              <label className="font-bold text-slate-700 block">Formato de Dispositivo / Prefijo Serial *</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleSelectHardwareType('stand')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition flex flex-col items-center gap-1 ${
                    newHardwareType === 'stand'
                      ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="font-black">Stand NFC</span>
                  <span className="text-[10px] font-mono opacity-80 font-bold">(STTS-XXXX)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectHardwareType('plate')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition flex flex-col items-center gap-1 ${
                    newHardwareType === 'plate'
                      ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="font-black">Placa Mostrador</span>
                  <span className="text-[10px] font-mono opacity-80 font-bold">(STT-XXXX)</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleSelectHardwareType('card')}
                  className={`py-2 px-2 rounded-xl text-xs font-bold border transition flex flex-col items-center gap-1 ${
                    newHardwareType === 'card'
                      ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  <span className="font-black">Tarjeta Bolsillo</span>
                  <span className="text-[10px] font-mono opacity-80 font-bold">(STTT-XXXX)</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Código TAG Serial *</label>
                <input
                  type="text"
                  required
                  value={newCardId}
                  onChange={e => setNewCardId(e.target.value)}
                  placeholder="Ej. STTS-1001"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nombre / Etiqueta del Local *</label>
                <input
                  type="text"
                  required
                  value={newLabel}
                  onChange={e => setNewLabel(e.target.value)}
                  placeholder="Ej. Stand NFC de Mesa - Restaurante"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="font-bold text-slate-700">URL de Destino Final (Redirección NFC / QR) *</label>
              <input
                type="url"
                required
                value={newUrl}
                onChange={e => setNewUrl(e.target.value)}
                placeholder="https://search.google.com/local/writereview?placeid=..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
              />
              <span className="text-[10px] text-slate-400 block mt-0.5">Puedes cambiar esta URL en cualquier momento sin tocar el hardware.</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tipo de Red / Ficha</label>
                <select
                  value={newType}
                  onChange={e => setNewType(e.target.value)}
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
                  value={newChannels}
                  onChange={e => setNewChannels(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 outline-none cursor-pointer"
                >
                  <option value="both">NFC + Código QR (Ambos)</option>
                  <option value="nfc">Solo NFC Contactless</option>
                  <option value="qr">Solo Código QR</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Nombre del Propietario</label>
                <input
                  type="text"
                  value={newOwnerName}
                  onChange={e => setNewOwnerName(e.target.value)}
                  placeholder="Nombre de la empresa o cliente"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Email del Propietario</label>
                <input
                  type="email"
                  value={newOwnerEmail}
                  onChange={e => setNewOwnerEmail(e.target.value)}
                  placeholder="cliente@correo.com"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 outline-none"
                />
              </div>
            </div>

            {/* CLASIFICACIÓN COMERCIAL & GA4 */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
              <label className="font-bold text-slate-700 block">Tipo de Operación (Inventario & Analytics GA4) *</label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setNewTipoActivacion('venta');
                    if (parseFloat(newPrecioVenta) === 0) setNewPrecioVenta('35.00');
                  }}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition ${
                    newTipoActivacion === 'venta'
                      ? 'bg-emerald-600 text-white border-emerald-700'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🏷️ Venta Física
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewTipoActivacion('regalia');
                    setNewPrecioVenta('0.00');
                  }}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition ${
                    newTipoActivacion === 'regalia'
                      ? 'bg-amber-500 text-slate-950 border-amber-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🎁 Regalía ($0)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setNewTipoActivacion('prueba');
                    setNewPrecioVenta('0.00');
                  }}
                  className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition ${
                    newTipoActivacion === 'prueba'
                      ? 'bg-purple-600 text-white border-purple-700'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  🧪 Demo ($0)
                </button>
              </div>

              {newTipoActivacion === 'venta' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Precio Venta ($ USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={newPrecioVenta}
                      onChange={e => setNewPrecioVenta(e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">Método de Pago</label>
                    <select
                      value={newMetodoPago}
                      onChange={e => setNewMetodoPago(e.target.value as any)}
                      className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-800"
                    >
                      <option value="Yappy">Yappy</option>
                      <option value="Efectivo">Efectivo</option>
                      <option value="ACH">ACH / Transferencia</option>
                      <option value="Tarjeta / POS">Tarjeta / POS</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="newIsActive"
                checked={newIsActive}
                onChange={e => setNewIsActive(e.target.checked)}
                className="w-4 h-4 text-amber-500 rounded border-slate-300 focus:ring-amber-500 cursor-pointer"
              />
              <label htmlFor="newIsActive" className="font-bold text-slate-800 cursor-pointer">
                Activar inmediatamente para redirección
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-xs transition flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Guardar y Vincular Dispositivo TAG</span>
            </button>
          </form>
        </div>

        {/* RIGHT: TABLA DE GESTIÓN Y EDICIÓN DE DISPOSITIVOS TAGS */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs space-y-4">
          <div className="p-5 bg-slate-50 border-b border-slate-200 space-y-3">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-slate-700" />
                  Listado de Dispositivos TAG Registrados ({filteredCards.length})
                </h2>
                <p className="text-xs text-slate-500">Busca por código STTS/STT/STTT, filtra por tipo de dispositivo o cliente.</p>
              </div>
            </div>

            {/* SEARCH & FILTER CONTROLS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar por cliente o serial..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <select
                value={hardwareFilter}
                onChange={e => setHardwareFilter(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 outline-none cursor-pointer"
              >
                <option value="all">Todos los Formatos</option>
                <option value="stand">🪧 Stands NFC (STTS-)</option>
                <option value="plate">🏷️ Placas Mostrador (STT-)</option>
                <option value="card">💳 Tarjetas Bolsillo (STTT-)</option>
              </select>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 outline-none cursor-pointer"
              >
                <option value="all">Todos los Estados</option>
                <option value="claimed">Reclamadas (Asignadas)</option>
                <option value="unclaimed">Sin Reclamar (Stock)</option>
                <option value="active">Activas</option>
                <option value="inactive">Desactivadas</option>
              </select>

              <select
                value={typeFilter}
                onChange={e => setTypeFilter(e.target.value)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 outline-none cursor-pointer"
              >
                <option value="all">Todas las Redes</option>
                <option value="google">Google Reviews ⭐</option>
                <option value="tripadvisor">TripAdvisor 🦉</option>
                <option value="instagram">Instagram 📸</option>
                <option value="vcard">vCard / Contacto 👤</option>
                <option value="airbnb">Airbnb 🏠</option>
                <option value="custom">Personalizado 🔗</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto p-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                  <th className="p-3">Código TAG</th>
                  <th className="p-3">Etiqueta / Local</th>
                  <th className="p-3">Información del Cliente / Dueño</th>
                  <th className="p-3 text-center">Estado</th>
                  <th className="p-3 text-center">Acciones de Edición</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredCards.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-slate-400 italic">
                      No se encontraron dispositivos TAG que coincidan con la búsqueda.
                    </td>
                  </tr>
                ) : (
                  filteredCards.map(c => {
                    const redirectUrl = `https://startap.com.pa/r/${c.card_id}`;

                    return (
                      <tr key={c.card_id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 font-mono font-black text-slate-900">
                          <span className="bg-slate-100 border border-slate-300 px-2 py-0.5 rounded text-xs block w-fit">
                            {c.card_id}
                          </span>
                          <span className="text-[10px] text-amber-700 uppercase font-bold mt-0.5 block">
                            {c.type || 'google'} ({c.channels || 'both'})
                          </span>
                        </td>

                        <td className="p-3">
                          <p className="font-bold text-slate-900 max-w-[160px] truncate">{c.label || 'Sin etiqueta'}</p>
                          <a
                            href={c.target_url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[10px] text-blue-600 font-mono hover:underline flex items-center gap-0.5 truncate max-w-[180px]"
                          >
                            <span>{c.target_url}</span>
                            <ExternalLink className="w-2.5 h-2.5 flex-shrink-0" />
                          </a>
                        </td>

                        <td className="p-3">
                          <div className="space-y-0.5">
                            <p className="font-bold text-slate-900 max-w-[160px] truncate">
                              {c.owner_name || (c.claimed ? 'Cliente starTAP' : 'Sin Asignar (Stock)')}
                            </p>
                            <p className="text-[10px] text-slate-500 font-mono max-w-[160px] truncate">
                              {c.owner_email || 'admin@startap.com.pa'}
                            </p>
                            <div>
                              {c.claimed ? (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <CheckCircle2 className="w-2.5 h-2.5 text-emerald-600" />
                                  Reclamada por Cliente
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-50 text-amber-800 border border-amber-300">
                                  En Stock (Sin Reclamar)
                                </span>
                              )}
                            </div>
                            {c.tipo_activacion && (
                              <div className="mt-1">
                                {c.tipo_activacion === 'venta' ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-amber-100 text-amber-900 border border-amber-300">
                                    🤝 Venta en Visita (${Number(c.precio_venta || 0).toFixed(2)})
                                  </span>
                                ) : c.tipo_activacion === 'regalia' ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-100 text-emerald-900 border border-emerald-300">
                                    🎁 Regalía / Combo ($0.00)
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-black bg-indigo-100 text-indigo-900 border border-indigo-300">
                                    🧪 Demo / Muestra ($0.00)
                                  </span>
                                )}
                              </div>
                            )}
                            {c.order_id && (
                              <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                                Pedido:{' '}
                                <Link href={`/master-control/pedidos/${c.order_id}`} className="text-amber-700 underline font-bold hover:text-amber-900">
                                  #{c.order_id}
                                </Link>
                              </div>
                            )}
                          </div>
                        </td>

                        <td className="p-3 text-center">
                          <button
                            type="button"
                            onClick={() => handleToggleActive(c.card_id, c.is_active)}
                            className={`px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase border transition flex items-center gap-1 mx-auto ${
                              c.is_active
                                ? 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                                : 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
                            }`}
                            title="Haz clic para activar o desactivar"
                          >
                            <Power className={`w-3 h-3 ${c.is_active ? 'text-emerald-600' : 'text-rose-600'}`} />
                            <span>{c.is_active ? 'Activo' : 'Desactivado'}</span>
                          </button>
                        </td>

                        <td className="p-3 text-center">
                          <div className="inline-flex flex-wrap items-center justify-center gap-1">
                            {/* COPIAR ENLACE NFC */}
                            <button
                              type="button"
                              onClick={() => copyToClipboard(`https://startap.com.pa/r/${c.card_id}?m=nfc`, `${c.card_id}_nfc`)}
                              className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                              title="Copiar Enlace Contactless NFC"
                            >
                              {copiedId === `${c.card_id}_nfc` ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700">¡NFC Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <Radio className="w-3 h-3 text-amber-600" />
                                  <span>Enlace NFC</span>
                                </>
                              )}
                            </button>

                            {/* COPIAR ENLACE QR */}
                            <button
                              type="button"
                              onClick={() => copyToClipboard(`https://startap.com.pa/r/${c.card_id}?m=qr`, `${c.card_id}_qr`)}
                              className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 rounded-lg text-[10px] font-bold transition flex items-center gap-1"
                              title="Copiar Enlace Código QR"
                            >
                              {copiedId === `${c.card_id}_qr` ? (
                                <>
                                  <Check className="w-3 h-3 text-emerald-600" />
                                  <span className="text-emerald-700">¡QR Copiado!</span>
                                </>
                              ) : (
                                <>
                                  <QrCode className="w-3 h-3 text-slate-700" />
                                  <span>Enlace QR</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => setQrModalCard(c)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                              title="Ver y Descargar Código QR"
                            >
                              <Eye className="w-3.5 h-3.5 text-slate-600" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenEditModal(c)}
                              className="p-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 rounded-lg transition font-bold"
                              title="Editar URL y Datos de TAG"
                            >
                              <Edit3 className="w-3.5 h-3.5 text-amber-700" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeleteCard(c.card_id)}
                              className="p-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg transition"
                              title="Eliminar Dispositivo TAG"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
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

      {/* MODAL DE EDICIÓN COMPLETA DE DISPOSITIVO TAG */}
      {editingCard && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-lg w-full space-y-4 shadow-xl">
            <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-black text-slate-900">Editar Dispositivo TAG ({editingCard.card_id})</h3>
                <p className="text-xs text-slate-500">Actualiza la URL de destino en tiempo real sin modificar el hardware.</p>
              </div>
              <button
                onClick={() => setEditingCard(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCardEdit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Etiqueta / Nombre del Comercio</label>
                <input
                  type="text"
                  required
                  value={editLabel}
                  onChange={e => setEditLabel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-900 outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">URL de Destino Final (Redirección)</label>
                <input
                  type="url"
                  required
                  value={editUrl}
                  onChange={e => setEditUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Tipo de Red / Ficha</label>
                  <select
                    value={editType}
                    onChange={e => setEditType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 outline-none"
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
                    value={editChannels}
                    onChange={e => setEditChannels(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 outline-none"
                  >
                    <option value="both">NFC + QR (Ambos)</option>
                    <option value="nfc">Solo NFC</option>
                    <option value="qr">Solo QR</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Nombre del Cliente</label>
                  <input
                    type="text"
                    value={editOwnerName}
                    onChange={e => setEditOwnerName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Email del Cliente</label>
                  <input
                    type="email"
                    value={editOwnerEmail}
                    onChange={e => setEditOwnerEmail(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="editIsActive"
                  checked={editIsActive}
                  onChange={e => setEditIsActive(e.target.checked)}
                  className="w-4 h-4 text-amber-500 rounded border-slate-300 cursor-pointer"
                />
                <label htmlFor="editIsActive" className="font-bold text-slate-800 cursor-pointer">
                  Dispositivo TAG Activo para redirección
                </label>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingCard(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-xl shadow-md transition flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Guardar Cambios de TAG</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CÓDIGO QR GENERADO */}
      {qrModalCard && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-200 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-xl">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <span className="font-mono font-black text-slate-900 bg-slate-100 px-2 py-0.5 rounded text-xs">
                {qrModalCard.card_id}
              </span>
              <button
                onClick={() => setQrModalCard(null)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="font-black text-slate-900 text-base">{qrModalCard.label || 'Dispositivo TAG'}</h3>
              <p className="text-xs text-slate-500 mt-0.5">Enlace de Redirección: startap.com.pa/r/{qrModalCard.card_id}</p>
            </div>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl inline-block">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https://startap.com.pa/r/${qrModalCard.card_id}?m=qr`}
                alt={`Código QR ${qrModalCard.card_id}`}
                className="w-48 h-48 mx-auto object-contain rounded-lg"
              />
            </div>

            <div className="space-y-2 pt-1 text-xs">
              <button
                type="button"
                onClick={() => copyToClipboard(`https://startap.com.pa/r/${qrModalCard.card_id}?m=nfc`, `modal_nfc_${qrModalCard.card_id}`)}
                className="w-full py-2 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                {copiedId === `modal_nfc_${qrModalCard.card_id}` ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">¡Enlace NFC Copiado!</span>
                  </>
                ) : (
                  <>
                    <Radio className="w-4 h-4 text-amber-600" />
                    <span>Copiar Enlace NFC (Contactless)</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => copyToClipboard(`https://startap.com.pa/r/${qrModalCard.card_id}?m=qr`, `modal_qr_${qrModalCard.card_id}`)}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 border border-slate-300 font-bold rounded-xl transition flex items-center justify-center gap-1.5"
              >
                {copiedId === `modal_qr_${qrModalCard.card_id}` ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span className="text-emerald-700">¡Enlace QR Copiado!</span>
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4 text-slate-700" />
                    <span>Copiar Enlace Código QR</span>
                  </>
                )}
              </button>

              <a
                href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=https://startap.com.pa/r/${qrModalCard.card_id}?m=qr`}
                target="_blank"
                download={`QR_${qrModalCard.card_id}.png`}
                className="w-full py-2.5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 mt-2"
              >
                <Download className="w-4 h-4 text-amber-400" />
                <span>Descargar Código QR (Alta Res)</span>
              </a>
            </div>
          </div>
        </div>
      )}

      {/* BULK ADD BATCH MODAL */}
      <BulkAddBatchModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={loadData}
        initialHardwareType={newHardwareType}
      />

    </div>
  );
}