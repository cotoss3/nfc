'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { dbLocal, Order, NfcCard, Product, AbandonedCheckout, supabase } from '@/lib/db';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  ShoppingBag,
  ShoppingCart,
  Users,
  AlertTriangle,
  QrCode,
  CreditCard,
  Layers,
  MapPin,
  TrendingUp,
  Package,
  Plus,
  RefreshCw,
  Copy,
  Check,
  Filter,
  ExternalLink,
  Activity,
  PieChart,
  BarChart3,
  Search,
  CheckCircle2,
  Clock,
  Radio,
  Tag,
  Boxes,
  Truck,
  FileText,
  Minus,
  Sliders,
  History,
  ShieldCheck,
  Warehouse
} from 'lucide-react';

export interface InventoryBatch {
  id: string; // e.g. LOTE-2026-09A
  product_id: string;
  product_name: string;
  quantity_initial: number;
  quantity_remaining: number;
  unit_cost: number;
  supplier: string;
  received_at: string;
  notes?: string;
  status: 'active' | 'depleted' | 'in_transit';
}

export interface StockMovement {
  id: string;
  created_at: string;
  type: 'entrada_lote' | 'salida_venta' | 'ajuste_manual' | 'merma';
  product_name: string;
  quantity_change: number;
  resulting_stock: number;
  reference: string;
}

export interface ProductStockInfo {
  product_id: string;
  sku: string;
  name: string;
  category: string;
  current_stock: number;
  min_alert_stock: number;
  unit_cost: number;
  selling_price: number;
}

type MainTab = 'inventario_lotes' | 'tags_hardware' | 'resumen_analiticas';

export default function InventarioPage() {
  const [activeTab, setActiveTab] = useState<MainTab>('inventario_lotes');

  const [orders, setOrders] = useState<Order[]>([]);
  const [cards, setCards] = useState<NfcCard[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [abandoned, setAbandoned] = useState<AbandonedCheckout[]>([]);
  const [loading, setLoading] = useState(true);

  // Inventory & Batch Custom Storage
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [productStocks, setProductStocks] = useState<{ [productId: string]: ProductStockInfo }>({});

  // Search & Filters for Product Stock Table
  const [productSearch, setProductSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'normal' | 'low' | 'out'>('all');

  // New Batch Form State
  const [batchCodeInput, setBatchCodeInput] = useState('');
  const [batchProductSelect, setBatchProductSelect] = useState('');
  const [batchQtyInput, setBatchQtyInput] = useState('');
  const [batchCostInput, setBatchCostInput] = useState('');
  const [batchSupplierInput, setBatchSupplierInput] = useState('Shenzhen NTAG Tech Ltd');
  const [batchNotesInput, setBatchNotesInput] = useState('');
  const [batchSuccessMsg, setBatchSuccessMsg] = useState('');

  // Quick Stock Edit Modal / Inline State
  const [editingStockId, setEditingStockId] = useState<string | null>(null);
  const [newStockValInput, setNewStockValInput] = useState('');

  // Period Filter State for Resumen Analíticas
  const [period, setPeriod] = useState<'hoy' | 'ayer' | 'semana' | 'mes' | 'custom'>('mes');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // TAG Hardware Inventory State
  const [tagSearch, setTagSearch] = useState('');
  const [tagChannelFilter, setTagChannelFilter] = useState<'all' | 'both' | 'nfc' | 'qr'>('all');
  const [tagClaimFilter, setTagClaimFilter] = useState<'all' | 'claimed' | 'unclaimed'>('all');
  const [tagCode, setTagCode] = useState('');
  const [tagLabel, setTagLabel] = useState('');
  const [tagUrl, setTagUrl] = useState('');
  const [tagType, setTagType] = useState('google');
  const [tagChannels, setTagChannels] = useState<'both' | 'nfc' | 'qr'>('both');
  const [tagOwnerEmail, setTagOwnerEmail] = useState('');
  const [tagOwnerName, setTagOwnerName] = useState('');
  const [tagSuccessMsg, setTagSuccessMsg] = useState('');

  const [copiedId, setCopiedId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    let dbOrders = dbLocal.getOrders();
    let dbCards = dbLocal.getCards();
    let dbProducts = dbLocal.getProducts();
    let dbAbandoned = dbLocal.getAbandonedCheckouts();

    if (supabase) {
      try {
        const [resOrders, resCards, resProducts, resAbandoned] = await Promise.all([
          supabase.from('orders').select('*').order('created_at', { ascending: false }),
          supabase.from('nfc_cards').select('*').order('created_at', { ascending: false }),
          supabase.from('products').select('*'),
          supabase.from('abandoned_checkouts').select('*').order('created_at', { ascending: false }),
        ]);

        if (!resOrders.error && resOrders.data && resOrders.data.length > 0) dbOrders = resOrders.data as Order[];
        if (!resCards.error && resCards.data && resCards.data.length > 0) dbCards = resCards.data as NfcCard[];
        if (!resProducts.error && resProducts.data && resProducts.data.length > 0) dbProducts = resProducts.data as Product[];
        if (!resAbandoned.error && resAbandoned.data && resAbandoned.data.length > 0) dbAbandoned = resAbandoned.data as AbandonedCheckout[];
      } catch (err) {
        console.error('Error sincronizando con Supabase:', err);
      }
    }

    setOrders(dbOrders);
    setCards(dbCards);
    setProducts(dbProducts);
    setAbandoned(dbAbandoned);

    // Initial Product Stocks setup & persistence (únicamente los 4 productos oficiales del catálogo)
    const savedStocks = dbLocal.getStorageItem<{ [id: string]: ProductStockInfo }>('inventory_product_stocks', {});
    const cleanStocks: { [id: string]: ProductStockInfo } = {};

    dbProducts.forEach((p, idx) => {
      const existing = savedStocks[p.id];
      const pid = p.id.toLowerCase();

      let defaultQty = 10;
      if (pid === 'placa-nfc-mostrador') defaultQty = 50;
      else if (pid === 'tarjeta-nfc-bolsillo') defaultQty = 20;
      else if (pid === 'stand-nfc-mesa') defaultQty = 0;
      else if (pid === 'pack-trio-comercial') defaultQty = 10;

      cleanStocks[p.id] = {
        product_id: p.id,
        sku: (p as any).sku || `STP-${(100 + idx + 1).toString().padStart(4, '0')}`,
        name: p.name,
        category: p.category || 'plates',
        current_stock: existing ? existing.current_stock : defaultQty,
        min_alert_stock: 10,
        unit_cost: existing ? existing.unit_cost : Math.round(p.price * 0.28 * 100) / 100,
        selling_price: p.price,
      };
    });

    // Asegurar conteo físico exacto inicial
    if (cleanStocks['placa-nfc-mostrador'] && savedStocks['placa-nfc-mostrador'] === undefined) {
      cleanStocks['placa-nfc-mostrador'].current_stock = 50;
    }
    if (cleanStocks['tarjeta-nfc-bolsillo'] && savedStocks['tarjeta-nfc-bolsillo'] === undefined) {
      cleanStocks['tarjeta-nfc-bolsillo'].current_stock = 20;
    }
    if (cleanStocks['stand-nfc-mesa'] && savedStocks['stand-nfc-mesa'] === undefined) {
      cleanStocks['stand-nfc-mesa'].current_stock = 0;
    }
    if (cleanStocks['pack-trio-comercial']) {
      const pStock = cleanStocks['placa-nfc-mostrador'] ? cleanStocks['placa-nfc-mostrador'].current_stock : 50;
      const tStock = cleanStocks['tarjeta-nfc-bolsillo'] ? cleanStocks['tarjeta-nfc-bolsillo'].current_stock : 20;
      cleanStocks['pack-trio-comercial'].current_stock = Math.min(pStock, Math.floor(tStock / 2));
    }

    setProductStocks(cleanStocks);
    dbLocal.setStorageItem('inventory_product_stocks', cleanStocks);

    // Initial Batches setup
    const savedBatches = dbLocal.getStorageItem<InventoryBatch[]>('inventory_batches', []);
    if (savedBatches.length === 0) {
      const defaultBatches: InventoryBatch[] = [
        {
          id: 'LOTE-2026-09A',
          product_id: dbProducts[0]?.id || 'placa-nfc-mostrador',
          product_name: dbProducts[0]?.name || 'Placa NFC para Reseñas de Google',
          quantity_initial: 50,
          quantity_remaining: 50,
          unit_cost: 6.50,
          supplier: 'Shenzhen Micro-NFC Tech',
          received_at: new Date(Date.now() - 86400000 * 12).toISOString(),
          status: 'active',
          notes: 'Acrílico 3mm + Impresión UV + Chip NTAG216',
        },
        {
          id: 'LOTE-2026-08B',
          product_id: dbProducts[1]?.id || 'tarjeta-nfc-bolsillo',
          product_name: dbProducts[1]?.name || 'Tarjeta NFC de Bolsillo',
          quantity_initial: 20,
          quantity_remaining: 20,
          unit_cost: 4.20,
          supplier: 'SmartCard Global Panama',
          received_at: new Date(Date.now() - 86400000 * 25).toISOString(),
          status: 'active',
          notes: 'PVC Mate 0.76mm contactless',
        }
      ];
      setBatches(defaultBatches);
      dbLocal.setStorageItem('inventory_batches', defaultBatches);
    } else {
      setBatches(savedBatches);
    }

    // Initial Movements Kardex setup
    const savedMovements = dbLocal.getStorageItem<StockMovement[]>('inventory_kardex', []);
    if (savedMovements.length === 0) {
      const defaultMovements: StockMovement[] = [
        {
          id: 'MOV-101',
          created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
          type: 'salida_venta',
          product_name: dbProducts[0]?.name || 'Placa NFC para Reseñas de Google',
          quantity_change: -2,
          resulting_stock: (cleanStocks[dbProducts[0]?.id]?.current_stock || 48),
          reference: 'Orden #1024',
        },
        {
          id: 'MOV-100',
          created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
          type: 'entrada_lote',
          product_name: dbProducts[1]?.name || 'Tarjeta NFC de Bolsillo',
          quantity_change: 20,
          resulting_stock: (cleanStocks[dbProducts[1]?.id]?.current_stock || 20),
          reference: 'LOTE-2026-08B',
        },
      ];
      setStockMovements(defaultMovements);
      dbLocal.setStorageItem('inventory_kardex', defaultMovements);
    } else {
      setStockMovements(savedMovements);
    }

    setBatchProductSelect(dbProducts[0]?.id || '');
    setBatchCodeInput(`LOTE-2026-${(batches.length + 10).toString()}`);
    setTagCode(dbLocal.getNextStickerCode());
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute Total Inventory Financial Valuation
  const inventoryMetrics = useMemo(() => {
    const stockList = Object.values(productStocks);
    const totalPhysicalUnits = stockList.reduce((sum, item) => sum + item.current_stock, 0);
    const totalValuationCost = stockList.reduce((sum, item) => sum + (item.current_stock * item.unit_cost), 0);
    const totalRetailValuation = stockList.reduce((sum, item) => sum + (item.current_stock * item.selling_price), 0);
    const lowStockCount = stockList.filter(item => item.current_stock <= item.min_alert_stock && item.current_stock > 0).length;
    const outOfStockCount = stockList.filter(item => item.current_stock === 0).length;
    const activeBatchesCount = batches.filter(b => b.status === 'active').length;

    return {
      totalPhysicalUnits,
      totalValuationCost,
      totalRetailValuation,
      lowStockCount,
      outOfStockCount,
      activeBatchesCount,
    };
  }, [productStocks, batches]);

  // Filtered Product Stock List
  const filteredProductStocks = useMemo(() => {
    return Object.values(productStocks).filter(p => {
      const matchSearch =
        !productSearch ||
        p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
        p.sku.toLowerCase().includes(productSearch.toLowerCase());

      const matchCategory =
        categoryFilter === 'all' || p.category === categoryFilter;

      const matchStatus =
        stockStatusFilter === 'all' ||
        (stockStatusFilter === 'normal' && p.current_stock > p.min_alert_stock) ||
        (stockStatusFilter === 'low' && p.current_stock <= p.min_alert_stock && p.current_stock > 0) ||
        (stockStatusFilter === 'out' && p.current_stock === 0);

      return matchSearch && matchCategory && matchStatus;
    });
  }, [productStocks, productSearch, categoryFilter, stockStatusFilter]);

  // Handle Manual Stock Adjustment (+ / -)
  const handleAdjustStock = (productId: string, delta: number) => {
    const target = productStocks[productId];
    if (!target) return;

    const newStock = Math.max(0, target.current_stock + delta);
    const updatedStocks = {
      ...productStocks,
      [productId]: {
        ...target,
        current_stock: newStock,
      },
    };

    setProductStocks(updatedStocks);
    dbLocal.setStorageItem('inventory_product_stocks', updatedStocks);

    // Record movement in Kardex
    const newMovement: StockMovement = {
      id: `MOV-${Date.now().toString().slice(-4)}`,
      created_at: new Date().toISOString(),
      type: 'ajuste_manual',
      product_name: target.name,
      quantity_change: delta,
      resulting_stock: newStock,
      reference: `Ajuste manual (${delta > 0 ? '+' : ''}${delta})`,
    };

    const updatedMovements = [newMovement, ...stockMovements];
    setStockMovements(updatedMovements);
    dbLocal.setStorageItem('inventory_kardex', updatedMovements);
  };

  // Handle Create New Production Batch
  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!batchCodeInput.trim()) return alert('Por favor ingresa un código de lote');
    if (!batchProductSelect) return alert('Selecciona un producto para el lote');

    const qty = parseInt(batchQtyInput) || 0;
    const cost = parseFloat(batchCostInput) || 0;

    if (qty <= 0) return alert('La cantidad del lote debe ser mayor a 0');

    const selectedProd = products.find(p => p.id === batchProductSelect);
    const prodName = selectedProd ? selectedProd.name : 'Producto General';

    const newBatch: InventoryBatch = {
      id: batchCodeInput.trim().toUpperCase(),
      product_id: batchProductSelect,
      product_name: prodName,
      quantity_initial: qty,
      quantity_remaining: qty,
      unit_cost: cost,
      supplier: batchSupplierInput.trim() || 'Proveedor Internacional',
      received_at: new Date().toISOString(),
      status: 'active',
      notes: batchNotesInput.trim(),
    };

    const updatedBatches = [newBatch, ...batches];
    setBatches(updatedBatches);
    dbLocal.setStorageItem('inventory_batches', updatedBatches);

    // Auto-update stock for this product
    if (productStocks[batchProductSelect]) {
      const current = productStocks[batchProductSelect];
      const newStockVal = current.current_stock + qty;
      const updatedStocks = {
        ...productStocks,
        [batchProductSelect]: {
          ...current,
          current_stock: newStockVal,
        },
      };
      setProductStocks(updatedStocks);
      dbLocal.setStorageItem('inventory_product_stocks', updatedStocks);

      // Record Kardex movement
      const newMovement: StockMovement = {
        id: `MOV-${Date.now().toString().slice(-4)}`,
        created_at: new Date().toISOString(),
        type: 'entrada_lote',
        product_name: prodName,
        quantity_change: qty,
        resulting_stock: newStockVal,
        reference: newBatch.id,
      };
      const updatedMovements = [newMovement, ...stockMovements];
      setStockMovements(updatedMovements);
      dbLocal.setStorageItem('inventory_kardex', updatedMovements);
    }

    setBatchSuccessMsg(`¡Lote ${newBatch.id} de ${qty} unidades registrado con éxito!`);
    setBatchQtyInput('');
    setBatchCostInput('');
    setBatchNotesInput('');
    setBatchCodeInput(`LOTE-2026-${(updatedBatches.length + 10).toString()}`);
    setTimeout(() => setBatchSuccessMsg(''), 4000);
  };

  // Filter orders by selected date period for Resumen Analíticas
  const filteredOrders = useMemo(() => {
    const now = new Date();
    return orders.filter(o => {
      const date = new Date(o.created_at);

      if (period === 'hoy') return date.toDateString() === now.toDateString();
      if (period === 'ayer') {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        return date.toDateString() === yesterday.toDateString();
      }
      if (period === 'semana') {
        const weekAgo = new Date(now);
        weekAgo.setDate(now.getDate() - 7);
        return date >= weekAgo;
      }
      if (period === 'mes') {
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
      }
      if (period === 'custom' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        return date >= start && date <= end;
      }
      return true;
    });
  }, [orders, period, startDate, endDate]);

  const totalRevenue = useMemo(() => {
    return filteredOrders
      .filter(o => o.payment_status === 'completed')
      .reduce((sum, o) => sum + (o.total || 0), 0);
  }, [filteredOrders]);

  const totalProductsSold = useMemo(() => {
    return filteredOrders.reduce((sum, o) => {
      const orderItems = o.items || [];
      return sum + orderItems.reduce((iSum, item) => iSum + (item.quantity || 1), 0);
    }, 0);
  }, [filteredOrders]);

  const totalOrdersCount = filteredOrders.length;
  const avgOrderTicket = totalOrdersCount > 0 ? totalRevenue / totalOrdersCount : 0;

  // TAG creation handler
  const handleCreateTag = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagCode.trim()) return alert('Ingresa el código serial (ej. STT-1050)');

    const cleanEmail = tagOwnerEmail.trim().toLowerCase() || 'admin@startap.com.pa';
    const cleanName = tagOwnerName.trim() || 'Cliente starTAP';

    const newCardObj: NfcCard = {
      card_id: tagCode.trim().toUpperCase(),
      activation_code: tagCode.trim().toUpperCase(),
      owner_id: 'user-session',
      owner_name: cleanName,
      owner_email: cleanEmail,
      label: tagLabel.trim() || `Dispositivo TAP (${tagCode.trim().toUpperCase()})`,
      target_url: tagUrl.trim() || 'https://search.google.com/local/writereview?placeid=...',
      nfc_target_url: tagUrl.trim() || 'https://search.google.com/local/writereview?placeid=...',
      is_active: true,
      claimed: true,
      type: tagType,
      channels: tagChannels,
      created_at: new Date().toISOString(),
    };

    const updated = [newCardObj, ...cards];
    setCards(updated);
    dbLocal.setStorageItem('nfc_cards', updated);

    if (supabase) {
      supabase.from('nfc_cards').upsert([newCardObj]).then(({ error }) => {
        if (error) console.error('Error insertando tarjeta en Supabase:', error);
      });
    }

    setTagSuccessMsg(`¡TAG "${newCardObj.card_id}" creado exitosamente!`);
    setTagLabel('');
    setTagUrl('');
    setTagOwnerEmail('');
    setTagOwnerName('');
    setTagCode(dbLocal.getNextStickerCode());
    setTimeout(() => setTagSuccessMsg(''), 4000);
  };

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
        <p className="font-semibold text-sm">Cargando sistema de inventario por lotes y stock físico...</p>
      </div>
    );
  }

  // Pedidos que quedaron con tags pendientes (se reutilizan los 'orders' ya cargados)
  const pedidosConTagsPendientes = useMemo(
    () => orders.filter((o) => Number(o.tags_pendientes || 0) > 0),
    [orders]
  );

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">

      {/* AVISO: pedidos que esperan tags porque no alcanzo el stock fisico */}
      {pedidosConTagsPendientes.length > 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 shadow-2xs">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h2 className="text-sm font-black text-amber-900">
              {pedidosConTagsPendientes.length} {pedidosConTagsPendientes.length === 1 ? 'pedido espera tags' : 'pedidos esperan tags'}
            </h2>
          </div>
          <p className="text-xs text-amber-800 mt-1">
            Estos pedidos se cobraron pero no habia tags libres en stock. Asignalos cuando entre el lote nuevo.
          </p>
          <ul className="mt-2 space-y-1">
            {pedidosConTagsPendientes.map((p) => (
              <li key={p.id} className="text-xs font-bold text-amber-900">
                Pedido {p.id} — faltan {p.tags_pendientes} tag{(p.tags_pendientes || 0) === 1 ? '' : 's'}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* TOP BAR & SUB-MODULE TABS */}
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
                <Boxes className="w-6 h-6 text-amber-500" />
                Gestión de Inventario & Control por Lotes
              </h1>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {inventoryMetrics.totalPhysicalUnits} Uds. Físicas
              </span>
            </div>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Control detallado de existencias en depósito, registro de lotes de importación y auditoría Kardex
            </p>
          </div>
        </div>

        {/* MAIN NAVIGATION TABS */}
        <div className="flex items-center gap-1.5 bg-slate-200/70 p-1.5 rounded-2xl border border-slate-300/80 shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('inventario_lotes')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'inventario_lotes'
                ? 'bg-slate-950 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            <Boxes className="w-4 h-4 text-amber-400" />
            <span>Inventario & Lotes</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('tags_hardware')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'tags_hardware'
                ? 'bg-slate-950 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            <QrCode className="w-4 h-4 text-amber-400" />
            <span>Fichas TAGs ({cards.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('resumen_analiticas')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition ${
              activeTab === 'resumen_analiticas'
                ? 'bg-slate-950 text-white shadow-md'
                : 'text-slate-700 hover:text-slate-950 hover:bg-slate-100'
            }`}
          >
            <PieChart className="w-4 h-4 text-amber-400" />
            <span>Rendimiento Financiero</span>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* TAB 1: INVENTARIO DETALLADO DE PRODUCTOS Y REGISTRO POR LOTES             */}
      {/* ========================================================================= */}
      {activeTab === 'inventario_lotes' && (
        <div className="space-y-8">
          
          {/* INVENTORY FINANCIAL & HEALTH SCORECARDS */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div className="bg-slate-950 text-white p-4 rounded-2xl shadow-md border border-slate-800 flex flex-col justify-between">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Valoración de Stock (Costo)</span>
              <div className="mt-2">
                <span className="text-2xl font-black text-amber-400 font-mono">${inventoryMetrics.totalValuationCost.toFixed(2)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">costo total en almacén</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs flex flex-col justify-between">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Valoración Comercial</span>
              <div className="mt-2">
                <span className="text-2xl font-black text-emerald-600 font-mono">${inventoryMetrics.totalRetailValuation.toFixed(2)}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">PVP estimado de venta</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs flex flex-col justify-between">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Unidades Físicas Total</span>
              <div className="mt-2">
                <span className="text-2xl font-black text-slate-900 font-mono">{inventoryMetrics.totalPhysicalUnits}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">piezas en existencia</span>
              </div>
            </div>

            <div className="bg-white border border-amber-200 p-4 rounded-2xl shadow-2xs flex flex-col justify-between">
              <span className="text-amber-700 text-[10px] font-bold uppercase tracking-wider block">Alertas de Stock Bajo</span>
              <div className="mt-2">
                <span className="text-2xl font-black text-amber-700 font-mono">{inventoryMetrics.lowStockCount}</span>
                <span className="text-[10px] text-amber-600 block mt-0.5">SKUs requieren reorden</span>
              </div>
            </div>

            <div className="bg-white border border-rose-200 p-4 rounded-2xl shadow-2xs flex flex-col justify-between">
              <span className="text-rose-600 text-[10px] font-bold uppercase tracking-wider block">Productos Agotados</span>
              <div className="mt-2">
                <span className="text-2xl font-black text-rose-700 font-mono">{inventoryMetrics.outOfStockCount}</span>
                <span className="text-[10px] text-rose-500 block mt-0.5">sin stock disponible</span>
              </div>
            </div>

            <div className="bg-white border border-slate-200 p-4 rounded-2xl shadow-2xs flex flex-col justify-between">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Lotes Activos</span>
              <div className="mt-2">
                <span className="text-2xl font-black text-blue-600 font-mono">{inventoryMetrics.activeBatchesCount}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">remesas en stock</span>
              </div>
            </div>
          </div>

          {/* TWO-COLUMN LAYOUT: REGISTRAR LOTE & TABLA DE CONTROL DE STOCK */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT: FORMULARIO DE REGISTRO DE NUEVO LOTE DE PRODUCCIÓN/ENTRADA */}
            <div className="lg:col-span-4 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <Truck className="w-5 h-5 text-amber-500" />
                    Registrar Entrada por Lote
                  </h2>
                  <p className="text-xs text-slate-500">Agrega una nueva remesa o lote de producción de placas o tarjetas.</p>
                </div>
              </div>

              {batchSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{batchSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreateBatch} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Código de Lote / Importación *</label>
                  <input
                    type="text"
                    required
                    value={batchCodeInput}
                    onChange={e => setBatchCodeInput(e.target.value)}
                    placeholder="Ej. LOTE-2026-09C"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Producto Asociado *</label>
                  <select
                    value={batchProductSelect}
                    onChange={e => setBatchProductSelect(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 outline-none cursor-pointer"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.name} (${p.price.toFixed(2)})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Cantidad (Piezas) *</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={batchQtyInput}
                      onChange={e => setBatchQtyInput(e.target.value)}
                      placeholder="Ej. 100"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Costo Unitario ($ USD) *</label>
                    <input
                      type="number"
                      step="0.01"
                      required
                      value={batchCostInput}
                      onChange={e => setBatchCostInput(e.target.value)}
                      placeholder="Ej. 4.50"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Proveedor / Fabricante</label>
                  <input
                    type="text"
                    value={batchSupplierInput}
                    onChange={e => setBatchSupplierInput(e.target.value)}
                    placeholder="Nombre del proveedor"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Notas / Especificaciones Técnicas</label>
                  <textarea
                    rows={2}
                    value={batchNotesInput}
                    onChange={e => setBatchNotesInput(e.target.value)}
                    placeholder="Detalles de acabado acrílico, chip NTAG216, etc."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 outline-none"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>Ingresar Lote a Inventario</span>
                </button>
              </form>
            </div>

            {/* RIGHT: TABLA DE CONTROL DE EXISTENCIAS Y AJUSTE RÁPIDO */}
            <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs space-y-4">
              <div className="p-5 bg-slate-50 border-b border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                      <Warehouse className="w-5 h-5 text-slate-700" />
                      Inventario Físico de Productos ({filteredProductStocks.length})
                    </h2>
                    <p className="text-xs text-slate-500">Existencias actuales, valor en costo y ajuste directo de stock.</p>
                  </div>
                </div>

                {/* SEARCH & FILTER CONTROLS */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={productSearch}
                      onChange={e => setProductSearch(e.target.value)}
                      placeholder="Buscar por producto o SKU..."
                      className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="all">Todas las Categorías</option>
                    <option value="plates">Placas de Mostrador</option>
                    <option value="cards">Tarjetas NFC</option>
                    <option value="accessories">Accesorios</option>
                  </select>

                  <select
                    value={stockStatusFilter}
                    onChange={e => setStockStatusFilter(e.target.value as any)}
                    className="w-full px-3 py-1.5 bg-white border border-slate-300 rounded-xl font-medium text-slate-800 outline-none cursor-pointer"
                  >
                    <option value="all">Todos los Estados de Stock</option>
                    <option value="normal">Normal (En Stock)</option>
                    <option value="low">Alerta Stock Bajo</option>
                    <option value="out">Agotado</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto p-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                      <th className="p-3">SKU / Producto</th>
                      <th className="p-3 text-center">Stock Actual</th>
                      <th className="p-3 text-right">Costo Unit.</th>
                      <th className="p-3 text-right">Precio Venta</th>
                      <th className="p-3 text-right">Valor Stock USD</th>
                      <th className="p-3 text-center">Estado</th>
                      <th className="p-3 text-center">Ajuste Directo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredProductStocks.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                          No se encontraron productos en el filtro seleccionado.
                        </td>
                      </tr>
                    ) : (
                      filteredProductStocks.map(prod => {
                        const isLow = prod.current_stock <= prod.min_alert_stock && prod.current_stock > 0;
                        const isOut = prod.current_stock === 0;
                        const stockVal = prod.current_stock * prod.unit_cost;

                        return (
                          <tr key={prod.product_id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3">
                              <span className="font-mono font-bold text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 block w-fit mb-0.5">
                                {prod.sku}
                              </span>
                              <span className="font-bold text-slate-900 block max-w-[200px] truncate">
                                {prod.name}
                              </span>
                            </td>

                            <td className="p-3 text-center font-mono font-black text-base text-slate-900">
                              {prod.current_stock} ud.
                            </td>

                            <td className="p-3 text-right font-mono font-semibold text-slate-600">
                              ${prod.unit_cost.toFixed(2)}
                            </td>

                            <td className="p-3 text-right font-mono font-bold text-slate-900">
                              ${prod.selling_price.toFixed(2)}
                            </td>

                            <td className="p-3 text-right font-mono font-black text-amber-700">
                              ${stockVal.toFixed(2)}
                            </td>

                            <td className="p-3 text-center">
                              {isOut ? (
                                <span className="px-2 py-0.5 bg-rose-100 text-rose-800 border border-rose-300 rounded font-bold uppercase text-[10px]">
                                  Agotado
                                </span>
                              ) : isLow ? (
                                <span className="px-2 py-0.5 bg-amber-100 text-amber-800 border border-amber-300 rounded font-bold uppercase text-[10px]">
                                  Stock Bajo ({prod.min_alert_stock})
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-bold uppercase text-[10px]">
                                  Disponible
                                </span>
                              )}
                            </td>

                            <td className="p-3 text-center">
                              <div className="inline-flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200">
                                <button
                                  type="button"
                                  onClick={() => handleAdjustStock(prod.product_id, -1)}
                                  className="w-6 h-6 bg-white hover:bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center font-bold shadow-2xs border border-slate-200 active:scale-95"
                                  title="Disminuir 1 unidad"
                                >
                                  <Minus className="w-3.5 h-3.5" />
                                </button>
                                <span className="font-mono font-bold px-1 text-[11px] text-slate-800">{prod.current_stock}</span>
                                <button
                                  type="button"
                                  onClick={() => handleAdjustStock(prod.product_id, 1)}
                                  className="w-6 h-6 bg-white hover:bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center font-bold shadow-2xs border border-slate-200 active:scale-95"
                                  title="Aumentar 1 unidad"
                                >
                                  <Plus className="w-3.5 h-3.5" />
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

          {/* HISTORIAL DE LOTES REGISTRADOS Y MOVIMIENTOS KARDEX */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT: HISTORIAL DE LOTES DE PRODUCCIÓN REGISTRADOS */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs space-y-4">
              <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <History className="w-5 h-5 text-slate-700" />
                    Lotes de Importación y Producción ({batches.length})
                  </h2>
                  <p className="text-xs text-slate-500">Histórico de remesas recibidas de proveedores.</p>
                </div>
              </div>

              <div className="overflow-x-auto p-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                      <th className="p-3">Código Lote</th>
                      <th className="p-3">Producto</th>
                      <th className="p-3 text-center">Cant. Inicial</th>
                      <th className="p-3 text-center">Restantes</th>
                      <th className="p-3 text-right">Costo Unit.</th>
                      <th className="p-3 text-center">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {batches.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 italic">No se registran lotes aún.</td>
                      </tr>
                    ) : (
                      batches.map(b => (
                        <tr key={b.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-3 font-mono font-black text-slate-900">
                            <span className="bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
                              {b.id}
                            </span>
                          </td>
                          <td className="p-3 font-bold text-slate-900 max-w-[180px] truncate">
                            {b.product_name}
                          </td>
                          <td className="p-3 text-center font-mono font-bold text-slate-700">
                            {b.quantity_initial} ud.
                          </td>
                          <td className="p-3 text-center font-mono font-black text-amber-700">
                            {b.quantity_remaining} ud.
                          </td>
                          <td className="p-3 text-right font-mono font-bold text-slate-900">
                            ${b.unit_cost.toFixed(2)}
                          </td>
                          <td className="p-3 text-center">
                            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 border border-emerald-300 rounded font-bold uppercase text-[10px]">
                              {b.status === 'active' ? 'Activo' : 'Agotado'}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* RIGHT: AUDITORÍA KARDEX DE MOVIMIENTOS RECIENTES */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs space-y-4">
              <div className="p-5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <Sliders className="w-5 h-5 text-slate-700" />
                    Kardex Auditable de Movimientos
                  </h2>
                  <p className="text-xs text-slate-500">Últimas entradas por lote y salidas por ordenes.</p>
                </div>
              </div>

              <div className="space-y-3 p-4">
                {stockMovements.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-6 text-center">No hay movimientos registrados.</p>
                ) : (
                  stockMovements.slice(0, 8).map(m => (
                    <div key={m.id} className="p-3 bg-slate-50 border border-slate-200 rounded-2xl flex items-center justify-between text-xs">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase ${
                            m.quantity_change > 0
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-rose-100 text-rose-800 border border-rose-300'
                          }`}>
                            {m.quantity_change > 0 ? `+${m.quantity_change} Entrada` : `${m.quantity_change} Salida`}
                          </span>
                          <span className="font-bold text-slate-900">{m.product_name}</span>
                        </div>
                        <p className="text-[10px] text-slate-400 mt-1 font-mono">
                          Ref: {m.reference} | {new Date(m.created_at).toLocaleTimeString('es-PA')}
                        </p>
                      </div>
                      <span className="font-mono font-black text-slate-900 text-xs">
                        {m.resulting_stock} ud. en stock
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: INVENTARIO DE FICHAS Y DISPOSITIVOS TAGS (STT-XXXX)                */}
      {/* ========================================================================= */}
      {activeTab === 'tags_hardware' && (
        <div className="space-y-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT: REGISTRO Y PROGRAMACIÓN DE DISPOSITIVO TAG */}
            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-5">
              <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
                <div>
                  <h2 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <QrCode className="w-5 h-5 text-amber-500" />
                    Programar Dispositivo TAG (STT-XXXX)
                  </h2>
                  <p className="text-xs text-slate-500">Asigna el código de pegatina a la URL de redirección final.</p>
                </div>
              </div>

              {tagSuccessMsg && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{tagSuccessMsg}</span>
                </div>
              )}

              <form onSubmit={handleCreateTag} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Código TAG (Serial) *</label>
                    <input
                      type="text"
                      required
                      value={tagCode}
                      onChange={e => setTagCode(e.target.value)}
                      placeholder="Ej. STT-1050"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Etiqueta / Local *</label>
                    <input
                      type="text"
                      required
                      value={tagLabel}
                      onChange={e => setTagLabel(e.target.value)}
                      placeholder="Ej. Placa Mostrador - Café Panamá"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">URL de Destino (Redirección NFC / QR) *</label>
                  <input
                    type="url"
                    required
                    value={tagUrl}
                    onChange={e => setTagUrl(e.target.value)}
                    placeholder="https://search.google.com/local/writereview?placeid=..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 outline-none focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Tipo de Ficha</label>
                    <select
                      value={tagType}
                      onChange={e => setTagType(e.target.value)}
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
                      value={tagChannels}
                      onChange={e => setTagChannels(e.target.value as any)}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-800 outline-none cursor-pointer"
                    >
                      <option value="both">NFC + Código QR (Ambos)</option>
                      <option value="nfc">Solo NFC Contactless</option>
                      <option value="qr">Solo Código QR</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Email del Cliente</label>
                    <input
                      type="email"
                      value={tagOwnerEmail}
                      onChange={e => setTagOwnerEmail(e.target.value)}
                      placeholder="cliente@correo.com"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Nombre Propietario</label>
                    <input
                      type="text"
                      value={tagOwnerName}
                      onChange={e => setTagOwnerName(e.target.value)}
                      placeholder="Nombre del negocio"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 outline-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 active:scale-[0.99]"
                >
                  <Plus className="w-4 h-4 text-amber-400" />
                  <span>Crear y Vincular Dispositivo TAG</span>
                </button>
              </form>
            </div>

            {/* RIGHT: LISTADO DE TAGS REGISTRADOS */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs space-y-4">
              <div className="p-5 bg-slate-50 border-b border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-slate-700" />
                      Inventario de TAGs Registrados ({cards.length})
                    </h2>
                    <p className="text-xs text-slate-500">Fichas activas y listas para clientes.</p>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto p-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                      <th className="p-3">Serial TAG</th>
                      <th className="p-3">Etiqueta</th>
                      <th className="p-3">Red</th>
                      <th className="p-3">Propietario</th>
                      <th className="p-3 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {cards.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-8 text-center text-slate-400 italic">No hay dispositivos TAG en el sistema.</td>
                      </tr>
                    ) : (
                      cards.slice(0, 15).map(c => {
                        const redirectUrl = `https://startap.com.pa/r/${c.card_id}`;
                        return (
                          <tr key={c.card_id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-mono font-black text-slate-900">
                              <span className="bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
                                {c.card_id}
                              </span>
                            </td>
                            <td className="p-3 font-bold text-slate-900 max-w-[150px] truncate">
                              {c.label || 'Sin etiqueta'}
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-800 rounded font-bold uppercase text-[10px] border border-amber-200">
                                {c.type || 'google'}
                              </span>
                            </td>
                            <td className="p-3">
                              <p className="font-semibold text-slate-800">{c.owner_name || 'En Stock'}</p>
                              <p className="text-[10px] text-slate-400 font-mono">{c.owner_email}</p>
                            </td>
                            <td className="p-3 text-center">
                              <button
                                type="button"
                                onClick={() => copyToClipboard(redirectUrl, c.card_id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-[11px] font-bold transition"
                              >
                                {copiedId === c.card_id ? (
                                  <>
                                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                                    <span className="text-emerald-700">¡Copiado!</span>
                                  </>
                                ) : (
                                  <>
                                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                                    <span>Copiar Enlace</span>
                                  </>
                                )}
                              </button>
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

        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: RENDIMIENTO FINANCIERO & ANALÍTICAS                                */}
      {/* ========================================================================= */}
      {activeTab === 'resumen_analiticas' && (
        <div className="space-y-8">
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-950 text-white p-4.5 rounded-2xl shadow-md border border-slate-800">
              <span className="text-slate-400 text-[10px] font-bold uppercase tracking-wider block">Ventas Totales ($ USD)</span>
              <span className="text-2xl font-black text-amber-400 font-mono mt-1 block">${totalRevenue.toFixed(2)}</span>
            </div>

            <div className="bg-white border border-slate-200 p-4.5 rounded-2xl shadow-2xs">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Unidades Vendidas</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{totalProductsSold}</span>
            </div>

            <div className="bg-white border border-slate-200 p-4.5 rounded-2xl shadow-2xs">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Órdenes Procesadas</span>
              <span className="text-2xl font-black text-slate-900 font-mono mt-1 block">{totalOrdersCount}</span>
            </div>

            <div className="bg-white border border-slate-200 p-4.5 rounded-2xl shadow-2xs">
              <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider block">Ticket Promedio</span>
              <span className="text-2xl font-black text-emerald-600 font-mono mt-1 block">${avgOrderTicket.toFixed(2)}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
            <h2 className="text-base font-black text-slate-900 uppercase tracking-tight mb-2">
              Resumen Financiero Comercial
            </h2>
            <p className="text-xs text-slate-500">
              Métricas consolidadas de transacciones y ventas acumuladas.
            </p>
          </div>

        </div>
      )}

    </div>
  );
}
