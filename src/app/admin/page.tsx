'use client';

import React, { useState, useEffect } from 'react';
import { dbLocal, Order, NfcCard, Product, ScanRecord } from '@/lib/db';
import { 
  ShieldCheck, Package, RefreshCw, CheckCircle, Search, 
  Tag, BarChart2, Smartphone, Layers, Edit2, DollarSign, 
  Filter, Radio, QrCode, User, Plus, Check, Printer, AlertCircle
} from 'lucide-react';

type AdminTab = 'cards' | 'orders' | 'products' | 'analytics' | 'stickers';

export default function AdminPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [cards, setCards] = useState<NfcCard[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>('cards');
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [cardSearch, setCardSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [productSearch, setProductSearch] = useState('');

  // Admin Single Card Creation
  const [newCardIdInput, setNewCardIdInput] = useState('');
  const [newCardChannels, setNewCardChannels] = useState<'both' | 'nfc' | 'qr'>('both');
  const [newCardIsActive, setNewCardIsActive] = useState(true);
  const [newCardLabelInput, setNewCardLabelInput] = useState('');
  const [createCardSuccess, setCreateCardSuccess] = useState(false);

  // Sticker Batch Generation
  const [stickerQuantity, setStickerQuantity] = useState(5);
  const [generatedStickers, setGeneratedStickers] = useState<string[]>([]);
  const [batchChannels, setBatchChannels] = useState<'both' | 'nfc' | 'qr'>('both');
  const [batchIsActive, setBatchIsActive] = useState(true);

  // Price Editor States
  const [priceInputs, setPriceInputs] = useState<{ [id: string]: string }>({});
  const [priceSuccess, setPriceSuccess] = useState<{ [id: string]: boolean }>({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setLoading(true);
    const dbOrders = dbLocal.getOrders();
    const dbCards = dbLocal.getCards();
    const dbProducts = dbLocal.getProducts();
    const dbScans = dbLocal.getStorageItem<ScanRecord[]>('nfc_scans', []);

    setOrders(dbOrders);
    setCards(dbCards);
    setProducts(dbProducts);
    setScans(dbScans);

    // Initial price input states
    const initPrices: { [id: string]: string } = {};
    dbProducts.forEach(p => {
      initPrices[p.id] = p.price.toFixed(2);
    });
    setPriceInputs(initPrices);

    setLoading(false);
  };

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
      dbLocal.createAdminCard(code, batchChannels, batchIsActive);
    }
    setGeneratedStickers(list);
    loadData();
  };

  const handleUpdateStatus = (orderId: string, status: Order['status']) => {
    dbLocal.updateOrderStatus(orderId, status);
    loadData();
  };

  const handlePriceSave = (productId: string) => {
    const newPriceVal = parseFloat(priceInputs[productId]);
    if (isNaN(newPriceVal) || newPriceVal <= 0) return;

    dbLocal.updateProductPrice(productId, newPriceVal);
    setPriceSuccess({ ...priceSuccess, [productId]: true });
    loadData();
    setTimeout(() => {
      setPriceSuccess(prev => ({ ...prev, [productId]: false }));
    }, 2000);
  };

  // Filtered Cards
  const filteredCards = cards.filter(c => {
    const query = cardSearch.toLowerCase().trim();
    return c.card_id.toLowerCase().includes(query) ||
           c.label.toLowerCase().includes(query) ||
           c.owner_name.toLowerCase().includes(query) ||
           c.owner_email.toLowerCase().includes(query);
  });

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    const query = orderSearch.toLowerCase().trim();
    const matchesSearch = o.id.toLowerCase().includes(query) ||
                          o.customer_name.toLowerCase().includes(query) ||
                          o.customer_email.toLowerCase().includes(query);
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const query = productSearch.toLowerCase().trim();
    return p.name.toLowerCase().includes(query) ||
           p.id.toLowerCase().includes(query) ||
           p.category.toLowerCase().includes(query);
  });

  // Aggregate user analytics
  const userMetricsMap: { [email: string]: { email: string; name: string; cardCount: number; scanCount: number; nfcCount: number; qrCount: number } } = {};

  cards.forEach(c => {
    const email = c.owner_email.trim().toLowerCase();
    if (!userMetricsMap[email]) {
      userMetricsMap[email] = {
        email,
        name: c.owner_name || email.split('@')[0],
        cardCount: 0,
        scanCount: 0,
        nfcCount: 0,
        qrCount: 0
      };
    }
    userMetricsMap[email].cardCount += 1;
  });

  scans.forEach(s => {
    const matchingCard = cards.find(c => c.card_id === s.card_id);
    if (matchingCard) {
      const email = matchingCard.owner_email.trim().toLowerCase();
      if (userMetricsMap[email]) {
        userMetricsMap[email].scanCount += 1;
        if (s.scan_type === 'qr' || (s.referrer && s.referrer.toLowerCase().includes('qr'))) {
          userMetricsMap[email].qrCount += 1;
        } else {
          userMetricsMap[email].nfcCount += 1;
        }
      }
    }
  });

  const userMetricsList = Object.values(userMetricsMap);

  return (
    <div className="min-h-screen bg-slate-100 text-slate-900 font-sans pb-24 md:pb-12">
      
      {/* MOBILE TOP HEADER BAR */}
      <header className="bg-slate-900 text-white px-4 py-3.5 flex items-center justify-between sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-red-600 text-white font-black rounded-lg flex items-center justify-center text-xs shadow-sm">
            ADM
          </div>
          <div>
            <h1 className="text-xs font-black uppercase tracking-wider text-slate-100">starTAP Admin</h1>
            <p className="text-[9px] text-slate-400">Control General de Comercio</p>
          </div>
        </div>

        <button
          onClick={loadData}
          className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-bold transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[10px] uppercase tracking-wider">Refrescar</span>
        </button>
      </header>

      {/* DESKTOP TOP TAB NAVIGATION */}
      <div className="max-w-7xl mx-auto px-4 pt-6">
        <div className="hidden md:flex space-x-2 border-b border-slate-200 pb-2">
          <button
            onClick={() => setActiveTab('cards')}
            className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'cards'
                ? 'border-slate-950 text-slate-950 bg-white rounded-t-xl py-2 shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4 text-amber-500" />
            <span>Dispositivos TAP ({cards.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'border-slate-950 text-slate-950 bg-white rounded-t-xl py-2 shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Package className="w-4 h-4 text-blue-500" />
            <span>Pedidos & Órdenes ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'products'
                ? 'border-slate-950 text-slate-950 bg-white rounded-t-xl py-2 shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Tag className="w-4 h-4 text-emerald-500" />
            <span>Catálogo & Precios ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'analytics'
                ? 'border-slate-950 text-slate-950 bg-white rounded-t-xl py-2 shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <BarChart2 className="w-4 h-4 text-purple-500" />
            <span>Analíticas por Comercio</span>
          </button>

          <button
            onClick={() => setActiveTab('stickers')}
            className={`pb-3 px-4 font-bold text-xs uppercase tracking-wider border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'stickers'
                ? 'border-slate-950 text-slate-950 bg-white rounded-t-xl py-2 shadow-sm'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-rose-500" />
            <span>Generador de Lotes STT</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 pt-4 md:pt-6 space-y-6">

        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center text-xs text-slate-400 font-bold uppercase tracking-widest border border-slate-200">
            Cargando Base de Datos Administrador...
          </div>
        ) : (
          <>
            {/* ---------------- MODULE 1: DISPOSITIVOS TAP ---------------- */}
            {activeTab === 'cards' && (
              <div className="space-y-6">
                
                {/* Search & Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <Smartphone className="w-5 h-5 text-amber-500" />
                      Inventario & Control de Habilitación TAP
                    </h2>
                    <p className="text-xs text-slate-500">Busca, activa, bloquea y asigna canales a placas físicas de clientes.</p>
                  </div>

                  <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={cardSearch}
                      onChange={(e) => setCardSearch(e.target.value)}
                      placeholder="Buscar por ID STT, usuario o correo..."
                      className="w-full bg-white border border-slate-300 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                {/* Single TAP ID Enable Form */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>Habilitar Nueva ID o Dispositivo STT-XXXX</span>
                  </h3>
                  <p className="text-xs text-slate-500">
                    Solo las IDs habilitadas en este panel podrán generar redirecciones públicas.
                  </p>

                  <form onSubmit={handleCreateOrEnableCard} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 items-end pt-1">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Código ID STT-XXXX</label>
                      <input
                        type="text"
                        required
                        value={newCardIdInput}
                        onChange={(e) => setNewCardIdInput(e.target.value)}
                        placeholder="ej. STT-1005"
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-mono font-bold uppercase"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Canales Permitidos</label>
                      <select
                        value={newCardChannels}
                        onChange={(e) => setNewCardChannels(e.target.value as any)}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                      >
                        <option value="both">📻 NFC + QR (Ambas)</option>
                        <option value="nfc">⚡ Solo NFC (Sin QR)</option>
                        <option value="qr">📷 Solo QR (Sin NFC)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Estado Inicial</label>
                      <select
                        value={newCardIsActive ? 'true' : 'false'}
                        onChange={(e) => setNewCardIsActive(e.target.value === 'true')}
                        className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold"
                      >
                        <option value="true">Activo (Habilitado)</option>
                        <option value="false">Inactivo (Bloqueado)</option>
                      </select>
                    </div>

                    <div>
                      <button
                        type="submit"
                        className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-sm"
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

                {/* Cards Inventory Table */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Dispositivos Registrados ({filteredCards.length})
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">Realtime Sync Active</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                          <th className="p-3.5">Ruta / ID Placa</th>
                          <th className="p-3.5">Nombre / Comercio</th>
                          <th className="p-3.5">Propietario / Correo</th>
                          <th className="p-3.5 text-center">Canales</th>
                          <th className="p-3.5 text-center">Acciones de Estado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {filteredCards.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="p-8 text-center text-slate-400 text-xs italic">
                              No se encontraron dispositivos registrados que coincidan con la búsqueda.
                            </td>
                          </tr>
                        ) : (
                          filteredCards.map((card) => (
                            <tr key={card.card_id} className="hover:bg-slate-50">
                              <td className="p-3.5 font-mono font-bold text-amber-700 select-all">
                                /r/{card.card_id}
                              </td>
                              <td className="p-3.5 font-bold text-slate-900">
                                {card.label}
                              </td>
                              <td className="p-3.5">
                                <p className="font-semibold text-slate-900">{card.owner_name}</p>
                                <p className="text-[10px] text-slate-400 font-mono">{card.owner_email}</p>
                              </td>
                              <td className="p-3.5 text-center">
                                <select
                                  value={card.channels || 'both'}
                                  onChange={(e) => handleChangeChannels(card.card_id, e.target.value as any)}
                                  className="bg-white border border-slate-200 text-[11px] font-bold rounded-lg px-2 py-1 focus:outline-none"
                                >
                                  <option value="both">📻 NFC + QR</option>
                                  <option value="nfc">⚡ Solo NFC</option>
                                  <option value="qr">📷 Solo QR</option>
                                </select>
                              </td>
                              <td className="p-3.5 text-center">
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
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* ---------------- MODULE 2: PEDIDOS & CONTROL DE ÓRDENES ---------------- */}
            {activeTab === 'orders' && (
              <div className="space-y-6">

                {/* Filter & Search Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <Package className="w-5 h-5 text-blue-500" />
                      Gestión & Fulfillment de Pedidos
                    </h2>
                    <p className="text-xs text-slate-500">Administra el estado de preparación, grabación NFC y despacho en Panamá.</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-2">
                    <div className="relative w-full sm:w-64">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        placeholder="Buscar pedido PED-XXXX o cliente..."
                        className="w-full bg-white border border-slate-300 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900"
                      />
                    </div>

                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="w-full sm:w-auto bg-white border border-slate-300 text-xs rounded-xl px-3 py-2 text-slate-700 font-semibold"
                    >
                      <option value="all">Todos los Estados</option>
                      <option value="pending">Pendientes</option>
                      <option value="processing">En Grabación NFC</option>
                      <option value="shipped">Despachados (🇵🇦)</option>
                      <option value="delivered">Entregados</option>
                    </select>
                  </div>
                </div>

                {/* Orders List */}
                {filteredOrders.length === 0 ? (
                  <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center text-xs text-slate-400 font-bold uppercase tracking-widest shadow-sm">
                    No hay pedidos que coincidan con el filtro
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {filteredOrders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm"
                      >
                        {/* Order Header */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-slate-100">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono font-black text-sm text-slate-900">{order.id}</span>
                              <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border uppercase tracking-wider ${
                                order.status === 'pending' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                order.status === 'processing' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                order.status === 'shipped' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                                'bg-emerald-50 text-emerald-700 border-emerald-200'
                              }`}>
                                {order.status === 'pending' ? 'Pendiente' :
                                 order.status === 'processing' ? 'Grabando NFC' :
                                 order.status === 'shipped' ? 'Despachado' : 'Entregado'}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-400 block mt-0.5 font-mono">
                              {new Date(order.created_at).toLocaleString('es-PA')}
                            </span>
                          </div>

                          {/* Quick Status Changers */}
                          <div className="flex items-center space-x-1.5 flex-wrap gap-y-1">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Cambiar Estado:</span>
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'processing')}
                              className="px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold text-[10px] rounded-lg uppercase tracking-wider"
                            >
                              Grabar
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'shipped')}
                              className="px-2.5 py-1 bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold text-[10px] rounded-lg uppercase tracking-wider"
                            >
                              Enviar (🇵🇦)
                            </button>
                            <button
                              onClick={() => handleUpdateStatus(order.id, 'delivered')}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-[10px] rounded-lg uppercase tracking-wider"
                            >
                              Entregar
                            </button>
                          </div>
                        </div>

                        {/* Order Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
                          <div>
                            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-1">Comprador</h4>
                            <p className="font-bold text-slate-800">{order.customer_name}</p>
                            <p className="text-[10px] text-slate-400 font-mono">{order.customer_email}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5">{order.customer_phone}</p>
                          </div>

                          <div>
                            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-1">Dirección de Despacho</h4>
                            <p className="font-semibold text-slate-800">{order.shipping_province}, {order.shipping_district}</p>
                            <p className="text-[10px] text-slate-500 leading-relaxed">{order.shipping_address}</p>
                          </div>

                          <div>
                            <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-1">Detalles del Cobro</h4>
                            <p className="text-slate-600">
                              Pasarela: <span className="font-bold uppercase font-mono text-slate-900">{order.payment_method}</span>
                            </p>
                            <p className="text-base font-black text-slate-900 mt-1">${order.total.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* ---------------- MODULE 3: CATÁLOGO & EDICIÓN DE PRECIOS ---------------- */}
            {activeTab === 'products' && (
              <div className="space-y-6">

                {/* Header & Product Search */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2">
                  <div>
                    <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                      <Tag className="w-5 h-5 text-emerald-500" />
                      Catálogo de Productos & Edición de Precios
                    </h2>
                    <p className="text-xs text-slate-500">Modifica precios de productos en tiempo real para la tienda starTAP Panamá.</p>
                  </div>

                  <div className="relative w-full md:w-80">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={(e) => setProductSearch(e.target.value)}
                      placeholder="Buscar producto..."
                      className="w-full bg-white border border-slate-300 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900"
                    />
                  </div>
                </div>

                {/* Products Table */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Productos del Catálogo ({filteredProducts.length})
                    </h3>
                    <span className="text-[10px] text-slate-400">Actualización en Supabase</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                          <th className="p-3.5">Imagen</th>
                          <th className="p-3.5">Nombre del Producto</th>
                          <th className="p-3.5">Categoría / Tipo</th>
                          <th className="p-3.5">Material</th>
                          <th className="p-3.5 text-right">Precio ($ USD)</th>
                          <th className="p-3.5 text-center">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="p-3.5">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-10 h-10 object-cover rounded-xl border border-slate-200 bg-slate-50"
                              />
                            </td>
                            <td className="p-3.5">
                              <p className="font-bold text-slate-900">{p.name}</p>
                              <p className="text-[10px] font-mono text-slate-400">{p.id}</p>
                            </td>
                            <td className="p-3.5">
                              <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded font-semibold text-[10px] uppercase">
                                {p.category} • {p.type}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-500">
                              {p.material || 'Estándar'}
                            </td>
                            <td className="p-3.5 text-right font-mono">
                              <div className="inline-flex items-center gap-1 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1">
                                <span className="text-slate-400 font-bold">$</span>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={priceInputs[p.id] !== undefined ? priceInputs[p.id] : p.price.toFixed(2)}
                                  onChange={(e) => setPriceInputs({ ...priceInputs, [p.id]: e.target.value })}
                                  className="w-16 bg-transparent font-bold text-slate-900 text-right focus:outline-none"
                                />
                              </div>
                            </td>
                            <td className="p-3.5 text-center">
                              <button
                                onClick={() => handlePriceSave(p.id)}
                                className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg shadow-sm transition flex items-center justify-center gap-1 mx-auto"
                              >
                                {priceSuccess[p.id] ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>¡Guardado!</span>
                                  </>
                                ) : (
                                  <span>Guardar Precio</span>
                                )}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* ---------------- MODULE 4: ANALÍTICAS POR USUARIO ---------------- */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">

                <div className="pb-2">
                  <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                    <BarChart2 className="w-5 h-5 text-purple-500" />
                    Analíticas por Comercio / Usuario
                  </h2>
                  <p className="text-xs text-slate-500">Métricas consolidadas de escaneos NFC y QR agrupadas por correo de propietario.</p>
                </div>

                {/* User Metrics Table */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Rendimiento Consolidado por Comercio ({userMetricsList.length})
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                          <th className="p-3.5">Usuario / Comercio</th>
                          <th className="p-3.5 text-center">Dispositivos TAP</th>
                          <th className="p-3.5 text-center">Escaneos NFC</th>
                          <th className="p-3.5 text-center">Escaneos QR</th>
                          <th className="p-3.5 text-right">Escaneos Totales</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {userMetricsList.map((u) => (
                          <tr key={u.email} className="hover:bg-slate-50">
                            <td className="p-3.5">
                              <p className="font-bold text-slate-900">{u.name}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{u.email}</p>
                            </td>
                            <td className="p-3.5 text-center font-bold text-amber-700">
                              {u.cardCount}
                            </td>
                            <td className="p-3.5 text-center font-bold text-emerald-600">
                              {u.nfcCount}
                            </td>
                            <td className="p-3.5 text-center font-bold text-blue-600">
                              {u.qrCount}
                            </td>
                            <td className="p-3.5 text-right font-black text-slate-900 text-sm">
                              {u.scanCount}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* ---------------- MODULE 5: GENERADOR DE LOTES STT ---------------- */}
            {activeTab === 'stickers' && (
              <div className="bg-white border border-slate-200 rounded-3xl p-8 space-y-6 shadow-sm">
                <div className="border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <Layers className="w-5 h-5 text-rose-500" />
                    <span>Generador de Lotes STT-XXXX Habilitados</span>
                  </h2>
                  <p className="text-xs text-slate-500">Crea e inicializa nuevos códigos únicos habilitados automáticamente en la plataforma.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Cantidad a Generar</label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={stickerQuantity}
                      onChange={(e) => setStickerQuantity(parseInt(e.target.value, 10) || 1)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 focus:outline-none focus:border-slate-900 font-bold"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Tipo / Canales del Lote</label>
                    <select
                      value={batchChannels}
                      onChange={(e) => setBatchChannels(e.target.value as any)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2.5 text-xs text-slate-900 font-semibold focus:outline-none"
                    >
                      <option value="both">📻 NFC + QR (Ambas)</option>
                      <option value="nfc">⚡ Solo NFC</option>
                      <option value="qr">📷 Solo QR</option>
                    </select>
                  </div>

                  <div>
                    <button
                      onClick={handleGenerateStickers}
                      className="w-full py-2.5 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition shadow-sm"
                    >
                      Generar Lote STT
                    </button>
                  </div>
                </div>

                {generatedStickers.length > 0 && (
                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <div className="flex justify-between items-center">
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Lote Generado ({generatedStickers.length} etiquetas)
                      </h3>
                      <button
                        onClick={() => window.print()}
                        className="py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300 transition flex items-center gap-1.5"
                      >
                        <Printer className="w-4 h-4" />
                        <span>Imprimir Etiquetas</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {generatedStickers.map((code) => (
                        <div key={code} className="border-2 border-slate-900 rounded-2xl p-4 bg-white shadow-sm flex flex-col items-center justify-center space-y-2 text-center">
                          <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">starTAP Panamá</span>
                          <span className="font-mono text-xl font-black text-slate-950 tracking-wider">{code}</span>
                          <span className="text-[9px] font-mono text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 font-bold">
                            Habilitado ({batchChannels === 'both' ? 'NFC+QR' : batchChannels.toUpperCase()})
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

          </>
        )}

      </main>

      {/* ---------------- MOBILE APP STICKY BOTTOM NAVIGATION BAR ---------------- */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 z-40 flex items-center justify-around py-2 px-1 shadow-lg shadow-slate-900/10">
        <button
          onClick={() => setActiveTab('cards')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'cards' ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Smartphone className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Dispositivos</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'orders' ? 'text-blue-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Package className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Pedidos</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'products' ? 'text-emerald-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Tag className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Precios</span>
        </button>

        <button
          onClick={() => setActiveTab('analytics')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'analytics' ? 'text-purple-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <BarChart2 className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Analíticas</span>
        </button>

        <button
          onClick={() => setActiveTab('stickers')}
          className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition ${
            activeTab === 'stickers' ? 'text-rose-600 font-bold' : 'text-slate-400 hover:text-slate-600'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px] font-semibold">Lotes</span>
        </button>
      </nav>

    </div>
  );
}

