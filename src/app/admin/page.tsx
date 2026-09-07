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

  const handleGenerateStickers = () => {
    const list: string[] = [];
    const baseCode = dbLocal.getNextStickerCode();
    let num = parseInt(baseCode.replace('STT-', ''), 10) || 1001;

    for (let i = 0; i < stickerQuantity; i++) {
      list.push(`STT-${num + i}`);
    }
    setGeneratedStickers(list);
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
            <span>Fulfillment PanaCards Panamá</span>
          </div>
          <h1 className="text-2xl font-black text-brand-950 uppercase tracking-wide">Panel Administrativo</h1>
          <p className="text-xs text-brand-400">Control de grabado láser, grabado NFC y despacho provincial de pedidos.</p>
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
          Registros NFC ({cards.length})
        </button>
        <button
          onClick={() => setActiveTab('stickers')}
          className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all ${
            activeTab === 'stickers'
              ? 'border-brand-950 text-brand-950'
              : 'border-transparent text-brand-400 hover:text-brand-650'
          }`}
        >
          Generador de Etiquetas STT
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

                  {/* Production specifications */}
                  <div className="bg-brand-50 border border-brand-200 rounded p-4 space-y-4">
                    <h3 className="text-[9px] font-bold text-brand-400 uppercase tracking-widest flex items-center gap-1.5">
                      <Package className="h-3.5 w-3.5" /> Ficha de Producción Física
                    </h3>

                    <div className="divide-y divide-brand-200">
                      {order.items.map((item, index) => (
                        <div key={index} className="py-3 first:pt-0 last:pb-0 flex flex-col sm:flex-row justify-between sm:items-center gap-4 text-xs">
                          <div className="space-y-1">
                            <p className="font-bold text-brand-950 uppercase tracking-wide">
                              {item.quantity}x {item.product_name}
                            </p>
                            <div className="text-[10px] text-brand-500 space-y-0.5">
                              <p>Material/Color: <span className="font-bold text-brand-800 uppercase">{item.selected_color}</span></p>
                              <p>Grabado Láser: <span className="font-bold text-brand-800 uppercase">{item.business_name}</span></p>
                              {item.initial_redirect_url && (
                                <p className="flex items-center gap-1 text-brand-700 font-bold font-mono text-[9px] break-all pt-0.5">
                                  <LinkIcon className="h-3 w-3 flex-shrink-0" />
                                  <span>Redirección Inicial: {item.initial_redirect_url}</span>
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Logo Preview */}
                          {item.logo_url && (
                            <div className="flex items-center space-x-2 border border-brand-200 bg-white p-2 rounded">
                              <span className="text-[8px] text-brand-400 font-bold uppercase tracking-wider">Logo Vector:</span>
                              <img src={item.logo_url} alt="Logo" className="h-7 max-w-14 object-contain" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : activeTab === 'cards' ? (
        /* Active chip links */
        <div className="bg-white border border-brand-200 rounded shadow-premium overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-brand-50 text-brand-400 font-bold border-b border-brand-200 uppercase tracking-wider">
                  <th className="p-4">Ruta del Chip NFC</th>
                  <th className="p-4">Establecimiento</th>
                  <th className="p-4">Propietario</th>
                  <th className="p-4">Destino Actual en la Nube</th>
                  <th className="p-4 text-center">NFC</th>
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
                    <td className="p-4 font-mono text-[10px] text-brand-500 max-w-[200px] truncate break-all" title={card.target_url}>
                      {card.target_url}
                    </td>
                    <td className="p-4 text-center">
                      <span className="inline-flex h-1.5 w-1.5 rounded-full bg-accent-600"></span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* Stickers Tab */
        <div className="bg-white border border-brand-200 rounded p-8 space-y-6 shadow-premium">
          <div className="border-b border-brand-100 pb-4">
            <h2 className="text-lg font-black text-brand-950 uppercase tracking-tight">Generador de Etiquetas Secuenciales STT</h2>
            <p className="text-xs text-brand-500">Crea nuevos códigos únicos para grabar en chips NFC o imprimir en stickers físicos (Formato: STT-1001, STT-1002...).</p>
          </div>

          <div className="flex flex-col sm:flex-row items-end gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-brand-700 block">Cantidad de Etiquetas a Generar</label>
              <input
                type="number"
                min="1"
                max="50"
                value={stickerQuantity}
                onChange={(e) => setStickerQuantity(parseInt(e.target.value, 10) || 1)}
                className="shopify-input w-40"
              />
            </div>
            <button
              onClick={handleGenerateStickers}
              className="shopify-btn-primary py-2.5 px-6 font-bold uppercase tracking-wider text-xs"
            >
              Generar Lote STT
            </button>
          </div>

          {generatedStickers.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-brand-100">
              <div className="flex justify-between items-center">
                <h3 className="text-xs font-bold uppercase tracking-wider text-brand-800">Lote Generado Listo para Imprimir / Grabar</h3>
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
                    <span className="text-[9px] font-mono text-brand-500 bg-brand-50 px-2 py-0.5 rounded border border-brand-200">
                      startap.com.pa/r/{code}
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
