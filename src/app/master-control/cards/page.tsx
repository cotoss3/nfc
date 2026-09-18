'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { dbLocal, NfcCard, ScanRecord, supabase } from '@/lib/db';
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
  X
} from 'lucide-react';

export default function CardsManagementPage() {
  const [cards, setCards] = useState<NfcCard[]>([]);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'unclaimed'>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | 'both' | 'nfc' | 'qr'>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  // Create Tag Form States
  const [newCardId, setNewCardId] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [newType, setNewType] = useState('google');
  const [newChannels, setNewChannels] = useState<'both' | 'nfc' | 'qr'>('both');
  const [newOwnerEmail, setNewOwnerEmail] = useState('');
  const [newOwnerName, setNewOwnerName] = useState('');
  const [newIsActive, setNewIsActive] = useState(true);
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

  const loadData = async () => {
    setLoading(true);
    let dbCards = dbLocal.getCards();
    let dbScans = dbLocal.getStorageItem<ScanRecord[]>('nfc_scans', []);

    if (supabase) {
      try {
        const [resCards, resScans] = await Promise.all([
          supabase.from('nfc_cards').select('*').order('created_at', { ascending: false }),
          supabase.from('nfc_scans').select('*').order('created_at', { ascending: false }),
        ]);

        if (!resCards.error && resCards.data && resCards.data.length > 0) {
          dbCards = resCards.data as NfcCard[];
          dbLocal.setStorageItem('nfc_cards', dbCards);
        }
        if (!resScans.error && resScans.data && resScans.data.length > 0) {
          dbScans = resScans.data as ScanRecord[];
        }
      } catch (err) {
        console.error('Error cargando tarjetas desde Supabase:', err);
      }
    }

    setCards(dbCards);
    setScans(dbScans);
    setNewCardId(dbLocal.getNextStickerCode());
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
        (card.label && card.label.toLowerCase().includes(q)) ||
        (card.owner_name && card.owner_name.toLowerCase().includes(q)) ||
        (card.owner_email && card.owner_email.toLowerCase().includes(q)) ||
        (card.target_url && card.target_url.toLowerCase().includes(q));

      const matchStatus =
        statusFilter === 'all' ||
        (statusFilter === 'active' && card.is_active && card.claimed) ||
        (statusFilter === 'inactive' && !card.is_active) ||
        (statusFilter === 'unclaimed' && !card.claimed);

      const matchChannel =
        channelFilter === 'all' || card.channels === channelFilter;

      const matchType =
        typeFilter === 'all' || (card.type || 'google') === typeFilter;

      return matchSearch && matchStatus && matchChannel && matchType;
    });
  }, [cards, searchQuery, statusFilter, channelFilter, typeFilter]);

  // Statistics Summary
  const stats = useMemo(() => {
    const total = cards.length;
    const active = cards.filter(c => c.is_active && c.claimed).length;
    const inactive = cards.filter(c => !c.is_active).length;
    const unclaimed = cards.filter(c => !c.claimed).length;
    const totalScans = scans.length;
    return { total, active, inactive, unclaimed, totalScans };
  }, [cards, scans]);

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
    if (!newCardId.trim()) return alert('Por favor ingresa un código serial para el TAG (ej. STT-1050)');

    const cleanCode = newCardId.trim().toUpperCase();
    const cleanEmail = newOwnerEmail.trim().toLowerCase() || 'admin@startap.com.pa';
    const cleanName = newOwnerName.trim() || 'Cliente starTAP';

    const newCardObj: NfcCard = {
      card_id: cleanCode,
      activation_code: cleanCode,
      owner_id: 'user-session',
      owner_name: cleanName,
      owner_email: cleanEmail,
      label: newLabel.trim() || `Dispositivo TAP (${cleanCode})`,
      target_url: newUrl.trim() || 'https://search.google.com/local/writereview?placeid=...',
      nfc_target_url: newUrl.trim() || 'https://search.google.com/local/writereview?placeid=...',
      is_active: newIsActive,
      claimed: true,
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

    const updatedCard: NfcCard = {
      ...editingCard,
      label: editLabel.trim(),
      target_url: editUrl.trim(),
      nfc_target_url: editUrl.trim(),
      type: editType,
      channels: editChannels,
      owner_name: editOwnerName.trim() || 'Cliente starTAP',
      owner_email: editOwnerEmail.trim().toLowerCase() || 'admin@startap.com.pa',
      is_active: editIsActive,
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
                Gestión & Edición de Dispositivos TAG (STT-XXXX)
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

        <button
          onClick={loadData}
          className="px-3.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-50 transition flex items-center gap-2 shadow-2xs self-start lg:self-auto"
        >
          <RefreshCw className="w-4 h-4 text-amber-500" />
          <span>Sincronizar Datos</span>
        </button>
      </div>

      {createSuccessMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{createSuccessMsg}</span>
        </div>
      )}

      {/* KPI STAT CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-950 text-white p-4.5 rounded-2xl shadow-md border border-slate-800">
          <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Total Dispositivos TAG</span>
          <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">{stats.total}</span>
          <span className="text-[10px] text-slate-400 block mt-0.5">en base de datos</span>
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
              <p className="text-xs text-slate-500">Crea o actualiza el código serial STT-XXXX asignando la URL final.</p>
            </div>
          </div>

          <form onSubmit={handleCreateCard} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Código TAG Serial *</label>
                <input
                  type="text"
                  required
                  value={newCardId}
                  onChange={e => setNewCardId(e.target.value)}
                  placeholder="Ej. STT-1050"
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
                  placeholder="Ej. Placa Mostrador - Café Panamá"
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
              className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-[0.99]"
            >
              <Plus className="w-4 h-4 text-amber-400" />
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
                <p className="text-xs text-slate-500">Busca por código STT-XXXX, cliente o edita el estado de activación.</p>
              </div>
            </div>

            {/* SEARCH & FILTER CONTROLS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Buscar por código STT, local o email..."
                  className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value as any)}
                className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 outline-none cursor-pointer"
              >
                <option value="all">Todos los Estados</option>
                <option value="active">Activos en Uso</option>
                <option value="inactive">Desactivados / Pausados</option>
                <option value="unclaimed">Sin Asignar (Stock)</option>
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
                  <th className="p-3">Propietario</th>
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
                          <p className="font-semibold text-slate-800 max-w-[140px] truncate">{c.owner_name || 'En Stock'}</p>
                          <p className="text-[10px] text-slate-400 font-mono max-w-[140px] truncate">{c.owner_email}</p>
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

    </div>
  );
}