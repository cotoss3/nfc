'use client';

import React, { useState, useEffect } from 'react';
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
  Tag as TagIcon
} from 'lucide-react';

export default function TagScannerAPKPage() {
  const [searchCode, setSearchCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [currentTag, setCurrentTag] = useState<any>(null);
  const [targetUrl, setTargetUrl] = useState('');
  const [label, setLabel] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Estados de NFC Nativo (Web NFC API)
  const [hasNfcSupport, setHasNfcSupport] = useState(false);
  const [isNfcWriting, setIsNfcWriting] = useState(false);
  const [isNfcScanning, setIsNfcScanning] = useState(false);

  useEffect(() => {
    // Detectar soporte para la Web NFC API (Android Chrome / WebAPK)
    if (typeof window !== 'undefined' && 'NDEFReader' in window) {
      setHasNfcSupport(true);
    }
  }, []);

  const handleSearch = async (codeToSearch?: string) => {
    const code = codeToSearch || searchCode;
    if (!code || !code.trim()) return;

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/admin/tags?code=${encodeURIComponent(code.trim())}`);
      const data = await res.json();

      if (data.success && data.card) {
        setCurrentTag(data.card);
        setTargetUrl(data.card.target_url || data.card.nfc_target_url || '');
        setLabel(data.card.label || '');
        setIsActive(data.card.is_active !== false);
        setMessage({ type: 'success', text: `TAG ${data.card.card_id} localizado exitosamente` });
      } else {
        setCurrentTag(null);
        setMessage({ 
          type: 'error', 
          text: data.message || `No se encontró el TAG con código "${code}"` 
        });
      }
    } catch (err: any) {
      console.error('Error buscando TAG:', err);
      setMessage({ type: 'error', text: 'Error al conectar con el servidor' });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Poner prefijo en la barra de búsqueda (STT-, STTT-, STTS-)
   */
  const handleSelectPrefix = (prefix: string) => {
    setSearchCode(prefix);
    setMessage({ type: 'info', text: `Prefijo "${prefix}" cargado. Completa el número y presiona Buscar.` });
  };

  /**
   * Cargar ejemplo exacto y buscar (STT-1001, STTT-1001, STTS-1001)
   */
  const handleSelectPresetAndSearch = (presetCode: string) => {
    setSearchCode(presetCode);
    handleSearch(presetCode);
  };

  /**
   * ESCRITURA NATIVA NFC (Web NFC API - Android / APK)
   */
  const handleWriteNfcNative = async (urlToWrite: string) => {
    if (typeof window === 'undefined' || !('NDEFReader' in window)) {
      setMessage({ 
        type: 'error', 
        text: 'La tecnología de escritura NFC directa no está soportada por este navegador. Usa Chrome en Android o la APK oficial de starTAP.' 
      });
      return;
    }

    setIsNfcWriting(true);
    setMessage({ 
      type: 'info', 
      text: '📲 ACERCA EL CHIP NFC AL REVERSO DE TU CELULAR AHORA MISMO...' 
    });

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.write({
        records: [
          {
            recordType: 'url',
            data: urlToWrite,
          },
        ],
      });

      setMessage({ 
        type: 'success', 
        text: `¡ÉXITO TOTAL! Chip NFC grabado físicamente con el enlace: ${urlToWrite}` 
      });
    } catch (err: any) {
      console.error('Error en escritura NFC nativa:', err);
      if (err.name === 'NotAllowedError') {
        setMessage({ type: 'error', text: 'Permiso de NFC denegado por el usuario o el sistema.' });
      } else {
        setMessage({ type: 'error', text: `Error de escritura NFC: ${err.message || 'Operación cancelada'}` });
      }
    } finally {
      setIsNfcWriting(false);
    }
  };

  /**
   * LECTURA NATIVA DE CHIPS NFC (Web NFC API)
   */
  const handleScanNfcNative = async () => {
    if (typeof window === 'undefined' || !('NDEFReader' in window)) {
      setMessage({ type: 'error', text: 'Lectura NFC no disponible en este dispositivo.' });
      return;
    }

    setIsNfcScanning(true);
    setMessage({ type: 'info', text: '📡 Escaneando... Acerca una tarjeta o chip NFC a la antena del teléfono.' });

    try {
      const ndef = new (window as any).NDEFReader();
      await ndef.scan();

      ndef.addEventListener('reading', ({ message, serialNumber }: any) => {
        let detectedCode = serialNumber || '';
        
        for (const record of message.records) {
          if (record.recordType === 'url' || record.recordType === 'text') {
            const textDecoder = new TextDecoder(record.encoding || 'utf-8');
            const text = textDecoder.decode(record.data);
            const match = text.match(/(STTT|STTS|STT)-\d+/i);
            if (match) {
              detectedCode = match[0];
              break;
            }
          }
        }

        if (detectedCode) {
          setSearchCode(detectedCode);
          handleSearch(detectedCode);
        } else {
          setMessage({ type: 'info', text: `Chip detectado (Serial: ${serialNumber || 'Desconocido'})` });
        }
      });
    } catch (err: any) {
      console.error('Error en lectura NFC:', err);
      setMessage({ type: 'error', text: 'Error iniciando escáner NFC nativo.' });
      setIsNfcScanning(false);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setTargetUrl(text.trim());
          setMessage({ type: 'success', text: 'URL pegada desde el portapapeles' });
        }
      } else {
        setMessage({ type: 'error', text: 'Usa la opción de pegar manteniendo presionado el campo de texto' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Pega la URL de destino manualmente' });
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!currentTag && !searchCode) return;

    const tagId = currentTag ? currentTag.card_id : searchCode;
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch('/api/admin/tags', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_id: tagId,
          target_url: targetUrl,
          label: label || `TAG ${tagId}`,
          is_active: isActive,
          auto_create: true
        })
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: `¡Destino guardado en base de datos para ${data.card_id}!` });
        handleSearch(data.card_id);
      } else {
        setMessage({ type: 'error', text: data.error || 'Error guardando destino' });
      }
    } catch (err) {
      console.error('Error guardando TAG:', err);
      setMessage({ type: 'error', text: 'Error de conexión al guardar' });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 font-sans">
      <div className="max-w-md mx-auto space-y-5">
        
        {/* Header Móvil APK */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <Link 
            href="/master-control/cards" 
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl transition flex items-center gap-1.5 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver</span>
          </Link>

          <div className="flex items-center gap-2">
            <span className={`w-2.5 h-2.5 rounded-full ${hasNfcSupport ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
            <span className="text-xs font-black uppercase tracking-widest text-slate-200">
              APK Nativa NFC
            </span>
          </div>
        </div>

        {/* Banner de Estado de Hardware NFC */}
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between text-xs ${
          hasNfcSupport 
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300' 
            : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
        }`}>
          <div className="flex items-center gap-2">
            <Wifi className="w-4 h-4 flex-shrink-0" />
            <span className="font-bold">
              {hasNfcSupport 
                ? 'NFC Nativo Activo (Escritura Directa)' 
                : 'Modo Web Standard (Copiado a Portapapeles)'}
            </span>
          </div>

          {hasNfcSupport && (
            <button
              type="button"
              onClick={handleScanNfcNative}
              disabled={isNfcScanning}
              className="px-2.5 py-1 bg-emerald-500 text-slate-950 font-black rounded-lg text-[10px] uppercase tracking-wider transition hover:bg-emerald-400"
            >
              {isNfcScanning ? 'Escaneando...' : 'Escanear'}
            </button>
          )}
        </div>

        {/* 1. Buscador Ultrarrápido de TAG con Selección de Prefijos */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-3">
          <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
            1. Localizar Código de TAG o Seleccionar Serie
          </label>

          {/* Botones Rápidos de Prefijos */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-semibold text-slate-400 block">Prefijos por Tipo de Dispositivo:</span>
            <div className="grid grid-cols-3 gap-1.5">
              <button
                type="button"
                onClick={() => handleSelectPrefix('STT-')}
                className="px-3 py-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1"
              >
                <TagIcon className="w-3.5 h-3.5 text-amber-400" />
                <span>STT-</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPrefix('STTT-')}
                className="px-3 py-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1"
              >
                <TagIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>STTT-</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectPrefix('STTS-')}
                className="px-3 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-mono font-bold transition flex items-center justify-center gap-1"
              >
                <TagIcon className="w-3.5 h-3.5 text-emerald-400" />
                <span>STTS-</span>
              </button>
            </div>
          </div>

          <form onSubmit={(e) => { e.preventDefault(); handleSearch(); }} className="flex gap-2 pt-1">
            <div className="relative flex-grow">
              <input
                type="text"
                value={searchCode}
                onChange={(e) => setSearchCode(e.target.value)}
                placeholder="Ej: STT-1001, STTT-1001, STTS-1001"
                className="w-full pl-9 pr-3 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-sm font-mono font-bold focus:outline-none focus:border-amber-400"
              />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition flex items-center gap-1.5 flex-shrink-0 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Buscar</span>}
            </button>
          </form>

          {/* Presets Rápidos de Código Completo */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[10px] text-slate-400 font-semibold block">Ejemplos de Lotes Frecuentes:</span>
            <div className="flex flex-wrap gap-1.5">
              {[
                { code: 'STT-1001', label: 'STT-1001 (Tarjeta)' },
                { code: 'STTT-1001', label: 'STTT-1001 (Sticker)' },
                { code: 'STTS-1001', label: 'STTS-1001 (Stand)' },
                { code: 'STT-1002', label: 'STT-1002' },
                { code: 'STTT-1002', label: 'STTT-1002' },
                { code: 'STTS-1002', label: 'STTS-1002' },
              ].map((item) => (
                <button
                  key={item.code}
                  type="button"
                  onClick={() => handleSelectPresetAndSearch(item.code)}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-[10px] font-mono font-bold transition flex items-center gap-1"
                >
                  <Sparkles className="w-3 h-3 text-amber-400" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Notificaciones del Sistema */}
        {message && (
          <div className={`p-4 rounded-2xl border text-xs font-bold flex items-center gap-2.5 shadow-lg ${
            message.type === 'success' 
              ? 'bg-emerald-950 border-emerald-500/50 text-emerald-200' 
              : message.type === 'info'
              ? 'bg-amber-950 border-amber-500/50 text-amber-200 animate-pulse'
              : 'bg-rose-950 border-rose-500/50 text-rose-200'
          }`}>
            {message.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            ) : message.type === 'info' ? (
              <Zap className="w-5 h-5 text-amber-400 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
            )}
            <span className="leading-snug">{message.text}</span>
          </div>
        )}

        {/* Tarjeta de Información y Operaciones de Escritura NFC */}
        {currentTag && (
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-5">
            
            {/* Header del TAG */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                  {currentTag.group_name || 'General'}
                </span>
                <h2 className="text-xl font-black text-amber-400 font-mono tracking-tight">
                  {currentTag.card_id}
                </h2>
              </div>

              <button
                type="button"
                onClick={() => setIsActive(!isActive)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 ${
                  isActive 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                }`}
              >
                <Power className="w-3.5 h-3.5" />
                <span>{isActive ? 'Activo' : 'Inactivo'}</span>
              </button>
            </div>

            {/* 2. ESCRITURA NATIVA NFC & COPIADO DE ENLACE */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                2. Grabar Chip NFC o Copiar Enlace
              </label>

              {/* Botón Principal: Grabación Nativa Directa NFC */}
              {hasNfcSupport && (
                <button
                  type="button"
                  disabled={isNfcWriting}
                  onClick={() => handleWriteNfcNative(`https://startap.com.pa/r/${currentTag.card_id}?m=nfc`)}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl transition shadow-xl flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isNfcWriting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Acerca el Celular al Chip...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 fill-slate-950" />
                      <span>⚡ Grabar Chip NFC Ahora (Acercar Celular)</span>
                    </>
                  )}
                </button>
              )}

              {/* Botones Secundarios: Copiado a Portapapeles */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => copyToClipboard(`https://startap.com.pa/r/${currentTag.card_id}?m=nfc`, 'btn_nfc')}
                  className="p-3 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl font-bold text-xs transition flex flex-col items-center justify-center gap-1 text-center"
                >
                  {copiedId === 'btn_nfc' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300 text-[11px]">¡NFC Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Radio className="w-4 h-4 text-amber-400" />
                      <span>Copiar Enlace NFC</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={() => copyToClipboard(`https://startap.com.pa/r/${currentTag.card_id}?m=qr`, 'btn_qr')}
                  className="p-3 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs transition flex flex-col items-center justify-center gap-1 text-center"
                >
                  {copiedId === 'btn_qr' ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-300 text-[11px]">¡QR Copiado!</span>
                    </>
                  ) : (
                    <>
                      <QrCode className="w-4 h-4 text-slate-300" />
                      <span>Copiar Enlace QR</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 3. Pegar y Configurar Destino Real */}
            <form onSubmit={handleSave} className="space-y-3 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-amber-400 uppercase tracking-wider">
                  3. Pegar URL de Destino
                </label>
                
                <button
                  type="button"
                  onClick={handlePasteClipboard}
                  className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-amber-500/30 rounded-lg text-[11px] font-bold transition flex items-center gap-1"
                >
                  <Clipboard className="w-3.5 h-3.5" />
                  <span>Pegar Portapapeles</span>
                </button>
              </div>

              <div>
                <input
                  type="url"
                  required
                  value={targetUrl}
                  onChange={(e) => setTargetUrl(e.target.value)}
                  placeholder="https://g.page/r/... o https://instagram.com/..."
                  className="w-full px-3.5 py-3 rounded-xl bg-slate-950 border border-slate-700 text-white placeholder-slate-500 text-xs font-mono focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">Nombre del Comercio / Asignación</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Ej: Rest. El Trapiche - Mostrador"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Guardando en Servidor...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Guardar Destino en Tiempo Real</span>
                  </>
                )}
              </button>
            </form>

            {/* Probar Redirección & Copiar URL */}
            {targetUrl && (
              <div className="pt-3 border-t border-slate-800/80 space-y-2 text-center">
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <a
                    href={`https://startap.com.pa/r/${currentTag.card_id}?m=nfc`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 hover:underline font-semibold bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-xl transition"
                  >
                    <span>Probar Redirección (`/r/${currentTag.card_id}?m=nfc`)</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>

                  <button
                    type="button"
                    onClick={() => copyToClipboard(`https://startap.com.pa/r/${currentTag.card_id}?m=nfc`, 'test_nfc_link')}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5"
                    title="Copiar URL completa de redirección"
                  >
                    {copiedId === 'test_nfc_link' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">¡URL Copiada!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copiar URL</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  );
}
