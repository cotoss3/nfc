'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { dbLocal, NfcCard, InventoryBatch } from '@/lib/db';
import {
  Boxes,
  Plus,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Download,
  Printer,
  X,
  Layers,
  ArrowRight,
  Sparkles,
  PackageCheck,
  RefreshCw,
  Building,
  DollarSign,
  FileText
} from 'lucide-react';

interface BulkAddBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  initialHardwareType?: 'stand' | 'plate' | 'card';
}

export default function BulkAddBatchModal({
  isOpen,
  onClose,
  onSuccess,
  initialHardwareType = 'stand'
}: BulkAddBatchModalProps) {
  const [hardwareType, setHardwareType] = useState<'stand' | 'plate' | 'card'>(initialHardwareType);
  const [quantity, setQuantity] = useState<number>(50);
  const [customStartCode, setCustomStartCode] = useState<string>('');
  const [batchId, setBatchId] = useState<string>('');
  const [supplier, setSupplier] = useState<string>('Shenzhen Micro-NFC Tech');
  const [unitCost, setUnitCost] = useState<number>(2.00);
  const [notes, setNotes] = useState<string>('');
  
  const [loading, setLoading] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    createdCards: NfcCard[];
    startCode: string;
    endCode: string;
    newStock: number;
    batch: InventoryBatch;
  } | null>(null);

  // Sync state on open or type change
  useEffect(() => {
    if (isOpen) {
      setHardwareType(initialHardwareType);
      updateDefaults(initialHardwareType, quantity);
      setResult(null);
      setErrorMsg('');
    }
  }, [isOpen, initialHardwareType]);

  const updateDefaults = (type: 'stand' | 'plate' | 'card', qty: number) => {
    const defaultCost = type === 'stand' ? 2.00 : type === 'card' ? 1.50 : 2.25;
    const defaultSupplier = type === 'card' ? 'SmartCard Global Panama' : 'Shenzhen Micro-NFC Tech';
    setUnitCost(defaultCost);
    setSupplier(defaultSupplier);
    
    try {
      const range = dbLocal.getNextSequentialRange(type, qty);
      setCustomStartCode(range.startCode);
      const prefix = range.prefix;
      const year = new Date().getFullYear();
      const existingBatches = dbLocal.getStorageItem<InventoryBatch[]>('inventory_batches', []);
      setBatchId(`LOTE-${year}-${prefix}-${(existingBatches.length + 10).toString()}`);
    } catch (e) {
      console.error('Error calculando correlativo inicial:', e);
    }
  };

  const handleSelectType = (type: 'stand' | 'plate' | 'card') => {
    setHardwareType(type);
    updateDefaults(type, quantity);
  };

  const handleQuantityChange = (newQty: number) => {
    const validQty = Math.max(1, newQty);
    setQuantity(validQty);
    try {
      const range = dbLocal.getNextSequentialRange(hardwareType, validQty, customStartCode);
      setCustomStartCode(range.startCode);
    } catch (e) {
      console.error(e);
    }
  };

  // Range preview memo
  const rangeInfo = useMemo(() => {
    try {
      return dbLocal.getNextSequentialRange(hardwareType, quantity, customStartCode);
    } catch {
      return {
        prefix: hardwareType === 'stand' ? 'STTS' : hardwareType === 'card' ? 'STTT' : 'STT',
        startNum: 1001,
        endNum: 1000 + quantity,
        startCode: `${hardwareType === 'stand' ? 'STTS' : hardwareType === 'card' ? 'STTT' : 'STT'}-1001`,
        endCode: `${hardwareType === 'stand' ? 'STTS' : hardwareType === 'card' ? 'STTT' : 'STT'}-${1000 + quantity}`,
        codes: []
      };
    }
  }, [hardwareType, quantity, customStartCode]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) {
      setErrorMsg('La cantidad debe ser al menos 1 unidad.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const res = dbLocal.createBatchTagIngestion({
        hardwareType,
        quantity,
        customStartCode: customStartCode.trim() || undefined,
        batchId: batchId.trim() || undefined,
        supplier: supplier.trim() || undefined,
        unitCost: Number(unitCost) || 0,
        notes: notes.trim() || undefined
      });

      setResult(res);
      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Ocurrió un error al procesar el lote.');
    } finally {
      setLoading(false);
    }
  };

  // Export CSV Handler
  const handleExportCsv = () => {
    if (!result || !result.createdCards || result.createdCards.length === 0) return;
    const headers = ['ID_Tag', 'Codigo_Activacion', 'Tipo_Hardware', 'Estado', 'URL_Redireccion', 'Lote', 'Fecha_Creacion'];
    const rows = result.createdCards.map(c => [
      c.card_id,
      c.activation_code || c.card_id,
      hardwareType === 'stand' ? 'Stand NFC de Mesa' : hardwareType === 'card' ? 'Tarjeta NFC' : 'Placa Mostrador',
      'En Stock (Disponible)',
      `https://startap.com.pa/r/${c.card_id}`,
      result.batch.id,
      new Date(c.created_at).toLocaleDateString('es-PA')
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.map(field => `"${field}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `starTAP_Lote_${result.batch.id}_${result.startCode}_a_${result.endCode}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Print QR Sheet Handler
  const handlePrintQrSheet = () => {
    if (!result || !result.createdCards || result.createdCards.length === 0) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Por favor permite las ventanas emergentes para imprimir las etiquetas.');
      return;
    }

    const itemsHtml = result.createdCards.map(c => `
      <div style="border: 1.5px solid #0f172a; border-radius: 12px; padding: 12px; text-align: center; background: #ffffff; page-break-inside: avoid; display: flex; flex-direction: column; align-items: center; justify-content: space-between; height: 190px; box-sizing: border-box;">
        <div style="font-size: 11px; font-weight: 900; letter-spacing: 0.5px; color: #0284c7; text-transform: uppercase;">
          starTAP · Contactless + QR
        </div>
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=https://startap.com.pa/r/${c.card_id}?m=qr" style="width: 100px; height: 100px; margin: 4px auto; display: block;" alt="${c.card_id}" />
        <div>
          <div style="font-family: monospace; font-size: 13px; font-weight: 900; color: #0f172a; letter-spacing: 1px;">
            ${c.card_id}
          </div>
          <div style="font-size: 8px; font-weight: 700; color: #64748b; text-transform: uppercase;">
            ${hardwareType === 'stand' ? 'Stand NFC Mesa' : hardwareType === 'card' ? 'Tarjeta NFC' : 'Placa Mostrador'} · ${result.batch.id}
          </div>
        </div>
      </div>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Planilla de Etiquetas · ${result.batch.id}</title>
          <style>
            @page { size: letter; margin: 12mm; }
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #fff; }
            .header { text-align: center; margin-bottom: 16px; border-bottom: 2px solid #0284c7; padding-bottom: 8px; }
            .header h1 { font-size: 18px; margin: 0; color: #0f172a; }
            .header p { font-size: 11px; color: #64748b; margin: 4px 0 0 0; }
            .grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; }
            @media print {
              body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>starTAP Panamá — Lote ${result.batch.id} (${result.createdCards.length} Etiquetas)</h1>
            <p>Rango: <strong>${result.startCode}</strong> a <strong>${result.endCode}</strong> · Generado el ${new Date().toLocaleDateString('es-PA')} · Escanea para activar en startap.com.pa</p>
          </div>
          <div class="grid">
            ${itemsHtml}
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() { window.print(); }, 500);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col animate-in fade-in zoom-in duration-200">
        
        {/* MODAL HEADER */}
        <div className="p-5 sm:p-6 bg-slate-950 text-white flex items-start justify-between relative border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Boxes className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-amber-400 uppercase bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20">
                  Módulo de Producción
                </span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-white mt-1">
                Entrada & Registro en Lote de Hardware
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Genera códigos correlativos continuos, alta en stock y cuadre automático de inventario disponible.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MODAL BODY */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 text-slate-800">
          
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 text-xs font-bold flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* SUCCESS SCREEN */}
          {result ? (
            <div className="space-y-6 text-center py-2 animate-in fade-in duration-200">
              <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto border-2 border-emerald-200 shadow-xs">
                <PackageCheck className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-xl font-black text-slate-900">
                  ¡Lote Registrado & Cuadrado con Éxito!
                </h3>
                <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                  Se crearon <strong className="text-slate-900 font-bold">{result.createdCards.length} tags físicos</strong> en estado <span className="text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">Disponible / En Stock</span> y se sumaron inmediatamente al stock de almacén.
                </p>
              </div>

              {/* STATS HIGHLIGHT */}
              <div className="grid grid-cols-3 gap-3 bg-slate-50 border border-slate-200 rounded-2xl p-4 text-left">
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Código de Lote</span>
                  <span className="text-sm font-black text-slate-900 font-mono">{result.batch.id}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Rango Correlativo</span>
                  <span className="text-sm font-black text-amber-600 font-mono">{result.startCode} → {result.endCode}</span>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase text-slate-500 block">Nuevo Stock Físico</span>
                  <span className="text-sm font-black text-emerald-700 font-mono">{result.newStock} uds</span>
                </div>
              </div>

              {/* ACTION BUTTONS */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleExportCsv}
                  className="flex-1 py-3 px-4 bg-white border border-slate-300 hover:bg-slate-50 text-slate-800 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4 text-amber-500" />
                  <span>Descargar Listado (CSV)</span>
                </button>

                <button
                  type="button"
                  onClick={handlePrintQrSheet}
                  className="flex-1 py-3 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2"
                >
                  <Printer className="w-4 h-4 text-amber-400" />
                  <span>Imprimir Planilla QR ({result.createdCards.length})</span>
                </button>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition"
                >
                  Listo, Volver al Panel
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 text-xs">
              
              {/* SELECTOR DE TIPO DE HARDWARE */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 block text-xs">
                  1. Formato de Hardware a Ingresar *
                </label>
                <div className="grid grid-cols-3 gap-2 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => handleSelectType('stand')}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                      hardwareType === 'stand'
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm ring-2 ring-amber-400/30'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="font-black text-xs">Stand NFC Mesa</span>
                    <span className="text-[10px] font-mono font-bold opacity-80">Prefijo (STTS-XXXX)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectType('plate')}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                      hardwareType === 'plate'
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm ring-2 ring-amber-400/30'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="font-black text-xs">Placa Mostrador</span>
                    <span className="text-[10px] font-mono font-bold opacity-80">Prefijo (STT-XXXX)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSelectType('card')}
                    className={`p-3 rounded-2xl border text-center transition flex flex-col items-center gap-1 ${
                      hardwareType === 'card'
                        ? 'bg-amber-500 text-slate-950 border-amber-600 shadow-sm ring-2 ring-amber-400/30'
                        : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                    }`}
                  >
                    <span className="font-black text-xs">Tarjeta Bolsillo</span>
                    <span className="text-[10px] font-mono font-bold opacity-80">Prefijo (STTT-XXXX)</span>
                  </button>
                </div>
              </div>

              {/* CANTIDAD & PRESETS */}
              <div className="space-y-1.5 bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700 block text-xs">
                    2. Cantidad de Unidades del Lote *
                  </label>
                  <div className="flex gap-1">
                    {[10, 20, 50, 100].map(qty => (
                      <button
                        key={qty}
                        type="button"
                        onClick={() => handleQuantityChange(qty)}
                        className={`px-2 py-0.5 rounded-lg text-[10px] font-bold border transition ${
                          quantity === qty
                            ? 'bg-slate-900 text-white border-slate-900'
                            : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                        }`}
                      >
                        +{qty}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <input
                      type="number"
                      min={1}
                      max={1000}
                      value={quantity}
                      onChange={(e) => handleQuantityChange(parseInt(e.target.value, 10) || 1)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                      required
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">Unidades físicas recibidas</span>
                  </div>

                  <div>
                    <input
                      type="text"
                      value={customStartCode}
                      onChange={(e) => setCustomStartCode(e.target.value)}
                      placeholder={rangeInfo.startCode}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl font-mono font-bold text-slate-900 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                    <span className="text-[10px] text-slate-500 block mt-1">Código inicial correlativo (autocalculado)</span>
                  </div>
                </div>

                {/* CORRELATIVE LIVE BADGE */}
                <div className="mt-2 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                    <div>
                      <span className="font-bold text-amber-900">Rango Continuo a Generar:</span>
                      <span className="font-mono font-black text-amber-800 ml-1.5">{rangeInfo.startCode} → {rangeInfo.endCode}</span>
                    </div>
                  </div>
                  <span className="font-black text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-md text-[10px]">
                    {quantity} IDs nuevos
                  </span>
                </div>
              </div>

              {/* METADATOS DEL LOTE DE INVENTARIO */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Código de Lote *</label>
                  <input
                    type="text"
                    value={batchId}
                    onChange={(e) => setBatchId(e.target.value)}
                    placeholder="LOTE-2026-XX"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    required
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Proveedor / Fabricante</label>
                  <input
                    type="text"
                    value={supplier}
                    onChange={(e) => setSupplier(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Costo Unitario ($ USD)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      step="0.01"
                      min={0}
                      value={unitCost}
                      onChange={(e) => setUnitCost(parseFloat(e.target.value) || 0)}
                      className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                    />
                  </div>
                </div>
              </div>

              {/* NOTAS ADICIONALES */}
              <div>
                <label className="font-bold text-slate-700 block mb-1">Observaciones / Factura / Envío (Opcional)</label>
                <input
                  type="text"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Ej. Importación DHL guía #984321 - Chips NTAG216 probados al 100%"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              {/* EXPLICACIÓN DEL CUADRE AUTOMÁTICO */}
              <div className="p-3 bg-slate-100 rounded-xl border border-slate-200 flex items-start gap-2.5 text-[11px] text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-slate-800 block">Garantía de Cuadre de Inventario:</strong>
                  Los {quantity} tags se crearán sin asignar (<code className="bg-slate-200 px-1 rounded text-slate-800">claimed: false</code>, <code className="bg-slate-200 px-1 rounded text-slate-800">is_active: false</code>). El stock disponible del producto se incrementará en +{quantity} unidades y se creará la entrada correspondiente en el Kardex de almacén.
                </div>
              </div>

              {/* SUBMIT BUTTON */}
              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Creando Lote...</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Registrar Lote & Cuadrar Stock (+{quantity})</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          )}

        </div>

      </div>
    </div>
  );
}
