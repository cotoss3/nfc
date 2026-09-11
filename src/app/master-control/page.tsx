'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dbLocal, Order, NfcCard, Product, ScanRecord } from '@/lib/db';
import { 
  ShieldCheck, Package, RefreshCw, CheckCircle, Search, 
  Tag, BarChart2, Smartphone, Layers, Edit2, Trash2, DollarSign, 
  Filter, Radio, QrCode, User, Plus, Check, Printer, AlertCircle,
  LogOut, ChevronRight, X, Image as ImageIcon
} from 'lucide-react';

type AdminTab = 'cards' | 'orders' | 'products' | 'analytics' | 'stickers';

export default function AdminPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [cards, setCards] = useState<NfcCard[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>('cards');
  const [loading, setLoading] = useState(true);

  // Search & Filter States
  const [cardSearch, setCardSearch] = useState('');
  const [cardClaimFilter, setCardClaimFilter] = useState<'all' | 'claimed' | 'unclaimed'>('all');
  const [cardActiveFilter, setCardActiveFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [cardChannelFilter, setCardChannelFilter] = useState<'all' | 'both' | 'nfc' | 'qr'>('all');

  const [orderSearch, setOrderSearch] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('all');
  const [orderPaymentFilter, setOrderPaymentFilter] = useState<string>('all');

  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<string>('all');
  const [productTypeFilter, setProductTypeFilter] = useState<string>('all');

  const [analyticsSearch, setAnalyticsSearch] = useState('');
  const [analyticsSort, setAnalyticsSort] = useState<'scans' | 'cards'>('scans');

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

  // Quick Price Editor States
  const [priceInputs, setPriceInputs] = useState<{ [id: string]: string }>({});
  const [priceSuccess, setPriceSuccess] = useState<{ [id: string]: boolean }>({});

  // Full Product Edit Modal States
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editProductName, setEditProductName] = useState('');
  const [editProductPrice, setEditProductPrice] = useState('');
  const [editProductDescription, setEditProductDescription] = useState('');
  const [editProductMaterial, setEditProductMaterial] = useState('');
  const [editProductCategory, setEditProductCategory] = useState<'plates' | 'cards' | 'accessories'>('plates');
  const [editProductType, setEditProductType] = useState<'google' | 'tripadvisor' | 'instagram' | 'vcard' | 'airbnb' | 'custom'>('google');
  const [editProductImage, setEditProductImage] = useState('');
  const [fullEditSuccess, setFullEditSuccess] = useState(false);
  const [copiedCardId, setCopiedCardId] = useState<{ id: string; type: string } | null>(null);

  const copyToClipboard = (text: string, id: string, type: string) => {
    if (typeof window !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopiedCardId({ id, type });
      setTimeout(() => setCopiedCardId(null), 2000);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const dbOrders = dbLocal.getOrders();
    const initialCards = dbLocal.getCards();
    const dbProducts = dbLocal.getProducts();
    const dbScans = dbLocal.getStorageItem<ScanRecord[]>('nfc_scans', []);

    setOrders(dbOrders);
    setCards(initialCards);
    setProducts(dbProducts);
    setScans(dbScans);

    // Initial price input states
    const initPrices: { [id: string]: string } = {};
    dbProducts.forEach(p => {
      initPrices[p.id] = p.price.toFixed(2);
    });
    setPriceInputs(initPrices);

    try {
      const remoteCards = await dbLocal.getCardsAsync();
      setCards(remoteCards);
    } catch (err) {
      console.error('Error cargando tarjetas en Master Control:', err);
    } finally {
      setLoading(false);
    }
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

  const handleQuickPriceSave = (productId: string) => {
    const newPriceVal = parseFloat(priceInputs[productId]);
    if (isNaN(newPriceVal) || newPriceVal <= 0) return;

    dbLocal.updateProductPrice(productId, newPriceVal);
    setPriceSuccess({ ...priceSuccess, [productId]: true });
    loadData();
    setTimeout(() => {
      setPriceSuccess(prev => ({ ...prev, [productId]: false }));
    }, 2000);
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el producto "${productName}" (${productId})? Esta acción no se puede deshacer.`)) {
      const success = dbLocal.deleteProduct(productId);
      if (success) {
        loadData();
      } else {
        alert('No se pudo eliminar el producto.');
      }
    }
  };

  const handleOpenProductEditModal = (p: Product) => {
    setEditingProduct(p);
    setEditProductName(p.name);
    setEditProductPrice(p.price.toString());
    setEditProductDescription(p.description);
    setEditProductMaterial(p.material || '');
    setEditProductCategory(p.category);
    setEditProductType(p.type);
    setEditProductImage(p.image);
  };

  const handleSaveFullProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const priceNum = parseFloat(editProductPrice);
    if (isNaN(priceNum) || priceNum <= 0) return;

    dbLocal.updateFullProduct(editingProduct.id, {
      name: editProductName.trim(),
      price: priceNum,
      description: editProductDescription.trim(),
      material: editProductMaterial.trim(),
      category: editProductCategory,
      type: editProductType,
      image: editProductImage.trim()
    });

    setFullEditSuccess(true);
    loadData();
    setTimeout(() => {
      setFullEditSuccess(false);
      setEditingProduct(null);
    }, 1200);
  };

  // Filtered Cards
  const filteredCards = cards.filter(c => {
    const query = cardSearch.toLowerCase().trim();
    const matchesSearch = !query || 
                          c.card_id.toLowerCase().includes(query) ||
                          c.label.toLowerCase().includes(query) ||
                          c.owner_name.toLowerCase().includes(query) ||
                          c.owner_email.toLowerCase().includes(query);
    const matchesClaim = cardClaimFilter === 'all' ||
                         (cardClaimFilter === 'claimed' && c.claimed === true) ||
                         (cardClaimFilter === 'unclaimed' && !c.claimed);
    const matchesActive = cardActiveFilter === 'all' ||
                          (cardActiveFilter === 'active' && c.is_active === true) ||
                          (cardActiveFilter === 'inactive' && !c.is_active);
    const matchesChannel = cardChannelFilter === 'all' ||
                           (c.channels || 'both') === cardChannelFilter;
    return matchesSearch && matchesClaim && matchesActive && matchesChannel;
  });

  const totalCardsCount = cards.length;
  const claimedCardsCount = cards.filter(c => c.claimed).length;
  const unclaimedCardsCount = cards.filter(c => !c.claimed).length;
  const activeCardsCount = cards.filter(c => c.is_active).length;

  // Filtered Orders
  const filteredOrders = orders.filter(o => {
    const query = orderSearch.toLowerCase().trim();
    const matchesSearch = !query ||
                          o.id.toLowerCase().includes(query) ||
                          o.customer_name.toLowerCase().includes(query) ||
                          o.customer_email.toLowerCase().includes(query) ||
                          (o.shipping_province && o.shipping_province.toLowerCase().includes(query));
    const matchesStatus = orderStatusFilter === 'all' || o.status === orderStatusFilter;
    const matchesPayment = orderPaymentFilter === 'all' || (o.payment_method && o.payment_method.toLowerCase() === orderPaymentFilter.toLowerCase());
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // Filtered Products
  const filteredProducts = products.filter(p => {
    const query = productSearch.toLowerCase().trim();
    const matchesSearch = !query ||
                          p.name.toLowerCase().includes(query) ||
                          p.id.toLowerCase().includes(query) ||
                          p.description.toLowerCase().includes(query);
    const matchesCategory = productCategoryFilter === 'all' || p.category === productCategoryFilter;
    const matchesType = productTypeFilter === 'all' || p.type === productTypeFilter;
    return matchesSearch && matchesCategory && matchesType;
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

  const userMetricsList = Object.values(userMetricsMap)
    .filter(u => {
      const query = analyticsSearch.toLowerCase().trim();
      return !query || u.name.toLowerCase().includes(query) || u.email.toLowerCase().includes(query);
    })
    .sort((a, b) => {
      if (analyticsSort === 'cards') {
        return b.cardCount - a.cardCount;
      }
      return b.scanCount - a.scanCount;
    });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col md:flex-row pb-20 md:pb-0">
      
      {/* MOBILE TOP HEADER BAR */}
      <header className="md:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30 shadow-sm">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-slate-900 text-amber-500 font-black rounded-xl flex items-center justify-center text-xs shadow-sm">
            ADM
          </div>
          <div>
            <h2 className="text-xs font-black text-slate-900 leading-tight">starTAP Admin</h2>
            <p className="text-[9px] text-amber-600 font-bold uppercase tracking-wider">Panamá Master</p>
          </div>
        </div>
        <button
          onClick={loadData}
          className="p-2 text-slate-500 hover:text-slate-900 bg-slate-100 rounded-lg text-xs font-bold flex items-center gap-1"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </header>

      {/* DESKTOP LEFT SIDEBAR NAVIGATION */}
      <aside className="hidden md:flex w-64 bg-white border-r border-slate-200 flex-col shrink-0">
        {/* Sidebar Header Brand */}
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-slate-900 text-amber-500 font-black rounded-xl flex items-center justify-center text-sm shadow-md">
              ADM
            </div>
            <div>
              <h2 className="text-sm font-black text-slate-900 leading-tight">starTAP Admin</h2>
              <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Panamá Master</p>
            </div>
          </div>
          <button
            onClick={loadData}
            title="Refrescar Panel"
            className="p-2 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>

        {/* Admin Info Card */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/60">
          <div className="flex items-center gap-2 text-xs text-slate-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="truncate font-bold text-slate-900">Super Administrador</span>
          </div>
          <p className="text-[11px] text-slate-500 truncate mt-0.5 font-mono">admin@startap.com.pa</p>
        </div>

        {/* Sidebar Modules List */}
        <nav className="p-3 space-y-1 flex-1">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-3 py-2">
            Módulos del Sistema
          </div>

          <button
            onClick={() => setActiveTab('cards')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'cards'
                ? 'bg-slate-900 text-white shadow-md font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-amber-500" />
              <span>Dispositivos TAP</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'cards' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600'}`}>
              {cards.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'orders'
                ? 'bg-slate-900 text-white shadow-md font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Package className="w-4 h-4 text-blue-500" />
              <span>Pedidos & Órdenes</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'orders' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600'}`}>
              {orders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'products'
                ? 'bg-slate-900 text-white shadow-md font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Tag className="w-4 h-4 text-emerald-500" />
              <span>Catálogo & Precios</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'products' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600'}`}>
              {products.length}
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
              <BarChart2 className="w-4 h-4 text-purple-500" />
              <span>Analíticas Comercio</span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full ${activeTab === 'analytics' ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-100 text-slate-600'}`}>
              {userMetricsList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('stickers')}
            className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
              activeTab === 'stickers'
                ? 'bg-slate-900 text-white shadow-md font-bold'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Layers className="w-4 h-4 text-rose-500" />
              <span>Generador de Lotes</span>
            </div>
          </button>
        </nav>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-200 text-center">
          <p className="text-[10px] text-slate-400 font-mono">starTAP v2.4 Admin Engine</p>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 space-y-6">

        {loading ? (
          <div className="bg-white rounded-3xl p-16 text-center text-xs text-slate-400 font-bold uppercase tracking-widest border border-slate-200 shadow-sm">
            Cargando Base de Datos Administrador...
          </div>
        ) : (
          <>
            {/* ---------------- MODULE 1: DISPOSITIVOS TAP ---------------- */}
            {activeTab === 'cards' && (
              <div className="space-y-6">
                
                {/* Summary Metric Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">Total Registrados</span>
                    <p className="text-2xl font-black text-slate-900 mt-1">{totalCardsCount}</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest block">🟢 Reclamados (En Uso)</span>
                    <p className="text-2xl font-black text-emerald-600 mt-1">{claimedCardsCount}</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest block">⚪ Sin Reclamar (Disponibles)</span>
                    <p className="text-2xl font-black text-amber-600 mt-1">{unclaimedCardsCount}</p>
                  </div>
                  <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest block">⚡ Activos (Habilitados)</span>
                    <p className="text-2xl font-black text-blue-600 mt-1">{activeCardsCount}</p>
                  </div>
                </div>

                {/* Multi-Criteria Filters Bar */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                      <Filter className="w-4 h-4 text-amber-500" />
                      <span>Filtros Multicriterio de Dispositivos TAP</span>
                    </div>
                    {(cardSearch || cardClaimFilter !== 'all' || cardActiveFilter !== 'all' || cardChannelFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setCardSearch('');
                          setCardClaimFilter('all');
                          setCardActiveFilter('all');
                          setCardChannelFilter('all');
                        }}
                        className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Limpiar Filtros
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={cardSearch}
                        onChange={(e) => setCardSearch(e.target.value)}
                        placeholder="Buscar ID, usuario, correo..."
                        className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
                      />
                    </div>

                    <select
                      value={cardClaimFilter}
                      onChange={(e) => setCardClaimFilter(e.target.value as any)}
                      className="bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none"
                    >
                      <option value="all">Vinculación: Todos ({totalCardsCount})</option>
                      <option value="claimed">🟢 Reclamados ({claimedCardsCount})</option>
                      <option value="unclaimed">⚪ Sin Reclamar ({unclaimedCardsCount})</option>
                    </select>

                    <select
                      value={cardActiveFilter}
                      onChange={(e) => setCardActiveFilter(e.target.value as any)}
                      className="bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none"
                    >
                      <option value="all">Estado: Todos ({totalCardsCount})</option>
                      <option value="active">🟢 Solo Activos ({activeCardsCount})</option>
                      <option value="inactive">🔴 Solo Inactivos ({totalCardsCount - activeCardsCount})</option>
                    </select>

                    <select
                      value={cardChannelFilter}
                      onChange={(e) => setCardChannelFilter(e.target.value as any)}
                      className="bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none"
                    >
                      <option value="all">Canales: Todos</option>
                      <option value="both">📻 NFC + QR</option>
                      <option value="nfc">⚡ Solo NFC</option>
                      <option value="qr">📷 Solo QR</option>
                    </select>
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
                          <th className="p-3.5">Estado Reclamado & Redirección</th>
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
                          filteredCards.map((card) => {
                            const isConfiguredNfc = card.nfc_target_url || card.target_url;
                            const isConfiguredQr = card.qr_target_url;

                            return (
                              <tr key={card.card_id} className="hover:bg-slate-50">
                                <td className="p-3.5 space-y-1.5">
                                  <div className="font-mono font-bold text-amber-700 text-xs">
                                    /r/{card.card_id}
                                  </div>
                                  <div className="flex flex-col gap-1 text-[10px]">
                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(`${window.location.origin}/r/${card.card_id}?m=nfc`, card.card_id, 'nfc')}
                                      className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold rounded flex items-center gap-1 transition shadow-xs"
                                      title="Copiar URL completa para grabar en el chip NFC"
                                    >
                                      <Radio className="w-3 h-3 text-emerald-600" />
                                      <span>{copiedCardId?.id === card.card_id && copiedCardId?.type === 'nfc' ? '¡NFC Copiado!' : 'Copiar URL NFC'}</span>
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => copyToClipboard(`${window.location.origin}/r/${card.card_id}?m=qr`, card.card_id, 'qr')}
                                      className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-300 font-bold rounded flex items-center gap-1 transition shadow-xs"
                                      title="Copiar URL completa para imprimir en Código QR"
                                    >
                                      <QrCode className="w-3 h-3 text-blue-600" />
                                      <span>{copiedCardId?.id === card.card_id && copiedCardId?.type === 'qr' ? '¡QR Copiado!' : 'Copiar URL QR'}</span>
                                    </button>
                                  </div>
                                </td>
                                <td className="p-3.5 font-bold text-slate-900">
                                  {card.label}
                                </td>
                                <td className="p-3.5">
                                  {card.claimed ? (
                                    <div className="space-y-1">
                                      <div className="flex items-center gap-1.5">
                                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-[10px] rounded-full uppercase">
                                          🟢 RECLAMADO POR COMERCIO
                                        </span>
                                      </div>
                                      <p className="font-semibold text-slate-900">{card.owner_name}</p>
                                      <p className="text-[10px] text-slate-400 font-mono">{card.owner_email}</p>
                                      <div className="text-[10px] text-slate-500 pt-0.5">
                                        <span>NFC: <strong className="font-mono text-slate-700">{isConfiguredNfc ? 'Configurada' : 'Sin URL'}</strong></span> • 
                                        <span> QR: <strong className="font-mono text-slate-700">{isConfiguredQr ? 'Configurada' : 'Sin URL'}</strong></span>
                                      </div>
                                    </div>
                                  ) : (
                                    <div>
                                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 border border-slate-300 font-bold text-[10px] rounded-full uppercase">
                                        ⚪ SIN RECLAMAR (DISPONIBLE)
                                      </span>
                                      <p className="text-[10px] text-slate-400 mt-1">Listo para ser vinculado por un comercio.</p>
                                    </div>
                                  )}
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
                            );
                          })
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

                {/* Filter & Search Bar */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-500" />
                        Gestión & Fulfillment de Pedidos
                      </h2>
                      <p className="text-xs text-slate-500">Administra el estado de preparación, grabación NFC y despacho en Panamá.</p>
                    </div>
                    {(orderSearch || orderStatusFilter !== 'all' || orderPaymentFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setOrderSearch('');
                          setOrderStatusFilter('all');
                          setOrderPaymentFilter('all');
                        }}
                        className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Limpiar Filtros
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={orderSearch}
                        onChange={(e) => setOrderSearch(e.target.value)}
                        placeholder="Buscar ID, cliente, provincia..."
                        className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
                      />
                    </div>

                    <select
                      value={orderStatusFilter}
                      onChange={(e) => setOrderStatusFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none"
                    >
                      <option value="all">Estado: Todos</option>
                      <option value="pending">Pendientes</option>
                      <option value="processing">En Grabación NFC</option>
                      <option value="shipped">Despachados (🇵🇦)</option>
                      <option value="delivered">Entregados</option>
                    </select>

                    <select
                      value={orderPaymentFilter}
                      onChange={(e) => setOrderPaymentFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none"
                    >
                      <option value="all">Medio de Pago: Todos</option>
                      <option value="yappy">Yappy Panamá</option>
                      <option value="card">Tarjeta de Crédito / Débito</option>
                      <option value="transfer">Transferencia Bancaria</option>
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

            {/* ---------------- MODULE 3: CATÁLOGO & EDICIÓN DE PRECIOS Y PRODUCTOS ---------------- */}
            {activeTab === 'products' && (
              <div className="space-y-6">

                {/* Filter & Search Bar */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Tag className="w-5 h-5 text-emerald-500" />
                        Catálogo de Productos & Edición Completa
                      </h2>
                      <p className="text-xs text-slate-500">Edita precios, nombres, descripciones, materiales y tipos en tiempo real.</p>
                    </div>
                    {(productSearch || productCategoryFilter !== 'all' || productTypeFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setProductSearch('');
                          setProductCategoryFilter('all');
                          setProductTypeFilter('all');
                        }}
                        className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Limpiar Filtros
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        placeholder="Buscar por nombre, ID o palabra clave..."
                        className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
                      />
                    </div>

                    <select
                      value={productCategoryFilter}
                      onChange={(e) => setProductCategoryFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none"
                    >
                      <option value="all">Categoría: Todas</option>
                      <option value="plates">Placas TAP (plates)</option>
                      <option value="cards">Tarjetas Inteligentes (cards)</option>
                      <option value="accessories">Accesorios & Stand (accessories)</option>
                    </select>

                    <select
                      value={productTypeFilter}
                      onChange={(e) => setProductTypeFilter(e.target.value)}
                      className="bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none"
                    >
                      <option value="all">Tipo de Redirección: Todos</option>
                      <option value="google">Google Reviews ⭐</option>
                      <option value="tripadvisor">TripAdvisor 🦉</option>
                      <option value="instagram">Instagram 📸</option>
                      <option value="vcard">vCard / Contacto 👤</option>
                      <option value="airbnb">Airbnb 🏠</option>
                      <option value="custom">Personalizado / Link 🔗</option>
                    </select>
                  </div>
                </div>

                {/* Products Table Card */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                        Productos del Catálogo ({filteredProducts.length})
                      </h3>
                      <p className="text-[10px] text-slate-400">Sincronización en tiempo real con Supabase Storage (S3)</p>
                    </div>

                    <button
                      onClick={() => router.push('/master-control/products/new')}
                      className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0"
                    >
                      <Plus className="w-4 h-4 text-amber-400" />
                      <span>+ Nuevo Producto</span>
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                          <th className="p-3.5">Imagen & Galería</th>
                          <th className="p-3.5">Nombre & Descripción</th>
                          <th className="p-3.5">Categoría / Tipo</th>
                          <th className="p-3.5">Material</th>
                          <th className="p-3.5 text-right">Precio ($ USD)</th>
                          <th className="p-3.5 text-center">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {filteredProducts.map((p) => (
                          <tr key={p.id} className="hover:bg-slate-50">
                            <td className="p-3.5">
                              <div className="relative inline-block">
                                <img
                                  src={p.image}
                                  alt={p.name}
                                  className="w-12 h-12 object-cover rounded-xl border border-slate-200 bg-slate-50"
                                />
                                {(p.images && p.images.length > 1) && (
                                  <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full shadow border border-white">
                                    {p.images.length}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-3.5 max-w-xs">
                              <p className="font-bold text-slate-900">{p.name}</p>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5">{p.description}</p>
                              <p className="text-[9px] font-mono text-amber-700 font-bold mt-0.5">{p.id}</p>
                            </td>
                            <td className="p-3.5">
                              <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg font-bold text-[10px] uppercase border border-slate-200">
                                {p.category} • {p.type}
                              </span>
                            </td>
                            <td className="p-3.5 text-slate-600 font-semibold">
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
                              <div className="flex items-center justify-center gap-1.5">
                                <button
                                  onClick={() => handleQuickPriceSave(p.id)}
                                  title="Guardar precio rápido"
                                  className="py-1.5 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[10px] uppercase tracking-wider rounded-lg border border-slate-300 transition"
                                >
                                  {priceSuccess[p.id] ? '¡Precio OK!' : 'Precio'}
                                </button>
                                <button
                                  onClick={() => router.push(`/master-control/products/edit/${p.id}`)}
                                  className="py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-[10px] uppercase tracking-wider rounded-lg shadow-sm transition flex items-center gap-1"
                                >
                                  <Edit2 className="w-3 h-3 text-amber-400" />
                                  <span>Editar</span>
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(p.id, p.name)}
                                  title="Eliminar producto"
                                  className="py-1.5 px-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[10px] uppercase tracking-wider rounded-lg border border-rose-200 transition flex items-center gap-1"
                                >
                                  <Trash2 className="w-3 h-3 text-rose-600" />
                                  <span>Eliminar</span>
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
            )}

            {/* ---------------- MODULE 4: ANALÍTICAS POR USUARIO ---------------- */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">

                {/* Filter & Search Bar */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <BarChart2 className="w-5 h-5 text-purple-500" />
                        Analíticas por Comercio / Usuario
                      </h2>
                      <p className="text-xs text-slate-500">Métricas consolidadas de escaneos NFC y QR agrupadas por correo de propietario.</p>
                    </div>
                    {analyticsSearch && (
                      <button
                        onClick={() => setAnalyticsSearch('')}
                        className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Limpiar Buscador
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={analyticsSearch}
                        onChange={(e) => setAnalyticsSearch(e.target.value)}
                        placeholder="Buscar por usuario o correo de comercio..."
                        className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
                      />
                    </div>

                    <select
                      value={analyticsSort}
                      onChange={(e) => setAnalyticsSort(e.target.value as any)}
                      className="bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none"
                    >
                      <option value="scans">Ordenar por: Mayor N° de Escaneos Totales 📈</option>
                      <option value="cards">Ordenar por: Mayor N° de Dispositivos TAP 📱</option>
                    </select>
                  </div>
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


