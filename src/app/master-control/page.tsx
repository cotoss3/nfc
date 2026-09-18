'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { dbLocal, Order, NfcCard, Product, ScanRecord, AbandonedCheckout, CustomerSummary, B2bQuote } from '@/lib/db';
import { Coupon, CouponType } from '@/config/shipping';
import { 
  ShieldCheck, Package, RefreshCw, CheckCircle, Search, 
  Tag, BarChart2, Smartphone, Layers, Edit2, Trash2, DollarSign, 
  Filter, Radio, QrCode, User, Plus, Check, Printer, AlertCircle,
  LogOut, ChevronRight, X, Image as ImageIcon, Percent,
  ShoppingCart, MessageCircle, Clock, Mail, Users, Building2,
  Download, Truck, FileText, CheckCircle2, TrendingUp, MapPin,
  CreditCard, Send, Eye, Archive
} from 'lucide-react';

type AdminTab = 'cards' | 'orders' | 'customers' | 'abandoned' | 'b2b' | 'products' | 'coupons' | 'analytics' | 'stickers';

export default function AdminPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [cards, setCards] = useState<NfcCard[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [scans, setScans] = useState<ScanRecord[]>([]);
  const [abandonedCheckouts, setAbandonedCheckouts] = useState<AbandonedCheckout[]>([]);
  const [customers, setCustomers] = useState<CustomerSummary[]>([]);
  const [b2bQuotes, setB2bQuotes] = useState<B2bQuote[]>([]);
  const [activeTab, setActiveTab] = useState<AdminTab>('cards');
  const [loading, setLoading] = useState(true);

  // Order Detail Modal State
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [trackingCourierInput, setTrackingCourierInput] = useState('');
  const [trackingNumberInput, setTrackingNumberInput] = useState('');
  const [adminNotesInput, setAdminNotesInput] = useState('');

  // CRM Customers Filters
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerFilter, setCustomerFilter] = useState<'all' | 'vip' | 'single'>('all');

  // B2B Quotes Filters
  const [b2bSearch, setB2bSearch] = useState('');
  const [b2bStatusFilter, setB2bStatusFilter] = useState<'all' | 'pending' | 'contacted' | 'won' | 'lost'>('all');

  // Abandoned Checkouts Filters
  const [abandonedSearch, setAbandonedSearch] = useState('');
  const [abandonedStatusFilter, setAbandonedStatusFilter] = useState<'all' | 'abandoned' | 'completed'>('all');

  // Coupon Manager States
  const [couponSearch, setCouponSearch] = useState('');
  const [newCouponCode, setNewCouponCode] = useState('');
  const [newCouponType, setNewCouponType] = useState<CouponType>('percent');
  const [newCouponValue, setNewCouponValue] = useState('');
  const [newCouponDescription, setNewCouponDescription] = useState('');
  const [createCouponSuccess, setCreateCouponSuccess] = useState(false);

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
    const dbCoupons = dbLocal.getCoupons();
    const dbScans = dbLocal.getStorageItem<ScanRecord[]>('nfc_scans', []);
    const dbAbandoned = dbLocal.getAbandonedCheckouts();
    const dbCustomers = dbLocal.getCustomersSummary();
    const dbB2b = dbLocal.getB2bQuotes();

    setOrders(dbOrders);
    setCards(initialCards);
    setProducts(dbProducts);
    setCoupons(dbCoupons);
    setScans(dbScans);
    setAbandonedCheckouts(dbAbandoned);
    setCustomers(dbCustomers);
    setB2bQuotes(dbB2b);

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

  const exportOrdersToCsv = () => {
    if (orders.length === 0) return alert('No hay órdenes para exportar.');
    const headers = ['ID Orden', 'Fecha', 'Cliente', 'Email', 'Telefono', 'Provincia', 'Distrito', 'Direccion', 'Metodo Pago', 'Estado Pago', 'Estado Orden', 'Courier', 'Tracking', 'Total USD', 'Productos'];
    const rows = orders.map(o => [
      `"${o.id}"`,
      `"${new Date(o.created_at).toLocaleString('es-PA')}"`,
      `"${(o.customer_name || '').replace(/"/g, '""')}"`,
      `"${o.customer_email || ''}"`,
      `"${o.customer_phone || ''}"`,
      `"${(o.shipping_province || '').replace(/"/g, '""')}"`,
      `"${(o.shipping_district || '').replace(/"/g, '""')}"`,
      `"${(o.shipping_address || '').replace(/"/g, '""')}"`,
      `"${o.payment_method}"`,
      `"${o.payment_status}"`,
      `"${o.status}"`,
      `"${o.tracking_courier || 'Pendiente'}"`,
      `"${o.tracking_number || ''}"`,
      `"${o.total.toFixed(2)}"`,
      `"${(o.items || []).map(i => `${i.quantity}x ${i.product_name}`).join(' | ').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `starTAP_Ordenes_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportCustomersToCsv = () => {
    if (customers.length === 0) return alert('No hay clientes para exportar.');
    const headers = ['Cliente', 'Email', 'Telefono', 'Provincia', 'Distrito', 'Ordenes Totales', 'LTV Gasto USD', 'Ultima Compra', 'Dispositivos TAP'];
    const rows = customers.map(c => [
      `"${(c.name || '').replace(/"/g, '""')}"`,
      `"${c.email}"`,
      `"${c.phone || ''}"`,
      `"${c.province || ''}"`,
      `"${c.district || ''}"`,
      `"${c.ordersCount}"`,
      `"${c.totalSpent.toFixed(2)}"`,
      `"${new Date(c.lastOrderDate).toLocaleDateString('es-PA')}"`,
      `"${c.cardCount}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `starTAP_Clientes_CRM_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrintPackingSlip = (order: Order) => {
    const printWindow = window.open('', '_blank', 'width=800,height=900');
    if (!printWindow) return alert('Por favor habilita las ventanas emergentes en tu navegador.');

    const itemsHtml = order.items.map(item => `
      <tr>
        <td style="padding:10px; border-bottom:1px solid #eee; text-align:center;">[ &nbsp; ]</td>
        <td style="padding:10px; border-bottom:1px solid #eee;">
          <strong>${item.product_name}</strong>
          ${item.selected_color ? `<br><small style="color:#666;">Color: ${item.selected_color}</small>` : ''}
          ${item.business_name ? `<br><small style="color:#666;">Ficha: ${item.business_name}</small>` : ''}
        </td>
        <td style="padding:10px; border-bottom:1px solid #eee; text-align:center; font-weight:bold;">${item.quantity}</td>
        <td style="padding:10px; border-bottom:1px solid #eee; text-align:right;">$${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Remisión de Empaque - Pedido #${order.id}</title>
        <style>
          body { font-family: Arial, sans-serif; font-size: 13px; color: #111; padding: 25px; line-height: 1.5; }
          .header { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #111; padding-bottom: 15px; margin-bottom: 20px; }
          .brand { font-size: 22px; font-weight: 900; }
          .badge { background: #111; color: #f59e0b; padding: 3px 8px; border-radius: 4px; font-size: 11px; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 20px; }
          .box { background: #f9f9f9; padding: 12px; border-radius: 8px; border: 1px solid #eee; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th { background: #111; color: #fff; text-align: left; padding: 8px 10px; font-size: 11px; text-transform: uppercase; }
          .footer { margin-top: 30px; border-top: 1px solid #eee; padding-top: 15px; text-align: center; font-size: 11px; color: #666; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <div class="brand">starTAP Panamá 🇵🇦</div>
            <div style="font-size:11px; color:#666;">Tecnología NFC & QR para Reseñas en Panamá</div>
          </div>
          <div style="text-align:right;">
            <div style="font-size:16px; font-weight:bold;">COMPROBANTE DE EMPAQUE</div>
            <div class="badge">#${order.id}</div>
          </div>
        </div>

        <div class="grid">
          <div class="box">
            <strong style="text-transform:uppercase; font-size:10px; color:#666;">Datos del Comercio / Cliente</strong>
            <div style="font-weight:bold; font-size:14px; margin-top:3px;">${order.customer_name}</div>
            <div>📧 ${order.customer_email}</div>
            <div>📱 ${order.customer_phone}</div>
          </div>

          <div class="box">
            <strong style="text-transform:uppercase; font-size:10px; color:#666;">Destino de Envío en Panamá</strong>
            <div style="font-weight:bold; margin-top:3px;">${order.shipping_province}, ${order.shipping_district}</div>
            <div style="font-size:11px;">${order.shipping_address}</div>
            <div style="margin-top:5px; font-size:11px;"><strong>Paquetería:</strong> ${order.tracking_courier || 'Envío Estándar'} | <strong>Guía:</strong> ${order.tracking_number || 'Por Asignar'}</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width:40px; text-align:center;">Verif.</th>
              <th>Producto & Descripción</th>
              <th style="width:60px; text-align:center;">Cant.</th>
              <th style="width:80px; text-align:right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <div style="margin-top:20px; text-align:right; font-size:15px; font-weight:bold;">
          Monto Total: $${order.total.toFixed(2)} USD (${order.payment_method.toUpperCase()})
        </div>

        <div class="footer">
          <p><strong>starTAP Panamá</strong> — ¡Gracias por confiar en nosotros!</p>
          <p>Soporte post-venta: pedidos@startap.com.pa | WhatsApp +507 6713-4341</p>
        </div>
      </body>
      </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const handleOpenOrderModal = (o: Order) => {
    setSelectedOrder(o);
    setTrackingCourierInput(o.tracking_courier || 'UnoExpress');
    setTrackingNumberInput(o.tracking_number || '');
    setAdminNotesInput(o.admin_notes || '');
  };

  const handleSaveOrderDetails = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;

    dbLocal.updateOrderDetails(selectedOrder.id, {
      tracking_courier: trackingCourierInput,
      tracking_number: trackingNumberInput,
      admin_notes: adminNotesInput,
    });

    loadData();
    setSelectedOrder(prev => prev ? { ...prev, tracking_courier: trackingCourierInput, tracking_number: trackingNumberInput, admin_notes: adminNotesInput } : null);
    alert('¡Datos de seguimiento y envío guardados correctamente!');
  };

  const handleToggleProductStock = (id: string, currentStock: boolean | undefined) => {
    const nextStock = currentStock === undefined ? false : !currentStock;
    dbLocal.toggleProductStock(id, nextStock);
    loadData();
  };

  const handleUpdateB2bStatus = (id: string, status: B2bQuote['status']) => {
    dbLocal.updateB2bQuoteStatus(id, status);
    loadData();
  };

  const handleDeleteB2bQuote = (id: string) => {
    if (window.confirm('¿Deseas eliminar esta solicitud de cotización B2B?')) {
      dbLocal.deleteB2bQuote(id);
      loadData();
    }
  };

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCouponCode.trim()) return;

    const numVal = parseFloat(newCouponValue);
    const couponData: Coupon = {
      code: newCouponCode.trim().toUpperCase(),
      type: newCouponType,
      value: isNaN(numVal) ? 0 : numVal,
      description: newCouponDescription.trim() || (
        newCouponType === 'free_shipping' ? 'Envío gratis en todo Panamá' :
        newCouponType === 'percent' ? `${numVal}% de descuento` :
        `$${numVal.toFixed(2)} USD de descuento`
      ),
      is_active: true,
    };

    dbLocal.saveCoupon(couponData);
    setCreateCouponSuccess(true);
    setNewCouponCode('');
    setNewCouponValue('');
    setNewCouponDescription('');
    loadData();
    setTimeout(() => setCreateCouponSuccess(false), 2500);
  };

  const handleToggleCoupon = (code: string, currentStatus: boolean) => {
    dbLocal.toggleCouponActive(code, !currentStatus);
    loadData();
  };

  const handleDeleteCoupon = (code: string) => {
    if (window.confirm(`¿Estás seguro de que deseas eliminar el cupón "${code}"?`)) {
      dbLocal.deleteCoupon(code);
      loadData();
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

  const handleMarkAbandonedCompleted = (emailOrPhone: string) => {
    dbLocal.markAbandonedCheckoutCompleted(emailOrPhone);
    loadData();
  };

  const handleDeleteAbandoned = (id: string) => {
    if (window.confirm('¿Estás seguro de que deseas descartar este registro de carrito abandonado?')) {
      dbLocal.deleteAbandonedCheckout(id);
      loadData();
    }
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

  const filteredAbandoned = abandonedCheckouts.filter(item => {
    const query = abandonedSearch.toLowerCase().trim();
    const matchesSearch = !query || 
      item.id.toLowerCase().includes(query) ||
      (item.customer_name && item.customer_name.toLowerCase().includes(query)) ||
      (item.customer_email && item.customer_email.toLowerCase().includes(query)) ||
      (item.customer_phone && item.customer_phone.includes(query)) ||
      (item.shipping_province && item.shipping_province.toLowerCase().includes(query)) ||
      (item.shipping_district && item.shipping_district.toLowerCase().includes(query));

    const matchesStatus = abandonedStatusFilter === 'all' || item.status === abandonedStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingAbandoned = abandonedCheckouts.filter(a => a.status === 'abandoned');
  const pendingAbandonedCount = pendingAbandoned.length;
  const abandonedTotalAtRisk = pendingAbandoned.reduce((sum, a) => sum + (a.total || 0), 0);
  const recoveredAbandonedCount = abandonedCheckouts.filter(a => a.status === 'completed' || a.status === 'recovered').length;

  // CRM Clientes Filtering & Metrics
  const filteredCustomers = customers.filter(c => {
    const q = customerSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      (c.name && c.name.toLowerCase().includes(q)) ||
      (c.email && c.email.toLowerCase().includes(q)) ||
      (c.phone && c.phone.includes(q)) ||
      (c.province && c.province.toLowerCase().includes(q));

    const matchesFilter = customerFilter === 'all' || (customerFilter === 'vip' ? c.ordersCount > 1 : c.ordersCount <= 1);
    return matchesSearch && matchesFilter;
  });

  const vipCustomersCount = customers.filter(c => c.ordersCount > 1).length;
  const totalLtvSum = customers.reduce((s, c) => s + c.totalSpent, 0);
  const avgLtv = customers.length > 0 ? totalLtvSum / customers.length : 0;

  // B2B Quotes Filtering & Metrics
  const filteredB2bQuotes = b2bQuotes.filter(q => {
    const s = b2bSearch.toLowerCase().trim();
    const matchesSearch = !s ||
      (q.business_name && q.business_name.toLowerCase().includes(s)) ||
      (q.name && q.name.toLowerCase().includes(s)) ||
      (q.email && q.email.toLowerCase().includes(s)) ||
      (q.phone && q.phone.includes(s));

    const matchesStatus = b2bStatusFilter === 'all' || q.status === b2bStatusFilter;
    return matchesSearch && matchesStatus;
  });

  const pendingB2bCount = b2bQuotes.filter(q => q.status === 'pending').length;
  const wonB2bCount = b2bQuotes.filter(q => q.status === 'won').length;

  // Financial E-commerce Metrics
  const totalRevenue = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const avgOrderValue = orders.length > 0 ? totalRevenue / orders.length : 0;
  const fulfillmentRate = orders.length > 0 ? Math.round((orders.filter(o => o.status === 'delivered' || o.status === 'shipped').length / orders.length) * 100) : 0;

  const yappyOrdersCount = orders.filter(o => o.payment_method === 'yappy').length;
  const cardOrdersCount = orders.filter(o => o.payment_method === 'tarjeta').length;

  const provinceDemandMap: { [prov: string]: number } = {};
  orders.forEach(o => {
    const prov = o.shipping_province || 'Sin especificar';
    provinceDemandMap[prov] = (provinceDemandMap[prov] || 0) + 1;
  });
  const topProvinces = Object.entries(provinceDemandMap).sort((a, b) => b[1] - a[1]);

  return (
    <main className="flex-1 w-full">

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
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Package className="w-5 h-5 text-blue-500" />
                        Gestión & Fulfillment de Pedidos (Shopify Style)
                      </h2>
                      <p className="text-xs text-slate-500">Administra el estado de preparación, grabación NFC, guías y despachos en Panamá.</p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={exportOrdersToCsv}
                        className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0"
                      >
                        <Download className="w-4 h-4 text-amber-400" />
                        <span>Exportar Pedidos CSV</span>
                      </button>

                      {(orderSearch || orderStatusFilter !== 'all' || orderPaymentFilter !== 'all') && (
                        <button
                          onClick={() => {
                            setOrderSearch('');
                            setOrderStatusFilter('all');
                            setOrderPaymentFilter('all');
                          }}
                          className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                        >
                          <X className="w-3 h-3" /> Limpiar
                        </button>
                      )}
                    </div>
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
                        className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4 shadow-sm hover:border-blue-300 transition"
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
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">Estado:</span>
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

                        {/* Order Card Actions */}
                        <div className="pt-3 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2 text-xs">
                            {order.tracking_number ? (
                              <span className="font-semibold text-purple-700 bg-purple-50 border border-purple-200 px-2.5 py-1 rounded-lg">
                                📦 {order.tracking_courier || 'Guía'}: <strong>{order.tracking_number}</strong>
                              </span>
                            ) : (
                              <span className="text-[11px] text-slate-400 italic">Sin guía asignada</span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handlePrintPackingSlip(order)}
                              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1"
                            >
                              <Printer className="w-3.5 h-3.5 text-slate-600" /> Imprimir Remisión
                            </button>

                            <button
                              type="button"
                              onClick={() => handleOpenOrderModal(order)}
                              className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-xs"
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-400" /> Ver Detalle & Guía
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

              </div>
            )}

            {/* ---------------- MODULE: CLIENTES & CRM (DIRECTORIO DE COMPRADORES) ---------------- */}
            {activeTab === 'customers' && (
              <div className="space-y-6">

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Total Clientes CRM</span>
                      <Users className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-2">{customers.length}</div>
                    <p className="text-[11px] text-slate-500 mt-1">Compradores y registros únicos</p>
                  </div>

                  <div className="bg-white border border-blue-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-blue-700">Clientes VIP Recurrentes</span>
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-2">{vipCustomersCount}</div>
                    <p className="text-[11px] text-slate-500 mt-1">Con 2 o más pedidos realizados</p>
                  </div>

                  <div className="bg-white border border-amber-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Valor de Vida Promedio (LTV)</span>
                      <DollarSign className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-2">${avgLtv.toFixed(2)} USD</div>
                    <p className="text-[11px] text-slate-500 mt-1">Gasto promedio acumulado por cliente</p>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-emerald-500" />
                        Directorio de Clientes & CRM (Shopify Style)
                      </h2>
                      <p className="text-xs text-slate-500">Historial unificado de compradores, valor acumulado LTV y contacto directo.</p>
                    </div>

                    <button
                      onClick={exportCustomersToCsv}
                      className="py-2 px-4 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center gap-1.5 shrink-0"
                    >
                      <Download className="w-4 h-4 text-amber-400" />
                      <span>Exportar Clientes CSV</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={customerSearch}
                        onChange={(e) => setCustomerSearch(e.target.value)}
                        placeholder="Buscar por cliente, correo, celular o provincia..."
                        className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
                      />
                    </div>

                    <select
                      value={customerFilter}
                      onChange={(e) => setCustomerFilter(e.target.value as any)}
                      className="bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none"
                    >
                      <option value="all">Segmento: Todos ({customers.length})</option>
                      <option value="vip">Clientes VIP / Recurrentes ({vipCustomersCount})</option>
                      <option value="single">Primera Compra ({customers.length - vipCustomersCount})</option>
                    </select>
                  </div>
                </div>

                {/* Customers Table */}
                <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-sm">
                  <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                      Directorio de Compradores ({filteredCustomers.length})
                    </h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                          <th className="p-3.5">Cliente / Comercio</th>
                          <th className="p-3.5">Celular / WhatsApp</th>
                          <th className="p-3.5">Ubicación</th>
                          <th className="p-3.5 text-center">Pedidos</th>
                          <th className="p-3.5 text-right">Gasto Acumulado (LTV)</th>
                          <th className="p-3.5 text-center">Acción Directa</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {filteredCustomers.length === 0 ? (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-400 text-xs italic">
                              No hay clientes registrados que coincidan con la búsqueda.
                            </td>
                          </tr>
                        ) : (
                          filteredCustomers.map((c) => {
                            const cleanPhoneDigits = (c.phone || '').replace(/\D/g, '');
                            const formattedWaNumber = cleanPhoneDigits.startsWith('507')
                              ? cleanPhoneDigits
                              : cleanPhoneDigits.length === 8
                              ? `507${cleanPhoneDigits}`
                              : cleanPhoneDigits;

                            const firstName = c.name ? c.name.split(' ')[0] : 'Estimado/a';
                            const waMessage = `¡Hola ${firstName}! Te saluda el equipo de starTAP Panamá. 🇵🇦\n\n¿Cómo ha sido tu experiencia con tus dispositivos TAP para reseñas de Google Maps?\n\nSi necesitas personalizar un nuevo equipo o agregar sucursales a tu cuenta, cuenta con nosotros.`;
                            const waUrl = formattedWaNumber
                              ? `https://wa.me/${formattedWaNumber}?text=${encodeURIComponent(waMessage)}`
                              : null;

                            return (
                              <tr key={c.email} className="hover:bg-slate-50">
                                <td className="p-3.5">
                                  <p className="font-bold text-slate-900">{c.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono">{c.email}</p>
                                </td>
                                <td className="p-3.5">
                                  {c.phone ? (
                                    <span className="font-mono font-semibold text-slate-800">📱 {c.phone}</span>
                                  ) : (
                                    <span className="text-slate-400 italic text-[11px]">Sin teléfono</span>
                                  )}
                                </td>
                                <td className="p-3.5 font-medium text-slate-700">
                                  {c.province ? `${c.province}${c.district ? `, ${c.district}` : ''}` : 'No registrada'}
                                </td>
                                <td className="p-3.5 text-center">
                                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase border ${
                                    c.ordersCount > 1
                                      ? 'bg-blue-100 text-blue-800 border-blue-300'
                                      : 'bg-slate-100 text-slate-700 border-slate-300'
                                  }`}>
                                    {c.ordersCount} {c.ordersCount === 1 ? 'pedido' : 'pedidos'}
                                  </span>
                                </td>
                                <td className="p-3.5 text-right font-black text-emerald-700 font-mono text-sm">
                                  ${c.totalSpent.toFixed(2)}
                                </td>
                                <td className="p-3.5 text-center">
                                  {waUrl ? (
                                    <a
                                      href={waUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[10px] rounded-lg shadow-xs transition"
                                    >
                                      <MessageCircle className="w-3.5 h-3.5" />
                                      <span>WhatsApp</span>
                                    </a>
                                  ) : (
                                    <a
                                      href={`mailto:${c.email}`}
                                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-[10px] rounded-lg transition"
                                    >
                                      <Mail className="w-3.5 h-3.5" />
                                      <span>Correo</span>
                                    </a>
                                  )}
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

            {/* ---------------- MODULE: CARRITOS & CHECKOUTS ABANDONADOS (RECUPERACIÓN CRO) ---------------- */}
            {activeTab === 'abandoned' && (
              <div className="space-y-6">

                {/* KPI Metric Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-rose-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-600">En Abandono</span>
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse"></span>
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-2">{pendingAbandonedCount}</div>
                    <p className="text-[11px] text-slate-500 mt-1">Checkouts iniciados sin pago completado</p>
                  </div>

                  <div className="bg-white border border-amber-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Monto en Riesgo CRO</span>
                      <DollarSign className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-2">${abandonedTotalAtRisk.toFixed(2)}</div>
                    <p className="text-[11px] text-slate-500 mt-1">Valor recuperable contactando por WhatsApp</p>
                  </div>

                  <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Recuperados / Pagados</span>
                      <CheckCircle className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-2">{recoveredAbandonedCount}</div>
                    <p className="text-[11px] text-slate-500 mt-1">Convertidos exitosamente a orden activa</p>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <ShoppingCart className="w-5 h-5 text-rose-500" />
                        Carritos Abandonados & Recuperación por WhatsApp
                      </h2>
                      <p className="text-xs text-slate-500">
                        Clientes que iniciaron checkout e ingresaron su contacto. Conviértelos con 1 clic directo a WhatsApp.
                      </p>
                    </div>
                    {(abandonedSearch || abandonedStatusFilter !== 'all') && (
                      <button
                        onClick={() => {
                          setAbandonedSearch('');
                          setAbandonedStatusFilter('all');
                        }}
                        className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                      >
                        <X className="w-3 h-3" /> Limpiar Filtros
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={abandonedSearch}
                        onChange={(e) => setAbandonedSearch(e.target.value)}
                        placeholder="Buscar por cliente, email, WhatsApp, provincia..."
                        className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
                      />
                    </div>

                    <select
                      value={abandonedStatusFilter}
                      onChange={(e) => setAbandonedStatusFilter(e.target.value as any)}
                      className="bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none"
                    >
                      <option value="all">Estado: Todos ({abandonedCheckouts.length})</option>
                      <option value="abandoned">Pendientes de Recuperar ({pendingAbandonedCount})</option>
                      <option value="completed">Completados / Recuperados ({recoveredAbandonedCount})</option>
                    </select>
                  </div>
                </div>

                {/* Abandoned Checkouts List */}
                {filteredAbandoned.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
                    <div className="w-14 h-14 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400">
                      <ShoppingCart className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">No hay carritos abandonados que coincidan</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Tan pronto un visitante ingrese su correo o teléfono en el checkout y no finalice el pago, aparecerá aquí inmediatamente con su botón de contacto rápido.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAbandoned.map((item) => {
                      const cleanPhoneDigits = (item.customer_phone || '').replace(/\D/g, '');
                      const formattedWaNumber = cleanPhoneDigits.startsWith('507')
                        ? cleanPhoneDigits
                        : cleanPhoneDigits.length === 8
                        ? `507${cleanPhoneDigits}`
                        : cleanPhoneDigits;

                      const firstName = item.customer_name ? item.customer_name.split(' ')[0] : 'Estimado/a';
                      const itemsSummary = item.items && item.items.length > 0
                        ? item.items.map((i) => `${i.quantity}x ${i.product_name}`).join(', ')
                        : 'dispositivos starTAP';

                      const waMessage = `¡Hola ${firstName}! Te saluda el equipo de starTAP Panamá. 🇵🇦\n\nVimos que estuviste por completar tu pedido de ${itemsSummary} ($${item.total.toFixed(2)} USD), pero no lograste finalizar el pago.\n\n¿Tuviste algún inconveniente con el método de pago (Yappy o tarjeta) o con la dirección de entrega?\n\nSi gustas, podemos completártelo directamente por aquí por Yappy para programar tu entrega hoy mismo. ¿Te gustaría que te ayude?`;
                      const waUrl = formattedWaNumber
                        ? `https://wa.me/${formattedWaNumber}?text=${encodeURIComponent(waMessage)}`
                        : null;

                      const mailtoUrl = item.customer_email
                        ? `mailto:${item.customer_email}?subject=${encodeURIComponent('Tu pedido en starTAP Panamá')}&body=${encodeURIComponent(waMessage)}`
                        : null;

                      const isCompleted = item.status === 'completed' || item.status === 'recovered';

                      return (
                        <div
                          key={item.id}
                          className={`bg-white border rounded-3xl p-5 md:p-6 shadow-sm transition space-y-4 ${
                            isCompleted ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 hover:border-amber-300'
                          }`}
                        >
                          {/* Top Header Card */}
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-xs font-black text-slate-800 bg-slate-100 px-2.5 py-1 rounded-lg">
                                {item.id}
                              </span>
                              <span
                                className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${
                                  isCompleted
                                    ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                    : 'bg-rose-100 text-rose-800 border-rose-300 animate-pulse'
                                }`}
                              >
                                {isCompleted ? '✓ Recuperado / Pagado' : '⚠️ Carrito Abandonado'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              <span>{new Date(item.created_at).toLocaleString('es-PA', { dateStyle: 'medium', timeStyle: 'short' })}</span>
                            </div>
                          </div>

                          {/* Info Grid */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
                            <div>
                              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-1">Cliente Potencial</h4>
                              <p className="font-bold text-slate-900 text-sm">{item.customer_name || 'Nombre no provisto'}</p>
                              <p className="text-[11px] text-slate-600 font-mono mt-0.5">{item.customer_email || 'Sin correo'}</p>
                              {item.customer_phone ? (
                                <p className="text-xs text-emerald-700 font-bold mt-1 flex items-center gap-1">
                                  📱 {item.customer_phone}
                                </p>
                              ) : (
                                <p className="text-[11px] text-slate-400 italic mt-0.5">Sin teléfono celular</p>
                              )}
                            </div>

                            <div>
                              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-1">Destino de Envío</h4>
                              <p className="font-semibold text-slate-800">
                                {item.shipping_province ? `${item.shipping_province}${item.shipping_district ? `, ${item.shipping_district}` : ''}` : 'Provincia sin seleccionar'}
                              </p>
                              <p className="text-[11px] text-slate-500 mt-1">
                                Productos: <strong className="text-slate-900">{itemsSummary}</strong>
                              </p>
                            </div>

                            <div>
                              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-1">Valor en Carrito</h4>
                              <p className="text-xl font-black text-slate-900">${item.total.toFixed(2)} USD</p>
                              <p className="text-[10px] text-slate-500 mt-0.5">{item.items.reduce((s, i) => s + i.quantity, 0)} unidades en espera</p>
                            </div>
                          </div>

                          {/* Action Buttons */}
                          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2.5">
                            <div className="flex flex-wrap items-center gap-2">
                              {waUrl ? (
                                <a
                                  href={waUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                  <span>Recuperar por WhatsApp (1 Clic)</span>
                                </a>
                              ) : (
                                <span className="text-[11px] text-slate-400 italic py-1">
                                  (Sin WhatsApp disponible)
                                </span>
                              )}

                              {mailtoUrl && (
                                <a
                                  href={mailtoUrl}
                                  className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition"
                                >
                                  <Mail className="w-3.5 h-3.5 text-slate-600" />
                                  <span>Enviar Correo</span>
                                </a>
                              )}
                            </div>

                            <div className="flex items-center gap-2">
                              {!isCompleted && (
                                <button
                                  type="button"
                                  onClick={() => handleMarkAbandonedCompleted(item.customer_email || item.customer_phone || '')}
                                  className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs font-bold rounded-xl transition"
                                >
                                  ✓ Marcar como Pagado
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleDeleteAbandoned(item.id)}
                                title="Descartar registro"
                                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

              </div>
            )}

            {/* ---------------- MODULE: COTIZACIONES CORPORATIVAS B2B ---------------- */}
            {activeTab === 'b2b' && (
              <div className="space-y-6">

                {/* KPI Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-white border border-indigo-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-700">Solicitudes B2B</span>
                      <Building2 className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-2">{b2bQuotes.length}</div>
                    <p className="text-[11px] text-slate-500 mt-1">Cotizaciones corporativas recibidas</p>
                  </div>

                  <div className="bg-white border border-amber-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-amber-700">Pendientes</span>
                      <Clock className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-2">{pendingB2bCount}</div>
                    <p className="text-[11px] text-slate-500 mt-1">Por atender o enviar propuesta</p>
                  </div>

                  <div className="bg-white border border-emerald-200 rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">Ganadas / Cerradas</span>
                      <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-2">{wonB2bCount}</div>
                    <p className="text-[11px] text-slate-500 mt-1">Contratos B2B concretados</p>
                  </div>
                </div>

                {/* Filter & Search Bar */}
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-sm">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Building2 className="w-5 h-5 text-indigo-600" />
                        Bandeja de Cotizaciones B2B Corporativas
                      </h2>
                      <p className="text-xs text-slate-500">Solicitudes masivas de empresas, cadenas y hoteles enviadas desde /corporativo.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                      <input
                        type="text"
                        value={b2bSearch}
                        onChange={(e) => setB2bSearch(e.target.value)}
                        placeholder="Buscar por empresa, contacto, correo..."
                        className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
                      />
                    </div>

                    <select
                      value={b2bStatusFilter}
                      onChange={(e) => setB2bStatusFilter(e.target.value as any)}
                      className="bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none"
                    >
                      <option value="all">Estado: Todos ({b2bQuotes.length})</option>
                      <option value="pending">Pendiente de Atención ({pendingB2bCount})</option>
                      <option value="contacted">En Contacto / Negociación</option>
                      <option value="won">Ganada / Venta Cerrada ({wonB2bCount})</option>
                      <option value="lost">Desestimada / Perdida</option>
                    </select>
                  </div>
                </div>

                {/* B2B Quotes List */}
                {filteredB2bQuotes.length === 0 ? (
                  <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
                    <div className="w-14 h-14 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto">
                      <Building2 className="w-7 h-7" />
                    </div>
                    <h3 className="text-base font-bold text-slate-800">No hay solicitudes B2B que coincidan</h3>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Las cotizaciones de volumen y planes corporativos solicitados desde la página /corporativo aparecerán aquí.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredB2bQuotes.map((quote) => {
                      const cleanPhoneDigits = (quote.phone || '').replace(/\D/g, '');
                      const formattedWaNumber = cleanPhoneDigits.startsWith('507')
                        ? cleanPhoneDigits
                        : cleanPhoneDigits.length === 8
                        ? `507${cleanPhoneDigits}`
                        : cleanPhoneDigits;

                      const firstName = quote.name ? quote.name.split(' ')[0] : 'Estimado/a';
                      const b2bMessage = `¡Hola ${firstName}! Te saluda el equipo B2B de starTAP Panamá. 🇵🇦\n\nRecibimos tu solicitud de cotización corporativa para ${quote.business_name} (${quote.quantity} unidades).\n\nNos encantaría enviarte nuestra propuesta formal con descuento por volumen, branding personalizado y factura fiscal. ¿A qué hora podemos llamarte o coordinar la presentación?`;
                      const waUrl = formattedWaNumber
                        ? `https://wa.me/${formattedWaNumber}?text=${encodeURIComponent(b2bMessage)}`
                        : null;

                      return (
                        <div
                          key={quote.id}
                          className="bg-white border border-slate-200 rounded-3xl p-5 md:p-6 shadow-sm space-y-4 hover:border-indigo-300 transition"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-xs font-black text-indigo-900 bg-indigo-50 px-2.5 py-1 rounded-lg">
                                {quote.id}
                              </span>
                              <span className="font-bold text-slate-900 text-sm">{quote.business_name}</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Estado:</span>
                              <select
                                value={quote.status}
                                onChange={(e) => handleUpdateB2bStatus(quote.id, e.target.value as any)}
                                className="bg-slate-50 border border-slate-300 text-xs font-bold rounded-lg px-2.5 py-1 text-slate-800 focus:outline-none"
                              >
                                <option value="pending">🟡 Pendiente</option>
                                <option value="contacted">🔵 En Contacto</option>
                                <option value="won">🟢 Ganada / Cerrada</option>
                                <option value="lost">🔴 Perdida</option>
                              </select>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600">
                            <div>
                              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-1">Contacto Empresarial</h4>
                              <p className="font-bold text-slate-900">{quote.name}</p>
                              <p className="text-[11px] text-slate-500 font-mono mt-0.5">{quote.email}</p>
                              <p className="text-xs text-emerald-700 font-bold mt-1">📱 {quote.phone}</p>
                            </div>

                            <div>
                              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-1">Volumen Solicitado</h4>
                              <span className="px-3 py-1 bg-indigo-50 text-indigo-800 border border-indigo-200 rounded-lg font-black text-xs uppercase inline-block">
                                {quote.quantity} unidades
                              </span>
                              <p className="text-[10px] text-slate-400 mt-1 font-mono">
                                Solicitado: {new Date(quote.created_at).toLocaleDateString('es-PA')}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[10px] mb-1">Requerimientos Específicos</h4>
                              <p className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 italic leading-relaxed">
                                {quote.notes || 'Sin notas adicionales especificadas.'}
                              </p>
                            </div>
                          </div>

                          <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                            {waUrl ? (
                              <a
                                href={waUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                              >
                                <MessageCircle className="w-4 h-4" />
                                <span>Enviar Propuesta Formal por WhatsApp (1 Clic)</span>
                              </a>
                            ) : (
                              <span className="text-xs text-slate-400 italic">Sin teléfono disponible</span>
                            )}

                            <button
                              onClick={() => handleDeleteB2bQuote(quote.id)}
                              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition"
                              title="Eliminar registro B2B"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
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
                          <th className="p-3.5 text-center">Stock</th>
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
                            <td className="p-3.5 text-center">
                              <button
                                type="button"
                                onClick={() => handleToggleProductStock(p.id, p.in_stock)}
                                className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition ${
                                  p.in_stock === false
                                    ? 'bg-rose-100 text-rose-800 border-rose-300'
                                    : 'bg-emerald-100 text-emerald-800 border-emerald-300'
                                }`}
                              >
                                {p.in_stock === false ? '🔴 Agotado' : '🟢 En Stock'}
                              </button>
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

            {/* ---------------- MODULE 4: ANALÍTICAS Y FINANZAS E-COMMERCE ---------------- */}
            {activeTab === 'analytics' && (
              <div className="space-y-6">

                {/* Header informativo */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 text-purple-600 font-bold text-xs uppercase tracking-wider bg-purple-50 px-2.5 py-1 rounded-full mb-1">
                      <BarChart2 className="w-3.5 h-3.5" /> Dashboard Financiero & Operativo
                    </div>
                    <h2 className="text-xl font-black text-slate-900 uppercase">Analíticas E-Commerce starTAP Panamá</h2>
                    <p className="text-xs text-slate-500 mt-1">Ingresos, ticket promedio, cumplimiento de pedidos, pasarelas de pago y demografía regional.</p>
                  </div>
                </div>

                {/* KPI Financial Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <span>Ventas Totales</span>
                      <DollarSign className="w-4 h-4 text-emerald-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-2 font-mono">${totalRevenue.toFixed(2)} USD</div>
                    <p className="text-[11px] text-slate-400 mt-1">Ingresos brutos acumulados</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <span>Ticket Promedio (AOV)</span>
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-2 font-mono">${avgOrderValue.toFixed(2)} USD</div>
                    <p className="text-[11px] text-slate-400 mt-1">Valor promedio por pedido</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <span>Tasa de Despacho</span>
                      <Truck className="w-4 h-4 text-amber-500" />
                    </div>
                    <div className="text-2xl font-black text-slate-900 mt-2">{fulfillmentRate}%</div>
                    <p className="text-[11px] text-slate-400 mt-1">Pedidos entregados / enviados</p>
                  </div>

                  <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
                    <div className="flex items-center justify-between text-slate-500 text-xs font-bold uppercase tracking-wider">
                      <span>Métodos de Pago</span>
                      <CreditCard className="w-4 h-4 text-indigo-500" />
                    </div>
                    <div className="text-base font-black text-slate-900 mt-2 space-y-1">
                      <div className="flex justify-between text-xs">
                        <span className="text-sky-700 font-bold">💙 Yappy:</span>
                        <span className="font-mono font-bold">{yappyOrdersCount} ({orders.length ? Math.round((yappyOrdersCount/orders.length)*100) : 0}%)</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-indigo-700 font-bold">💳 Tarjeta (Tilopay):</span>
                        <span className="font-mono font-bold">{cardOrdersCount} ({orders.length ? Math.round((cardOrdersCount/orders.length)*100) : 0}%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Panama Province Demand Ranking & Scans Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Top Provinces */}
                  <div className="md:col-span-5 bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-rose-500" /> Demanda por Provincia (Panamá)
                      </h3>
                      <span className="text-[10px] font-bold bg-slate-100 px-2 py-0.5 rounded-full text-slate-600">{topProvinces.length} regiones</span>
                    </div>

                    {topProvinces.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">No hay registros de envío aún.</p>
                    ) : (
                      <div className="space-y-2.5">
                        {topProvinces.map(([prov, count], idx) => {
                          const percentage = orders.length > 0 ? Math.round((count / orders.length) * 100) : 0;
                          return (
                            <div key={prov} className="space-y-1">
                              <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                                <span className="flex items-center gap-2">
                                  <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 text-[10px] flex items-center justify-center font-mono">{idx + 1}</span>
                                  {prov}
                                </span>
                                <span className="font-mono">{count} pedidos ({percentage}%)</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div className="bg-slate-900 h-full rounded-full transition-all" style={{ width: `${percentage}%` }}></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Comercio/Usuario Table */}
                  <div className="md:col-span-7 space-y-4">
                    {/* Filter & Search Bar */}
                    <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                            <Users className="w-4 h-4 text-purple-500" />
                            Uso por Comercio / Propietario TAP
                          </h3>
                          <p className="text-[11px] text-slate-500">Métricas de escaneos NFC y QR agrupadas por cliente.</p>
                        </div>
                        {analyticsSearch && (
                          <button
                            onClick={() => setAnalyticsSearch('')}
                            className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
                          >
                            <X className="w-3 h-3" /> Limpiar
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
                            placeholder="Buscar por usuario o correo..."
                            className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl pl-9 pr-3 py-2 text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
                          />
                        </div>

                        <select
                          value={analyticsSort}
                          onChange={(e) => setAnalyticsSort(e.target.value as any)}
                          className="bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2 text-slate-800 font-semibold focus:outline-none"
                        >
                          <option value="scans">Mayor N° Escaneos 📈</option>
                          <option value="cards">Mayor N° Dispositivos 📱</option>
                        </select>
                      </div>
                    </div>

                    {/* User Metrics Table */}
                    <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden shadow-xs">
                      <div className="p-3 bg-slate-50 border-b border-slate-200">
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                          Comercios Registrados ({userMetricsList.length})
                        </h4>
                      </div>

                      <div className="overflow-x-auto max-h-96">
                        <table className="w-full text-left text-xs border-collapse">
                          <thead>
                            <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider text-[10px]">
                              <th className="p-3">Usuario / Comercio</th>
                              <th className="p-3 text-center">TAP</th>
                              <th className="p-3 text-center">NFC</th>
                              <th className="p-3 text-center">QR</th>
                              <th className="p-3 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                            {userMetricsList.map((u) => (
                              <tr key={u.email} className="hover:bg-slate-50">
                                <td className="p-3">
                                  <p className="font-bold text-slate-900">{u.name}</p>
                                  <p className="text-[10px] text-slate-400 font-mono truncate max-w-[160px]">{u.email}</p>
                                </td>
                                <td className="p-3 text-center font-bold text-amber-700">
                                  {u.cardCount}
                                </td>
                                <td className="p-3 text-center font-bold text-emerald-600">
                                  {u.nfcCount}
                                </td>
                                <td className="p-3 text-center font-bold text-blue-600">
                                  {u.qrCount}
                                </td>
                                <td className="p-3 text-right font-black text-slate-900">
                                  {u.scanCount}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
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

            {/* ---------------- MODULE 6: GESTOR DE CUPONES DE DESCUENTO ---------------- */}
            {activeTab === 'coupons' && (
              <div className="space-y-6">
                {/* Header informativo */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase tracking-wider bg-emerald-50 px-2.5 py-1 rounded-full mb-1">
                      <Percent className="w-3.5 h-3.5" /> Promociones & Descuentos
                    </div>
                    <h2 className="text-xl font-black text-slate-900 uppercase">Gestor de Cupones de Descuento</h2>
                    <p className="text-xs text-slate-500 mt-1">Crea y administra códigos promocionales activos en la tienda y checkout de starTAP Panamá.</p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="bg-slate-100 px-4 py-2 rounded-xl text-center border border-slate-200">
                      <span className="text-xs font-bold text-slate-500 block">Cupones Activos</span>
                      <span className="text-lg font-black text-slate-900">{coupons.filter(c => c.is_active !== false).length} / {coupons.length}</span>
                    </div>
                  </div>
                </div>

                {/* Formulario de creación de cupón */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs space-y-4">
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wide flex items-center gap-2">
                    <Plus className="w-4 h-4 text-emerald-600" /> Generar Nuevo Cupón
                  </h3>

                  {createCouponSuccess && (
                    <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold p-3.5 rounded-xl flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                      <span>¡Cupón creado con éxito! Ya se encuentra disponible para ser usado por tus clientes en el checkout.</span>
                    </div>
                  )}

                  <form onSubmit={handleCreateCoupon} className="grid grid-cols-1 md:grid-cols-12 gap-4">
                    <div className="md:col-span-3 space-y-1">
                      <label className="text-xs font-bold text-slate-700">Código del Cupón</label>
                      <input
                        type="text"
                        required
                        value={newCouponCode}
                        onChange={(e) => setNewCouponCode(e.target.value.toUpperCase())}
                        placeholder="EJ: VERANO2026"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs uppercase font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none"
                      />
                    </div>

                    <div className="md:col-span-3 space-y-1">
                      <label className="text-xs font-bold text-slate-700">Tipo de Descuento</label>
                      <select
                        value={newCouponType}
                        onChange={(e) => setNewCouponType(e.target.value as CouponType)}
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none"
                      >
                        <option value="percent">Porcentaje (%) sobre Subtotal</option>
                        <option value="fixed">Monto Fijo en USD ($)</option>
                        <option value="free_shipping">Envío Gratis</option>
                      </select>
                    </div>

                    {newCouponType !== 'free_shipping' && (
                      <div className="md:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-slate-700">
                          {newCouponType === 'percent' ? 'Porcentaje (%)' : 'Monto USD ($)'}
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          required
                          value={newCouponValue}
                          onChange={(e) => setNewCouponValue(e.target.value)}
                          placeholder={newCouponType === 'percent' ? '15' : '5.00'}
                          className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none"
                        />
                      </div>
                    )}

                    <div className={`${newCouponType === 'free_shipping' ? 'md:col-span-6' : 'md:col-span-4'} space-y-1`}>
                      <label className="text-xs font-bold text-slate-700">Descripción Promocional</label>
                      <input
                        type="text"
                        value={newCouponDescription}
                        onChange={(e) => setNewCouponDescription(e.target.value)}
                        placeholder="Ej: 15% OFF por promoción de lanzamiento"
                        className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none"
                      />
                    </div>

                    <div className="md:col-span-12 flex justify-end pt-2">
                      <button
                        type="submit"
                        className="bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs px-6 py-2.5 rounded-xl shadow-sm transition flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4 text-amber-400" /> Crear y Activar Cupón
                      </button>
                    </div>
                  </form>
                </div>

                {/* Listado de cupones */}
                <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
                  <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">Listado de Cupones ({coupons.length})</h3>
                    <div className="relative w-full sm:w-64">
                      <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={couponSearch}
                        onChange={(e) => setCouponSearch(e.target.value)}
                        placeholder="Buscar por código..."
                        className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:bg-white focus:ring-1 focus:ring-slate-900 outline-none"
                      />
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 overflow-x-auto">
                    {coupons
                      .filter(c => !couponSearch || c.code.toLowerCase().includes(couponSearch.toLowerCase()) || c.description.toLowerCase().includes(couponSearch.toLowerCase()))
                      .map((c) => (
                        <div key={c.code} className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-slate-50/50 transition">
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-black text-sm text-slate-900 bg-amber-400/20 text-amber-950 px-3 py-1 rounded-xl border border-amber-300">
                              {c.code}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-900">{c.description}</span>
                                <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                  c.type === 'free_shipping' ? 'bg-blue-100 text-blue-700' :
                                  c.type === 'percent' ? 'bg-purple-100 text-purple-700' :
                                  'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {c.type === 'free_shipping' ? 'Envío Gratis' : c.type === 'percent' ? `${c.value}% OFF` : `$${c.value.toFixed(2)} OFF`}
                                </span>
                              </div>
                              <span className="text-[11px] text-slate-400 block mt-0.5">
                                {c.is_active !== false ? '🟢 Activo en Checkout' : '🔴 Desactivado'}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => copyToClipboard(c.code, c.code, 'coupon')}
                              className="px-3 py-1.5 text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition flex items-center gap-1"
                            >
                              {copiedCardId?.id === c.code ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Tag className="w-3.5 h-3.5" />}
                              {copiedCardId?.id === c.code ? 'Copiado' : 'Copiar'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleToggleCoupon(c.code, c.is_active !== false)}
                              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition ${
                                c.is_active !== false
                                  ? 'bg-amber-100 hover:bg-amber-200 text-amber-800'
                                  : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-800'
                              }`}
                            >
                              {c.is_active !== false ? 'Desactivar' : 'Activar'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteCoupon(c.code)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            )}

          </>
        )}

      </main>
  );
}
