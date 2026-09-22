'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { dbLocal, Order, NfcCard, Product, AbandonedCheckout, supabase, StockAuditItem } from '@/lib/db';
import BulkAddBatchModal from '@/components/admin/BulkAddBatchModal';
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
  is_bundle?: boolean;
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
  const [tagHardwareType, setTagHardwareType] = useState<'stand' | 'plate' | 'card'>('stand');
  const [tagHardwareFilter, setTagHardwareFilter] = useState<'all' | 'stand' | 'plate' | 'card'>('all');
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

  // Bulk Add Modal & Stock Audit State
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [bulkHardwareType, setBulkHardwareType] = useState<'stand' | 'plate' | 'card'>('stand');
  const [auditItems, setAuditItems] = useState<StockAuditItem[]>([]);
  const [reconcileSuccessMsg, setReconcileSuccessMsg] = useState('');

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
      if (!p || !p.id) return;
      const existing = savedStocks[p.id];
      const pid = (p.id || '').toLowerCase();

      let defaultQty = 10;
      let officialUnitCost = 2.25;

      if (pid.includes('tarjeta') || pid === 'tarjeta-nfc' || pid === 'tarjeta-nfc-bolsillo') {
        defaultQty = 20;
        officialUnitCost = 1.50;
      } else if (pid.includes('placa') || pid === 'placa-nfc-mostrador' || pid === 'placa-google' || pid === 'nfc_10001') {
        defaultQty = 50;
        officialUnitCost = 2.25;
      } else if (pid.includes('stand') || pid === 'stand-nfc-mesa' || pid === 'stand-nfc' || pid === 'nfc10002') {
        defaultQty = 0;
        officialUnitCost = 2.00;
      } else if (pid.includes('pack') || pid === 'pack-trio-comercial') {
        defaultQty = 10;
        officialUnitCost = 5.25; // 1 Placa ($2.25) + 2 Tarjetas ($3.00)
      }

      const pPrice = typeof p.price === 'number' && !isNaN(p.price) ? p.price : 0;
      const unitCostVal = existing && typeof existing.unit_cost === 'number' && !isNaN(existing.unit_cost) && existing.unit_cost > 0
        ? existing.unit_cost
        : officialUnitCost;

      const sellingPriceVal = existing && typeof existing.selling_price === 'number' && !isNaN(existing.selling_price)
        ? existing.selling_price
        : pPrice;

      const isBundleProd = pid.includes('pack') || pid === 'pack-trio-comercial';

      cleanStocks[p.id] = {
        product_id: p.id,
        sku: (p as any).sku || existing?.sku || `STP-${(100 + idx + 1).toString().padStart(4, '0')}`,
        name: p.name || existing?.name || p.id,
        category: p.category || existing?.category || 'plates',
        current_stock: existing && typeof existing.current_stock === 'number' ? existing.current_stock : defaultQty,
        min_alert_stock: existing && typeof existing.min_alert_stock === 'number' ? existing.min_alert_stock : 10,
        unit_cost: officialUnitCost, // Forzar costo unitario oficial de compra
        selling_price: sellingPriceVal,
        is_bundle: isBundleProd,
      };
    });

    // Asegurar conteo físico exacto inicial y costos oficiales
    if (cleanStocks['placa-nfc-mostrador']) {
      if (savedStocks['placa-nfc-mostrador'] === undefined) cleanStocks['placa-nfc-mostrador'].current_stock = 50;
      cleanStocks['placa-nfc-mostrador'].unit_cost = 2.25;
    }
    if (cleanStocks['tarjeta-nfc-bolsillo']) {
      if (savedStocks['tarjeta-nfc-bolsillo'] === undefined) cleanStocks['tarjeta-nfc-bolsillo'].current_stock = 20;
      cleanStocks['tarjeta-nfc-bolsillo'].unit_cost = 1.50;
    }
    if (cleanStocks['stand-nfc-mesa']) {
      cleanStocks['stand-nfc-mesa'].current_stock = 100;
      cleanStocks['stand-nfc-mesa'].unit_cost = 2.00;
      cleanStocks['stand-nfc-mesa'].selling_price = 35.00;
    }
    if (cleanStocks['pack-trio-comercial']) {
      const pStock = cleanStocks['placa-nfc-mostrador'] ? cleanStocks['placa-nfc-mostrador'].current_stock : 50;
      const tStock = cleanStocks['tarjeta-nfc-bolsillo'] ? cleanStocks['tarjeta-nfc-bolsillo'].current_stock : 20;
      cleanStocks['pack-trio-comercial'].current_stock = Math.min(pStock, Math.floor(tStock / 2));
      cleanStocks['pack-trio-comercial'].unit_cost = 5.25; // 1 Placa ($2.25) + 2 Tarjetas ($3.00)
      cleanStocks['pack-trio-comercial'].is_bundle = true;
    }

    setProductStocks(cleanStocks);
    dbLocal.setStorageItem('inventory_product_stocks', cleanStocks);

    // Initial Batches setup con costos unitarios oficiales
    const savedBatches = dbLocal.getStorageItem<InventoryBatch[]>('inventory_batches', []);
    const defaultInitialBatches: InventoryBatch[] = [
      {
        id: 'LOTE-2026-10S',
        product_id: 'stand-nfc-mesa',
        product_name: 'Stand NFC para Reseñas de Google',
        quantity_initial: 100,
        quantity_remaining: 100,
        unit_cost: 2.00,
        supplier: 'Shenzhen Micro-NFC Tech',
        received_at: new Date().toISOString(),
        status: 'active',
        notes: 'Stand Acrílico triangular 3mm + Impresión UV + Chip NTAG216',
      },
      {
        id: 'LOTE-2026-09A',
        product_id: 'placa-nfc-mostrador',
        product_name: 'Placa NFC para Reseñas de Google',
        quantity_initial: 50,
        quantity_remaining: 50,
        unit_cost: 2.25,
        supplier: 'Shenzhen Micro-NFC Tech',
        received_at: new Date(Date.now() - 86400000 * 12).toISOString(),
        status: 'active',
        notes: 'Acrílico 3mm + Impresión UV + Chip NTAG216',
      },
      {
        id: 'LOTE-2026-08B',
        product_id: 'tarjeta-nfc-bolsillo',
        product_name: 'Tarjeta NFC de Bolsillo',
        quantity_initial: 20,
        quantity_remaining: 20,
        unit_cost: 1.50,
        supplier: 'SmartCard Global Panama',
        received_at: new Date(Date.now() - 86400000 * 25).toISOString(),
        status: 'active',
        notes: 'PVC Mate 0.76mm contactless',
      }
    ];

    const cleanBatches: InventoryBatch[] = (savedBatches.length > 0 ? savedBatches : defaultInitialBatches).map(b => {
      const pName = (b.product_name || '').toLowerCase();
      const pId = (b.product_id || '').toLowerCase();
      let cost = b.unit_cost;
      if (pName.includes('tarjeta') || pId.includes('tarjeta')) cost = 1.50;
      else if (pName.includes('placa') || pId.includes('placa')) cost = 2.25;
      else if (pName.includes('stand') || pId.includes('stand')) cost = 2.00;
      else if (pName.includes('pack') || pId.includes('pack')) cost = 5.25;
      return { ...b, unit_cost: cost };
    });

    setBatches(cleanBatches);
    dbLocal.setStorageItem('inventory_batches', cleanBatches);

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
    const initialTagCode = dbLocal.getNextStickerCode('stand');
    setTagCode(initialTagCode);
    setTagLabel(`Stand NFC de Mesa (${initialTagCode})`);
    
    // Actualizar Auditoría de Cuadre
    setAuditItems(dbLocal.getStockAudit());
    setLoading(false);
  };

  const handleOpenBulkModal = (type: 'stand' | 'plate' | 'card' = 'stand') => {
    setBulkHardwareType(type);
    setIsBulkModalOpen(true);
  };

  const handleReconcileStock = () => {
    if (window.confirm('¿Deseas cuadrar automáticamente el inventario disponible para que coincida exactamente con los tags físicos no reclamados (claimed: false) en stock?')) {
      const res = dbLocal.reconcileStockWithUnclaimedTags();
      setReconcileSuccessMsg(res.message);
      loadData();
      setTimeout(() => setReconcileSuccessMsg(''), 5000);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Compute Total Inventory Financial Valuation (Solo contando ítems físicos reales para no duplicar combos)
  const inventoryMetrics = useMemo(() => {
    const stockList = Object.values(productStocks).filter(Boolean);
    const physicalItems = stockList.filter(item => !item.is_bundle && !item.product_id.includes('pack'));

    const totalPhysicalUnits = physicalItems.reduce((sum, item) => sum + (item.current_stock || 0), 0);
    const totalValuationCost = physicalItems.reduce((sum, item) => sum + ((item.current_stock || 0) * (item.unit_cost || 0)), 0);
    const totalRetailValuation = physicalItems.reduce((sum, item) => sum + ((item.current_stock || 0) * (item.selling_price || 0)), 0);

    const lowStockCount = stockList.filter(item => (item.current_stock || 0) <= (item.min_alert_stock || 10) && (item.current_stock || 0) > 0).length;
    const outOfStockCount = stockList.filter(item => (item.current_stock || 0) === 0).length;
    const activeBatchesCount = (batches || []).filter(b => b && b.status === 'active').length;

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
      if (!p) return false;
      const pName = p.name || '';
      const pSku = p.sku || '';

      const matchSearch =
        !productSearch ||
        pName.toLowerCase().includes(productSearch.toLowerCase()) ||
        pSku.toLowerCase().includes(productSearch.toLowerCase());

      const matchCategory =
        categoryFilter === 'all' || p.category === categoryFilter;

      const currentStock = p.current_stock || 0;
      const minStock = p.min_alert_stock || 10;

      const matchStatus =
        stockStatusFilter === 'all' ||
        (stockStatusFilter === 'normal' && currentStock > minStock) ||
        (stockStatusFilter === 'low' && currentStock <= minStock && currentStock > 0) ||
        (stockStatusFilter === 'out' && currentStock === 0);

      return matchSearch && matchCategory && matchStatus;
    });
  }, [productStocks, productSearch, categoryFilter, stockStatusFilter]);

  // Switch Hardware Type for new TAG
  const handleHardwareTypeChange = (type: 'stand' | 'plate' | 'card') => {
    setTagHardwareType(type);
    const nextCode = dbLocal.getNextStickerCode(type);
    setTagCode(nextCode);
    const labelMap: Record<'stand' | 'plate' | 'card', string> = {
      stand: 'Stand NFC de Mesa',
      plate: 'Placa NFC de Mostrador',
      card: 'Tarjeta NFC de Bolsillo',
    };
    setTagLabel(`${labelMap[type]} (${nextCode})`);
  };

  // Filtered TAG Cards Memo
  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      const q = tagSearch.toLowerCase().trim();
      const matchSearch =
        !q ||
        card.card_id.toLowerCase().includes(q) ||
        (card.label && card.label.toLowerCase().includes(q)) ||
        (card.owner_name && card.owner_name.toLowerCase().includes(q)) ||
        (card.owner_email && card.owner_email.toLowerCase().includes(q));

      const matchClaim =
        tagClaimFilter === 'all' ||
        (tagClaimFilter === 'claimed' && card.claimed) ||
        (tagClaimFilter === 'unclaimed' && !card.claimed);

      const matchChannel =
        tagChannelFilter === 'all' || card.channels === tagChannelFilter;

      const codeUpper = (card.card_id || card.activation_code || '').toUpperCase();
      const isStand = codeUpper.startsWith('STTS-') || (card.label && card.label.toLowerCase().includes('stand'));
      const isCard = codeUpper.startsWith('STTT-') || (card.label && card.label.toLowerCase().includes('tarjeta'));
      const isPlate = !isStand && !isCard;

      const matchHardware =
        tagHardwareFilter === 'all' ||
        (tagHardwareFilter === 'stand' && isStand) ||
        (tagHardwareFilter === 'card' && isCard) ||
        (tagHardwareFilter === 'plate' && isPlate);

      return matchSearch && matchClaim && matchChannel && matchHardware;
    });
  }, [cards, tagSearch, tagClaimFilter, tagChannelFilter, tagHardwareFilter]);

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
    const nextTagCode = dbLocal.getNextStickerCode(tagHardwareType);
    setTagCode(nextTagCode);
    const labelMap: Record<'stand' | 'plate' | 'card', string> = {
      stand: 'Stand NFC de Mesa',
      plate: 'Placa NFC de Mostrador',
      card: 'Tarjeta NFC de Bolsillo',
    };
    setTagLabel(`${labelMap[tagHardwareType]} (${nextTagCode})`);
    setTagUrl('');
    setTagOwnerEmail('');
    setTagOwnerName('');
    setTimeout(() => setTagSuccessMsg(''), 4000);
  };

  // Pedidos que quedaron con tags pendientes (se reutilizan los 'orders' ya cargados)
  const pedidosConTagsPendientes = useMemo(
    () => (orders || []).filter((o) => o && Number((o as any).tags_pendientes || 0) > 0),
    [orders]
  );

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

        {/* MAIN NAVIGATION TABS & BULK ACTION */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenBulkModal('stand')}
            className="flex items-center gap-2 px-4 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-2xl text-xs transition shadow-md ring-2 ring-amber-400/20"
          >
            <Boxes className="w-4 h-4" />
            <span>📦 Agregar en Lote (+Stock & Tags)</span>
          </button>

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
      </div>

      {/* RECONCILIATION SUCCESS BANNER */}
      {reconcileSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs font-bold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <span>{reconcileSuccessMsg}</span>
          </div>
          <button
            onClick={() => setReconcileSuccessMsg('')}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold"
          >
            ✕
          </button>
        </div>
      )}

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
            
            {/* LEFT: ENTRADA EN LOTE ASISTIDA & AUDITORÍA DE CUADRE */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* CARD 1: CTA ASISTIDO PARA AGREGAR EN LOTE */}
              <div className="bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-6 shadow-md border border-slate-800 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                    <Boxes className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-sm font-black uppercase tracking-tight text-white">
                      Módulo de Agregar en Lote
                    </h2>
                    <span className="text-[10px] text-amber-400 font-bold block">
                      Generador Correlativo + Cuadre Automático
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">
                  Genera códigos correlativos continuos (<code className="text-amber-400 font-mono font-bold">STTS-</code>, <code className="text-amber-400 font-mono font-bold">STT-</code>, <code className="text-amber-400 font-mono font-bold">STTT-</code>) y cuadra automáticamente el inventario disponible.
                </p>

                <div className="grid grid-cols-3 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => handleOpenBulkModal('stand')}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 font-bold text-[11px] transition text-center"
                  >
                    + Stand NFC
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenBulkModal('plate')}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 font-bold text-[11px] transition text-center"
                  >
                    + Placa NFC
                  </button>
                  <button
                    type="button"
                    onClick={() => handleOpenBulkModal('card')}
                    className="p-2 rounded-xl bg-slate-800/80 hover:bg-amber-500 hover:text-slate-950 border border-slate-700 font-bold text-[11px] transition text-center"
                  >
                    + Tarjeta NFC
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenBulkModal('stand')}
                  className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  <span>Abrir Asistente de Lotes</span>
                </button>
              </div>

              {/* CARD 2: AUDITORÍA Y CUADRE DE STOCK CON TAGS DISPONIBLES */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <div>
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight">
                        Auditoría de Cuadre
                      </h3>
                      <p className="text-[10px] text-slate-500">Tags No Reclamados vs Stock Almacén</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={loadData}
                    className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 transition"
                    title="Recalcular auditoría"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-2.5">
                  {auditItems.map(item => (
                    <div
                      key={item.productId}
                      className="p-2.5 rounded-xl border bg-slate-50 border-slate-200 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-800 block text-[11px]">{item.productName}</span>
                        <span className="text-[10px] text-slate-500">
                          Tags Físicos: <strong className="text-slate-900 font-mono">{item.unclaimedTagsCount}</strong> · Almacén: <strong className="text-slate-900 font-mono">{item.recordedStock}</strong>
                        </span>
                      </div>
                      <div>
                        {item.isBalanced ? (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                            <Check className="w-3 h-3 text-emerald-600" /> Cuadrado
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-300">
                            Dif: {item.difference > 0 ? `+${item.difference}` : item.difference}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleReconcileStock}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl text-xs transition flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
                  <span>Sincronizar & Cuadrar con Tags</span>
                </button>
              </div>

              {/* CARD 3: FORMULARIO DIRECTO MANUAL */}
              <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
                <div className="border-b border-slate-100 pb-3">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    <Truck className="w-4 h-4 text-slate-600" />
                    Entrada Manual Rápida
                  </h3>
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
                      <th className="p-3 text-right">Valor Costo</th>
                      <th className="p-3 text-right">Valor Comercial</th>
                      <th className="p-3 text-center">Estado</th>
                      <th className="p-3 text-center">Ajuste Directo</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredProductStocks.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                          No se encontraron productos en el filtro seleccionado.
                        </td>
                      </tr>
                    ) : (
                      filteredProductStocks.map(prod => {
                        const currentStock = prod.current_stock || 0;
                        const minAlert = prod.min_alert_stock || 10;
                        const unitCost = typeof prod.unit_cost === 'number' && !isNaN(prod.unit_cost) ? prod.unit_cost : 0;
                        const sellingPrice = typeof prod.selling_price === 'number' && !isNaN(prod.selling_price) ? prod.selling_price : 0;

                        const isLow = currentStock <= minAlert && currentStock > 0;
                        const isOut = currentStock === 0;
                        const isBundle = prod.is_bundle || prod.product_id.includes('pack');
                        const costVal = currentStock * unitCost;
                        const retailVal = currentStock * sellingPrice;

                        return (
                          <tr key={prod.product_id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="font-mono font-bold text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 block w-fit">
                                  {prod.sku || 'STP-0000'}
                                </span>
                                {isBundle && (
                                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-purple-100 text-purple-800 border border-purple-300 rounded">
                                    Combo Virtual
                                  </span>
                                )}
                              </div>
                              <span className="font-bold text-slate-900 block max-w-[220px] truncate mt-0.5">
                                {prod.name || prod.product_id}
                              </span>
                            </td>

                            <td className="p-3 text-center font-mono font-black text-base text-slate-900">
                              {currentStock} ud.
                              {isBundle && <span className="text-[10px] font-bold text-purple-700 block -mt-1">(armables)</span>}
                            </td>

                            <td className="p-3 text-right font-mono font-semibold text-slate-600">
                              ${unitCost.toFixed(2)}
                            </td>

                            <td className="p-3 text-right font-mono font-bold text-slate-900">
                              ${sellingPrice.toFixed(2)}
                            </td>

                            <td className="p-3 text-right font-mono font-black">
                              {isBundle ? (
                                <span className="text-[11px] font-bold text-slate-400 italic" title="No suma al total para evitar duplicar existencias de insumos">
                                  $0.00 (Combo)
                                </span>
                              ) : (
                                <span className="text-amber-700">${costVal.toFixed(2)}</span>
                              )}
                            </td>

                            <td className="p-3 text-right font-mono font-black">
                              {isBundle ? (
                                <span className="text-[11px] font-bold text-slate-400 italic" title="Derivado de 1 Placa + 2 Tarjetas físicas">
                                  $0.00 (Combo)
                                </span>
                              ) : (
                                <span className="text-emerald-700">${retailVal.toFixed(2)}</span>
                              )}
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
                          <td className="p-3 font-mono font-black text-slate-900 whitespace-nowrap">
                            <span className="bg-slate-100 border border-slate-300 px-2 py-0.5 rounded whitespace-nowrap inline-block font-bold">
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
                    Programar Dispositivo TAG
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

              {/* Selector de Hardware / Formato */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                  Formato de Dispositivo / Hardware *
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => handleHardwareTypeChange('stand')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      tagHardwareType === 'stand'
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-sm">🏢</span>
                      <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded ${
                        tagHardwareType === 'stand' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        STTS-
                      </span>
                    </div>
                    <p className="text-[11px] font-black text-slate-900 leading-tight">Stand NFC</p>
                    <p className="text-[9px] text-slate-500">Mesa / Mostrador</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleHardwareTypeChange('plate')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      tagHardwareType === 'plate'
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-sm">🏷️</span>
                      <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded ${
                        tagHardwareType === 'plate' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        STT-
                      </span>
                    </div>
                    <p className="text-[11px] font-black text-slate-900 leading-tight">Placa NFC</p>
                    <p className="text-[9px] text-slate-500">Acrílica Pequeña</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleHardwareTypeChange('card')}
                    className={`p-2.5 rounded-xl border text-left transition flex flex-col justify-between ${
                      tagHardwareType === 'card'
                        ? 'border-amber-500 bg-amber-50/50 ring-2 ring-amber-500/20 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-sm">💳</span>
                      <span className={`text-[9px] font-mono font-black px-1.5 py-0.5 rounded ${
                        tagHardwareType === 'card' ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                      }`}>
                        STTT-
                      </span>
                    </div>
                    <p className="text-[11px] font-black text-slate-900 leading-tight">Tarjeta NFC</p>
                    <p className="text-[9px] text-slate-500">PVC Bolsillo</p>
                  </button>
                </div>
              </div>

              <form onSubmit={handleCreateTag} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700">Código TAG (Serial) *</label>
                    <input
                      type="text"
                      required
                      value={tagCode}
                      onChange={e => setTagCode(e.target.value)}
                      placeholder="Ej. STTS-1001"
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
                      placeholder="Ej. Stand NFC - Café Panamá"
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

            {/* RIGHT: LISTADO DE TAGS REGISTRADOS CON FILTRO POR DISPOSITIVO */}
            <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs space-y-4">
              <div className="p-5 bg-slate-50 border-b border-slate-200 space-y-3">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div>
                    <h2 className="text-base font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-slate-700" />
                      Inventario de TAGs Registrados ({filteredCards.length})
                    </h2>
                    <p className="text-xs text-slate-500">Fichas activas y listas para clientes.</p>
                  </div>
                </div>

                {/* Filtros de Hardware y Búsqueda */}
                <div className="space-y-2 pt-1">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="text"
                        value={tagSearch}
                        onChange={e => setTagSearch(e.target.value)}
                        placeholder="Buscar por serial, local o propietario..."
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-300 rounded-xl text-xs text-slate-900 placeholder-slate-400 outline-none focus:ring-2 focus:ring-slate-900"
                      />
                    </div>
                  </div>

                  {/* Pills de formato de dispositivo */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    <button
                      type="button"
                      onClick={() => setTagHardwareFilter('all')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        tagHardwareFilter === 'all'
                          ? 'bg-slate-900 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span>Todos los Formatos</span>
                      <span className="text-[10px] opacity-75 font-mono">({cards.length})</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTagHardwareFilter('stand')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        tagHardwareFilter === 'stand'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span>🏢 Stands NFC (STTS-)</span>
                      <span className="text-[10px] opacity-75 font-mono">
                        ({cards.filter(c => (c.card_id || '').toUpperCase().startsWith('STTS-') || (c.label && c.label.toLowerCase().includes('stand'))).length})
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTagHardwareFilter('plate')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        tagHardwareFilter === 'plate'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span>🏷️ Placas (STT-)</span>
                      <span className="text-[10px] opacity-75 font-mono">
                        ({cards.filter(c => !(c.card_id || '').toUpperCase().startsWith('STTS-') && !(c.card_id || '').toUpperCase().startsWith('STTT-') && !(c.label && (c.label.toLowerCase().includes('stand') || c.label.toLowerCase().includes('tarjeta')))).length})
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setTagHardwareFilter('card')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                        tagHardwareFilter === 'card'
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                      }`}
                    >
                      <span>💳 Tarjetas (STTT-)</span>
                      <span className="text-[10px] opacity-75 font-mono">
                        ({cards.filter(c => (c.card_id || '').toUpperCase().startsWith('STTT-') || (c.label && c.label.toLowerCase().includes('tarjeta'))).length})
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto p-2">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                      <th className="p-3">Serial TAG</th>
                      <th className="p-3">Formato</th>
                      <th className="p-3">Etiqueta</th>
                      <th className="p-3">Red</th>
                      <th className="p-3">Propietario</th>
                      <th className="p-3 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                    {filteredCards.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400 italic">No hay dispositivos TAG que coincidan con el filtro.</td>
                      </tr>
                    ) : (
                      filteredCards.map(c => {
                        const redirectUrl = `https://startap.com.pa/r/${c.card_id}`;
                        const isStandTag = (c.card_id || '').toUpperCase().startsWith('STTS-') || (c.label && c.label.toLowerCase().includes('stand'));
                        const isCardTag = (c.card_id || '').toUpperCase().startsWith('STTT-') || (c.label && c.label.toLowerCase().includes('tarjeta'));
                        
                        return (
                          <tr key={c.card_id} className="hover:bg-slate-50 transition-colors">
                            <td className="p-3 font-mono font-black text-slate-900">
                              <span className="bg-slate-100 border border-slate-300 px-2 py-0.5 rounded">
                                {c.card_id}
                              </span>
                            </td>
                            <td className="p-3">
                              {isStandTag ? (
                                <span className="px-2 py-0.5 bg-purple-50 text-purple-700 rounded font-bold text-[10px] border border-purple-200">
                                  🏢 Stand NFC
                                </span>
                              ) : isCardTag ? (
                                <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded font-bold text-[10px] border border-blue-200">
                                  💳 Tarjeta NFC
                                </span>
                              ) : (
                                <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded font-bold text-[10px] border border-amber-200">
                                  🏷️ Placa NFC
                                </span>
                              )}
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

      {/* BULK ADD BATCH MODAL */}
      <BulkAddBatchModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        onSuccess={loadData}
        initialHardwareType={bulkHardwareType}
      />

    </div>
  );
}
