'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { dbLocal, Product, supabase } from '@/lib/db';
import { authService } from '@/lib/auth';
import {
  ArrowLeft,
  Search,
  Tag,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Package,
  X,
  Filter,
  RefreshCw,
  Layers,
  DollarSign
} from 'lucide-react';

export default function ProductosPage() {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [priceInputs, setPriceInputs] = useState<{ [id: string]: string }>({});
  const [priceSuccess, setPriceSuccess] = useState<{ [id: string]: boolean }>({});
  const [priceError, setPriceError] = useState<{ [id: string]: string }>({});

  const fetchProducts = async () => {
    setLoading(true);
    let data = dbLocal.getProducts();
    if (supabase) {
      try {
        const { data: dbData, error } = await supabase.from('products').select('*');
        if (!error && dbData && dbData.length > 0) {
          data = dbData as Product[];
        }
      } catch (e) {
        console.error('Error cargando productos desde Supabase:', e);
      }
    }
    setProducts(data);

    const initPrices: { [id: string]: string } = {};
    data.forEach(p => {
      initPrices[p.id] = (p.price || 0).toFixed(2);
    });
    setPriceInputs(initPrices);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // El precio se guarda en el servidor (llave service_role), no en localStorage:
  // con la llave publica cualquiera podria poner los precios en cero.
  const handleQuickPriceSave = async (productId: string) => {
    const newPriceVal = parseFloat(priceInputs[productId]);
    setPriceError(prev => ({ ...prev, [productId]: '' }));

    if (isNaN(newPriceVal) || newPriceVal <= 0) {
      setPriceError(prev => ({ ...prev, [productId]: 'Ingresa un precio válido mayor a $0.00' }));
      return;
    }

    try {
      const session = await authService.getSession();
      const token = session?.access_token;
      if (!token) {
        setPriceError(prev => ({ ...prev, [productId]: 'Sesión expirada. Vuelve a iniciar sesión.' }));
        return;
      }

      const res = await fetch('/api/admin/precio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: 'Bearer ' + token,
        },
        body: JSON.stringify({ id: productId, precio: newPriceVal }),
      });

      const data = await res.json().catch(() => null);

      if (res.status !== 200 || !data?.success) {
        setPriceError(prev => ({
          ...prev,
          [productId]: data?.error || `No se pudo guardar el precio (HTTP ${res.status}).`,
        }));
        return;
      }

      setPriceSuccess(prev => ({ ...prev, [productId]: true }));
      setTimeout(() => {
        setPriceSuccess(prev => ({ ...prev, [productId]: false }));
      }, 2000);

      dbLocal.updateProductPrice(productId, newPriceVal);
      setProducts(prev =>
        prev.map(p => (p.id === productId ? { ...p, price: newPriceVal } : p))
      );
    } catch (e: any) {
      console.error('[ADMIN_PRECIO_UI]', e);
      setPriceError(prev => ({
        ...prev,
        [productId]: e?.message || 'Error de red al guardar el precio.',
      }));
    }
  };

  const handleToggleStock = (productId: string, currentStock?: boolean) => {
    const newStock = currentStock === false ? true : false;
    dbLocal.toggleProductStock(productId, newStock);
    setProducts(prev =>
      prev.map(p => (p.id === productId ? { ...p, in_stock: newStock } : p))
    );
  };

  const handleDeleteProduct = (productId: string, productName: string) => {
    if (confirm(`¿Estás seguro de que deseas eliminar el producto "${productName}"?`)) {
      dbLocal.deleteProduct(productId);
      setProducts(prev => prev.filter(p => p.id !== productId));
    }
  };

  const filteredProducts = products.filter(p => {
    const q = search.toLowerCase().trim();
    const matchSearch =
      !q ||
      p.name.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      (p.material || '').toLowerCase().includes(q);

    const matchCategory = categoryFilter === 'all' || p.category === categoryFilter;
    const matchType = typeFilter === 'all' || p.type === typeFilter;

    return matchSearch && matchCategory && matchType;
  });

  const totalProducts = products.length;
  const inStockCount = products.filter(p => p.in_stock !== false).length;
  const outOfStockCount = products.filter(p => p.in_stock === false).length;
  const categoriesCount = new Set(products.map(p => p.category)).size;

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto text-center text-slate-500 py-24 space-y-3">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-amber-500" />
        <p className="font-semibold text-sm">Cargando catálogo de productos...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER & BREADCRUMB */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <Link
            href="/master-control"
            className="p-2.5 bg-white rounded-xl border border-slate-200 hover:bg-slate-50 transition shadow-2xs"
          >
            <ArrowLeft className="w-5 h-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Tag className="w-6 h-6 text-amber-500" />
              Gestión de Productos
            </h1>
            <p className="text-slate-500 text-xs sm:text-sm mt-0.5">
              Catálogo oficial, precios, edición de stock y atributos en tiempo real
            </p>
          </div>
        </div>

        <button
          onClick={() => router.push('/master-control/products/new')}
          className="py-3 px-5 bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-md transition flex items-center justify-center gap-2 shrink-0 active:scale-[0.98]"
        >
          <Plus className="w-4 h-4 text-amber-400" />
          <span>+ Nuevo Producto</span>
        </button>
      </div>

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Total Productos</span>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-slate-700" />
            <span className="text-2xl font-black text-slate-900">{totalProducts}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">En Stock</span>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            <span className="text-2xl font-black text-slate-900">{inStockCount}</span>
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col gap-1">
          <span className="text-slate-500 text-[11px] font-bold uppercase tracking-wider">Agotados</span>
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-rose-500" />
            <span className="text-2xl font-black text-slate-900">{outOfStockCount}</span>
          </div>
        </div>
        <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 shadow-xs flex flex-col gap-1 text-white">
          <span className="text-slate-400 text-[11px] font-bold uppercase tracking-wider">Categorías Activas</span>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            <span className="text-2xl font-black text-white">{categoriesCount}</span>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" /> Filtros y Búsqueda
          </span>
          {(search || categoryFilter !== 'all' || typeFilter !== 'all') && (
            <button
              onClick={() => {
                setSearch('');
                setCategoryFilter('all');
                setTypeFilter('all');
              }}
              className="text-[11px] font-bold text-rose-600 hover:underline flex items-center gap-1"
            >
              <X className="w-3 h-3" /> Limpiar Filtros
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Buscar por nombre, ID o descripción..."
              className="w-full bg-slate-50 border border-slate-300 text-xs rounded-xl pl-9 pr-3 py-2.5 text-slate-900 focus:outline-none focus:border-slate-900 font-medium"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2.5 text-slate-800 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all">Todas las Categorías</option>
            <option value="plates">Placas TAP (plates)</option>
            <option value="cards">Tarjetas Inteligentes (cards)</option>
            <option value="accessories">Accesorios & Stand (accessories)</option>
          </select>

          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-slate-50 border border-slate-300 text-xs rounded-xl px-3 py-2.5 text-slate-800 font-semibold focus:outline-none cursor-pointer"
          >
            <option value="all">Todas las Redirecciones</option>
            <option value="google">Google Reviews ⭐</option>
            <option value="tripadvisor">TripAdvisor 🦉</option>
            <option value="instagram">Instagram 📸</option>
            <option value="vcard">vCard / Contacto 👤</option>
            <option value="airbnb">Airbnb 🏠</option>
            <option value="custom">Personalizado / Link 🔗</option>
          </select>
        </div>
      </div>

      {/* PRODUCTS TABLE */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
            Catálogo de Productos ({filteredProducts.length})
          </h3>
          <span className="text-[10px] text-slate-400 font-semibold">
            Edición rápida de precios y stock
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase tracking-wider">
                <th className="p-4">Imagen</th>
                <th className="p-4">Producto / Detalle</th>
                <th className="p-4">Categoría & Tipo</th>
                <th className="p-4">Material</th>
                <th className="p-4 text-center">Estado Stock</th>
                <th className="p-4 text-right">Precio ($ USD)</th>
                <th className="p-4 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 italic">
                    No se encontraron productos que coincidan con la búsqueda.
                  </td>
                </tr>
              ) : (
                filteredProducts.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="relative inline-block">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-12 h-12 object-cover rounded-xl border border-slate-200 bg-slate-50 p-0.5"
                        />
                        {p.images && p.images.length > 1 && (
                          <span className="absolute -bottom-1 -right-1 bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.2 rounded-full shadow-2xs border border-white">
                            {p.images.length}
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="p-4 max-w-xs">
                      <p className="font-bold text-slate-900">{p.name}</p>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">{p.description}</p>
                      <span className="text-[9px] font-mono text-amber-700 font-bold mt-1 inline-block bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        {p.id}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-800 rounded-lg font-bold text-[10px] uppercase border border-slate-200 block w-fit">
                        {p.category} • {p.type}
                      </span>
                    </td>

                    <td className="p-4 text-slate-600 font-semibold text-xs">
                      {p.material || 'Estándar'}
                    </td>

                    <td className="p-4 text-center">
                      <button
                        type="button"
                        onClick={() => handleToggleStock(p.id, p.in_stock)}
                        className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border transition ${
                          p.in_stock === false
                            ? 'bg-rose-100 text-rose-800 border-rose-300 hover:bg-rose-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-300 hover:bg-emerald-200'
                        }`}
                      >
                        {p.in_stock === false ? '🔴 Agotado' : '🟢 En Stock'}
                      </button>
                    </td>

                    <td className="p-4 text-right font-mono">
                      <div className="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1">
                        <span className="text-slate-400 font-bold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={priceInputs[p.id] ?? (p.price || 0).toString()}
                          onChange={e =>
                            setPriceInputs({ ...priceInputs, [p.id]: e.target.value })
                          }
                          className="w-16 bg-transparent text-right font-black text-slate-900 outline-none text-xs"
                        />
                        <button
                          type="button"
                          onClick={() => handleQuickPriceSave(p.id)}
                          className={`p-1 rounded-md text-[10px] font-bold transition ${
                            priceSuccess[p.id]
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-900 text-white hover:bg-slate-800'
                          }`}
                          title="Guardar precio"
                        >
                          {priceSuccess[p.id] ? '✓' : 'Guardar'}
                        </button>
                      </div>
                      {priceError[p.id] && (
                        <p className="mt-1 text-[10px] font-bold text-rose-600 text-right max-w-[220px] ml-auto">
                          {priceError[p.id]}
                        </p>
                      )}
                    </td>

                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => router.push(`/master-control/products/edit/${p.id}`)}
                          className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                          title="Editar producto completo"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Eliminar producto"
                        >
                          <Trash2 className="w-4 h-4" />
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
  );
}