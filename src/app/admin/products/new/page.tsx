'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { dbLocal, Product } from '@/lib/db';
import { 
  ArrowLeft, Tag, Upload, Trash2, Star, CheckCircle, 
  AlertCircle, Image as ImageIcon, Plus, RefreshCw, ShieldCheck
} from 'lucide-react';

export default function NewProductPage() {
  const router = useRouter();

  // Form State
  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [description, setDescription] = useState('');
  const [material, setMaterial] = useState('Acrílico Premium');
  const [category, setCategory] = useState<Product['category']>('plates');
  const [type, setType] = useState<Product['type']>('google');
  
  // Images State (Multiple Photos)
  const [mainImage, setMainImage] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [customImageUrl, setCustomImageUrl] = useState('');
  
  // UI States
  const [uploading, setUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Handle Supabase Storage Multiple File Upload
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
        throw new Error(data.error || 'Error subiendo las imágenes');
      }

      const newUploadedUrls: string[] = data.urls || [];
      const updatedGallery = [...images, ...newUploadedUrls];
      
      setImages(updatedGallery);

      // Si no hay imagen principal definida, asignar la primera subida
      if (!mainImage && newUploadedUrls.length > 0) {
        setMainImage(newUploadedUrls[0]);
      }

    } catch (err: any) {
      console.error('Error al subir archivos:', err);
      setErrorMsg(err.message || 'Fallo la carga de imagen');
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
    setErrorMsg('');
    setSuccessMsg('');

    if (!id.trim()) {
      setErrorMsg('Por favor ingresa un ID único para el producto (ej. placa-google-v2).');
      return;
    }
    if (!name.trim()) {
      setErrorMsg('Ingresa el nombre del producto.');
      return;
    }

    const priceNum = parseFloat(price);
    if (isNaN(priceNum) || priceNum <= 0) {
      setErrorMsg('Ingresa un precio válido mayor a 0.');
      return;
    }

    const finalMainImage = mainImage || (images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=600');
    const finalImagesList = images.length > 0 ? images : [finalMainImage];

    const newProduct: Product = {
      id: id.trim().toLowerCase().replace(/\s+/g, '-'),
      name: name.trim(),
      price: priceNum,
      description: description.trim(),
      material: material.trim(),
      category,
      type,
      image: finalMainImage,
      images: finalImagesList
    };

    dbLocal.createProduct(newProduct);

    setSuccessMsg('¡Producto creado exitosamente y guardado en Supabase!');
    setTimeout(() => {
      router.push('/admin');
    }, 1500);
  };

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
          <div className="flex items-center gap-2 text-xs text-amber-600 font-bold bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
            <Tag className="w-3.5 h-3.5" />
            <span>Creación de Producto Individual</span>
          </div>
        </div>

        {/* Header Title */}
        <div>
          <h1 className="text-2xl font-black text-slate-900">Crear Nuevo Producto en Catálogo</h1>
          <p className="text-xs text-slate-500 mt-1">
            Sube múltiples fotografías al Storage S3 de Supabase y configura todas las especificaciones comerciales.
          </p>
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
            <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">1. Información del Producto</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  ID Único del Producto (identificador URL)
                </label>
                <input
                  type="text"
                  required
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  placeholder="ej. placa-google-mate"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Precio ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  placeholder="ej. 34.99"
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Nombre del Producto
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="ej. Placa NFC Google Reviews (Acrílico Mate)"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2.5 text-xs font-bold text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Descripción Comercial
              </label>
              <textarea
                rows={3}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Escribe la descripción detallada enfocada en beneficios y SEO..."
                className="w-full bg-slate-50 border border-slate-300 rounded-xl p-3.5 text-xs font-medium text-slate-900 focus:outline-none focus:border-slate-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-1">Material</label>
                <input
                  type="text"
                  value={material}
                  onChange={(e) => setMaterial(e.target.value)}
                  placeholder="ej. Acrílico Premium 3mm"
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

          {/* Supabase Storage Multiple Images Uploader */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xs font-black uppercase tracking-wider text-slate-400">2. Galería de Imágenes Supabase Storage (S3)</h2>
                <p className="text-[11px] text-slate-500">Sube múltiples fotografías reales del producto que se alojarán de forma segura en Supabase.</p>
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
                id="file-upload-input"
                className="hidden"
              />
              <label htmlFor="file-upload-input" className="cursor-pointer flex flex-col items-center justify-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
                  {uploading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Upload className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    {uploading ? 'Subiendo archivos a Supabase Storage...' : 'Haz clic aquí para seleccionar imágenes'}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Soporta JPG, PNG, WEBP o SVG (Selección Múltiple)</p>
                </div>
              </label>
            </div>

            {/* Add Image by URL fallback */}
            <div className="flex gap-2 pt-1">
              <input
                type="url"
                value={customImageUrl}
                onChange={(e) => setCustomImageUrl(e.target.value)}
                placeholder="O pega una URL de imagen externa..."
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
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Miniaturas de la Galería</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {images.map((imgUrl, idx) => {
                    const isMain = mainImage === imgUrl || (!mainImage && idx === 0);
                    return (
                      <div key={idx} className={`relative group bg-slate-100 rounded-2xl overflow-hidden border-2 transition ${isMain ? 'border-amber-500 shadow-md ring-2 ring-amber-500/20' : 'border-slate-200'}`}>
                        <img src={imgUrl} alt={`Foto ${idx + 1}`} className="w-full h-32 object-cover" />
                        
                        {/* Status Badges */}
                        <div className="absolute top-2 left-2 flex flex-col gap-1">
                          {isMain && (
                            <span className="bg-amber-500 text-slate-950 font-black text-[9px] px-2 py-0.5 rounded-md uppercase tracking-wider shadow-sm">
                              Principal ⭐
                            </span>
                          )}
                        </div>

                        {/* Action Bar Overlay */}
                        <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-2 p-2">
                          {!isMain && (
                            <button
                              type="button"
                              onClick={() => handleSetMainImage(imgUrl)}
                              title="Establecer como imagen principal"
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
              className="py-3 px-8 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg transition"
            >
              Guardar Producto en Supabase
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
