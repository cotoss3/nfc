'use client';

import React, { useState, useEffect } from 'react';
import { dbLocal, Order, NfcCard } from '@/lib/db';
import { ShieldCheck, Package, Link as LinkIcon, RefreshCw, CheckCircle } from 'lucide-react';

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [cards, setCards] = useState<NfcCard[]>([]);
  const [activeTab, setActiveTab] = useState<'orders' | 'cards' | 'stickers'>('orders');
  const [stickerQuantity, setStickerQuantity] = useState(5);
  const [generatedStickers, setGeneratedStickers] = useState<string[]>([]);

  // Admin creation states
  const [newCardIdInput, setNewCardIdInput] = useState('');
  const [newCardChannels, setNewCardChannels] = useState<'both' | 'nfc' | 'qr'>('both');
  const [newCardIsActive, setNewCardIsActive] = useState(true);
  const [newCardLabelInput, setNewCardLabelInput] = useState('');
  const [createCardSuccess, setCreateCardSuccess] = useState(false);

  // Sticker batch states
  const [batchChannels, setBatchChannels] = useState<'both' | 'nfc' | 'qr'>('both');
  const [batchIsActive, setBatchIsActive] = useState(true);

  const handleCreateOrEnableCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardIdInput.trim()) return;

    dbLocal.createAdminCard(newCardIdInput.trim(), newCardChannels, newCardIsActive, newCardLabelInput.trim());
    setCreateCardSuccess(true);
    setNewCardIdInput('');
    setNewCardLabelInput('');
    loadData();
    setTimeout(() => setCreateCardSuccess(false), 2000);
  };

  const handleToggleActive = async (cardId: string, currentStatus: boolean) => {
    dbLocal.toggleCardActive(cardId, !currentStatus);
    try {
      const allCards = dbLocal.getCards();
      await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'nfc_cards', value: allCards })
      });
    } catch (err) {
      console.error('Error guardando estado activo:', err);
    }
    loadData();
  };

  const handleChangeChannels = async (cardId: string, channels: 'both' | 'nfc' | 'qr') => {
    dbLocal.updateCardChannels(cardId, channels);
    try {
      const allCards = dbLocal.getCards();
      await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: 'nfc_cards', value: allCards })
      });
    } catch (err) {
      console.error('Error guardando canales:', err);
    }
    loadData();
  };

  const handleGenerateStickers = () => {
    const list: string[] = [];
    const baseCode = dbLocal.getNextStickerCode();
    let num = parseInt(baseCode.replace('STT-', ''), 10) || 1001;

    for (let i = 0; i < stickerQuantity; i++) {
      const code = `STT-${num + i}`;
      list.push(code);
      // Registrar e inicializar en DB como habilitado por Admin
      dbLocal.createAdminCard(code, batchChannels, batchIsActive);
    }
    setGeneratedStickers(list);
    loadData();
  };
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    const dbOrders = dbLocal.getOrders();
    const dbCards = dbLocal.getCards();
    setOrders(dbOrders);
    setCards(dbCards);
    setLoading(false);
  };

  const handleUpdateStatus = (orderId: string, status: Order['status']) => {
    dbLocal.updateOrderStatus(orderId, status);
    loadData();
  };

  return (
    <div className="shopify-container max-w-6xl py-12 space-y-8 bg-brand-50">
      {/* Admin Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-200 pb-6">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-[9px] font-bold text-red-650 bg-red-50 border border-red-100 px-2.5 py-1 rounded mb-1 uppercase tracking-wider">
            <ShieldCheck className="h-3.5 w-3.5" />
            <span>Fulfillment & Control de Activación starTAP</span>
          </div>
          <h1 className="text-2xl font-black text-brand-950 uppercase tracking-wide">Panel de Control de Administrador</h1>
          <p className="text-xs text-brand-400">Habilitación de IDs STT-XXXX, asignación de canales (NFC / QR / Ambas) y control de estado activo.</p>
        </div>

        <button
          onClick={loadData}
          className="shopify-btn-secondary flex items-center space-x-1.5 py-2 px-4 text-xs font-bold uppercase tracking-wider border-brand-300"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Refrescar Panel</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 border-b border-brand-200">
        <button
          onClick={() => setActiveTab('orders')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'orders'
              ? 'border-brand-950 text-brand-950'
              : 'border-transparent text-brand-400 hover:text-brand-650'
          }`}
        >
          Pedidos ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('cards')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'cards'
              ? 'border-brand-950 text-brand-950'
              : 'border-transparent text-brand-400 hover:text-brand-650'
          }`}
        >
          Gestión de IDs & Canales ({cards.length})
        </button>
        <button
          onClick={() => setActiveTab('stickers')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'stickers'
              ? 'border-brand-950 text-brand-950'
              : 'border-transparent text-brand-400 hover:text-brand-650'
          }`}
        >
          Generador de Lotes STT
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 text-xs text-brand-400 uppercase tracking-widest font-bold">Cargando base de datos...</div>
      ) : activeTab === 'orders' ? (
        /* Orders list */
        <div className="space-y-6">
          {orders.length === 0 ? (
            <div className="bg-white border border-brand-200 rounded p-12 text-center text-xs text-brand-400 uppercase tracking-widest font-bold">
              No hay pedidos registrados
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-white border border-brand-200 rounded p-6 space-y-6 shadow-premium"
                >
                  {/* Order header */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-brand-200">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono font-bold text-sm text-brand-950">{order.id}</span>
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${
                          order.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-100' :
                          order.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-100' :
                          order.status === 'shipped' ? 'bg-purple-50 text-purple-700 border-purple-100' :
                          'bg-green-50 text-green-700 border-green-100'
                        }`}>
                          {order.status === 'pending' ? 'Pendiente' :
                           order.status === 'processing' ? 'Grabando NFC' :
                           order.status === 'shipped' ? 'Despachado' : 'Entregado'}
                        </span>
                      </div>
                      <span className="text-[10px] text-brand-400 block mt-0.5">
                        {new Date(order.created_at).toLocaleString('es-PA')}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[9px] font-bold text-brand-400 uppercase tracking-wider mr-1">Cambiar Estado:</span>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'processing')}
                        className="px-2 py-1 bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-250 font-bold text-[9px] rounded uppercase tracking-wider"
                      >
                        Grabar
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'shipped')}
                        className="px-2 py-1 bg-brand-50 hover:bg-brand-100 text-brand-800 border border-brand-250 font-bold text-[9px] rounded uppercase tracking-wider"
                      >
                        Enviar (🇵🇦)
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(order.id, 'delivered')}
                        className="px-2 py-1 bg-accent-50 hover:bg-accent-100 text-accent-700 border border-accent-100 font-bold text-[9px] rounded uppercase tracking-wider"
                      >
                        Entregar
                      </button>
                    </div>
                  </div>

                  {/* Details grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-brand-500">
                    <div>
                      <h3 className="font-bold text-brand-950 uppercase tracking-wider mb-2">Comprador</h3>
                      <p className="font-bold text-brand-800">{order.customer_name}</p>
                      <p className="text-[10px] text-brand-400 font-mono mt-0.5">{order.customer_email}</p>
                      <p className="text-[10px] text-brand-400">{order.customer_phone}</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-950 uppercase tracking-wider mb-2">Dirección de Despacho</h3>
                      <p className="font-bold text-brand-800">{order.shipping_province}, {order.shipping_district}</p>
                      <p className="text-[10px] text-brand-400 leading-relaxed">{order.shipping_address}</p>
                    </div>
                    <div>
                      <h3 className="font-bold text-brand-950 uppercase tracking-wider mb-2">Detalles del Cobro</h3>
                      <p className="text-brand-700">
                        Pasarela: <span className="font-bold uppercase font-mono text-brand-950">{order.payment_method}</span>
                      </p>
                      <p className="text-base font-black text-brand-950 mt-1">${order.total.toFixed(2)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'cards' ? (
        /* Active chip links & Admin Creation */
        <div className="space-y-6">
          {/* Admin Enable / Create New ID Form */}
          <div className="bg-white border border-brand-200 rounded p-6 shadow-premium space-y-4">
            <h2 className="text-sm font-black text-brand-950 uppercase tracking-wide flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Habilitar Nueva ID o Dispositivo STT-XXXX</span>
            </h2>
            <p className="text-xs text-brand-500">
              Solo las IDs habilitadas en este panel podrán generar redirecciones. Define el ID, canales soportados (NFC / QR / Ambas) y estado de activación.
            </p>

            <form onSubmit={handleCreateOrEnableCard} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end pt-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-700 mb-1">Código ID STT-XXXX</label>
                <input
                  type="text"
                  required
                  value={newCardIdInput}
                  onChange={(e) => setNewCardIdInput(e.target.value)}
                  placeholder="ej. STT-1005"
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-mono font-bold uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-700 mb-1">Tipo / Canales Soportados</label>
                <select
                  value={newCardChannels}
                  onChange={(e) => setNewCardChannels(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-semibold"
                >
                  <option value="both">NFC + Código QR (Ambas)</option>
                  <option value="nfc">Solo NFC (Sin QR)</option>
                  <option value="qr">Solo Código QR (Sin NFC)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-700 mb-1">Estado Inicial</label>
                <select
                  value={newCardIsActive ? 'true' : 'false'}
                  onChange={(e) => setNewCardIsActive(e.target.value === 'true')}
                  className="w-full bg-slate-50 border border-slate-300 rounded px-3 py-2 text-xs font-semibold"
                >
                  <option value="true">Activo (Habilitado)</option>
                  <option value="false">Inactivo (Bloqueado)</option>
                </select>
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-brand-950 hover:bg-brand-900 text-white font-bold text-xs uppercase tracking-wider rounded transition"
                >
                  Habilitar ID
                </button>
              </div>
            </form>

            {createCardSuccess && (
              <p className="text-xs text-emerald-600 font-bold flex items-center gap-1 pt-1">
                <CheckCircle className="w-4 h-4" /> ¡ID Habilitada correctamente en la plataforma!
              </p>
            )}
          </div>

          {/* Cards Table */}
          <div className="bg-white border border-brand-200 rounded shadow-premium overflow-hidden">
            <div className="p-4 border-b border-brand-200 bg-brand-50 flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase tracking-wider text-brand-950">Inventario Global de Dispositivos Registrados ({cards.length})</h3>
              <span className="text-[10px] text-brand-400">Control directo de Administrador</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-brand-50 text-brand-400 font-bold border-b border-brand-200 uppercase tracking-wider">
                    <th className="p-4">Ruta / ID Placa</th>
                    <th className="p-4">Establecimiento / Etiqueta</th>
                    <th className="p-4">Propietario / Cliente</th>
                    <th className="p-4 text-center">Tipo de Canales</th>
                    <th className="p-4 text-center">Estado de Activación</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-100 font-medium text-brand-700">
                  {cards.map((card) => (
                    <tr key={card.card_id} className="hover:bg-brand-50">
                      <td className="p-4 font-mono font-bold text-brand-950 select-all">
                        /r/{card.card_id}
                      </td>
                      <td className="p-4 font-bold text-brand-950 uppercase tracking-wide">
                        {card.label}
                      </td>
                      <td className="p-4">
                        <p className="font-semibold text-brand-800">{card.owner_name}</p>
                        <p className="text-[9px] text-brand-400 font-mono">{card.owner_email}</p>
                      </td>
                      <td className="p-4 text-center">
                        <select
                          value={card.channels || 'both'}
                          onChange={(e) => handleChangeChannels(card.card_id, e.target.value as any)}
                          className="bg-white border border-slate-200 text-[11px] font-bold rounded px-2 py-1 focus:outline-none"
                        >
                          <option value="both">📻 NFC + QR (Ambas)</option>
                          <option value="nfc">⚡ Solo NFC</option>
                          <option value="qr">📷 Solo QR</option>
                        </select>
                      </td>
                      <td className="p-4 text-center">
                        <div className="flex items-center justify-center space-x-2">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                            card.is_active 
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' 
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {card.is_active ? '🟢 Activo' : '🔴 Inactivo'}
                          </span>
                          <button
                            onClick={() => handleToggleActive(card.card_id, card.is_active)}
                            className={`px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border transition ${
                              card.is_active 
                                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-300 shadow-sm' 
                                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 shadow-sm'
                            }`}
                          >
                            {card.is_active ? 'Desactivar' : 'Activar'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* Stickers Tab */
        <div className="bg-white border border-brand-200 rounded p-8 space-y-6 shadow-premium">
          <div className="border-b border-brand-100 pb-4">
            <h2 className="text-lg font-black text-brand-950 uppercase tracking-tight">Generador de Lotes STT Habilitados</h2>
            <p className="text-xs text-brand-500">Crea e inicializa nuevos códigos únicos habilitados automáticamente en el sistema.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-700 block">Cantidad a Generar</label>
              <input
                type="number"
                min="1"
                max="50"
                value={stickerQuantity}
                onChange={(e) => setStickerQuantity(parseInt(e.target.value, 10) || 1)}
                className="shopify-input w-full"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-700 block">Tipo / Canales del Lote</label>
              <select
                value={batchChannels}
                onChange={(e) => setBatchChannels(e.target.value as any)}
                className="shopify-input w-full"
              >
                <option value="both">NFC + QR (Ambas)</option>
                <option value="nfc">Solo NFC</option>
                <option value="qr">Solo QR</option>
              </select>
            </div>

            <div>
              <button
                onClick={handleGenerateStickers}
                className="shopify-btn-primary w-full py-2.5 px-6 font-bold uppercase tracking-wider text-xs"
              >
                Generar e Inicializar Lote
              </button>
            </div>
          </div>

          {generatedStickers.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-brand-100">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-800">Lote Generado e Habilitado Listo para Grabar / Imprimir</h3>
                <button
                  onClick={() => window.print()}
                  className="shopify-btn-secondary py-1.5 px-3 text-xs font-bold"
                >
                  🖨️ Imprimir Etiquetas
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {generatedStickers.map((code) => (
                  <div key={code} className="border-2 border-brand-950 rounded-xl p-4 bg-white shadow-sm flex flex-col items-center justify-center space-y-2 text-center">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-brand-400">starTAP Panamá</span>
                    <span className="font-mono text-xl font-black text-brand-950 tracking-wider">{code}</span>
                    <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 font-bold">
                      Habilitado ({batchChannels === 'both' ? 'NFC+QR' : batchChannels.toUpperCase()})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
