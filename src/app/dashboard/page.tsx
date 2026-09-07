'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { dbLocal, NfcCard, ScanRecord } from '@/lib/db';
import Link from 'next/link';
import { 
  Edit2, QrCode, Smartphone, Eye, Check, ExternalLink, BarChart2, 
  ShieldAlert, Folder, Users, Settings, LogOut, Plus, Search, 
  Filter, Copy, Radio, Globe, AlertTriangle, Download, Layers,
  ChevronRight, ArrowUpRight
} from 'lucide-react';

type ModuleTab = 'devices' | 'groups' | 'analytics' | 'settings';

function DashboardContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<ModuleTab>('devices');

  // User & Auth states
  const [emailInput, setEmailInput] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Cliente TapStar');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [nameInput, setNameInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Cards & Groups states
  const [cards, setCards] = useState<NfcCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<NfcCard | null>(null);
  const [selectedGroupFilter, setSelectedGroupFilter] = useState<string>('TODOS');
  const [searchQuery, setSearchQuery] = useState('');
  const [groupsList, setGroupsList] = useState<string[]>(['General']);

  // Edit states
  const [editLabel, setEditLabel] = useState('');
  const [editNfcUrl, setEditNfcUrl] = useState('');
  const [editQrUrl, setEditQrUrl] = useState('');
  const [editGroup, setEditGroup] = useState('General');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  // New Group state
  const [newGroupNameInput, setNewGroupNameInput] = useState('');
  const [createGroupSuccess, setCreateGroupSuccess] = useState(false);

  // Claim state
  const [claimInput, setClaimInput] = useState('');
  const [claimMessage, setClaimMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  // QR Modal state
  const [qrModalCard, setQrModalCard] = useState<NfcCard | null>(null);

  // Analytics states
  const [allScans, setAllScans] = useState<ScanRecord[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryEmail = searchParams.get('email');
      const claimCode = searchParams.get('claim');
      const sessionEmail = sessionStorage.getItem('current_user_email');
      const sessionName = sessionStorage.getItem('current_user_name');
      const activeEmail = queryEmail || sessionEmail;

      if (sessionName) setUserName(sessionName);

      if (claimCode) {
        setClaimInput(claimCode);
        setIsClaimModalOpen(true);
      }

      if (activeEmail) {
        setUserEmail(activeEmail);
        loadUserData(activeEmail);
      }
    }
  }, [searchParams]);

  const loadUserData = (email: string) => {
    const userCards = dbLocal.getCardsByOwner(email);
    const userScans = dbLocal.getScansForOwner(email);
    const groups = dbLocal.getGroupsForOwner(email);

    setCards(userCards);
    setAllScans(userScans);
    setGroupsList(groups);

    if (userCards.length > 0) {
      handleSelectCard(userCards[0]);
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const email = emailInput.trim().toLowerCase();
    if (!email) {
      setAuthError('Por favor ingresa un correo electrónico.');
      return;
    }

    const name = nameInput.trim() || email.split('@')[0];
    if (authMode === 'register') {
      const res = dbLocal.registerUser(name, email);
      if (!res.success) {
        setAuthError(res.message);
        return;
      }
    } else {
      dbLocal.registerUser(name, email);
    }

    setUserEmail(email);
    setUserName(name);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('current_user_email', email);
      sessionStorage.setItem('current_user_name', name);
    }
    loadUserData(email);
  };

  const handleLogout = () => {
    setUserEmail(null);
    setCards([]);
    setSelectedCard(null);
    setAllScans([]);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('current_user_email');
      sessionStorage.removeItem('current_user_name');
    }
  };

  const handleSelectCard = (card: NfcCard) => {
    setSelectedCard(card);
    setEditLabel(card.label);
    setEditNfcUrl(card.nfc_target_url || card.target_url || '');
    setEditQrUrl(card.qr_target_url || '');
    setEditGroup(card.group_name || 'General');
  };

  const handleUpdateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;

    let cleanNfc = editNfcUrl.trim();
    if (cleanNfc && !cleanNfc.startsWith('http://') && !cleanNfc.startsWith('https://')) {
      cleanNfc = `https://${cleanNfc}`;
    }

    let cleanQr = editQrUrl.trim();
    if (cleanQr && !cleanQr.startsWith('http://') && !cleanQr.startsWith('https://')) {
      cleanQr = `https://${cleanQr}`;
    }

    setIsUpdating(true);
    const success = dbLocal.updateCardRedirect(
      selectedCard.card_id, 
      cleanNfc, 
      cleanQr, 
      editLabel, 
      editGroup
    );
    
    // Sync with backend API
    try {
      const allCards = dbLocal.getCards();
      await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'nfc_cards', value: allCards })
      });
    } catch (err) {
      console.error('Error sincronizando tarjetas:', err);
    }

    if (success) {
      setUpdateSuccess(true);
      setEditNfcUrl(cleanNfc);
      setEditQrUrl(cleanQr);

      const updatedCards = cards.map(c => 
        c.card_id === selectedCard.card_id 
          ? { 
              ...c, 
              label: editLabel, 
              target_url: cleanNfc || cleanQr || c.target_url, 
              nfc_target_url: cleanNfc, 
              qr_target_url: cleanQr, 
              group_name: editGroup 
            } 
          : c
      );
      setCards(updatedCards);
      setSelectedCard({ 
        ...selectedCard, 
        label: editLabel, 
        target_url: cleanNfc || cleanQr || selectedCard.target_url, 
        nfc_target_url: cleanNfc, 
        qr_target_url: cleanQr, 
        group_name: editGroup 
      });

      if (userEmail) {
        setGroupsList(dbLocal.getGroupsForOwner(userEmail));
      }
      
      setTimeout(() => setUpdateSuccess(false), 2000);
    }
    setIsUpdating(false);
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const gName = newGroupNameInput.trim();
    if (!gName) return;

    if (!groupsList.includes(gName)) {
      setGroupsList([...groupsList, gName]);
    }
    setNewGroupNameInput('');
    setCreateGroupSuccess(true);
    setTimeout(() => setCreateGroupSuccess(false), 2000);
  };

  const handleClaimTap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimInput || !userEmail) return;

    const res = dbLocal.claimCard(claimInput, userEmail, userName);
    try {
      const allCards = dbLocal.getCards();
      await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'nfc_cards', value: allCards })
      });
    } catch (err) {
      console.error('Error sincronizando al reclamar:', err);
    }

    setClaimMessage({ success: res.success, text: res.message });

    if (res.success) {
      loadUserData(userEmail);
      setTimeout(() => {
        setIsClaimModalOpen(false);
        setClaimMessage(null);
        setClaimInput('');
      }, 1500);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedLink(label);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Filtered Cards
  const filteredCards = cards.filter(c => {
    const matchesGroup = selectedGroupFilter === 'TODOS' || (c.group_name || 'General') === selectedGroupFilter;
    const matchesSearch = c.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          c.card_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesGroup && matchesSearch;
  });

  // Calculate analytics
  const nfcScansCount = allScans.filter(s => s.scan_type === 'nfc' || s.referrer.toLowerCase().includes('nfc')).length;
  const qrScansCount = allScans.filter(s => s.scan_type === 'qr' || s.referrer.toLowerCase().includes('qr')).length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col md:flex-row">
      
      {/* ---------------- LOGIN & REGISTRATION OVERLAY ---------------- */}
      {!userEmail ? (
        <div className="flex-1 flex items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-950/20 via-slate-950 to-slate-950">
          <div className="max-w-md w-full bg-slate-900/90 border border-slate-800 rounded-3xl p-8 shadow-2xl backdrop-blur-md space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl mb-2">
                <Smartphone className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white">starTAP Panamá</h1>
              <p className="text-xs text-slate-400 uppercase tracking-widest">Panel de Control de Administración</p>
            </div>

            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 rounded-lg transition ${authMode === 'login' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2 rounded-lg transition ${authMode === 'register' ? 'bg-amber-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'}`}
              >
                Registrar Comercio
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authError && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Nombre del Establecimiento / Comercio</label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Ej. Restaurante El Trapiche"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Correo Electrónico Propietario</label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="ejemplo@comercio.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500 transition"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-amber-500/20 transition text-sm uppercase tracking-wider"
              >
                {authMode === 'login' ? 'Acceder al Panel' : 'Crear Cuenta Administrador'}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-800/80 text-center">
              <p className="text-xs text-slate-500">¿Tienes un código de activación en tu caja?</p>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setEmailInput('');
                }}
                className="text-xs font-bold text-amber-400 hover:underline mt-1 inline-block"
              >
                Vincular nueva placa STT-XXXX
              </button>
            </div>
          </div>
        </div>
      ) : (

        /* ---------------- MAIN DASHBOARD LAYOUT WITH SIDEBAR ---------------- */
        <>
          {/* SIDEBAR NAVIGATION */}
          <aside className="w-full md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
            {/* Header / Brand */}
            <div className="p-5 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-500 text-slate-950 font-black rounded-xl flex items-center justify-center text-sm shadow-md shadow-amber-500/20">
                  ST
                </div>
                <div>
                  <h2 className="text-sm font-black text-white leading-tight">starTAP</h2>
                  <p className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">Panamá Pro</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Cerrar Sesión"
                className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Tenant User Info Card */}
            <div className="p-4 border-b border-slate-800/60 bg-slate-950/40">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="truncate font-semibold text-white">{userName}</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">{userEmail}</p>
            </div>

            {/* Navigation Modules */}
            <nav className="p-3 space-y-1 flex-1">
              <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest px-3 py-2">
                Módulos de Gestión
              </div>

              <button
                onClick={() => setActiveTab('devices')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'devices'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4" />
                  <span>Dispositivos TAP</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'devices' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                  {cards.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('groups')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'groups'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Folder className="w-4 h-4" />
                  <span>Grupos y Sucursales</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'groups' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                  {groupsList.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'analytics'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart2 className="w-4 h-4" />
                  <span>Analíticas de Grupo</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'analytics' ? 'bg-slate-950 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
                  {allScans.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'settings'
                    ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4" />
                  <span>Ajustes & Exportar</span>
                </div>
              </button>
            </nav>

            {/* Footer Action */}
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={() => setIsClaimModalOpen(true)}
                className="w-full py-2.5 px-3 bg-slate-800 hover:bg-slate-700 text-amber-400 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 border border-slate-700/60"
              >
                <Plus className="w-4 h-4" />
                <span>Vincular Nueva Placa</span>
              </button>
            </div>
          </aside>

          {/* MAIN CONTENT AREA */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">

            {/* ---------------- MODULE 1: DISPOSITIVOS TAP ---------------- */}
            {activeTab === 'devices' && (
              <div className="space-y-6">
                {/* Header Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
                  <div>
                    <h1 className="text-xl font-black text-white flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-amber-500" />
                      Gestión de Dispositivos TAP
                    </h1>
                    <p className="text-xs text-slate-400 mt-1">Configura enlaces independientes para lectura NFC y Código QR impreso.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar placa..."
                        className="bg-slate-900 border border-slate-800 text-xs rounded-xl pl-9 pr-3 py-2 text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    {/* Group Filter */}
                    <select
                      value={selectedGroupFilter}
                      onChange={(e) => setSelectedGroupFilter(e.target.value)}
                      className="bg-slate-900 border border-slate-800 text-xs rounded-xl px-3 py-2 text-slate-300 focus:outline-none focus:border-amber-500 font-medium"
                    >
                      <option value="TODOS">Todos los Grupos</option>
                      {groupsList.map(g => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Grid Layout: Device Cards + Dynamic Dual Editor */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  
                  {/* Left Column: Device Selector List */}
                  <div className="lg:col-span-5 space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase tracking-wider px-1">
                      <span>Tarjetas Registradas ({filteredCards.length})</span>
                    </div>

                    {filteredCards.length === 0 ? (
                      <div className="p-8 bg-slate-900/60 border border-slate-800 rounded-2xl text-center space-y-3">
                        <ShieldAlert className="w-8 h-8 text-amber-500 mx-auto opacity-60" />
                        <p className="text-xs text-slate-400">No se encontraron dispositivos en este filtro.</p>
                        <button
                          onClick={() => setIsClaimModalOpen(true)}
                          className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl"
                        >
                          Reclamar Dispositivo
                        </button>
                      </div>
                    ) : (
                      filteredCards.map((card) => {
                        const isSelected = selectedCard?.card_id === card.card_id;
                        const hasNfc = !!(card.nfc_target_url || card.target_url);
                        const hasQr = !!card.qr_target_url;

                        return (
                          <div
                            key={card.card_id}
                            onClick={() => handleSelectCard(card)}
                            className={`p-4 rounded-2xl border transition cursor-pointer relative ${
                              isSelected 
                                ? 'bg-slate-900 border-amber-500 shadow-lg shadow-amber-500/10' 
                                : 'bg-slate-900/50 border-slate-800/80 hover:border-slate-700'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs font-bold text-white">{card.label}</span>
                                  <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-950 border border-slate-800 text-amber-400 rounded-md">
                                    {card.card_id}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 text-[11px] text-slate-400">
                                  <Folder className="w-3 h-3 text-slate-500" />
                                  <span>{card.group_name || 'General'}</span>
                                </div>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setQrModalCard(card);
                                }}
                                title="Ver Código QR impreso"
                                className="p-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-400 hover:text-amber-400 transition"
                              >
                                <QrCode className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Dual URL Badges */}
                            <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center gap-2 text-[10px] font-semibold">
                              <span className={`px-2 py-0.5 rounded-full flex items-center gap-1 ${hasNfc ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-500'}`}>
                                <Radio className="w-3 h-3" />
                                {hasNfc ? 'NFC Configurado' : 'NFC En blanco'}
                              </span>
                              <span className={`px-2 py-0.5 rounded-full flex items-center gap-1 ${hasQr ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                                <QrCode className="w-3 h-3" />
                                {hasQr ? 'QR Configurado' : 'QR En blanco'}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Right Column: Dual URL Editor Form */}
                  <div className="lg:col-span-7">
                    {selectedCard ? (
                      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                          <div>
                            <span className="text-[10px] font-mono text-amber-400 uppercase tracking-widest">Configuración Dual</span>
                            <h2 className="text-lg font-bold text-white">{selectedCard.label}</h2>
                          </div>
                          <span className="text-xs font-mono px-3 py-1 bg-slate-950 text-slate-400 rounded-full border border-slate-800">
                            {selectedCard.card_id}
                          </span>
                        </div>

                        <form onSubmit={handleUpdateCard} className="space-y-5">
                          {/* Label */}
                          <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Nombre / Etiqueta del Dispositivo</label>
                            <input
                              type="text"
                              value={editLabel}
                              onChange={(e) => setEditLabel(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                            />
                          </div>

                          {/* Group Assignment */}
                          <div>
                            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">Grupo / Sucursal Asignada</label>
                            <select
                              value={editGroup}
                              onChange={(e) => setEditGroup(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-amber-500"
                            >
                              {groupsList.map(g => (
                                <option key={g} value={g}>{g}</option>
                              ))}
                            </select>
                          </div>

                          {/* Dual URLs */}
                          <div className="space-y-4 pt-2 border-t border-slate-800">
                            {/* NFC URL Field */}
                            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                                  <Radio className="w-4 h-4" />
                                  1. Redirección para Escaneo NFC (Aproximación física)
                                </label>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(`${window.location.origin}/r/${selectedCard.card_id}?m=nfc`, 'nfc')}
                                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>{copiedLink === 'nfc' ? '¡Copiado!' : 'Copiar Link'}</span>
                                </button>
                              </div>
                              <input
                                type="text"
                                value={editNfcUrl}
                                onChange={(e) => setEditNfcUrl(e.target.value)}
                                placeholder="datakorex.com o https://g.page/r/..."
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                              />
                              <p className="text-[11px] text-slate-500">URL a la que se dirigirá cuando el cliente acerque su celular al chip NFC.</p>
                            </div>

                            {/* QR URL Field */}
                            <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-blue-400 flex items-center gap-1.5 uppercase tracking-wider">
                                  <QrCode className="w-4 h-4" />
                                  2. Redirección para Código QR impreso
                                </label>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(`${window.location.origin}/r/${selectedCard.card_id}?m=qr`, 'qr')}
                                  className="text-[11px] text-slate-400 hover:text-white flex items-center gap-1"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>{copiedLink === 'qr' ? '¡Copiado!' : 'Copiar Link'}</span>
                                </button>
                              </div>
                              <input
                                type="text"
                                value={editQrUrl}
                                onChange={(e) => setEditQrUrl(e.target.value)}
                                placeholder="Dejar en blanco o colocar enlace (ej. instagram.com/...)"
                                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500 font-mono"
                              />
                              <p className="text-[11px] text-slate-500">Si se deja en blanco, al escanear el QR mostrará aviso elegante de "No configurado".</p>
                            </div>
                          </div>

                          {/* Submit & Status */}
                          <div className="flex items-center justify-between pt-2">
                            <button
                              type="submit"
                              disabled={isUpdating}
                              className="py-3 px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition flex items-center gap-2"
                            >
                              {isUpdating ? 'Guardando en Supabase...' : 'Guardar Cambios de Redirección'}
                            </button>

                            {updateSuccess && (
                              <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5 animate-pulse">
                                <Check className="w-4 h-4" />
                                ¡Sincronizado en tiempo real!
                              </span>
                            )}
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="p-12 bg-slate-900/40 border border-slate-800 rounded-3xl text-center text-slate-500 text-xs">
                        Selecciona un dispositivo para editar su configuración.
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* ---------------- MODULE 2: GRUPOS Y SUCURSALES ---------------- */}
            {activeTab === 'groups' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-slate-800">
                  <h1 className="text-xl font-black text-white flex items-center gap-2">
                    <Folder className="w-5 h-5 text-amber-500" />
                    Gestión de Grupos y Sucursales
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">Organiza tus dispositivos por ubicación, departamento o sucursal.</p>
                </div>

                {/* Create New Group */}
                <form onSubmit={handleCreateGroup} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col md:flex-row items-center gap-3">
                  <input
                    type="text"
                    value={newGroupNameInput}
                    onChange={(e) => setNewGroupNameInput(e.target.value)}
                    placeholder="Nombre del nuevo grupo (ej. Sucursal Costa del Este)"
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder:text-slate-600 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="submit"
                    className="w-full md:w-auto px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Crear Grupo</span>
                  </button>
                  {createGroupSuccess && (
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" /> ¡Creado!
                    </span>
                  )}
                </form>

                {/* Groups Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {groupsList.map(group => {
                    const groupCards = cards.filter(c => (c.group_name || 'General') === group);
                    const groupScans = allScans.filter(s => s.group_name === group);

                    return (
                      <div key={group} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-white text-sm">{group}</h3>
                          <span className="text-[10px] font-mono px-2.5 py-0.5 bg-slate-950 border border-slate-800 text-amber-400 rounded-full">
                            {groupCards.length} dispositivos
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-400 pt-2 border-t border-slate-800">
                          <div className="flex justify-between">
                            <span>Escaneos Totales:</span>
                            <span className="font-bold text-white">{groupScans.length}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedGroupFilter(group);
                            setActiveTab('devices');
                          }}
                          className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl border border-slate-800 transition flex items-center justify-center gap-1"
                        >
                          <span>Ver Tarjetas de este grupo</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ---------------- MODULE 3: ANALÍTICAS DE GRUPO ---------------- */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-slate-800">
                  <h1 className="text-xl font-black text-white flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-amber-500" />
                    Analíticas de Grupo y Rendimiento
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">Métricas de rendimiento comparativas por canal (NFC vs QR) y sucursales.</p>
                </div>

                {/* Key Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Escaneos Totales</span>
                    <p className="text-2xl font-black text-white mt-1">{allScans.length}</p>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                    <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                      <Radio className="w-3 h-3" /> Escaneos NFC
                    </span>
                    <p className="text-2xl font-black text-emerald-400 mt-1">{nfcScansCount}</p>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                    <span className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-1">
                      <QrCode className="w-3 h-3" /> Escaneos QR
                    </span>
                    <p className="text-2xl font-black text-blue-400 mt-1">{qrScansCount}</p>
                  </div>
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                    <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest">Grupos Activos</span>
                    <p className="text-2xl font-black text-amber-400 mt-1">{groupsList.length}</p>
                  </div>
                </div>

                {/* Scan Logs Table */}
                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300">Registro Reciente de Actividad</h3>
                  {allScans.length === 0 ? (
                    <p className="text-xs text-slate-500 italic text-center py-6">No hay escaneos registrados aún.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-800 text-slate-500 uppercase tracking-wider">
                            <th className="pb-3">Dispositivo ID</th>
                            <th className="pb-3">Grupo</th>
                            <th className="pb-3">Canal</th>
                            <th className="pb-3">Teléfono / OS</th>
                            <th className="pb-3">Fecha y Hora</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-slate-300">
                          {allScans.slice(-15).reverse().map((scan) => (
                            <tr key={scan.id} className="hover:bg-slate-950/40">
                              <td className="py-2.5 font-mono text-amber-400">{scan.card_id}</td>
                              <td className="py-2.5">{scan.group_name || 'General'}</td>
                              <td className="py-2.5">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${scan.scan_type === 'qr' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                                  {scan.scan_type === 'qr' ? 'QR Code' : 'NFC Scan'}
                                </span>
                              </td>
                              <td className="py-2.5">{scan.device}</td>
                              <td className="py-2.5 text-slate-500">
                                {new Date(scan.created_at).toLocaleString('es-PA')}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ---------------- MODULE 4: AJUSTES & EXPORTAR ---------------- */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-slate-800">
                  <h1 className="text-xl font-black text-white flex items-center gap-2">
                    <Settings className="w-5 h-5 text-amber-500" />
                    Ajustes de Perfil y Exportación
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">Configuración del tenant de comercio y exportación de datos.</p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 max-w-xl">
                  <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Información de Cuenta Tenant</h3>
                  <div className="space-y-2 text-xs text-slate-400">
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span>Propietario:</span>
                      <span className="font-bold text-white">{userName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span>Correo Electrónico:</span>
                      <span className="font-mono text-amber-400">{userEmail}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-800">
                      <span>Nube Supabase:</span>
                      <span className="text-emerald-400 font-bold">Activo (Realtime Sync)</span>
                    </div>
                  </div>

                  <div className="pt-4">
                    <button
                      onClick={() => {
                        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ cards, scans: allScans }, null, 2));
                        const downloadAnchor = document.createElement('a');
                        downloadAnchor.setAttribute("href", dataStr);
                        downloadAnchor.setAttribute("download", `startap_export_${Date.now()}.json`);
                        document.body.appendChild(downloadAnchor);
                        downloadAnchor.click();
                        downloadAnchor.remove();
                      }}
                      className="py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 transition flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      <span>Exportar Configuración y Escaneos a JSON</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

          </main>
        </>
      )}

      {/* ---------------- CLAIM DEVICE MODAL ---------------- */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="font-bold text-white text-sm">Vincular Nueva Placa STT-XXXX</h3>
              <button
                onClick={() => setIsClaimModalOpen(false)}
                className="text-slate-500 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleClaimTap} className="space-y-4">
              {claimMessage && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${claimMessage.success ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
                  {claimMessage.text}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">Código de Activación del Sticker</label>
                <input
                  type="text"
                  required
                  value={claimInput}
                  onChange={(e) => setClaimInput(e.target.value)}
                  placeholder="Ej. STT-1002"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white font-mono uppercase focus:outline-none focus:border-amber-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition"
              >
                Vincular a mi Cuenta
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- QR MODAL ---------------- */}
      {qrModalCard && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-xs w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <h3 className="font-bold text-white text-sm">{qrModalCard.label}</h3>
            <span className="inline-block text-xs font-mono px-3 py-1 bg-slate-950 text-amber-400 rounded-full border border-slate-800">
              {qrModalCard.card_id}
            </span>
            <div className="bg-white p-4 rounded-2xl mx-auto inline-block">
              {/* Render QR code via Google API service */}
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : 'https://startap.pa'}/r/${qrModalCard.card_id}?m=qr`)}`}
                alt="QR Code"
                className="w-44 h-44 mx-auto"
              />
            </div>
            <p className="text-[11px] text-slate-400">Este QR redirige directamente a la URL de QR configurada (`/r/${qrModalCard.card_id}?m=qr`).</p>
            <button
              onClick={() => setQrModalCard(null)}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-slate-400 uppercase tracking-widest">Cargando Panel...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
