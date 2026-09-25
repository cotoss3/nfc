'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { dbLocal, NfcCard, ScanRecord } from '@/lib/db';
import { authService } from '@/lib/auth';
import { rateLimiter } from '@/lib/rateLimiter';
import Link from 'next/link';
import { 
  Edit2, QrCode, Smartphone, Eye, EyeOff, Check, ExternalLink, BarChart2, 
  ShieldAlert, Folder, Users, Settings, LogOut, Plus, Search, 
  Filter, Copy, Radio, Globe, AlertTriangle, Download, Layers,
  ChevronRight, ArrowUpRight, Lock, Key, Activity, Clock,
  MousePointerClick, RefreshCw, ArrowUpDown, CheckCircle2
} from 'lucide-react';

type ModuleTab = 'devices' | 'behavior' | 'groups' | 'analytics' | 'settings';

interface ClientTapBehaviorItem {
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
  last_read_at: string | null;
  created_at: string;
}

function formatExactDateTime(iso: string | null): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return '';
  return d.toLocaleString('es-PA', {
    timeZone: 'America/Panama',
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatElapsedTime(iso: string | null, nowMs: number): string {
  if (!iso) return '';
  const targetMs = new Date(iso).getTime();
  if (isNaN(targetMs)) return '';

  const diffSec = Math.max(0, Math.floor((nowMs - targetMs) / 1000));
  if (diffSec < 60) {
    return `Hace ${diffSec} seg`;
  }
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) {
    return `Hace ${diffMin} min`;
  }
  const diffHours = Math.floor(diffMin / 60);
  const remMin = diffMin % 60;
  if (diffHours < 24) {
    return remMin > 0 ? `Hace ${diffHours} h ${remMin} min` : `Hace ${diffHours} h`;
  }
  const diffDays = Math.floor(diffHours / 24);
  const remHours = diffHours % 24;
  if (diffDays < 30) {
    return remHours > 0 ? `Hace ${diffDays} d ${remHours} h` : `Hace ${diffDays} días`;
  }
  const diffMonths = Math.floor(diffDays / 30);
  return `Hace ${diffMonths} mes${diffMonths > 1 ? 'es' : ''}`;
}

function DashboardContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<ModuleTab>('devices');

  // User & Auth states
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Cliente TapStar');
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [nameInput, setNameInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  // Recovery Password Modal State
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmailInput, setResetEmailInput] = useState('');
  const [resetMessage, setResetMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [isResetting, setIsResetting] = useState(false);

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

  // Bulk selection & Group Assignment state
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const [bulkGroupTarget, setBulkGroupTarget] = useState('General');
  const [claimGroupInput, setClaimGroupInput] = useState('General');
  const [bulkSuccessMsg, setBulkSuccessMsg] = useState('');

  // Claim state
  const [claimInput, setClaimInput] = useState('');
  const [claimMessage, setClaimMessage] = useState<{ success: boolean; text: string } | null>(null);
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);

  // QR Modal state
  const [qrModalCard, setQrModalCard] = useState<NfcCard | null>(null);

  // Analytics & Behavior states
  const [allScans, setAllScans] = useState<ScanRecord[]>([]);
  const [behaviorItems, setBehaviorItems] = useState<ClientTapBehaviorItem[]>([]);
  const [behaviorLoading, setBehaviorLoading] = useState<boolean>(false);
  const [behaviorSearch, setBehaviorSearch] = useState<string>('');
  const [behaviorStatusFilter, setBehaviorStatusFilter] = useState<'active' | 'with_reads' | 'all'>('active');
  const [behaviorSortBy, setBehaviorSortBy] = useState<'reads' | 'cta' | 'time' | 'code'>('reads');
  const [nowMs, setNowMs] = useState<number>(Date.now());

  const handleClaimTap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!claimInput || !userEmail) return;

    const rawCodes = claimInput
      .split(/[\n,\s]+/)
      .map(c => c.trim())
      .filter(Boolean);

    if (rawCodes.length === 0) return;

    let successCount = 0;
    let lastMsg = '';

    for (const code of rawCodes) {
      const res = dbLocal.claimCard(code, userEmail, userName, claimGroupInput);
      if (res.success) {
        successCount++;
        lastMsg = res.message;
      }
    }

    try {
      const allCards = dbLocal.getCards();
      await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'nfc_cards', value: allCards })
      });
    } catch (err) {
      console.error('Error sincronizando lote al reclamar:', err);
    }

    if (successCount > 0) {
      setClaimMessage({
        success: true,
        text: rawCodes.length > 1
          ? `¡Se vincularon ${successCount} dispositivos al grupo "${claimGroupInput}" exitosamente!`
          : lastMsg
      });
      loadUserData(userEmail);
      setTimeout(() => {
        setIsClaimModalOpen(false);
        setClaimMessage(null);
        setClaimInput('');
      }, 1500);
    } else {
      setClaimMessage({ success: false, text: 'No se pudo vincular ninguno de los códigos ingresados.' });
    }
  };

  const handleSelectAllCards = () => {
    if (selectedCardIds.length === filteredCards.length) {
      setSelectedCardIds([]);
    } else {
      setSelectedCardIds(filteredCards.map(c => c.card_id));
    }
  };

  const handleToggleSelectCard = (cardId: string) => {
    setSelectedCardIds(prev =>
      prev.includes(cardId) ? prev.filter(id => id !== cardId) : [...prev, cardId]
    );
  };

  const handleBulkAssignGroup = async () => {
    if (selectedCardIds.length === 0 || !userEmail) return;

    dbLocal.bulkUpdateCardsGroup(selectedCardIds, bulkGroupTarget, userEmail);
    try {
      const allCards = dbLocal.getCards();
      await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'nfc_cards', value: allCards })
      });
    } catch (err) {
      console.error('Error en asignación masiva de grupo:', err);
    }

    setBulkSuccessMsg(`¡Se asignaron ${selectedCardIds.length} tarjeta(s) al grupo "${bulkGroupTarget}"!`);
    loadUserData(userEmail);
    setSelectedCardIds([]);
    setTimeout(() => setBulkSuccessMsg(''), 3000);
  };

  const handleBulkToggleActive = async (isActive: boolean) => {
    if (selectedCardIds.length === 0 || !userEmail) return;

    dbLocal.bulkUpdateCardsActiveStatus(selectedCardIds, isActive, userEmail);
    try {
      const allCards = dbLocal.getCards();
      await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'nfc_cards', value: allCards })
      });
    } catch (err) {
      console.error('Error en cambio masivo de estado:', err);
    }

    setBulkSuccessMsg(`¡Se ${isActive ? 'activaron' : 'desactivaron'} ${selectedCardIds.length} tarjeta(s)!`);
    loadUserData(userEmail);
    setSelectedCardIds([]);
    setTimeout(() => setBulkSuccessMsg(''), 3000);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryEmail = searchParams.get('email');
      const claimCode = searchParams.get('claim');
      const sessionName = sessionStorage.getItem('current_user_name');

      if (queryEmail) {
        setEmailInput(queryEmail);
      }

      if (sessionName) {
        setUserName(sessionName);
      }

      if (claimCode) {
        setClaimInput(claimCode);
        setIsClaimModalOpen(true);
      }

      // Verificar si hay una sesión activa y verificada de Supabase Auth
      authService.getSession().then(session => {
        if (session?.user?.email) {
          const email = session.user.email;
          const name = session.user.user_metadata?.full_name || session.user.user_metadata?.name || email.split('@')[0];
          setUserEmail(email);
          setUserName(name);
          loadUserData(email);
        } else {
          // Si no hay sesión activa verificada, no se exponen los dispositivos
          setUserEmail(null);
        }
      }).catch(err => {
        console.error('[DASHBOARD_AUTH_CHECK_ERROR]', err);
        setUserEmail(null);
      });
    }
  }, [searchParams]);

  const fetchClientBehavior = async (email: string, silent = false) => {
    if (!email) return;
    if (!silent) setBehaviorLoading(true);
    try {
      const res = await fetch(`/api/r/event?owner_email=${encodeURIComponent(email.trim().toLowerCase())}`, {
        cache: 'no-store',
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.items)) {
        setBehaviorItems(data.items);
      }
    } catch (err) {
      console.error('Error cargando comportamiento de TAPs del cliente:', err);
    } finally {
      if (!silent) setBehaviorLoading(false);
    }
  };

  useEffect(() => {
    if (!userEmail) return;
    fetchClientBehavior(userEmail, false);
    const pollInterval = setInterval(() => {
      fetchClientBehavior(userEmail, true);
    }, 10000);
    const clockInterval = setInterval(() => {
      setNowMs(Date.now());
    }, 10000);
    return () => {
      clearInterval(pollInterval);
      clearInterval(clockInterval);
    };
  }, [userEmail]);

  const loadUserData = async (email: string) => {
    // Carga síncrona inmediata (local)
    const initialCards = dbLocal.getCardsByOwner(email);
    const userScans = dbLocal.getScansForOwner(email);
    const groups = dbLocal.getGroupsForOwner(email);

    setCards(initialCards);
    setAllScans(userScans);
    setGroupsList(groups);

    if (initialCards.length > 0) {
      handleSelectCard(initialCards[0]);
    }

    fetchClientBehavior(email, true);

    // Sincronización en tiempo real desde Supabase
    try {
      const remoteCards = await dbLocal.getCardsByOwnerAsync(email);
      setCards(remoteCards);
      if (remoteCards.length > 0) {
        handleSelectCard(remoteCards[0]);
      }
    } catch (e) {
      console.error('Error sincronizando tarjetas de usuario:', e);
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    setAuthLoading(true);
    try {
      await authService.signInWithGoogle();
    } catch (err: any) {
      setAuthError(err.message || 'Error al conectar con Google OAuth');
      setAuthLoading(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const email = emailInput.trim().toLowerCase();
    if (!email) {
      setAuthError('Por favor ingresa un correo electrónico.');
      return;
    }

    if (!passwordInput || passwordInput.length < 6) {
      setAuthError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    // Verificar límite de tasa de seguridad (máximo 5 intentos en 30 minutos)
    const limitCheck = rateLimiter.checkLimit(email);
    if (!limitCheck.allowed) {
      setAuthError(limitCheck.message || 'Demasiados intentos fallidos. Inténtalo más tarde.');
      return;
    }

    setAuthLoading(true);
    const name = nameInput.trim() || email.split('@')[0];

    try {
      if (authMode === 'register') {
        await authService.signUpWithEmail(email, passwordInput, name);
      } else {
        await authService.signInWithEmail(email, passwordInput);
      }

      // Si la autenticación es exitosa, limpiar los intentos fallidos
      rateLimiter.clearAttempts(email);
      dbLocal.registerUser(name, email);
      setUserEmail(email);
      setUserName(name);
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('current_user_email', email);
        sessionStorage.setItem('current_user_name', name);
      }
      loadUserData(email);
    } catch (err: any) {
      // Registrar intento fallido
      const attemptRes = rateLimiter.recordFailedAttempt(email);
      setAuthError(`${err.message || 'Error de autenticación.'} ${attemptRes.message}`);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetMessage(null);
    const email = resetEmailInput.trim().toLowerCase();
    if (!email) return;

    // Verificar límite de 5 intentos en 30 minutos
    const limitCheck = rateLimiter.checkLimit(email);
    if (!limitCheck.allowed) {
      setResetMessage({
        success: false,
        text: limitCheck.message || 'Has superado el límite de 5 intentos en 30 minutos.'
      });
      return;
    }

    setIsResetting(true);
    try {
      await authService.resetPassword(email);
      rateLimiter.clearAttempts(email);
      setResetMessage({
        success: true,
        text: '¡Enlace enviado! Revisa tu bandeja de entrada o spam para restablecer tu contraseña.'
      });
    } catch (err: any) {
      const attemptRes = rateLimiter.recordFailedAttempt(email);
      setResetMessage({
        success: false,
        text: `${err.message || 'Error enviando correo de restablecimiento.'} ${attemptRes.message}`
      });
    } finally {
      setIsResetting(false);
    }
  };

  const handleLogout = async () => {
    await authService.signOut();
    setUserEmail(null);
    setCards([]);
    setSelectedCard(null);
    setAllScans([]);
    setBehaviorItems([]);
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

  const [updateError, setUpdateError] = useState<string | null>(null);

  const handleUpdateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;

    setUpdateError(null);
    let cleanNfc = editNfcUrl.trim();
    if (cleanNfc && !cleanNfc.startsWith('http://') && !cleanNfc.startsWith('https://')) {
      cleanNfc = `https://${cleanNfc}`;
    }

    let cleanQr = editQrUrl.trim();
    if (cleanQr && !cleanQr.startsWith('http://') && !cleanQr.startsWith('https://')) {
      cleanQr = `https://${cleanQr}`;
    }

    setIsUpdating(true);
    const result = dbLocal.updateCardRedirect(
      selectedCard.card_id, 
      cleanNfc, 
      cleanQr, 
      editLabel, 
      editGroup,
      userEmail || undefined
    );

    if (!result.success) {
      setUpdateError(result.message);
      setIsUpdating(false);
      return;
    }
    
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
      fetchClientBehavior(userEmail, true);
    }
    
    setTimeout(() => setUpdateSuccess(false), 2000);
    setIsUpdating(false);
  };

  const handleDeleteCard = async (cardId: string) => {
    if (!userEmail) return;
    if (!confirm(`¿Estás seguro de que deseas desvincular el dispositivo ${cardId} de tu cuenta comercial (${userEmail})?`)) return;

    const res = dbLocal.deleteCard(cardId, userEmail);
    if (res.success) {
      try {
        const allCards = dbLocal.getCards();
        await fetch('/api/cards', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ key: 'nfc_cards', value: allCards })
        });
      } catch (err) {
        console.error('Error sincronizando al desvincular:', err);
      }
      loadUserData(userEmail);
    } else {
      alert(res.message);
    }
  };

  const handleToggleCardActive = async (cardId: string, currentActiveStatus: boolean) => {
    const newStatus = !currentActiveStatus;
    dbLocal.toggleCardActive(cardId, newStatus);
    
    try {
      const allCards = dbLocal.getCards();
      await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'nfc_cards', value: allCards })
      });
    } catch (err) {
      console.error('Error sincronizando estado activo:', err);
    }

    const updatedCards = cards.map(c => 
      c.card_id === cardId ? { ...c, is_active: newStatus } : c
    );
    setCards(updatedCards);

    if (selectedCard && selectedCard.card_id === cardId) {
      setSelectedCard({ ...selectedCard, is_active: newStatus });
    }
    if (userEmail) {
      fetchClientBehavior(userEmail, true);
    }
  };

  const handleCreateGroup = (e: React.FormEvent) => {
    e.preventDefault();
    const gName = newGroupNameInput.trim();
    if (!gName) return;

    if (userEmail) {
      dbLocal.addGroupForOwner(userEmail, gName);
      setGroupsList(dbLocal.getGroupsForOwner(userEmail));
    } else if (!groupsList.includes(gName)) {
      setGroupsList([...groupsList, gName]);
    }
    setNewGroupNameInput('');
    setCreateGroupSuccess(true);
    setTimeout(() => setCreateGroupSuccess(false), 2000);
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

  // Comportamiento de TAPs del cliente (filtrado y ordenado sin anuncios)
  const ownedCardIdsSet = useMemo(
    () => new Set(cards.map((c) => c.card_id.trim().toUpperCase())),
    [cards]
  );

  const clientBehaviorSource = useMemo(() => {
    const byId = new Map<string, ClientTapBehaviorItem>();
    for (const item of behaviorItems) {
      const key = item.card_id.trim().toUpperCase();
      if (
        ownedCardIdsSet.has(key) ||
        (userEmail && (item.owner_email || '').trim().toLowerCase() === userEmail.trim().toLowerCase())
      ) {
        byId.set(key, item);
      }
    }
    for (const c of cards) {
      const key = c.card_id.trim().toUpperCase();
      if (!byId.has(key)) {
        byId.set(key, {
          card_id: c.card_id,
          activation_code: c.activation_code || c.card_id,
          business_name: c.label || c.group_name || userName || c.card_id,
          label: c.label || '',
          group_name: c.group_name || 'General',
          owner_name: c.owner_name || userName,
          owner_email: c.owner_email || userEmail || '',
          target_url: c.nfc_target_url || c.target_url || c.qr_target_url || '',
          type: c.type || 'google',
          is_active: Boolean(c.is_active),
          claimed: Boolean(c.claimed),
          total_reads: 0,
          nfc_reads: 0,
          qr_reads: 0,
          auto_time_count: 0,
          cta_click_count: 0,
          last_read_at: null,
          created_at: c.created_at,
        });
      }
    }
    return Array.from(byId.values());
  }, [behaviorItems, cards, ownedCardIdsSet, userEmail, userName]);

  const filteredBehaviorItems = useMemo(() => {
    const q = behaviorSearch.trim().toLowerCase();
    const list = clientBehaviorSource.filter((item) => {
      if (behaviorStatusFilter === 'active' && !item.is_active) return false;
      if (behaviorStatusFilter === 'with_reads' && item.total_reads === 0) return false;

      if (q) {
        const matchCode = item.card_id.toLowerCase().includes(q);
        const matchName = (item.business_name || '').toLowerCase().includes(q);
        const matchLabel = (item.label || '').toLowerCase().includes(q);
        const matchGroup = (item.group_name || '').toLowerCase().includes(q);
        return matchCode || matchName || matchLabel || matchGroup;
      }
      return true;
    });

    return list.sort((a, b) => {
      if (behaviorSortBy === 'reads') {
        if (b.total_reads !== a.total_reads) return b.total_reads - a.total_reads;
        return a.card_id.localeCompare(b.card_id);
      }
      if (behaviorSortBy === 'cta') {
        if (b.cta_click_count !== a.cta_click_count) return b.cta_click_count - a.cta_click_count;
        return b.total_reads - a.total_reads;
      }
      if (behaviorSortBy === 'time') {
        if (b.auto_time_count !== a.auto_time_count) return b.auto_time_count - a.auto_time_count;
        return b.total_reads - a.total_reads;
      }
      return a.card_id.localeCompare(b.card_id);
    });
  }, [clientBehaviorSource, behaviorSearch, behaviorStatusFilter, behaviorSortBy]);

  const behaviorTotals = useMemo(() => {
    const base =
      behaviorStatusFilter === 'active'
        ? clientBehaviorSource.filter((i) => i.is_active)
        : filteredBehaviorItems;

    let totalReads = 0;
    let totalNfc = 0;
    let totalQr = 0;
    let autoTime = 0;
    let ctaClick = 0;

    for (const i of base) {
      totalReads += i.total_reads;
      totalNfc += i.nfc_reads;
      totalQr += i.qr_reads;
      autoTime += i.auto_time_count;
      ctaClick += i.cta_click_count;
    }

    return {
      activeCount: clientBehaviorSource.filter((i) => i.is_active).length,
      totalReads,
      totalNfc,
      totalQr,
      autoTime,
      ctaClick,
    };
  }, [clientBehaviorSource, filteredBehaviorItems, behaviorStatusFilter]);

  const formatPercent = (part: number, total: number) => {
    if (!total || total <= 0) return '0%';
    const pct = Math.min(100, Math.round((part / total) * 100));
    return `${pct}%`;
  };

  const exportBehaviorCsv = () => {
    const headers = [
      'Nombre de Dispositivo / Negocio',
      'Grupo / Sucursal',
      'Codigo de TAP',
      'Estado',
      'Veces Leido (Total)',
      'Lecturas NFC',
      'Lecturas QR',
      'Redirigido por Tiempo (8s)',
      'Toco Boton de Resena',
      'Fecha y Hora Ultima Lectura',
      'Tiempo Transcurrido',
    ];

    const rows = filteredBehaviorItems.map((i) => [
      `"${(i.label || i.business_name || '').replace(/"/g, '""')}"`,
      `"${(i.group_name || 'General').replace(/"/g, '""')}"`,
      i.card_id,
      i.is_active ? 'ACTIVO' : 'INACTIVO',
      i.total_reads,
      i.nfc_reads,
      i.qr_reads,
      i.auto_time_count,
      i.cta_click_count,
      i.last_read_at ? `"${formatExactDateTime(i.last_read_at)}"` : 'Sin lecturas',
      i.last_read_at ? `"${formatElapsedTime(i.last_read_at, nowMs)}"` : '-',
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,\uFEFF' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `comportamiento_mis_taps_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Calculate analytics
  const nfcScansCount = Math.max(
    allScans.filter(s => s.scan_type === 'nfc' || s.referrer.toLowerCase().includes('nfc')).length,
    behaviorTotals.totalNfc
  );
  const qrScansCount = Math.max(
    allScans.filter(s => s.scan_type === 'qr' || s.referrer.toLowerCase().includes('qr')).length,
    behaviorTotals.totalQr
  );
  const totalScansCount = Math.max(allScans.length, nfcScansCount + qrScansCount);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row pb-20 md:pb-0">
      
      {/* ---------------- LOGIN & REGISTRATION OVERLAY (LIGHT THEME) ---------------- */}
      {!userEmail ? (
        <div className="flex-1 flex items-center justify-center p-4 bg-slate-100/80">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-8 shadow-xl space-y-6">
            <div className="text-center space-y-2">
              <div className="inline-flex p-3 bg-amber-500/10 border border-amber-500/20 text-amber-600 rounded-2xl mb-2">
                <Smartphone className="w-8 h-8" />
              </div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">starTAP Panamá</h1>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold">Panel de Control de Administración</p>
            </div>

            {/* Google Sign-In Button */}
            <button
              type="button"
              disabled={authLoading}
              onClick={handleGoogleSignIn}
              className="w-full py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl shadow-sm transition flex items-center justify-center gap-2.5 active:scale-[0.99]"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>Continuar con Google</span>
            </button>

            <div className="relative flex items-center justify-center my-2">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-3 text-[10px] text-slate-400 font-bold uppercase tracking-wider absolute">o con tu contraseña</span>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2.5 rounded-lg transition ${authMode === 'login' ? 'bg-slate-900 text-white font-bold shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Iniciar Sesión
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('register')}
                className={`flex-1 py-2.5 rounded-lg transition ${authMode === 'register' ? 'bg-slate-900 text-white font-bold shadow-sm' : 'text-slate-500 hover:text-slate-900'}`}
              >
                Registrar Comercio
              </button>
            </div>

            <form onSubmit={handleAuthSubmit} className="space-y-4">
              {authError && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs flex items-center gap-2 font-medium">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authMode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nombre del Establecimiento / Comercio</label>
                  <input
                    type="text"
                    required
                    value={nameInput}
                    onChange={(e) => setNameInput(e.target.value)}
                    placeholder="Ej. Restaurante El Trapiche"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Correo Electrónico Propietario</label>
                <input
                  type="email"
                  required
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="ejemplo@comercio.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Contraseña</label>
                  {authMode === 'login' && (
                    <button
                      type="button"
                      onClick={() => setIsResetModalOpen(true)}
                      className="text-[11px] font-bold text-amber-600 hover:underline"
                    >
                      ¿Olvidaste tu contraseña?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900 transition pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3.5 text-slate-400 hover:text-slate-700"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl shadow-md transition text-sm uppercase tracking-wider flex items-center justify-center gap-2"
              >
                {authLoading ? 'Procesando...' : (authMode === 'login' ? 'Acceder al Panel' : 'Crear Cuenta Administrador')}
              </button>
            </form>

            <div className="pt-4 border-t border-slate-200 text-center">
              <p className="text-xs text-slate-500">¿Tienes un código de activación en tu caja?</p>
              <button
                type="button"
                onClick={() => {
                  setAuthMode('register');
                  setEmailInput('');
                }}
                className="text-xs font-bold text-amber-600 hover:underline mt-1 inline-block"
              >
                Vincular nueva placa STT-XXXX
              </button>
            </div>
          </div>
        </div>
      ) : (

        /* ---------------- MAIN DASHBOARD LAYOUT (LIGHT THEME) ---------------- */
        <>
          {/* MOBILE TOP HEADER BAR */}
          <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 bg-amber-500 text-slate-950 font-black rounded-lg flex items-center justify-center text-xs shadow-sm">
                ST
              </div>
              <div>
                <h2 className="text-xs font-black text-slate-900 leading-tight">starTAP</h2>
                <p className="text-[9px] text-amber-600 font-bold uppercase tracking-wider">{userName}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsClaimModalOpen(true)}
                className="p-2 bg-amber-500 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1 shadow-sm"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-rose-600 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* DESKTOP SIDEBAR NAVIGATION (LIGHT MODE) */}
          <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0">
            {/* Header / Brand */}
            <div className="p-5 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-amber-500 text-slate-950 font-black rounded-xl flex items-center justify-center text-sm shadow-md shadow-amber-500/20">
                  ST
                </div>
                <div>
                  <h2 className="text-sm font-black text-slate-900 leading-tight">starTAP</h2>
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Panamá Pro</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                title="Cerrar Sesión"
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* Tenant User Info Card */}
            <div className="p-4 border-b border-slate-200 bg-slate-50/60">
              <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="truncate font-semibold text-slate-900">{userName}</span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">{userEmail}</p>
            </div>

            {/* Navigation Modules */}
            <nav className="p-3 space-y-1 flex-1">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">
                Módulos de Gestión
              </div>

              <button
                onClick={() => setActiveTab('devices')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'devices'
                    ? 'bg-slate-900 text-white shadow-md font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Smartphone className="w-4 h-4" />
                  <span>Dispositivos TAP</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'devices' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600'}`}>
                  {cards.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('behavior')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'behavior'
                    ? 'bg-slate-900 text-white shadow-md font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4" />
                  <span>Comportamiento</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'behavior' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600'}`}>
                  {behaviorTotals.totalReads}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('groups')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'groups'
                    ? 'bg-slate-900 text-white shadow-md font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Folder className="w-4 h-4" />
                  <span>Grupos y Sucursales</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'groups' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600'}`}>
                  {groupsList.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('analytics')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'analytics'
                    ? 'bg-slate-900 text-white shadow-md font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart2 className="w-4 h-4" />
                  <span>Analíticas de Grupo</span>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'analytics' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600'}`}>
                  {totalScansCount}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                  activeTab === 'settings'
                    ? 'bg-slate-900 text-white shadow-md font-bold'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4" />
                  <span>Ajustes & Exportar</span>
                </div>
              </button>
            </nav>

            {/* Footer Action */}
            <div className="p-4 border-t border-slate-200">
              <button
                onClick={() => setIsClaimModalOpen(true)}
                className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus className="w-4 h-4" />
                <span>Vincular Nueva Placa</span>
              </button>
            </div>
          </aside>

          {/* MOBILE BOTTOM NAVIGATION BAR (NATIVE MOBILE APP STYLE) */}
          <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 flex items-center justify-around py-2 px-1 shadow-lg shadow-slate-900/10">
            <button
              onClick={() => setActiveTab('devices')}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
                activeTab === 'devices' ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Smartphone className="w-5 h-5" />
              <span className="text-[10px] font-semibold">Dispositivos</span>
            </button>

            <button
              onClick={() => setActiveTab('behavior')}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
                activeTab === 'behavior' ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Activity className="w-5 h-5" />
              <span className="text-[10px] font-semibold">Comportamiento</span>
            </button>

            <button
              onClick={() => setActiveTab('groups')}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
                activeTab === 'groups' ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Folder className="w-5 h-5" />
              <span className="text-[10px] font-semibold">Grupos</span>
            </button>

            <button
              onClick={() => setActiveTab('analytics')}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
                activeTab === 'analytics' ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <BarChart2 className="w-5 h-5" />
              <span className="text-[10px] font-semibold">Analíticas</span>
            </button>

            <button
              onClick={() => setActiveTab('settings')}
              className={`flex flex-col items-center gap-1 py-1 px-2.5 rounded-xl transition ${
                activeTab === 'settings' ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-600'
              }`}
            >
              <Settings className="w-5 h-5" />
              <span className="text-[10px] font-semibold">Ajustes</span>
            </button>
          </nav>

          {/* MAIN CONTENT AREA (LIGHT THEME) */}
          <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">

            {/* ---------------- MODULE 1: DISPOSITIVOS TAP ---------------- */}
            {activeTab === 'devices' && (
              <div className="space-y-6">
                {/* Mobile Top Banner: Vincular Nueva Placa */}
                <div className="md:hidden p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 bg-amber-500 text-slate-950 rounded-xl flex items-center justify-center font-bold shrink-0">
                      <Plus className="w-5 h-5 stroke-[2.5]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">¿Tienes una nueva placa?</h4>
                      <p className="text-[11px] text-slate-500">Ingresa el código STT-XXXX</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsClaimModalOpen(true)}
                    className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-sm transition uppercase tracking-wider shrink-0"
                  >
                    Vincular
                  </button>
                </div>

                {/* Header Bar */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                  <div>
                    <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-amber-500" />
                      Gestión de Dispositivos TAP
                    </h1>
                    <p className="text-xs text-slate-500 mt-1">Configura enlaces independientes para lectura NFC y Código QR impreso.</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {/* Search */}
                    <div className="relative flex-1 md:w-auto">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Buscar placa..."
                        className="w-full bg-white border border-slate-200 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
                      />
                    </div>
                    {/* Group Filter */}
                    <select
                      value={selectedGroupFilter}
                      onChange={(e) => setSelectedGroupFilter(e.target.value)}
                      className="bg-white border border-slate-200 text-xs rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:border-slate-900 font-medium"
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
                    <div className="flex flex-wrap items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider px-1 gap-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={filteredCards.length > 0 && selectedCardIds.length === filteredCards.length}
                          onChange={handleSelectAllCards}
                          className="w-4 h-4 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                        />
                        <span>Tarjetas ({filteredCards.length})</span>
                      </div>
                      <button
                        onClick={() => setIsClaimModalOpen(true)}
                        className="px-2.5 py-1 bg-amber-500/20 hover:bg-amber-500/30 text-amber-900 border border-amber-300 rounded-lg text-[11px] font-bold flex items-center gap-1 transition"
                      >
                        <Plus className="w-3.5 h-3.5 text-amber-600" />
                        <span>Vincular Lote</span>
                      </button>
                    </div>

                    {/* Mensaje de Confirmación de Acción en Grupo */}
                    {bulkSuccessMsg && (
                      <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl shadow-sm animate-pulse">
                        {bulkSuccessMsg}
                      </div>
                    )}

                    {/* Barra de Acciones Masivas / Gestión en Grupo */}
                    {selectedCardIds.length > 0 && (
                      <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-2.5 shadow-sm">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-black text-amber-900 uppercase tracking-wider">
                            ⚡ {selectedCardIds.length} tarjeta(s) seleccionada(s)
                          </span>
                          <button
                            type="button"
                            onClick={() => setSelectedCardIds([])}
                            className="text-[10px] font-bold text-slate-500 hover:text-slate-900 underline"
                          >
                            Limpiar selección
                          </button>
                        </div>

                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <select
                              value={bulkGroupTarget}
                              onChange={(e) => setBulkGroupTarget(e.target.value)}
                              className="flex-1 bg-white border border-slate-300 text-xs rounded-xl px-3 py-1.5 text-slate-800 font-medium focus:outline-none focus:border-slate-900"
                            >
                              <option value="General">Grupo: General</option>
                              {groupsList.filter(g => g !== 'General').map(g => (
                                <option key={g} value={g}>Grupo: {g}</option>
                              ))}
                            </select>

                            <button
                              type="button"
                              onClick={handleBulkAssignGroup}
                              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition shrink-0"
                            >
                              Asignar Grupo
                            </button>
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => handleBulkToggleActive(true)}
                              className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition shadow-sm"
                            >
                              Activar Grupo
                            </button>
                            <button
                              type="button"
                              onClick={() => handleBulkToggleActive(false)}
                              className="flex-1 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px] uppercase tracking-wider rounded-xl transition shadow-sm"
                            >
                              Desactivar Grupo
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {filteredCards.length === 0 ? (
                      <div className="p-8 bg-white border border-slate-200 rounded-2xl text-center space-y-3 shadow-sm">
                        <ShieldAlert className="w-8 h-8 text-amber-500 mx-auto opacity-60" />
                        <p className="text-xs text-slate-500">No se encontraron dispositivos en este filtro.</p>
                        <button
                          onClick={() => setIsClaimModalOpen(true)}
                          className="px-4 py-2 bg-amber-500 text-slate-950 font-bold text-xs rounded-xl"
                        >
                          Reclamar Lote de Dispositivos
                        </button>
                      </div>
                    ) : (
                      filteredCards.map((card) => {
                        const isSelected = selectedCard?.card_id === card.card_id;
                        const isChecked = selectedCardIds.includes(card.card_id);
                        const hasNfc = !!(card.nfc_target_url || card.target_url);
                        const hasQr = !!card.qr_target_url;

                        return (
                          <div
                            key={card.card_id}
                            onClick={() => handleSelectCard(card)}
                            className={`p-4 rounded-2xl border transition cursor-pointer relative ${
                              isSelected 
                                ? 'bg-white border-amber-500 shadow-md ring-2 ring-amber-500/20' 
                                : 'bg-white border-slate-200/90 hover:border-slate-300 shadow-sm'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start gap-3">
                                <input
                                  type="checkbox"
                                  checked={isChecked}
                                  onChange={(e) => {
                                    e.stopPropagation();
                                    handleToggleSelectCard(card.card_id);
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-4 h-4 mt-0.5 rounded text-amber-500 focus:ring-amber-500 cursor-pointer"
                                />
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-slate-900">{card.label}</span>
                                    <span className="text-[10px] font-mono px-2 py-0.5 bg-slate-100 border border-slate-200 text-amber-700 font-bold rounded-md">
                                      {card.card_id}
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2 text-[11px] text-slate-500">
                                    <Folder className="w-3 h-3 text-slate-400" />
                                    <span className="font-semibold text-slate-700">{card.group_name || 'General'}</span>
                                  </div>
                                </div>
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setQrModalCard(card);
                                }}
                                title="Ver Código QR impreso"
                                className="p-2 bg-slate-100 border border-slate-200 rounded-xl text-slate-600 hover:text-amber-600 transition"
                              >
                                <QrCode className="w-4 h-4" />
                              </button>
                            </div>

                            {/* Status & Dual URL Badges */}
                            <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[10px] font-semibold">
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded-full flex items-center gap-1 ${hasNfc ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'}`}>
                                  <Radio className="w-3 h-3" />
                                  {hasNfc ? 'NFC Configurado' : 'NFC En blanco'}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full flex items-center gap-1 ${hasQr ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
                                  <QrCode className="w-3 h-3" />
                                  {hasQr ? 'QR Configurado' : 'QR En blanco'}
                                </span>
                              </div>

                              <div className="flex items-center gap-1.5">
                                <span className={`px-2 py-0.5 rounded-full font-bold border ${card.is_active ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'}`}>
                                  {card.is_active ? '🟢 Activo' : '🔴 Inactivo'}
                                </span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleCardActive(card.card_id, card.is_active);
                                  }}
                                  className={`px-2.5 py-0.5 rounded font-bold text-[10px] uppercase tracking-wider border transition ${
                                    card.is_active 
                                      ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300' 
                                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300'
                                  }`}
                                >
                                  {card.is_active ? 'Desactivar' : 'Activar'}
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Right Column: Dual URL Editor Form */}
                  <div className="lg:col-span-7">
                    {selectedCard ? (
                      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-6">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                          <div>
                            <span className="text-[10px] font-mono text-amber-600 font-bold uppercase tracking-widest">Configuración Dual</span>
                            <h2 className="text-lg font-bold text-slate-900">{selectedCard.label}</h2>
                          </div>
                          <span className="text-xs font-mono px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200 font-bold">
                            {selectedCard.card_id}
                          </span>
                        </div>

                        {/* Banner Control Estado Activo / Inactivo */}
                        <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">Estado del Dispositivo:</span>
                              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold border ${selectedCard.is_active ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : 'bg-rose-100 text-rose-800 border-rose-300'}`}>
                                {selectedCard.is_active ? '🟢 HABILITADO / ACTIVO' : '🔴 BLOQUEADO / INACTIVO'}
                              </span>
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1">
                              {selectedCard.is_active 
                                ? 'El dispositivo está activo y redirige escaneos NFC/QR a la URL configurada.' 
                                : 'El dispositivo está inactivo. Quien lo escanee verá una pantalla de aviso de inactivo.'}
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleToggleCardActive(selectedCard.card_id, selectedCard.is_active)}
                            className={`w-full sm:w-auto px-4 py-2 text-xs font-bold rounded-xl border transition shadow-sm uppercase tracking-wider shrink-0 ${
                              selectedCard.is_active
                                ? 'bg-rose-600 hover:bg-rose-700 text-white border-rose-700'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-700'
                            }`}
                          >
                            {selectedCard.is_active ? 'Desactivar Dispositivo' : 'Activar Dispositivo'}
                          </button>
                        </div>

                        <form onSubmit={handleUpdateCard} className="space-y-5">
                          {/* Label */}
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Nombre / Etiqueta del Dispositivo</label>
                            <input
                              type="text"
                              value={editLabel}
                              onChange={(e) => setEditLabel(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                            />
                          </div>

                          {/* Group Assignment */}
                          <div>
                            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Grupo / Sucursal Asignada</label>
                            <select
                              value={editGroup}
                              onChange={(e) => setEditGroup(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                            >
                              {groupsList.map(g => (
                                <option key={g} value={g}>{g}</option>
                              ))}
                            </select>
                          </div>

                          {/* Box de URLs de Grabación para NFC y QR */}
                          <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-2xl space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                                <Copy className="w-4 h-4 text-amber-600" />
                                URLs Asignadas para Grabación NFC y Código QR
                              </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                                <div className="flex items-center justify-between text-[10px] font-bold text-emerald-800 uppercase">
                                  <span>URL para Programador NFC</span>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(`${window.location.origin}/r/${selectedCard.card_id}?m=nfc`, 'nfc_write')}
                                    className="px-2 py-0.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold rounded flex items-center gap-1"
                                  >
                                    <Copy className="w-3 h-3" />
                                    <span>{copiedLink === 'nfc_write' ? '¡Copiado!' : 'Copiar URL'}</span>
                                  </button>
                                </div>
                                <p className="font-mono text-[11px] text-slate-800 break-all select-all font-bold">
                                  {typeof window !== 'undefined' ? window.location.origin : 'https://startap.com.pa'}/r/{selectedCard.card_id}?m=nfc
                                </p>
                              </div>

                              <div className="bg-white p-3 rounded-xl border border-slate-200 space-y-1">
                                <div className="flex items-center justify-between text-[10px] font-bold text-blue-800 uppercase">
                                  <span>URL para Código QR</span>
                                  <button
                                    type="button"
                                    onClick={() => copyToClipboard(`${window.location.origin}/r/${selectedCard.card_id}?m=qr`, 'qr_write')}
                                    className="px-2 py-0.5 bg-blue-100 hover:bg-blue-200 text-blue-900 font-bold rounded flex items-center gap-1"
                                  >
                                    <Copy className="w-3 h-3" />
                                    <span>{copiedLink === 'qr_write' ? '¡Copiado!' : 'Copiar URL'}</span>
                                  </button>
                                </div>
                                <p className="font-mono text-[11px] text-slate-800 break-all select-all font-bold">
                                  {typeof window !== 'undefined' ? window.location.origin : 'https://startap.com.pa'}/r/{selectedCard.card_id}?m=qr
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Dual URLs */}
                          <div className="space-y-4 pt-2 border-t border-slate-100">
                            {/* NFC URL Field */}
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-emerald-700 flex items-center gap-1.5 uppercase tracking-wider">
                                  <Radio className="w-4 h-4" />
                                  1. Redirección para Escaneo NFC (Aproximación física)
                                </label>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(`${window.location.origin}/r/${selectedCard.card_id}?m=nfc`, 'nfc')}
                                  className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 font-semibold"
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
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-emerald-600 font-mono"
                              />
                              <p className="text-[11px] text-slate-500">URL a la que se dirigirá cuando el cliente acerque su celular al chip NFC.</p>
                            </div>

                            {/* QR URL Field */}
                            <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                              <div className="flex items-center justify-between">
                                <label className="text-xs font-bold text-blue-700 flex items-center gap-1.5 uppercase tracking-wider">
                                  <QrCode className="w-4 h-4" />
                                  2. Redirección para Código QR impreso
                                </label>
                                <button
                                  type="button"
                                  onClick={() => copyToClipboard(`${window.location.origin}/r/${selectedCard.card_id}?m=qr`, 'qr')}
                                  className="text-[11px] text-slate-500 hover:text-slate-900 flex items-center gap-1 font-semibold"
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
                                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-blue-600 font-mono"
                              />
                              <p className="text-[11px] text-slate-500">Si se deja en blanco, al escanear el QR mostrará aviso elegante de "No configurado".</p>
                            </div>
                          </div>

                          {updateError && (
                            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold rounded-xl flex items-center gap-2">
                              <AlertTriangle className="w-4 h-4 shrink-0" />
                              <span>{updateError}</span>
                            </div>
                          )}

                          {/* Submit & Status & Delete */}
                          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
                            <button
                              type="submit"
                              disabled={isUpdating}
                              className="py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2"
                            >
                              {isUpdating ? 'Guardando en Supabase...' : 'Guardar Cambios de Redirección'}
                            </button>

                            <div className="flex items-center justify-between sm:justify-end gap-3">
                              {updateSuccess && (
                                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1.5 animate-pulse">
                                  <Check className="w-4 h-4" />
                                  ¡Sincronizado!
                                </span>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteCard(selectedCard.card_id)}
                                className="py-2.5 px-3 bg-slate-100 hover:bg-rose-50 text-slate-600 hover:text-rose-700 border border-slate-200 hover:border-rose-300 font-bold text-[11px] rounded-xl transition uppercase tracking-wider flex items-center gap-1"
                              >
                                🗑️ Desvincular Dispositivo
                              </button>
                            </div>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <div className="p-12 bg-white border border-slate-200 rounded-3xl text-center text-slate-400 text-xs">
                        Selecciona un dispositivo para editar su configuración.
                      </div>
                    )}
                  </div>

                </div>
              </div>
            )}

            {/* ---------------- MODULE 1.5: COMPORTAMIENTO DE TAPs (SIN ANUNCIOS) ---------------- */}
            {activeTab === 'behavior' && (
              <div className="space-y-6">
                {/* HEADER */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-sm">
                  <div className="space-y-1">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-extrabold uppercase tracking-wider">
                      <Activity className="w-3.5 h-3.5 text-amber-600" />
                      Panel de Visualización de Lecturas
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                      Comportamiento de tus TAPs
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
                      Visualiza en tiempo real cuántas veces ha sido leído cada uno de tus dispositivos (por chip NFC o código QR), cuántos clientes fueron redirigidos por tiempo (8s) y cuántos tocaron directamente el botón de reseña.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5">
                    <button
                      type="button"
                      onClick={exportBehaviorCsv}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs transition"
                    >
                      <Download className="w-4 h-4" />
                      Exportar CSV
                    </button>
                    <button
                      type="button"
                      onClick={() => userEmail && fetchClientBehavior(userEmail, false)}
                      disabled={behaviorLoading}
                      className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition shadow-sm disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${behaviorLoading ? 'animate-spin' : ''}`} />
                      Actualizar Datos
                    </button>
                  </div>
                </div>

                {/* TARJETAS KPI RESUMEN (4 TARJETAS, SIN PUBLICIDAD) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                      <span>TAPs Activos</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                      {behaviorTotals.activeCount}
                    </p>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Habilitados en tu cuenta
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                      <span>Veces Leído</span>
                      <Eye className="w-4 h-4 text-sky-600" />
                    </div>
                    <p className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
                      {behaviorTotals.totalReads}
                    </p>
                    <span className="text-[11px] text-slate-500 font-medium">
                      {behaviorTotals.totalNfc} NFC • {behaviorTotals.totalQr} QR
                    </span>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-bold">
                      <span>Por Tiempo (8s)</span>
                      <Clock className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <p className="text-2xl sm:text-3xl font-black text-indigo-700">
                        {behaviorTotals.autoTime}
                      </p>
                      <span className="text-xs font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {formatPercent(behaviorTotals.autoTime, behaviorTotals.totalReads)}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Redirección automática
                    </span>
                  </div>

                  <div className="bg-white border border-amber-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between text-amber-800 text-xs font-bold">
                      <span>Botón de Reseña</span>
                      <MousePointerClick className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="flex items-baseline gap-2 mt-2">
                      <p className="text-2xl sm:text-3xl font-black text-amber-600">
                        {behaviorTotals.ctaClick}
                      </p>
                      <span className="text-xs font-extrabold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                        {formatPercent(behaviorTotals.ctaClick, behaviorTotals.totalReads)}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-500 font-medium">
                      Toque directo en botón
                    </span>
                  </div>
                </div>

                {/* BARRA DE FILTROS Y BÚSQUEDA */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 shadow-sm">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={behaviorSearch}
                      onChange={(e) => setBehaviorSearch(e.target.value)}
                      placeholder="Buscar por etiqueta, sucursal o código de TAP (ej. STT-1001)..."
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-amber-500 focus:bg-white font-medium text-slate-900"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                      <button
                        type="button"
                        onClick={() => setBehaviorStatusFilter('active')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          behaviorStatusFilter === 'active'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        TAPs Activos ({clientBehaviorSource.filter((i) => i.is_active).length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setBehaviorStatusFilter('with_reads')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          behaviorStatusFilter === 'with_reads'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Con Lecturas ({clientBehaviorSource.filter((i) => i.total_reads > 0).length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setBehaviorStatusFilter('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                          behaviorStatusFilter === 'all'
                            ? 'bg-white text-slate-900 shadow-sm'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        Todos ({clientBehaviorSource.length})
                      </button>
                    </div>

                    <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2">
                      <ArrowUpDown className="w-3.5 h-3.5 text-slate-500" />
                      <select
                        value={behaviorSortBy}
                        onChange={(e) => setBehaviorSortBy(e.target.value as any)}
                        className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                      >
                        <option value="reads">Ordenar: Más veces leído</option>
                        <option value="cta">Ordenar: Más toques al botón</option>
                        <option value="time">Ordenar: Más redirigidos por tiempo</option>
                        <option value="code">Ordenar: Código de TAP</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* TABLA DE COMPORTAMIENTO DEL CLIENTE (SIN COLUMNA DE PUBLICIDAD) */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-black uppercase tracking-wider text-slate-600">
                          <th className="py-3.5 px-4">Dispositivo / Sucursal</th>
                          <th className="py-3.5 px-4">Código de TAP</th>
                          <th className="py-3.5 px-4 text-center">Veces Leído</th>
                          <th className="py-3.5 px-4 text-center">Redirigido por Tiempo (8s)</th>
                          <th className="py-3.5 px-4 text-center">Tocó Botón de Reseña</th>
                          <th className="py-3.5 px-4 text-right">Última Lectura</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
                        {behaviorLoading && filteredBehaviorItems.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                              Cargando comportamiento de tus TAPs...
                            </td>
                          </tr>
                        ) : filteredBehaviorItems.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="py-12 text-center text-slate-500 font-medium">
                              No se encontraron dispositivos TAP con los filtros seleccionados.
                            </td>
                          </tr>
                        ) : (
                          filteredBehaviorItems.map((item) => (
                            <tr key={item.card_id} className="hover:bg-slate-50/80 transition-colors">
                              {/* 1. DISPOSITIVO / SUCURSAL */}
                              <td className="py-3.5 px-4">
                                <div className="font-black text-slate-900 leading-snug">
                                  {item.label || item.business_name}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 mt-1 text-[11px] text-slate-500">
                                  <span className="font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                    {item.group_name || 'General'}
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

                              {/* 2. CÓDIGO DE TAP */}
                              <td className="py-3.5 px-4">
                                <span className="inline-block font-mono font-black text-slate-950 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-lg text-xs whitespace-nowrap">
                                  {item.card_id}
                                </span>
                                <div className="mt-1">
                                  {item.is_active ? (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-700 whitespace-nowrap">
                                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                      TAP Activo
                                    </span>
                                  ) : (
                                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-slate-400 whitespace-nowrap">
                                      <span className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                                      Inactivo
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* 3. VECES LEÍDO (NFC + QR) */}
                              <td className="py-3.5 px-4 text-center">
                                <span className="inline-flex items-center justify-center min-w-[44px] px-2.5 py-1 rounded-xl bg-slate-900 text-white font-black text-sm">
                                  {item.total_reads}
                                </span>
                                <div className="flex items-center justify-center gap-1.5 mt-1.5 text-[10px] font-extrabold whitespace-nowrap">
                                  <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200"
                                    title="Lecturas por Chip NFC"
                                  >
                                    <Smartphone className="w-3 h-3 text-sky-600 shrink-0" />
                                    <span>{item.nfc_reads} NFC</span>
                                  </span>
                                  <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-violet-50 text-violet-800 border border-violet-200"
                                    title="Lecturas por Código QR"
                                  >
                                    <QrCode className="w-3 h-3 text-violet-600 shrink-0" />
                                    <span>{item.qr_reads} QR</span>
                                  </span>
                                </div>
                              </td>

                              {/* 4. REDIRIGIDO POR TIEMPO (8s) */}
                              <td className="py-3.5 px-4 text-center">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 font-black text-sm">
                                  <Clock className="w-3.5 h-3.5 text-indigo-600" />
                                  <span>{item.auto_time_count}</span>
                                </div>
                                <div className="text-[10px] font-bold text-slate-500 mt-1 whitespace-nowrap">
                                  {formatPercent(item.auto_time_count, item.total_reads)} de lecturas
                                </div>
                              </td>

                              {/* 5. TOCÓ BOTÓN DE RESEÑA */}
                              <td className="py-3.5 px-4 text-center">
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 font-black text-sm">
                                  <MousePointerClick className="w-3.5 h-3.5 text-amber-600" />
                                  <span>{item.cta_click_count}</span>
                                </div>
                                <div className="text-[10px] font-bold text-slate-500 mt-1 whitespace-nowrap">
                                  {formatPercent(item.cta_click_count, item.total_reads)} de lecturas
                                </div>
                              </td>

                              {/* 6. ÚLTIMA LECTURA: FECHA Y HORA + TIEMPO TRANSCURRIDO */}
                              <td className="py-3.5 px-4 text-right whitespace-nowrap">
                                {item.last_read_at ? (
                                  <div className="inline-flex flex-col items-end gap-1">
                                    <span className="text-xs font-bold text-slate-900">
                                      {formatExactDateTime(item.last_read_at)}
                                    </span>
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-extrabold">
                                      <Clock className="w-2.5 h-2.5 text-amber-600" />
                                      {formatElapsedTime(item.last_read_at, nowMs)}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400 font-medium">
                                    Sin lecturas aún
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ---------------- MODULE 2: GRUPOS Y SUCURSALES ---------------- */}
            {activeTab === 'groups' && (
              <div className="space-y-6">
                <div className="pb-4 border-b border-slate-200">
                  <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Folder className="w-5 h-5 text-amber-500" />
                    Gestión de Grupos y Sucursales
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">Organiza tus dispositivos por ubicación, departamento o sucursal.</p>
                </div>

                {/* Create New Group */}
                <form onSubmit={handleCreateGroup} className="p-4 bg-white border border-slate-200 rounded-2xl flex flex-col md:flex-row items-center gap-3 shadow-sm">
                  <input
                    type="text"
                    value={newGroupNameInput}
                    onChange={(e) => setNewGroupNameInput(e.target.value)}
                    placeholder="Nombre del nuevo grupo (ej. Sucursal Costa del Este)"
                    className="flex-1 w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-slate-900"
                  />
                  <button
                    type="submit"
                    className="w-full md:w-auto px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-1.5"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Crear Grupo</span>
                  </button>
                  {createGroupSuccess && (
                    <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" /> ¡Creado!
                    </span>
                  )}
                </form>

                {/* Groups Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {groupsList.map(group => {
                    const groupCards = cards.filter(c => (c.group_name || 'General') === group);
                    const groupCardIds = new Set(groupCards.map(c => c.card_id.trim().toUpperCase()));
                    const groupBehaviorReads = clientBehaviorSource
                      .filter(b => groupCardIds.has(b.card_id.trim().toUpperCase()))
                      .reduce((acc, b) => acc + b.total_reads, 0);
                    const groupScans = allScans.filter(s => s.group_name === group);
                    const groupTotalReads = Math.max(groupScans.length, groupBehaviorReads);

                    return (
                      <div key={group} className="p-5 bg-white border border-slate-200 rounded-2xl space-y-3 shadow-sm">
                        <div className="flex items-center justify-between">
                          <h3 className="font-bold text-slate-900 text-sm">{group}</h3>
                          <span className="text-[10px] font-mono px-2.5 py-0.5 bg-amber-50 text-amber-700 font-bold border border-amber-200 rounded-full">
                            {groupCards.length} dispositivos
                          </span>
                        </div>

                        <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                          <div className="flex justify-between">
                            <span>Escaneos Totales:</span>
                            <span className="font-bold text-slate-900">{groupTotalReads}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => {
                            setSelectedGroupFilter(group);
                            setActiveTab('devices');
                          }}
                          className="w-full py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition flex items-center justify-center gap-1"
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
                <div className="pb-4 border-b border-slate-200">
                  <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-amber-500" />
                    Analíticas de Grupo y Rendimiento
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">Métricas de rendimiento comparativas por canal (NFC vs QR) y sucursales.</p>
                </div>

                {/* Key Metric Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Escaneos Totales</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">{totalScansCount}</p>
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest flex items-center gap-1">
                      <Radio className="w-3 h-3" /> Escaneos NFC
                    </span>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{nfcScansCount}</p>
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest flex items-center gap-1">
                      <QrCode className="w-3 h-3" /> Escaneos QR
                    </span>
                    <p className="text-2xl font-black text-blue-600 mt-1">{qrScansCount}</p>
                  </div>
                  <div className="p-4 bg-white border border-slate-200 rounded-2xl shadow-sm">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Grupos Activos</span>
                    <p className="text-2xl font-black text-amber-600 mt-1">{groupsList.length}</p>
                  </div>
                </div>

                {/* Device Performance Breakdown */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Rendimiento por Nombre de Dispositivo</h3>
                  {cards.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-4">No tienes dispositivos registrados.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider">
                            <th className="pb-3">Nombre del Dispositivo</th>
                            <th className="pb-3">Código ID</th>
                            <th className="pb-3">Grupo / Sucursal</th>
                            <th className="pb-3 text-center">Escaneos NFC</th>
                            <th className="pb-3 text-center">Escaneos QR</th>
                            <th className="pb-3 text-right">Total Escaneos</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {cards.map(card => {
                            const deviceScans = allScans.filter(s => s.card_id === card.card_id);
                            const beh = clientBehaviorSource.find(b => b.card_id.trim().toUpperCase() === card.card_id.trim().toUpperCase());
                            const localNfc = deviceScans.filter(s => s.scan_type === 'nfc' || (s.referrer && s.referrer.toLowerCase().includes('nfc'))).length;
                            const localQr = deviceScans.filter(s => s.scan_type === 'qr' || (s.referrer && s.referrer.toLowerCase().includes('qr'))).length;
                            const nfc = Math.max(localNfc, beh?.nfc_reads || 0);
                            const qr = Math.max(localQr, beh?.qr_reads || 0);
                            const totalDevScans = Math.max(deviceScans.length, nfc + qr, beh?.total_reads || 0);
                            return (
                              <tr key={card.card_id} className="hover:bg-slate-50">
                                <td className="py-3 font-bold text-slate-900 flex items-center gap-2">
                                  <Smartphone className="w-4 h-4 text-amber-500 shrink-0" />
                                  <span>{card.label}</span>
                                </td>
                                <td className="py-3 font-mono text-amber-700 font-bold">{card.card_id}</td>
                                <td className="py-3">
                                  <span className="px-2 py-0.5 bg-slate-100 rounded-md text-[11px] font-medium text-slate-600">
                                    {card.group_name || 'General'}
                                  </span>
                                </td>
                                <td className="py-3 text-center font-semibold text-emerald-600">{nfc}</td>
                                <td className="py-3 text-center font-semibold text-blue-600">{qr}</td>
                                <td className="py-3 text-right font-black text-slate-900">{totalDevScans}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Scan Logs Table */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">Registro Reciente de Actividad</h3>
                  {allScans.length === 0 ? (
                    <p className="text-xs text-slate-400 italic text-center py-6">No hay escaneos registrados aún.</p>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left text-xs">
                        <thead>
                          <tr className="border-b border-slate-200 text-slate-400 uppercase tracking-wider">
                            <th className="pb-3">Nombre del Dispositivo</th>
                            <th className="pb-3">Código ID</th>
                            <th className="pb-3">Grupo</th>
                            <th className="pb-3">Canal</th>
                            <th className="pb-3">Teléfono / OS</th>
                            <th className="pb-3">Fecha y Hora</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-slate-700">
                          {allScans.slice(-15).reverse().map((scan) => {
                            const matchingCard = cards.find(c => c.card_id === scan.card_id);
                            return (
                              <tr key={scan.id} className="hover:bg-slate-50">
                                <td className="py-2.5 font-bold text-slate-900">
                                  {matchingCard ? matchingCard.label : 'Dispositivo TapStar'}
                                </td>
                                <td className="py-2.5 font-mono text-amber-700 font-bold">{scan.card_id}</td>
                                <td className="py-2.5">{scan.group_name || 'General'}</td>
                                <td className="py-2.5">
                                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${scan.scan_type === 'qr' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
                                    {scan.scan_type === 'qr' ? 'QR Code' : 'NFC Scan'}
                                  </span>
                                </td>
                                <td className="py-2.5">{scan.device}</td>
                                <td className="py-2.5 text-slate-400">
                                  {new Date(scan.created_at).toLocaleString('es-PA')}
                                </td>
                              </tr>
                            );
                          })}
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
                <div className="pb-4 border-b border-slate-200">
                  <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-amber-500" />
                    Ajustes de Perfil y Exportación
                  </h1>
                  <p className="text-xs text-slate-500 mt-1">Configuración del tenant de comercio y exportación de datos.</p>
                </div>

                <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 max-w-xl shadow-sm">
                  <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Información de Cuenta Tenant</h3>
                  <div className="space-y-2 text-xs text-slate-600">
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span>Propietario:</span>
                      <span className="font-bold text-slate-900">{userName}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span>Correo Electrónico:</span>
                      <span className="font-mono text-amber-700 font-bold">{userEmail}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-slate-100">
                      <span>Nube Supabase:</span>
                      <span className="text-emerald-600 font-bold">Activo (Realtime Sync)</span>
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
                      className="py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-sm transition flex items-center gap-2"
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

      {/* ---------------- FLOATING ACTION BUTTON (FAB) FOR MOBILE ---------------- */}
      <button
        onClick={() => setIsClaimModalOpen(true)}
        className="md:hidden fixed bottom-20 right-4 z-40 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 border border-amber-300 transition-transform active:scale-95"
      >
        <Plus className="w-5 h-5 stroke-[3]" />
        <span>Vincular Placa</span>
      </button>

      {/* ---------------- CLAIM DEVICE MODAL (SINGLE / BATCH GROUP LINKING) ---------------- */}
      {isClaimModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">Vincular Dispositivo o Lote en Grupo</h3>
                <p className="text-[11px] text-slate-500">Agrega uno o varios códigos STT-XXXX / STTT-XXXX al grupo deseado.</p>
              </div>
              <button
                onClick={() => setIsClaimModalOpen(false)}
                className="text-slate-400 hover:text-slate-900 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleClaimTap} className="space-y-4">
              {claimMessage && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${claimMessage.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                  {claimMessage.text}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Grupo / Sucursal Destino</label>
                <select
                  value={claimGroupInput}
                  onChange={(e) => setClaimGroupInput(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-bold focus:outline-none focus:border-slate-900"
                >
                  <option value="General">Grupo: General</option>
                  {groupsList.filter(g => g !== 'General').map(g => (
                    <option key={g} value={g}>Grupo: {g}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Código(s) de Activación (Uno o varios por lote)</label>
                <textarea
                  rows={3}
                  required
                  value={claimInput}
                  onChange={(e) => setClaimInput(e.target.value)}
                  placeholder="Ej. STT-1001, STT-1002, STTT-1005 (separados por comas o saltos de línea)"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-xs text-slate-900 font-mono uppercase focus:outline-none focus:border-slate-900"
                />
                <p className="text-[10px] text-slate-400 mt-1">Puedes ingresar múltiples códigos separados por comas o líneas para registrarlos en lote al grupo seleccionado.</p>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-sm"
              >
                Vincular Lote al Grupo
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ---------------- QR MODAL ---------------- */}
      {qrModalCard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-xs w-full bg-white border border-slate-200 rounded-3xl p-6 text-center space-y-4 shadow-2xl">
            <h3 className="font-bold text-slate-900 text-sm">{qrModalCard.label}</h3>
            <span className="inline-block text-xs font-mono px-3 py-1 bg-slate-100 text-amber-700 rounded-full border border-slate-200 font-bold">
              {qrModalCard.card_id}
            </span>
            <div className="bg-white p-4 rounded-2xl mx-auto inline-block border border-slate-200 shadow-sm">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(`${typeof window !== 'undefined' ? window.location.origin : 'https://startap.com.pa'}/r/${qrModalCard.card_id}?m=qr`)}`}
                alt="QR Code"
                className="w-44 h-44 mx-auto"
              />
            </div>
            <p className="text-[11px] text-slate-500">Este QR redirige directamente a la URL de QR configurada (`/r/${qrModalCard.card_id}?m=qr`).</p>
            <button
              onClick={() => setQrModalCard(null)}
              className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* ---------------- RESET PASSWORD MODAL ---------------- */}
      {isResetModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                <Lock className="w-4 h-4 text-amber-500" />
                <span>Recuperar Contraseña</span>
              </h3>
              <button
                onClick={() => {
                  setIsResetModalOpen(false);
                  setResetMessage(null);
                }}
                className="text-slate-400 hover:text-slate-900 text-xs font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-4">
              <p className="text-xs text-slate-500">
                Ingresa tu correo registrado. Te enviaremos un enlace seguro para restablecer tu contraseña.
              </p>

              {resetMessage && (
                <div className={`p-3 rounded-xl text-xs font-semibold ${resetMessage.success ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
                  {resetMessage.text}
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">Correo Electrónico</label>
                <input
                  type="email"
                  required
                  value={resetEmailInput}
                  onChange={(e) => setResetEmailInput(e.target.value)}
                  placeholder="ejemplo@comercio.com"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={isResetting}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-sm"
              >
                {isResetting ? 'Enviando Enlace...' : 'Enviar Enlace de Recuperación'}
              </button>
            </form>
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

