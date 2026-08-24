'use client';

import React, { useState, useEffect } from 'react';
import { notFound, useRouter } from 'next/navigation';
import Link from 'next/link';
import { dbLocal, Product } from '@/lib/db';
import { useCart } from '@/context/CartContext';
import { ArrowLeft, Upload, Check, Info } from 'lucide-react';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { addToCart } = useCart();
  const [product, setProduct] = useState<Product | null>(null);
  
  // Customization States
  const [color, setColor] = useState('Negro Premium');
  const [businessName, setBusinessName] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [logoFile, setLogoFile] = useState<string>('');

  const [selectedImage, setSelectedImage] = useState('');

  useEffect(() => {
    const found = dbLocal.getProductById(params.id);
    if (!found) {
      notFound();
    } else {
      setProduct(found);
      setSelectedImage(found.image);
      
      const defaultColors = found.colors || (found.category === 'cards' 
        ? ['Negro Premium', 'Blanco Premium', 'Madera Bambú', 'Madera Nogal'] 
        : ['Negro Mate', 'Blanco Brillante', 'Dorado Espejo', 'Plata Cepillado']);
      setColor(defaultColors[0]);

      if (found.type === 'google') {
        setRedirectUrl('https://search.google.com/local/writereview?placeid=...');
      } else if (found.type === 'tripadvisor') {
        setRedirectUrl('https://www.tripadvisor.com/UserReview-...');
      } else if (found.type === 'instagram') {
        setRedirectUrl('https://instagram.com/mi_negocio');
      } else if (found.type === 'airbnb') {
        setRedirectUrl('https://www.airbnb.com/rooms/...');
      }
    }
  }, [params.id]);

  if (!product) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm text-brand-400">Cargando producto...</div>;
  }

  const colors = product.colors || (product.category === 'cards' 
    ? ['Negro Premium', 'Blanco Premium', 'Madera Bambú', 'Madera Nogal'] 
    : ['Negro Mate', 'Blanco Brillante', 'Dorado Espejo', 'Plata Cepillado']);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoPreview(reader.result as string);
        setLogoFile(file.name);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!businessName) {
      alert('Por favor ingresa el nombre de tu negocio para continuar');
      return;
    }

    addToCart({
      product_id: product.id,
      product_name: product.name,
      price: product.price,
      quantity,
      selected_color: color,
      business_name: businessName,
      initial_redirect_url: redirectUrl,
      logo_url: logoPreview || undefined
    });

    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      router.push('/cart');
    }, 1200);
  };

  return (
    <div className="shopify-container max-w-5xl py-12">
      {/* Back Button */}
      <Link href="/shop" className="inline-flex items-center space-x-2 text-xs font-bold uppercase tracking-wider text-brand-400 hover:text-brand-950 transition-colors mb-10">
        <ArrowLeft className="h-4 w-4" />
        <span>Volver a Colecciones</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left Side: Mockup & Images */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Physical Photo Gallery */}
          <div className="space-y-4">
            <div className="bg-white border border-brand-200 rounded-lg p-4 shadow-premium flex items-center justify-center aspect-square overflow-hidden">
              <img src={selectedImage || product.image} alt={product.name} className="max-h-full max-w-full object-contain" />
            </div>
            
            {product.images && product.images.length > 0 && (
              <div className="grid grid-cols-5 gap-2">
                {product.images.map((img, idx) => (
                  <button
                    type="button"
                    key={idx}
                    onClick={() => setSelectedImage(img)}
                    className={`aspect-square border rounded overflow-hidden bg-brand-50 hover:border-brand-950 transition-colors ${
                      (selectedImage || product.image) === img ? 'border-brand-950 ring-1 ring-brand-950' : 'border-brand-200'
                    }`}
                  >
                    <img src={img} alt={`Miniatura ${idx}`} className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details */}
          <div className="bg-white border border-brand-200 rounded-lg p-6 space-y-4 shadow-premium">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-950">Especificaciones</h3>
            <ul className="text-xs text-brand-500 space-y-2">
              <li className="flex justify-between"><span>Material</span><span className="font-semibold text-brand-800">{product.material || (product.category === 'plates' ? 'Acrílico Premium 3mm' : 'PVC / Madera Maciza')}</span></li>
              <li className="flex justify-between"><span>Chip Interno</span><span className="font-semibold text-brand-800">NTAG213 (Alta velocidad)</span></li>
              <li className="flex justify-between"><span>Ciclo de Vida</span><span className="font-semibold text-brand-800">100,000 lecturas / Grabado Permanente</span></li>
              <li className="flex justify-between"><span>Fulfillment</span><span className="font-semibold text-brand-800">Grabado láser en Panamá</span></li>
            </ul>
          </div>
        </div>

        {/* Right Side: Product Details & Config */}
        <div className="lg:col-span-7 bg-white border border-brand-200 rounded-lg p-8 shadow-premium">
          <form onSubmit={handleAddToCart} className="space-y-8">
            {/* Header info */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-brand-400 uppercase tracking-widest block">Colección Oficial</span>
              <h2 className="text-2xl font-black text-brand-950 uppercase tracking-wide">{product.name}</h2>
              <div className="flex items-center space-x-2">
                <span className="text-lg font-black text-brand-950">${product.price.toFixed(2)}</span>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 font-bold uppercase rounded">Pago único</span>
              </div>
            </div>

            <hr className="border-brand-200" />

            {/* Customization Options */}
            <div className="space-y-6">
              {/* Option: Color */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-900 block">Acabado / Material</label>
                <div className="flex flex-wrap gap-2">
                  {colors.map((c) => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setColor(c)}
                      className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border rounded transition-all ${
                        color === c
                          ? 'border-brand-950 bg-brand-950 text-white shadow-sm'
                          : 'border-brand-200 hover:bg-brand-100 hover:text-brand-950 text-brand-600 bg-white'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>

              {/* Option: Name */}
              <div className="space-y-1">
                <label htmlFor="businessName" className="text-xs font-bold uppercase tracking-wider text-brand-900 block">Nombre del Establecimiento</label>
                <input
                  type="text"
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Ej: PIZZERÍA ROMA"
                  className="shopify-input uppercase"
                  required
                />
              </div>

              {/* Option: Logo */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold uppercase tracking-wider text-brand-900 block">Subir Vector de Logotipo</label>
                <div className="border border-dashed border-brand-300 rounded p-4 text-center cursor-pointer hover:border-brand-950 transition-colors relative bg-brand-50">
                  <input
                    type="file"
                    id="logoUpload"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <Upload className="h-5 w-5 text-brand-400 mx-auto mb-1.5 stroke-[1.8]" />
                  <span className="text-[11px] text-brand-500 font-bold block">
                    {logoFile ? `Archivo cargado: ${logoFile}` : 'Arrastra tu archivo logo (SVG, PNG, JPG)'}
                  </span>
                </div>
              </div>

              {/* Option: Redirect Url */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="redirectUrl" className="text-xs font-bold uppercase tracking-wider text-brand-900">Enlace de Redirección Inicial</label>
                </div>
                <input
                  type="url"
                  id="redirectUrl"
                  value={redirectUrl}
                  onChange={(e) => setRedirectUrl(e.target.value)}
                  placeholder="https://search.google.com/local/writereview?placeid=..."
                  className="shopify-input font-mono text-xs"
                  required
                />
                <div className="flex items-start space-x-2 text-[10px] text-brand-400 bg-brand-50 p-2.5 rounded border border-brand-200">
                  <Info className="h-4 w-4 text-brand-500 flex-shrink-0 mt-0.5" />
                  <span>
                    No te preocupes si no tienes el link definitivo ahora. Podrás editar el destino en tiempo real las veces que quieras desde tu portal administrativo.
                  </span>
                </div>
              </div>
            </div>

            <hr className="border-brand-200" />

            {/* Quantity and Checkout Add button */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4">
              {/* Quantity */}
              <div className="flex items-center border border-brand-300 rounded bg-white w-full sm:w-auto justify-between">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-4 py-2 font-bold text-brand-500 hover:bg-brand-100"
                >
                  −
                </button>
                <span className="px-5 font-bold text-xs text-brand-950">{quantity}</span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="px-4 py-2 font-bold text-brand-500 hover:bg-brand-100"
                >
                  +
                </button>
              </div>

              {/* Button */}
              <button
                type="submit"
                disabled={isSuccess}
                className={`shopify-btn-primary flex-grow text-xs tracking-widest uppercase font-bold py-4 transition-all ${
                  isSuccess ? 'bg-accent-600 hover:bg-accent-600' : ''
                }`}
              >
                {isSuccess ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    <span>¡Agregado al Carrito!</span>
                  </>
                ) : (
                  <span>Añadir al Carrito • ${(product.price * quantity).toFixed(2)}</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
