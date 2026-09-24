'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { 
  Search, 
  Copy, 
  Check, 
  Radio, 
  QrCode, 
  Clipboard, 
  Save, 
  Power, 
  ExternalLink, 
  Smartphone, 
  ArrowLeft,
  Sparkles,
  Loader2,
  AlertCircle,
  Wifi,
  Zap,
  CheckCircle2,
  Tag as TagIcon,
  DollarSign,
  FlaskConical,
  X,
  ShoppingBag,
  Gift,
  Layers,
  RefreshCw,
  UserCheck,
  Mail,
  Phone,
  Globe,
  MessageCircle,
  Filter,
  Eye,
  PackageCheck,
  Boxes,
  ArrowUpRight,
  Download
} from 'lucide-react';
import { trackGA, itemsParaGA } from '@/lib/googleanalytics';

interface TagRecord {
  card_id: string;
  label?: string;
  target_url?: string;
  nfc_target_url?: string;
  qr_target_url?: string;
  owner_id?: string;
  owner_name?: string;
  owner_email?: string;
  customer_phone?: string;
  group_name?: string;
  channels?: 'both' | 'nfc' | 'qr';
  type?: 'google' | 'instagram' | 'whatsapp' | 'tripadvisor' | 'vcard' | 'custom';
  is_active?: boolean;
  claimed?: boolean;
  tipo_activacion?: 'venta' | 'prueba' | 'regalia';
  precio_venta?: number;
  scan_count?: number;
  is_free_stock?: boolean;
  activated_at?: string | null;
  created_at?: string;
}

interface StockStats {
  total_cards: number;
  active_cards: number;
  ventas_count: number;
  regalias_count: number;
  pruebas_count: number;
  stt_free: number;
  sttt_free: number;
  stts_free: number;
  next_stt: string;
  next_sttt: string;
  next_stts: string;
  combo_sttt_pair: string[];
}

export default function TagScannerWorkstationPage() {
  // Estado principal del TAG seleccionado
  const [searchCode, setSearchCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentTag, setCurrentTag] = useState<TagRecord | null>(null);

  // Campos de configuración del TAG
  const [targetUrl, setTargetUrl] = useState('');
  const [label, setLabel] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerEmail, setOwnerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [channels, setChannels] = useState<'both' | 'nfc' | 'qr'>('both');
  const [tagType, setTagType] = useState<'google' | 'instagram' | 'whatsapp' | 'tripadvisor' | 'vcard' | 'custom'>('google');

  // Clasificación financiera
  const [tipoActivacion, setTipoActivacion] = useState<'venta' | 'prueba' | 'regalia'>('venta');
  const [precioVenta, setPrecioVenta] = useState<string>('35.00');
  const [metodoPagoFisico, setMetodoPagoFisico] = useState<'Yappy' | 'Efectivo' | 'ACH' | 'Tarjeta / POS'>('Yappy');

  // Modo Combo Pack Trío ($50: 1 Placa + 2 Tarjetas de Regalía)
  const [operationMode, setOperationMode] = useState<'single' | 'combo'>('single');
  const [comboCard1, setComboCard1] = useState('');
  const [comboCard2, setComboCard2] = useState('');

  // Asistente rápido de enlace de WhatsApp
  const [showWaHelper, setShowWaHelper] = useState(false);
  const [waPhoneInput, setWaPhoneInput] = useState('');
  const [waMessageInput, setWaMessageInput] = useState('Hola, vi su contacto en el dispositivo starTAP y me gustaría más información.');

  // Directorio en vivo y estadísticas de stock
  const [allCards, setAllCards] = useState<TagRecord[]>([]);
  const [stats, setStats] = useState<StockStats>({
    total_cards: 0,
    active_cards: 0,
    ventas_count: 0,
    regalias_count: 0,
    pruebas_count: 0,
    stt_free: 0,
    sttt_free: 0,
    stts_free: 0,
    next_stt: 'STT-1001',
    next_sttt: 'STTT-1001',
    next_stts: 'STTS-1001',
    combo_sttt_pair: ['STTT-1001', 'STTT-1002'],
  });
  const [loadingDirectory, setLoadingDirectory] = useState(true);
  const [directoryFilter, setDirectoryFilter] = useState<'all' | 'stock' | 'venta' | 'regalia' | 'prueba'>('all');
  const [directorySearch, setDirectorySearch] = useState('');

  // Notificaciones y utilidades
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Estados de NFC Nativo (Web NFC API)
  const [hasNfcSupport, setHasNfcSupport] = useState(false);
  const [isNfcWriting, setIsNfcWriting] = useState(false);
  const [isNfcScanning, setIsNfcScanning] = useState(false);

  const fetchDirectoryAndStats = useCallback(async () => {
    setLoadingDirectory(true);
    try {
      const res = await fetch('/api/admin/tags?action=list_all');
      const data = await res.json();
      if (data.success) {
        setAllCards(data.cards || []);
        if (data.stats) {
          setStats(data.stats);
        }
      }
    } catch (err) {
      console.error('Error cargando directorio de TAGs:', err);
    } finally {
      setLoadingDirectory(false);
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      setHasNfcSupport(true);
    }
    fetchDirectoryAndStats();
  }, [fetchDirectoryAndStats]);

  // Autodetectar categoría según la URL pegada
  const handleUrlChange = (val: string) => {
    setTargetUrl(val);
    const lower = val.toLowerCase();
    if (lower.includes('g.page') || lower.includes('google.com/maps') || lower.includes('search.google.com/local/writereview')) {
      setTagType('google');
    } else if (lower.includes('instagram.com')) {
      setTagType('instagram');
    } else if (lower.includes('wa.me') || lower.includes('whatsapp.com')) {
      setTagType('whatsapp');
    } else if (lower.includes('tripadvisor.')) {
      setTagType('tripadvisor');
    }
  };

  const populateTagForm = (card: TagRecord) => {
    setCurrentTag(card);
    setSearchCode(card.card_id);
    setTargetUrl(card.target_url || card.nfc_target_url || '');
    setLabel(card.label && !card.label.startsWith('Dispositivo Pre-generado') ? card.label : '');
    setOwnerName(
      card.owner_name &&
      card.owner_name !== 'Inventario Libre' &&
      card.owner_name !== 'Admin / Inventario'
        ? card.owner_name
        : ''
    );
    setOwnerEmail(
      card.owner_email &&
      card.owner_email !== 'admin@startap.com.pa' &&
      card.owner_email !== 'info@startap.com.pa'
        ? card.owner_email
        : ''
    );
    setCustomerPhone(card.customer_phone || '');
    setIsActive(card.is_free_stock ? true : Boolean(card.is_active));
    setChannels(card.channels || 'both');
    setTagType(card.type || 'google');

    if (card.is_free_stock) {
      // Si es un TAG libre en stock, preparamos para Venta por defecto
      setTipoActivacion('venta');
      if (operationMode === 'combo') {
        setPrecioVenta('50.00');
      } else if (card.card_id.startsWith('STTT-')) {
        setPrecioVenta('20.00');
      } else {
        setPrecioVenta('35.00');
      }
    } else {
      setTipoActivacion(card.tipo_activacion || 'prueba');
      setPrecioVenta(
        typeof card.precio_venta === 'number' && card.precio_venta > 0
          ? card.precio_venta.toFixed(2)
          : '0.00'
      );
    }
  };

  const handleSearch = async (codeToSearch?: string) => {
    const code = (codeToSearch || searchCode).trim().toUpperCase();
    if (!code) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/tags?code=${encodeURIComponent(code)}`);
      const data = await res.json();

      if (data.success && data.card) {
        // Enriquecer con flag is_free_stock del listado local si existe
        const matchedFromList = allCards.find((c) => c.card_id.toUpperCase() === data.card.card_id.toUpperCase());
        const mergedCard: TagRecord = {
          ...data.card,
          is_free_stock: matchedFromList ? matchedFromList.is_free_stock : !data.card.claimed,
          scan_count: matchedFromList?.scan_count || 0,
        };
        populateTagForm(mergedCard);
        setMessage({
          type: 'success',
          text: mergedCard.is_free_stock
            ? `TAG ${mergedCard.card_id} libre en stock — listo para configurar y activar.`
            : `TAG ${mergedCard.card_id} cargado (${mergedCard.label || 'Configurado'}).`,
        });
      } else {
        // Permitir crear el TAG si no existe aún en la base de datos
        const newDraft: TagRecord = {
          card_id: code,
          label: '',
          target_url: '',
          is_active: true,
          claimed: false,
          is_free_stock: true,
          tipo_activacion: 'venta',
          precio_venta: operationMode === 'combo' ? 50 : code.startsWith('STTT-') ? 20 : 35,
        };
        populateTagForm(newDraft);
        setMessage({
          type: 'info',
          text: `El código ${code} no existía en el padrón; se creará automáticamente al guardar.`,
        });
      }
    } catch (err) {
      console.error('Error buscando TAG:', err);
      setMessage({ type: 'error', text: 'Error al conectar con el servidor.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPrefix = async (prefix: string) => {
    setLoading(true);
    setMessage({ type: 'info', text: `Localizando el siguiente TAG libre en stock para la serie ${prefix}...` });

    try {
      const res = await fetch(`/api/admin/tags?action=next_available&prefix=${encodeURIComponent(prefix)}`);
      const data = await res.json();

      if (data.success && data.next_code) {
        setSearchCode(data.next_code);
        await handleSearch(data.next_code);
      } else {
        setSearchCode(prefix);
      }
    } catch (e) {
      setSearchCode(prefix);
    } finally {
      setLoading(false);
    }
  };

  // Activar modo Combo Pack Trío ($50: 1 Placa STT + 2 Tarjetas STTT Regalía)
  const handleSwitchMode = (mode: 'single' | 'combo') => {
    setOperationMode(mode);
    if (mode === 'combo') {
      setTipoActivacion('venta');
      setPrecioVenta('50.00');
      const nextPlaca = stats.next_stt || 'STT-1005';
      const pair = stats.combo_sttt_pair?.length === 2 ? stats.combo_sttt_pair : [stats.next_sttt || 'STTT-1001', 'STTT-1002'];
      setComboCard1(pair[0]);
      setComboCard2(pair[1]);
      if (!searchCode || !searchCode.startsWith('STT-')) {
        setSearchCode(nextPlaca);
        handleSearch(nextPlaca);
      }
      setMessage({
        type: 'info',
        text: `Modo Combo Pack Trío ($50) activo: 1 Placa Principal (${nextPlaca}) + 2 Tarjetas de Regalía (${pair[0]} y ${pair[1]}).`,
      });
    } else {
      setMessage(null);
    }
  };

  // Generar enlace de WhatsApp
  const handleApplyWhatsAppUrl = () => {
    const cleanPhone = waPhoneInput.replace(/\D/g, '');
    if (!cleanPhone) {
      setMessage({ type: 'error', text: 'Ingresa un número de teléfono válido para generar el enlace de WhatsApp.' });
      return;
    }
    const fullPhone = cleanPhone.length === 8 ? `507${cleanPhone}` : cleanPhone;
    const encodedMsg = waMessageInput.trim() ? `?text=${encodeURIComponent(waMessageInput.trim())}` : '';
    const generated = `https://wa.me/${fullPhone}${encodedMsg}`;
    setTargetUrl(generated);
    setTagType('whatsapp');
    setShowWaHelper(false);
    setMessage({ type: 'success', text: `Enlace directo de WhatsApp generado: ${generated}` });
  };

  // ESCRITURA NATIVA NFC (Web NFC API)
  const handleWriteNfcNative = async (urlToWrite: string, cardLabel?: string) => {
    if (typeof window === 'undefined' || !('NDEFReader' in window)) {
      setMessage({
        type: 'error',
        text: 'Tu navegador actual no soporta escritura NFC directa. Usa Chrome en Android o copia el enlace al portapapeles.',
      });
      return;
    }

    setIsNfcWriting(true);
    setMessage({
      type: 'info',
      text: `📲 Acerca el chip físico ${cardLabel || ''} al reverso de tu teléfono ahora...`,
    });

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.write({
        records: [{ recordType: 'url', data: urlToWrite }],
      });

      setMessage({
        type: 'success',
        text: `¡Chip ${cardLabel || ''} grabado físicamente con éxito! (${urlToWrite})`,
      });
    } catch (err: any) {
      console.error('Error en escritura NFC nativa:', err);
      if (err.name === 'NotAllowedError') {
        setMessage({ type: 'error', text: 'Permiso NFC denegado en el dispositivo.' });
      } else {
        setMessage({ type: 'error', text: `Error al grabar NFC: ${err.message || 'Operación cancelada'}` });
      }
    } finally {
      setIsNfcWriting(false);
    }
  };

  // LECTURA NATIVA DE CHIPS NFC
  const handleScanNfcNative = async () => {
    if (typeof window === 'undefined' || !('NDEFReader' in window)) {
      setMessage({ type: 'error', text: 'Lectura NFC directa disponible únicamente en Chrome para Android.' });
      return;
    }

    setIsNfcScanning(true);
    setMessage({ type: 'info', text: '📡 Escaneando... Acerca cualquier tarjeta, placa o stand NFC al teléfono.' });

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();

      ndef.addEventListener('reading', ({ message: ndefMsg, serialNumber }: any) => {
        let detectedCode = serialNumber || '';
        for (const record of ndefMsg.records) {
          if (record.recordType === 'url' || record.recordType === 'text') {
            const textDecoder = new TextDecoder(record.encoding || 'utf-8');
            const text = textDecoder.decode(record.data);
            const match = text.match(/(STTT|STTS|STT)-\d+/i);
            if (match) {
              detectedCode = match[0].toUpperCase();
              break;
            }
          }
        }

        if (detectedCode) {
          setSearchCode(detectedCode);
          handleSearch(detectedCode);
        } else {
          setMessage({ type: 'info', text: `Chip NFC detectado (Serial: ${serialNumber || 'Sin formato starTAP'})` });
        }
        setIsNfcScanning(false);
      });
    } catch (err) {
      console.error('Error en lectura NFC:', err);
      setMessage({ type: 'error', text: 'No se pudo iniciar el lector NFC nativo.' });
      setIsNfcScanning(false);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          handleUrlChange(text.trim());
          setMessage({ type: 'success', text: 'URL pegada desde el portapapeles.' });
        }
      } else {
        setMessage({ type: 'error', text: 'Pega la URL manteniendo presionado el campo de texto.' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Permiso de portapapeles no concedido; pega manualmente.' });
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const tagId = (currentTag?.card_id || searchCode).trim().toUpperCase();
    if (!tagId) {
      setMessage({ type: 'error', text: 'Primero selecciona o escribe un código de TAG (ej. STT-1005).' });
      return;
    }
    if (!targetUrl.trim()) {
      setMessage({ type: 'error', text: 'Ingresa la URL de destino para este TAG.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    try {
      const numericPrice = tipoActivacion === 'venta' ? parseFloat(precioVenta) || 0 : 0;
      const extraCards =
        operationMode === 'combo'
          ? [comboCard1.trim().toUpperCase(), comboCard2.trim().toUpperCase()].filter(Boolean)
          : [];

      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_id: tagId,
          target_url: targetUrl.trim(),
          label: label.trim() || ownerName.trim() || `TAG ${tagId}`,
          owner_name: ownerName.trim() || label.trim() || undefined,
          owner_email: ownerEmail.trim().toLowerCase() || undefined,
          customer_phone: customerPhone.trim() || undefined,
          channels,
          type: tagType,
          is_active: isActive,
          tipo_activacion: tipoActivacion,
          precio_venta: numericPrice,
          auto_create: true,
          combo_extra_cards: extraCards,
        }),
      });

      const data = await res.json();

      if (data.success) {
        const cleanSavedId = String(data.card_id || tagId).toUpperCase();

        // ANALÍTICA GA4: Registrar Venta Física (total > 0) o Evento de Regalía/Demo (total === 0)
        if (isActive) {
          if (tipoActivacion === 'venta' && numericPrice > 0) {
            const txId = data.order_id || `PED-VISITA-${cleanSavedId.replace(/[^A-Za-z0-9]/g, '')}`;
            const prodId =
              operationMode === 'combo'
                ? 'pack-trio-comercial'
                : cleanSavedId.startsWith('STTS-')
                ? 'stand-nfc-mesa'
                : cleanSavedId.startsWith('STTT-')
                ? 'tarjeta-nfc-bolsillo'
                : 'placa-nfc-mostrador';
            const prodName =
              operationMode === 'combo'
                ? 'Combo Pack Trío (1 Placa + 2 Tarjetas NFC)'
                : cleanSavedId.startsWith('STTS-')
                ? 'Stand NFC de Mesa'
                : cleanSavedId.startsWith('STTT-')
                ? 'Tarjeta NFC de Bolsillo'
                : 'Placa NFC para Reseñas de Google';

            trackGA('purchase', {
              transaction_id: txId,
              value: numericPrice,
              currency: 'USD',
              affiliation: 'Venta Física Presencial',
              payment_type: metodoPagoFisico,
              items: itemsParaGA([
                {
                  product_id: prodId,
                  product_name: prodName,
                  quantity: 1,
                  price: numericPrice,
                },
              ]),
            });

            // Si es Combo Pack, registrar las tarjetas acompañantes de cortesía como 'regalia_demo' ($0)
            if (extraCards.length > 0) {
              extraCards.forEach((extraCode) => {
                trackGA('regalia_demo', {
                  card_id: extraCode,
                  tipo_activacion: 'regalia',
                });
              });
            }
          } else {
            // Filtro de Regalías y Demos (total === 0): NO disparar 'purchase'
            trackGA('regalia_demo', {
              card_id: cleanSavedId,
              tipo_activacion: tipoActivacion,
            });
          }
        }

        const modoTexto = isActive
          ? tipoActivacion === 'venta'
            ? `Venta Comercial ($${numericPrice.toFixed(2)} vía ${metodoPagoFisico})`
            : tipoActivacion === 'regalia'
            ? 'Regalía ($0.00)'
            : 'Demo / Muestra ($0.00)'
          : 'Inactivo';

        const comboTexto =
          extraCards.length > 0
            ? ` + ${extraCards.length} tarjetas de regalía (${extraCards.join(', ')}) activadas y descontadas de stock.`
            : '';

        setMessage({
          type: 'success',
          text: `¡${ data.card_id } guardado exitosamente como ${modoTexto}!${comboTexto}`,
        });

        await fetchDirectoryAndStats();
        await handleSearch(data.card_id);
      } else {
        setMessage({ type: 'error', text: data.error || 'No se pudo guardar el TAG.' });
      }
    } catch (err) {
      console.error('Error guardando TAG:', err);
      setMessage({ type: 'error', text: 'Error de red al guardar los cambios.' });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2200);
  };

  // Filtrado en vivo del directorio
  const filteredDirectory = useMemo(() => {
    return allCards.filter((card) => {
      if (directoryFilter === 'stock' && !card.is_free_stock) return false;
      if (directoryFilter === 'venta' && (card.is_free_stock || card.tipo_activacion !== 'venta')) return false;
      if (directoryFilter === 'regalia' && (card.is_free_stock || card.tipo_activacion !== 'regalia')) return false;
      if (directoryFilter === 'prueba' && (card.is_free_stock || card.tipo_activacion !== 'prueba')) return false;

      if (directorySearch.trim()) {
        const q = directorySearch.trim().toLowerCase();
        const matchId = card.card_id.toLowerCase().includes(q);
        const matchLabel = (card.label || '').toLowerCase().includes(q);
        const matchOwner = (card.owner_name || '').toLowerCase().includes(q);
        const matchEmail = (card.owner_email || '').toLowerCase().includes(q);
        const matchUrl = (card.target_url || '').toLowerCase().includes(q);
        return matchId || matchLabel || matchOwner || matchEmail || matchUrl;
      }
      return true;
    });
  }, [allCards, directoryFilter, directorySearch]);

  const activeCode = (currentTag?.card_id || searchCode || 'STT-1001').trim().toUpperCase();
  const nfcRedirectUrl = `https://startap.com.pa/r/${activeCode}?m=nfc`;
  const qrRedirectUrl = `https://startap.com.pa/r/${activeCode}?m=qr`;
  const qrImageApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=220x220&margin=8&data=${encodeURIComponent(qrRedirectUrl)}`;

  // Enlace para enviar comprobante / instrucciones por WhatsApp al cliente
  const buildClientWhatsAppShareUrl = () => {
    const cleanPhone = customerPhone.replace(/\D/g, '');
    const fullPhone = cleanPhone.length === 8 ? `507${cleanPhone}` : cleanPhone;
    const businessTitle = label.trim() || ownerName.trim() || 'su comercio';
    const extraText =
      operationMode === 'combo' && (comboCard1 || comboCard2)
        ? `\n🎁 *Tarjetas de Regalía incluidas:* ${[comboCard1, comboCard2].filter(Boolean).join(', ')}`
        : '';
    const emailText = ownerEmail.trim()
      ? `\n📧 *Correo pre-vinculado a su Panel:* ${ownerEmail.trim().toLowerCase()}\n🔑 Puede crear su cuenta o iniciar sesión cuando guste en https://startap.com.pa/login y sus dispositivos aparecerán automáticamente.`
      : '';

    const msg =
      `¡Hola! 👋 Sus dispositivos inteligentes *starTAP* para *${businessTitle}* ya están activos y listos:\n\n` +
      `🏷️ *Código Principal:* ${activeCode}${extraText}\n` +
      `🔗 *Enlace Inteligente:* ${nfcRedirectUrl}\n` +
      `🎯 *Redirige actualmente a:* ${targetUrl || 'Configurado'}` +
      `${emailText}\n\n¡Gracias por confiar en starTAP Panamá!`;

    return fullPhone
      ? `https://wa.me/${fullPhone}?text=${encodeURIComponent(msg)}`
      : `https://wa.me/?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* CABECERA EJECUTIVA CLARA */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2.5 flex-wrap">
              <Link
                href="/master-control/cards"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Padrón de TAGs</span>
              </Link>
              <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-black uppercase tracking-wider">
                Centro Operativo de Campo & Oficina
              </span>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold border ${
                  hasNfcSupport
                    ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                <Wifi className="w-3.5 h-3.5" />
                {hasNfcSupport ? 'Hardware NFC Android Activo' : 'Modo Web / Escritorio'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight pt-1">
              Escáner, Grabador NFC y Activación Instantánea de TAGs
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Activa ventas individuales o Combos Trío ($50), pre-asigna dispositivos al correo del cliente sin requerir cuenta previa y descuenta stock en tiempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {hasNfcSupport && (
              <button
                type="button"
                onClick={handleScanNfcNative}
                disabled={isNfcScanning}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-2 shadow-xs"
              >
                <Radio className="w-4 h-4 animate-pulse" />
                <span>{isNfcScanning ? 'Acerca el Chip...' : 'Escanear Chip NFC'}</span>
              </button>
            )}

            <button
              type="button"
              onClick={fetchDirectoryAndStats}
              disabled={loadingDirectory}
              className="px-3.5 py-2.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-2xs"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingDirectory ? 'animate-spin text-amber-600' : 'text-slate-500'}`} />
              <span>Actualizar Stock</span>
            </button>
          </div>
        </div>

        {/* BARRA DE STOCK DISPONIBLE EN TIEMPO REAL Y CARGA RÁPIDA DE SERIE */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {/* Placas STT- */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  Serie STT- (Placas)
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">{stats.stt_free}</span>
                  <span className="text-xs font-semibold text-slate-500">libres en stock</span>
                </div>
              </div>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl border border-amber-100">
                <TagIcon className="w-5 h-5" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setOperationMode('single');
                handleSelectPrefix('STT-');
              }}
              className="w-full py-2 px-3 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 rounded-xl text-xs font-bold transition flex items-center justify-between"
            >
              <span>Cargar siguiente libre:</span>
              <span className="font-mono font-black">{stats.next_stt} →</span>
            </button>
          </div>

          {/* Tarjetas STTT- */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                  Serie STTT- (Tarjetas)
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">{stats.sttt_free}</span>
                  <span className="text-xs font-semibold text-slate-500">libres en stock</span>
                </div>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl border border-blue-100">
                <Smartphone className="w-5 h-5" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setOperationMode('single');
                handleSelectPrefix('STTT-');
              }}
              className="w-full py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center justify-between"
            >
              <span>Cargar siguiente libre:</span>
              <span className="font-mono font-black">{stats.next_sttt} →</span>
            </button>
          </div>

          {/* Stands STTS- */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  Serie STTS- (Stands)
                </span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900">{stats.stts_free}</span>
                  <span className="text-xs font-semibold text-slate-500">libres en stock</span>
                </div>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl border border-emerald-100">
                <Layers className="w-5 h-5" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setOperationMode('single');
                handleSelectPrefix('STTS-');
              }}
              className="w-full py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 rounded-xl text-xs font-bold transition flex items-center justify-between"
            >
              <span>Cargar siguiente libre:</span>
              <span className="font-mono font-black">{stats.next_stts} →</span>
            </button>
          </div>

          {/* Acceso Rápido Combo Pack Trío $50 */}
          <div className="bg-gradient-to-br from-amber-50/80 via-white to-orange-50/60 border-2 border-amber-300 rounded-2xl p-4 shadow-2xs flex flex-col justify-between gap-3">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded-md">
                  🔥 Combo Pack Trío ($50)
                </span>
                <p className="text-xs text-slate-700 font-semibold mt-2 leading-snug">
                  1 Placa <span className="font-mono font-bold">STT-</span> ($50) + 2 Tarjetas <span className="font-mono font-bold">STTT-</span> ($0 Regalía)
                </p>
              </div>
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                <Boxes className="w-5 h-5" />
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleSwitchMode('combo')}
              className={`w-full py-2 px-3 rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 ${
                operationMode === 'combo'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{operationMode === 'combo' ? 'Modo Combo Activo' : 'Preparar Combo Trío ($50)'}</span>
            </button>
          </div>
        </div>

        {/* BANNER DE NOTIFICACIÓN */}
        {message && (
          <div
            className={`p-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-between gap-3 shadow-xs ${
              message.type === 'success'
                ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                : message.type === 'info'
                ? 'bg-amber-50 border-amber-300 text-amber-900'
                : 'bg-rose-50 border-rose-300 text-rose-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              {message.type === 'success' ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              ) : message.type === 'info' ? (
                <Zap className="w-5 h-5 text-amber-600 flex-shrink-0" />
              ) : (
                <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
              )}
              <span>{message.text}</span>
            </div>
            <button
              type="button"
              onClick={() => setMessage(null)}
              className="p-1 rounded-lg hover:bg-black/5 text-slate-500"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* WORKSTATION DE 2 COLUMNAS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* COLUMNA IZQUIERDA (7 COL): CONFIGURACIÓN, FINANZAS Y CLIENTE */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* PASO 1: SELECCIÓN DE MODO Y LOCALIZACIÓN DE CÓDIGO */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-600">
                    Paso 1 · Identificación del Dispositivo
                  </span>
                  <h2 className="text-base font-black text-slate-900">
                    Seleccionar Modo y Código de TAG
                  </h2>
                </div>

                {/* Selector Individual vs Combo */}
                <div className="inline-flex rounded-xl bg-slate-100 p-1 border border-slate-200">
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('single')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      operationMode === 'single'
                        ? 'bg-white text-slate-900 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    🎯 Individual (1 TAG)
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSwitchMode('combo')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                      operationMode === 'combo'
                        ? 'bg-amber-500 text-slate-950 shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    📦 Combo Trío (3 TAGs)
                  </button>
                </div>
              </div>

              {/* Buscador de Código Principal */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSearch();
                }}
                className="space-y-3"
              >
                <label className="block text-xs font-bold text-slate-700">
                  {operationMode === 'combo'
                    ? 'Código de la Placa Principal (se registrará como Venta de $50.00):'
                    : 'Código del Dispositivo TAG (Placa STT-, Tarjeta STTT- o Stand STTS-):'}
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-grow">
                    <input
                      type="text"
                      value={searchCode}
                      onChange={(e) => setSearchCode(e.target.value.toUpperCase())}
                      placeholder="Ej: STT-1005, STTT-1004, STTS-1051"
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-sm font-mono font-bold focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                    />
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Cargar TAG</span>}
                  </button>
                </div>
              </form>

              {/* Si está en modo Combo Pack Trío, mostrar las 2 tarjetas acompañantes de regalía */}
              {operationMode === 'combo' && (
                <div className="p-4 bg-amber-50/70 border border-amber-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="w-4 h-4 text-amber-700" />
                      <span className="text-xs font-black text-amber-900 uppercase tracking-wider">
                        2 Tarjetas de Bolsillo Incluidas en el Combo (Regalía $0)
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                      Descuenta 3 unidades del stock
                    </span>
                  </div>
                  <p className="text-xs text-amber-900/80">
                    Ambas tarjetas se activarán automáticamente con la misma URL de destino y el mismo correo del cliente con precio <strong>$0.00 (Regalía)</strong>:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 mb-1">
                        Tarjeta Regalía #1 (Serie STTT-)
                      </label>
                      <input
                        type="text"
                        value={comboCard1}
                        onChange={(e) => setComboCard1(e.target.value.toUpperCase())}
                        placeholder="Ej: STTT-1003"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-slate-900 font-mono text-xs font-bold focus:outline-none focus:border-amber-600"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-amber-900 mb-1">
                        Tarjeta Regalía #2 (Serie STTT-)
                      </label>
                      <input
                        type="text"
                        value={comboCard2}
                        onChange={(e) => setComboCard2(e.target.value.toUpperCase())}
                        placeholder="Ej: STTT-1004"
                        className="w-full px-3 py-2 rounded-xl bg-white border border-amber-300 text-slate-900 font-mono text-xs font-bold focus:outline-none focus:border-amber-600"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* PASO 2: FORMULARIO INTEGRAL DE CONFIGURACIÓN, FINANZAS Y CLIENTE */}
            <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-6">
              
              {/* Encabezado de Estado del TAG Actual */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-2 bg-amber-50 border border-amber-200 rounded-xl">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-amber-700 block">
                      TAG Seleccionado
                    </span>
                    <span className="text-lg font-black font-mono text-slate-900">
                      {activeCode}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      {currentTag?.is_free_stock ? (
                        <span className="px-2.5 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full text-[11px] font-bold">
                          📦 Libre en Inventario
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold">
                          ✅ Asignado / Configurado
                        </span>
                      )}
                      {typeof currentTag?.scan_count === 'number' && (
                        <span className="text-xs font-bold text-slate-500">
                          · {currentTag.scan_count} {currentTag.scan_count === 1 ? 'lectura' : 'lecturas'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      {currentTag?.label || 'Configura los datos abajo y presiona Guardar.'}
                    </p>
                  </div>
                </div>

                {/* Toggle Activo / Inactivo */}
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`px-4 py-2 rounded-xl border text-xs font-black uppercase tracking-wider transition flex items-center gap-2 ${
                    isActive
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-800 hover:bg-emerald-100'
                      : 'bg-rose-50 border-rose-300 text-rose-800 hover:bg-rose-100'
                  }`}
                >
                  <Power className="w-4 h-4" />
                  <span>{isActive ? 'Estado: Activo' : 'Estado: Inactivo'}</span>
                </button>
              </div>

              {/* SECCIÓN A: CLASIFICACIÓN COMERCIAL Y PRECIO (INLINE) */}
              <div className="space-y-3">
                <label className="block text-xs font-black uppercase tracking-wider text-amber-700">
                  2. Clasificación Financiera e Inventario
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setTipoActivacion('venta');
                      if ( parseFloat(precioVenta) === 0 ) {
                        setPrecioVenta(operationMode === 'combo' ? '50.00' : activeCode.startsWith('STTT-') ? '20.00' : '35.00');
                      }
                    }}
                    className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                      tipoActivacion === 'venta'
                        ? 'bg-emerald-50/90 border-2 border-emerald-500 text-emerald-950 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">🏷️ Venta Comercial</span>
                      <ShoppingBag className={`w-4 h-4 ${tipoActivacion === 'venta' ? 'text-emerald-600' : 'text-slate-400'}`} />
                    </div>
                    <span className="text-[11px] leading-tight opacity-80">
                      Suma a Ingresos Reales y descuenta del stock disponible.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTipoActivacion('regalia');
                      setPrecioVenta('0.00');
                    }}
                    className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                      tipoActivacion === 'regalia'
                        ? 'bg-amber-50/90 border-2 border-amber-500 text-amber-950 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">🎁 Regalía / Combo</span>
                      <Gift className={`w-4 h-4 ${tipoActivacion === 'regalia' ? 'text-amber-600' : 'text-slate-400'}`} />
                    </div>
                    <span className="text-[11px] leading-tight opacity-80">
                      Precio $0.00. Descuenta unidad física del inventario.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setTipoActivacion('prueba');
                      setPrecioVenta('0.00');
                    }}
                    className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between gap-1.5 ${
                      tipoActivacion === 'prueba'
                        ? 'bg-purple-50/90 border-2 border-purple-500 text-purple-950 shadow-2xs'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black">🧪 Muestra / Demo</span>
                      <FlaskConical className={`w-4 h-4 ${tipoActivacion === 'prueba' ? 'text-purple-600' : 'text-slate-400'}`} />
                    </div>
                    <span className="text-[11px] leading-tight opacity-80">
                      Uso interno o demostración ($0.00 ingresos).
                    </span>
                  </button>
                </div>

                {/* Selector Rápido de Precio cuando es Venta Comercial */}
                {tipoActivacion === 'venta' && (
                  <div className="p-4 bg-emerald-50/60 border border-emerald-200 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <label className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <span>Precio de Venta Cobrado (USD):</span>
                      </label>
                      <div className="flex flex-wrap gap-1.5">
                        {[
                          { val: '20.00', tag: '$20 (Tarjeta)' },
                          { val: '25.00', tag: '$25 (Promo Visita)' },
                          { val: '35.00', tag: '$35 (Placa/Stand)' },
                          { val: '50.00', tag: '$50 (Combo Trío)' },
                        ].map((p) => (
                          <button
                            key={p.val}
                            type="button"
                            onClick={() => setPrecioVenta(p.val)}
                            className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition ${
                              parseFloat(precioVenta) === parseFloat(p.val)
                                ? 'bg-emerald-600 text-white border-emerald-700'
                                : 'bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                            }`}
                          >
                            {p.tag}
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3.5 top-2.5 text-sm font-black text-emerald-700">$</span>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={precioVenta}
                        onChange={(e) => setPrecioVenta(e.target.value)}
                        className="w-full pl-8 pr-14 py-2 rounded-xl bg-white border border-emerald-300 text-slate-900 font-mono text-sm font-black focus:outline-none focus:border-emerald-600"
                      />
                      <span className="absolute right-3.5 top-2.5 text-xs font-bold text-slate-400">USD</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-1 border-t border-emerald-200/70">
                      <span className="text-[11px] font-bold text-emerald-900">
                        Método de Pago Presencial (GA4):
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(['Yappy', 'Efectivo', 'ACH', 'Tarjeta / POS'] as const).map((metodo) => (
                          <button
                            key={metodo}
                            type="button"
                            onClick={() => setMetodoPagoFisico(metodo)}
                            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border transition ${
                              metodoPagoFisico === metodo
                                ? 'bg-slate-900 text-white border-slate-900'
                                : 'bg-white text-emerald-900 border-emerald-300 hover:bg-emerald-100'
                            }`}
                          >
                            {metodo}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* SECCIÓN B: DESTINO INTELIGENTE, CATEGORÍA Y CANAL */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <label className="block text-xs font-black uppercase tracking-wider text-amber-700">
                    3. Enlace de Destino (Google Reviews, Instagram, WhatsApp, Web)
                  </label>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => setShowWaHelper(!showWaHelper)}
                      className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                    >
                      <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Generador WhatsApp</span>
                    </button>
                    <button
                      type="button"
                      onClick={handlePasteClipboard}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                    >
                      <Clipboard className="w-3.5 h-3.5" />
                      <span>Pegar URL</span>
                    </button>
                  </div>
                </div>

                {/* Mini-Generador de Link de WhatsApp */}
                {showWaHelper && (
                  <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-emerald-900">
                        💬 Crear enlace directo a WhatsApp del Comercio (wa.me)
                      </span>
                      <button
                        type="button"
                        onClick={() => setShowWaHelper(false)}
                        className="text-xs text-slate-500 hover:text-slate-800"
                      >
                        Cerrar
                      </button>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <input
                        type="text"
                        value={waPhoneInput}
                        onChange={(e) => setWaPhoneInput(e.target.value)}
                        placeholder="Teléfono (ej: 6534-2691)"
                        className="px-3 py-2 rounded-lg bg-white border border-emerald-300 text-xs font-mono text-slate-900"
                      />
                      <input
                        type="text"
                        value={waMessageInput}
                        onChange={(e) => setWaMessageInput(e.target.value)}
                        placeholder="Mensaje predeterminado opcional"
                        className="px-3 py-2 rounded-lg bg-white border border-emerald-300 text-xs text-slate-900"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleApplyWhatsAppUrl}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition"
                    >
                      Usar este enlace de WhatsApp como Destino
                    </button>
                  </div>
                )}

                <div className="relative">
                  <Globe className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="url"
                    required
                    value={targetUrl}
                    onChange={(e) => handleUrlChange(e.target.value)}
                    placeholder="https://g.page/r/... o https://instagram.com/..."
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                  />
                </div>

                {/* Categoría y Canal */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Plataforma / Objetivo del TAG
                    </label>
                    <select
                      value={tagType}
                      onChange={(e) => setTagType(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-amber-500"
                    >
                      <option value="google">⭐ Google Reviews / Maps</option>
                      <option value="instagram">📸 Instagram Perfil</option>
                      <option value="whatsapp">💬 WhatsApp Business</option>
                      <option value="tripadvisor">🦉 TripAdvisor</option>
                      <option value="vcard">🪪 Tarjeta de Contacto / vCard</option>
                      <option value="custom">🌐 Menú Digital / Sitio Web</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-1">
                      Canales Habilitados en el Dispositivo
                    </label>
                    <select
                      value={channels}
                      onChange={(e) => setChannels(e.target.value as any)}
                      className="w-full px-3 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs font-bold focus:outline-none focus:border-amber-500"
                    >
                      <option value="both">📡 + 📱 Ambos (Chip NFC + Código QR)</option>
                      <option value="nfc">📡 Solo Chip NFC</option>
                      <option value="qr">📱 Solo Código QR</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* SECCIÓN C: DATOS DEL CLIENTE Y PRE-ASIGNACIÓN SIN CUENTA PREVIA */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-black uppercase tracking-wider text-amber-700">
                    4. Comercio y Pre-Vinculación al Correo del Cliente
                  </label>
                  <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                    No requiere que el cliente tenga cuenta creada hoy
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nombre del Comercio / Etiqueta del TAG
                    </label>
                    <input
                      type="text"
                      value={label}
                      onChange={(e) => setLabel(e.target.value)}
                      placeholder="Ej: Arepitas Q Chimba - Mostrador"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Nombre del Cliente / Propietario
                    </label>
                    <input
                      type="text"
                      value={ownerName}
                      onChange={(e) => setOwnerName(e.target.value)}
                      placeholder="Ej: Arepitas Q Chimba"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs font-semibold focus:outline-none focus:border-amber-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      Correo del Cliente <span className="text-amber-700 font-normal">(Auto-vincula su Panel)</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="email"
                        value={ownerEmail}
                        onChange={(e) => setOwnerEmail(e.target.value)}
                        placeholder="cliente@restaurante.com"
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs font-semibold focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-700 mb-1">
                      WhatsApp del Cliente <span className="text-slate-400 font-normal">(Opcional, para enviarle su link)</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                      <input
                        type="text"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Ej: 6534-2691"
                        className="w-full pl-8 pr-3.5 py-2.5 rounded-xl bg-white border border-slate-300 text-slate-900 placeholder-slate-400 text-xs font-semibold focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                {ownerEmail.trim() && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-950 flex items-start gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <strong>Pre-asignación garantizada:</strong> Aunque{' '}
                      <span className="font-mono font-bold underline">{ownerEmail.trim().toLowerCase()}</span> aún no haya creado su cuenta en starTAP, este TAG (y sus tarjetas de regalía si es Combo) quedan reservados a su correo y aparecerán automáticamente en su <strong>/dashboard</strong> apenas se registre.
                    </div>
                  </div>
                )}
              </div>

              {/* BOTÓN PRINCIPAL DE GUARDADO Y ACTIVACIÓN */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm uppercase tracking-wider rounded-xl transition shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Guardando y Sincronizando Inventario...</span>
                    </>
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>
                        {operationMode === 'combo'
                          ? `Guardar y Activar Combo Trío (${activeCode} + 2 Tarjetas Regalía)`
                          : `Guardar y Activar TAG ${activeCode} en Tiempo Real`}
                      </span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* COLUMNA DERECHA (5 COL): GRABACIÓN FÍSICA NFC, QR Y DIRECTORIO EN VIVO */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* PANEL A: GRABACIÓN NFC, CÓDIGO QR Y ENTREGA AL CLIENTE */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-600">
                    Herramientas de Chip & QR
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    Grabación Física y Prueba de Redirección
                  </h3>
                </div>
                <span className="font-mono text-xs font-black px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg border border-slate-200">
                  {activeCode}
                </span>
              </div>

              {/* Botón de Escritura Nativa NFC para el TAG Principal */}
              <div className="space-y-2.5">
                <button
                  type="button"
                  disabled={isNfcWriting}
                  onClick={() => handleWriteNfcNative(nfcRedirectUrl, activeCode)}
                  className="w-full py-3.5 px-4 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-xs flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isNfcWriting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Acerca el Chip al Teléfono...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 fill-slate-950" />
                      <span>⚡ Grabar Chip Físico NFC ({activeCode})</span>
                    </>
                  )}
                </button>

                {/* Botones de copiado de enlace NFC y QR */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => copyToClipboard(nfcRedirectUrl, 'copy_nfc')}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    {copiedId === 'copy_nfc' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">¡Link NFC Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Radio className="w-4 h-4 text-amber-600" />
                        <span>Copiar Link NFC</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(qrRedirectUrl, 'copy_qr')}
                    className="p-2.5 bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl font-bold text-xs transition flex items-center justify-center gap-1.5"
                  >
                    {copiedId === 'copy_qr' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span className="text-emerald-700">¡Link QR Copiado!</span>
                      </>
                    ) : (
                      <>
                        <QrCode className="w-4 h-4 text-slate-600" />
                        <span>Copiar Link QR</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Si está en Modo Combo, botones rápidos para grabar o copiar las 2 tarjetas de regalía */}
              {operationMode === 'combo' && (comboCard1 || comboCard2) && (
                <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-xl space-y-2">
                  <span className="text-[11px] font-black text-amber-900 uppercase tracking-wider block">
                    Grabación Rápida de las 2 Tarjetas del Combo:
                  </span>
                  {[comboCard1, comboCard2].filter(Boolean).map((cCode) => {
                    const cUrl = `https://startap.com.pa/r/${cCode.trim().toUpperCase()}?m=nfc`;
                    return (
                      <div key={cCode} className="flex items-center justify-between gap-2 bg-white p-2 rounded-lg border border-amber-200">
                        <span className="font-mono text-xs font-black text-slate-800">{cCode}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => copyToClipboard(cUrl, `combo_${cCode}`)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md text-[11px] font-bold"
                          >
                            {copiedId === `combo_${cCode}` ? '¡Copiado!' : 'Copiar Link'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleWriteNfcNative(cUrl, cCode)}
                            className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-md text-[11px] font-black"
                          >
                            ⚡ Grabar NFC
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Vista Previa QR + Acciones de Prueba y Envío al Cliente */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex flex-col sm:flex-row items-center gap-4">
                <div className="bg-white p-2 rounded-xl border border-slate-200 flex-shrink-0">
                  <img
                    src={qrImageApiUrl}
                    alt={`QR ${activeCode}`}
                    className="w-24 h-24 object-contain"
                  />
                </div>
                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <div className="text-xs font-bold text-slate-800">
                    Enlace Público de Redirección:
                  </div>
                  <div className="text-[11px] font-mono text-slate-600 break-all bg-white px-2.5 py-1.5 rounded-lg border border-slate-200">
                    {nfcRedirectUrl}
                  </div>
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                    <a
                      href={nfcRedirectUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-lg text-xs font-bold transition"
                    >
                      <span>Probar Redirección</span>
                      <ExternalLink className="w-3.5 h-3.5 text-amber-600" />
                    </a>

                    <a
                      href={qrImageApiUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      download={`QR-${activeCode}.png`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 rounded-lg text-xs font-bold transition"
                    >
                      <Download className="w-3.5 h-3.5 text-slate-500" />
                      <span>Ver QR</span>
                    </a>

                    <a
                      href={buildClientWhatsAppShareUrl()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Enviar por WhatsApp al Cliente</span>
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* PANEL B: DIRECTORIO INTERACTIVO DE TAGS EN TIEMPO REAL */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-amber-600">
                    Inventario & Activos en Vivo
                  </span>
                  <h3 className="text-base font-black text-slate-900">
                    Directorio Rápido de Dispositivos ({filteredDirectory.length})
                  </h3>
                </div>
              </div>

              {/* Pestañas de Filtro */}
              <div className="flex flex-wrap gap-1.5">
                {[
                  { id: 'all', label: `Todos (${allCards.length})` },
                  { id: 'stock', label: `Libres (${stats.stt_free + stats.sttt_free + stats.stts_free})` },
                  { id: 'venta', label: `Ventas 🏷️ (${stats.ventas_count})` },
                  { id: 'regalia', label: `Regalías 🎁 (${stats.regalias_count})` },
                  { id: 'prueba', label: `Demos 🧪 (${stats.pruebas_count})` },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setDirectoryFilter(tab.id as any)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition border ${
                      directoryFilter === tab.id
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Buscador Rápido dentro del Directorio */}
              <div className="relative">
                <Filter className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={directorySearch}
                  onChange={(e) => setDirectorySearch(e.target.value)}
                  placeholder="Filtrar por código, restaurante, correo o URL..."
                  className="w-full pl-8 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-amber-500"
                />
              </div>

              {/* Lista Compacta con Carga en 1 Clic */}
              <div className="max-h-[420px] overflow-y-auto divide-y divide-slate-100 border border-slate-200 rounded-xl bg-slate-50/40">
                {loadingDirectory ? (
                  <div className="p-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
                    <span>Cargando padrón de dispositivos...</span>
                  </div>
                ) : filteredDirectory.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No se encontraron dispositivos con este filtro.
                  </div>
                ) : (
                  filteredDirectory.slice(0, 60).map((item) => {
                    const isSelected = item.card_id.toUpperCase() === activeCode;
                    return (
                      <div
                        key={item.card_id}
                        onClick={() => populateTagForm(item)}
                        className={`p-3 transition cursor-pointer flex items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-amber-50/90 border-l-4 border-l-amber-500'
                            : 'bg-white hover:bg-slate-50'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-mono text-xs font-black text-slate-900">
                              {item.card_id}
                            </span>
                            {item.is_free_stock ? (
                              <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-md text-[10px] font-bold">
                                En Stock Libre
                              </span>
                            ) : item.tipo_activacion === 'venta' ? (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-md text-[10px] font-bold">
                                🏷️ Venta ${Number(item.precio_venta || 0).toFixed(0)}
                              </span>
                            ) : item.tipo_activacion === 'regalia' ? (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 border border-amber-200 rounded-md text-[10px] font-bold">
                                🎁 Regalía $0
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-purple-50 text-purple-800 border border-purple-200 rounded-md text-[10px] font-bold">
                                🧪 Demo
                              </span>
                            )}
                            {typeof item.scan_count === 'number' && item.scan_count > 0 && (
                              <span className="text-[10px] font-bold text-slate-500">
                                · {item.scan_count} taps
                              </span>
                            )}
                          </div>
                          <div className="text-xs font-semibold text-slate-700 truncate mt-0.5">
                            {item.is_free_stock
                              ? 'Disponible para asignar'
                              : item.label || item.owner_name || 'Sin nombre'}
                          </div>
                          {item.owner_email &&
                            item.owner_email !== 'admin@startap.com.pa' &&
                            item.owner_email !== 'info@startap.com.pa' && (
                              <div className="text-[11px] text-amber-700 font-mono truncate">
                                ✉️ {item.owner_email}
                              </div>
                            )}
                        </div>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            populateTagForm(item);
                          }}
                          className="px-2.5 py-1.5 bg-slate-100 hover:bg-amber-500 hover:text-slate-950 text-slate-700 rounded-lg text-[11px] font-bold transition flex items-center gap-1 flex-shrink-0"
                        >
                          <span>Cargar</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
