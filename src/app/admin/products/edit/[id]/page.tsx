'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { dbLocal, Product } from '@/lib/db';
import { 
  ArrowLeft, Tag, Upload, Trash2, Star, CheckCircle, 
  AlertCircle, Image as ImageIcon, RefreshCw, Save
} from 'lucide-react';

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const productId = params?.id as string;

  const [loading, setLoading] = useState(true);
  const [product, setProduct] = useState<Product | null>(null);

  // Form States
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('');
  const [category, setCategory] = useState<Product['category']>('plates');
  const [type, setType] = useState<Product['type']>('google');
  
  // Images State
  const [mainImage, setMainImage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState('');

  // UI States
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (productId) {
      loadProduct();
    }
  }, [productId]);

  const loadProduct = () => {
    setLoading(true);
    const dbProducts = dbLocal.getProducts();
    const found = dbProducts.find(p => p.id.toLowerCase() === productId.toLowerCase());

    if (found) {
      setProduct(found);
      setName(found.name);
      setPrice(found.price.toString());
      setDescription(found.description);
      setMaterial(found.material || '');
      setCategory(found.category);
      setType(found.type);
      setMainImage(found.image);

      const existingGallery = found.images && found.images.length > 0 ? found.images : [found.image];
      setImages(existingGallery);
    } else {
      setErrorMsg(`No se encontró ningún producto con ID: ${productId}`);
    }
    setLoading(false);
  };

  // Supabase Storage Upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setErrorMsg('');

    try {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('file', files[i]);
      }

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Error subiendo imágenes a Supabase Storage');
      }

      const newUrls: string[] = data.urls || [];
      const updatedGallery = [...images, ...newUrls];
      
      setImages(updatedGallery);
      if (!mainImage && newUrls.length > 0) {
        setMainImage(newUrls[0]);
      }

    } catch (err: any) {
      console.error('Error en carga:', err);
      setErrorMsg(err.message || 'Error al subir imágenes');
    } finally {
      setUploading(false);
    }
  };

  const handleAddCustomUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customImageUrl.trim()) return;

    const url = customImageUrl.trim();
    if (!images.includes(url)) {
      const updated = [...images, url];
      setImages(updated);
      if (!mainImage) setMainImage(url);
    }
    setCustomImageUrl('');
  };

  const handleRemoveImage = (urlToRemove: string) => {
    const updated = images.filter(img => img !== urlToRemove);
    setImages(updated);
    if (mainImage === urlToRemove) {
      setMainImage(updated.length > 0 ? updated[0] : '');
    }
  };

  const handleSetMainImage = (url: string) => {
    setMainImage(url);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    setErrorMsg('');
    setSuccessMsg('');

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg('Por favor ingresa un precio válido.');
      return;
    }

    const finalMainImage = mainImage || (images.length > 0 ? images[0] : product.image);
    const finalImagesList = images.length > 0 ? images : [finalMainImage];

    const updates: Partial<Product> = {
      name: name.trim(),
      price: priceNum,
      description: description.trim(),
      material: material.trim(),
      category,
      type,
      image: finalMainImage,
      images: finalImagesList
    };

    dbLocal.updateFullProduct(product.id, updates);

    setSuccessMsg('¡Cambios guardados correctamente en Supabase!');
    setTimeout(() => {
      router.push('/admin');
    }, 1500);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-12 text-center text-xs font-bold uppercase tracking-widest text-slate-400">
        Cargando Información del Producto...
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-xl mx-auto bg-white border border-rose-200 rounded-3xl p-8 text-center space-y-4 shadow-sm">
          <AlertCircle className="w-8 h-8 text-rose-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Producto No Encontrado</h2>
          <p className="text-xs text-slate-500">No pudimos encontrar el producto especificado ({productId}).</p>
          <button
            onClick={() => router.push('/admin')}
            className="py-2.5 px-5 bg-slate-900 text-white text-xs font-bold rounded-xl uppercase"
          >
            Volver a Catálogo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Navigation Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <button
            onClick={() => router.push('/admin')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-bold text-xs bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Catálogo</span>
          </button>
          <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
            <Tag className="w-3.5 h-3.5" />
            <span>Edición Individual ({product.id})</span>
          </div>
        </div>

        {/* Header Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900">Editar Producto: {product.name}</h1>
            <p className="text-xs text-slate-500 mt-1 font-mono">ID Registro: {product.id}</p>
          </div>
        </div>

        {/* Feedback Alerts */}
        {errorMsg && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-xs font-bold flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Main Info Grid */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">1. Detalles Comerciales</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Nombre del Producto</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Precio ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Descripción</label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs font-medium text-slate-900 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Material</label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-slate-900 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Categoría</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="plates">Placas TAP (plates)</option>
                  <option value="cards">Tarjetas Inteligentes (cards)</option>
                  <option value="accessories">Accesorios & Stand (accessories)</option>
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Tipo de Redirección</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-800 focus:outline-none"
                >
                  <option value="google">Google Reviews ⭐</option>
                  <option value="tripadvisor">TripAdvisor 🦉</option>
                  <option value="instagram">Instagram 📸</option>
                  <option value="vcard">vCard / Contacto 👤</option>
                  <option value="airbnb">Airbnb 🏠</option>
                  <option value="custom">Personalizado 🔗</option>
                </select>
              </div>
            </div>
          </div>

          {/* Supabase Storage Gallery Manager */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">2. Galería & Fotos Supabase Storage (S3)</h2>
                <p className="text-[11px] text-slate-500">Administra las fotos públicas almacenadas en la base de datos de Supabase.</p>
              </div>
              <span className="text-xs font-mono font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                {images.length} foto(s)
              </span>
            </div>

            {/* Dropzone Upload Button */}
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center hover:border-slate-900 transition bg-slate-50/50">
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                id="edit-file-upload"
                className="hidden"
              />
              <label htmlFor="edit-file-upload" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  {uploading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {uploading ? 'Subiendo fotos a Supabase...' : 'Añadir más fotos desde tu equipo'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Sube imágenes en alta definición (S3 Storage)</p>
                </div>
              </label>
            </div>

            {/* Add Custom URL */}
            <div className="flex gap-2 pt-1">
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="O pega una URL de imagen..."
                className="flex-1 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleAddCustomUrl}
                className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl border border-slate-300"
              >
                Añadir URL
              </button>
            </div>

            {/* Gallery Thumbnails Grid */}
            {images.length > 0 && (
              <div className="space-y-2 pt-2">
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Fotos del Producto</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {images.map((imgUrl, idx) => {
                    const isMain = mainImage === imgUrl || (!mainImage && idx === 0);
                    return (
                      <div key={idx} className={`relative group bg-slate-100 rounded-2xl overflow-hidden border-2 transition ${isMain ? 'border-amber-500 shadow-md ring-2 ring-amber-500/20' : 'border-slate-200'}`}>
                        <img src={imgUrl} alt={`Foto ${idx + 1}`} className="w-full h-32 object-cover" />
                        
                        {isMain && (
                          <span className="absolute top-2 left-2 bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                            Principal ⭐
                          </span>
                        )}

                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 p-2">
                          {!isMain && (
                            <button
                              type="button"
                              onClick={() => handleSetMainImage(imgUrl)}
                              title="Establecer como principal"
                              className="p-2 bg-amber-500 text-slate-950 rounded-xl text-xs font-bold shadow-md hover:bg-amber-400"
                            >
                              <Star className="w-4 h-4 fill-slate-950" />
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => handleRemoveImage(imgUrl)}
                            title="Eliminar de la galería"
                            className="p-2 bg-rose-600 text-white rounded-xl text-xs font-bold shadow-md hover:bg-rose-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => router.push('/admin')}
              className="py-3 px-6 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs uppercase tracking-wider rounded-xl border border-slate-300 transition"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="py-3 px-8 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition flex items-center gap-2"
            >
              <Save className="w-4 h-4 text-amber-400" />
              <span>Guardar Cambios en Supabase</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
