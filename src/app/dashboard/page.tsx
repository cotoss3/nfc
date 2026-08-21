'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { dbLocal, NfcCard, ScanRecord } from '@/lib/db';
import Link from 'next/link';
import { Edit2, QrCode, Smartphone, Eye, Check, ExternalLink, BarChart2, List, ShieldAlert } from 'lucide-react';

function DashboardContent() {
  const searchParams = useSearchParams();
  const [emailInput, setEmailInput] = useState('');
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [cards, setCards] = useState<NfcCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<NfcCard | null>(null);
  
  // Edit states
  const [editLabel, setEditLabel] = useState('');
  const [editUrl, setEditUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Analytics states
  const [scans, setScans] = useState<ScanRecord[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const queryEmail = searchParams.get('email');
      const sessionEmail = sessionStorage.getItem('current_user_email');
      const activeEmail = queryEmail || sessionEmail;

      if (activeEmail) {
        setUserEmail(activeEmail);
        loadUserData(activeEmail);
      }
    }
  }, [searchParams]);

  const loadUserData = (email: string) => {
    const userCards = dbLocal.getCardsByOwner(email);
    setCards(userCards);
    if (userCards.length > 0) {
      handleSelectCard(userCards[0]);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) return;
    setUserEmail(emailInput);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('current_user_email', emailInput);
    }
    loadUserData(emailInput);
  };

  const handleLogout = () => {
    setUserEmail(null);
    setCards([]);
    setSelectedCard(null);
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('current_user_email');
      sessionStorage.removeItem('current_user_name');
    }
  };

  const handleSelectCard = (card: NfcCard) => {
    setSelectedCard(card);
    setEditLabel(card.label);
    setEditUrl(card.target_url);
    
    // Load scans
    const cardScans = dbLocal.getScansForCard(card.card_id);
    setScans(cardScans);
  };

  const handleUpdateCard = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCard) return;

    setIsUpdating(true);
    setTimeout(() => {
      const success = dbLocal.updateCardRedirect(selectedCard.card_id, editUrl, editLabel);
      if (success) {
        setUpdateSuccess(true);
        const updatedCards = cards.map(c => 
          c.card_id === selectedCard.card_id 
            ? { ...c, label: editLabel, target_url: editUrl } 
            : c
        );
        setCards(updatedCards);
        setSelectedCard({ ...selectedCard, label: editLabel, target_url: editUrl });
        
        setTimeout(() => setUpdateSuccess(false), 2000);
      }
      setIsUpdating(false);
    }, 600);
  };

  const simulateScan = (m: 'nfc' | 'qr') => {
    if (!selectedCard) return;
    const devices = ['iPhone (iOS)', 'Android (Mobile)', 'Desktop (Web)'];
    const randomDevice = devices[Math.floor(Math.random() * devices.length)];
    const ref = m === 'qr' ? 'QR Code' : 'NFC Scan';

    dbLocal.registerScan(selectedCard.card_id, randomDevice, ref);
    
    const cardScans = dbLocal.getScansForCard(selectedCard.card_id);
    setScans(cardScans);
  };

  const getChartData = () => {
    const data = [];
    const today = new Date();
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      const dateStr = date.toLocaleDateString('es-PA', { weekday: 'short', day: 'numeric' });
      
      const count = scans.filter(s => {
        const scanDate = new Date(s.created_at);
        return scanDate.toDateString() === date.toDateString();
      }).length;

      data.push({ name: dateStr, count });
    }
    return data;
  };

  const chartData = getChartData();
  const maxScanCount = Math.max(...chartData.map(d => d.count), 1);

  const deviceCounts = scans.reduce((acc, curr) => {
    acc[curr.device] = (acc[curr.device] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const totalScans = scans.length;

  return (
    <div className="shopify-container max-w-6xl py-12 space-y-10 bg-brand-50">
      {!userEmail ? (
        /* Login Screen */
        <div className="max-w-md mx-auto bg-white border border-brand-200 rounded p-8 shadow-premium space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold tracking-widest text-brand-400 uppercase block">Acceso Clientes</span>
            <h1 className="text-xl font-bold uppercase tracking-wide text-brand-950">Administrar mis Dispositivos NFC</h1>
            <p className="text-xs text-brand-500 leading-relaxed">
              Ingresa el correo con el que realizaste tu compra para configurar las redirecciones de tus productos físicos.
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="email" className="text-[10px] font-bold text-brand-500 uppercase tracking-wider block">Correo Electrónico</label>
              <input
                type="email"
                id="email"
                required
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="carlos.mendoza@gmail.com"
                className="shopify-input"
              />
            </div>

            <button
              type="submit"
              className="w-full shopify-btn-primary uppercase tracking-widest text-xs font-bold py-3.5"
            >
              Entrar al Portal
            </button>
          </form>

          <div className="border border-brand-200 bg-brand-50 p-4 rounded text-[11px] text-brand-600 leading-relaxed">
            <p className="font-bold text-brand-950 uppercase tracking-wider mb-1">💡 Cuenta Demo de Prueba:</p>
            <p>Ingresa con <span className="font-bold text-brand-850">carlos.mendoza@gmail.com</span> para ver un dispositivo configurado con analíticas simuladas de prueba.</p>
          </div>
        </div>
      ) : (
        /* Dashboard Portal */
        <div className="space-y-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-brand-200 pb-6">
            <div>
              <span className="text-[9px] font-bold text-brand-400 uppercase tracking-widest block mb-0.5">Portal de Redireccionamientos</span>
              <h1 className="text-2xl font-black text-brand-950 uppercase tracking-wide">Tus Tarjetas y Placas NFC</h1>
              <p className="text-xs text-brand-500">Sesión iniciada como: <span className="font-bold text-brand-800">{userEmail}</span></p>
            </div>
            <button
              onClick={handleLogout}
              className="shopify-btn-secondary py-2 px-4 text-xs font-bold uppercase tracking-wider border-brand-300"
            >
              Cerrar Sesión
            </button>
          </div>

          {cards.length === 0 ? (
            <div className="bg-white border border-brand-200 p-12 text-center max-w-md mx-auto space-y-4">
              <p className="text-xs text-brand-400 uppercase tracking-widest font-bold">Sin Dispositivos</p>
              <h2 className="text-base font-bold text-brand-950">No hay productos NFC vinculados</h2>
              <p className="text-xs text-brand-500 leading-relaxed">
                No hemos encontrado compras asociadas a este correo electrónico. Adquiere tu primera placa en nuestro catálogo.
              </p>
              <Link href="/shop" className="inline-block shopify-btn-primary text-xs uppercase tracking-wider font-bold py-2.5 px-6">
                Ver Catálogo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Left Column: Selectors */}
              <div className="lg:col-span-4 space-y-4">
                <h2 className="text-[10px] font-bold text-brand-400 uppercase tracking-widest flex items-center gap-1.5">
                  <List className="h-3.5 w-3.5 stroke-[1.8]" /> Equipos Registrados
                </h2>
                
                <div className="space-y-3">
                  {cards.map((c) => (
                    <button
                      key={c.card_id}
                      onClick={() => handleSelectCard(c)}
                      className={`w-full p-4 rounded border text-left flex justify-between items-center transition-all ${
                        selectedCard?.card_id === c.card_id
                          ? 'border-brand-950 bg-white shadow-premium'
                          : 'border-brand-200 bg-white hover:bg-brand-100'
                      }`}
                    >
                      <div className="truncate max-w-[85%] space-y-1">
                        <span className="font-bold text-xs uppercase tracking-wider text-brand-900 block truncate">{c.label}</span>
                        <span className="text-[9px] text-brand-400 font-mono block truncate">ID: {c.card_id}</span>
                        <span className="text-[10px] font-bold text-brand-500 block truncate font-mono">{c.target_url}</span>
                      </div>
                      <span className="flex h-1.5 w-1.5 rounded-full bg-accent-600"></span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Column: Selected Card Stats and Redirect updates */}
              {selectedCard && (
                <div className="lg:col-span-8 space-y-8">
                  {/* Configuration card form */}
                  <div className="bg-white border border-brand-200 rounded-lg p-6 shadow-premium space-y-6">
                    <div className="space-y-1">
                      <h2 className="text-sm font-bold uppercase tracking-widest text-brand-950">Destino del Redireccionamiento</h2>
                      <p className="text-[11px] text-brand-400">Modifica la ruta del enlace en tiempo real. Los cambios se aplican al instante.</p>
                    </div>

                    <form onSubmit={handleUpdateCard} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-brand-500 uppercase tracking-wider">Etiqueta del Rótulo</label>
                          <input
                            type="text"
                            required
                            value={editLabel}
                            onChange={(e) => setEditLabel(e.target.value)}
                            className="shopify-input"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-brand-500 uppercase tracking-wider">URL Destino de Escaneo</label>
                          <input
                            type="url"
                            required
                            value={editUrl}
                            onChange={(e) => setEditUrl(e.target.value)}
                            className="shopify-input font-mono text-xs"
                          />
                        </div>
                      </div>
                      
                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={isUpdating}
                          className="shopify-btn-primary py-2.5 px-6 text-xs uppercase tracking-widest font-bold rounded"
                        >
                          {isUpdating ? 'Actualizando...' : updateSuccess ? '¡Guardado!' : 'Guardar Cambios'}
                        </button>
                      </div>
                    </form>

                    {updateSuccess && (
                      <div className="bg-accent-50 text-accent-700 border border-accent-100 p-3 rounded text-[11px] font-bold flex items-center space-x-1.5">
                        <Check className="h-4 w-4" />
                        <span>El enlace destino se ha reconfigurado correctamente de fábrica en la nube.</span>
                      </div>
                    )}
                  </div>

                  {/* Dev Sandbox simulation */}
                  <div className="bg-brand-950 border border-brand-950 text-white rounded-lg p-6 space-y-4 shadow-card">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <Smartphone className="h-4.5 w-4.5" /> Enlace de Registro Técnico & Pruebas
                      </h3>
                      <p className="text-[11px] text-brand-400 leading-relaxed">
                        Este es el enlace registrado físicamente en el chip NFC de tu placa. Haz clic para probar la redirección en el navegador y simular escaneos para testear las analíticas.
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2 border-t border-white/10 pt-4">
                      <a
                        href={`/r/${selectedCard.card_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/10 hover:bg-white/20 text-white font-bold px-4 py-2 rounded text-xs uppercase tracking-wider transition-colors border border-white/10 flex items-center justify-center gap-1.5"
                      >
                        <span>Probar Redirección</span>
                        <ExternalLink className="h-3.5 w-3.5" />
                      </a>

                      <div className="flex gap-2">
                        <button
                          onClick={() => simulateScan('nfc')}
                          className="bg-white text-brand-950 font-bold px-4 py-2 rounded text-xs uppercase tracking-wider hover:bg-brand-100 flex-1 sm:flex-initial"
                        >
                          Toque NFC (+1)
                        </button>
                        <button
                          onClick={() => simulateScan('qr')}
                          className="bg-white/10 text-white border border-white/20 font-bold px-4 py-2 rounded text-xs uppercase tracking-wider hover:bg-white/20 flex-1 sm:flex-initial"
                        >
                          Escaneo QR (+1)
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Stats counts cards */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-white p-5 border border-brand-200 rounded-lg shadow-premium">
                      <span className="text-[9px] font-bold text-brand-400 uppercase tracking-wider">Escaneos Totales</span>
                      <p className="text-2xl font-black text-brand-950 mt-1">{totalScans}</p>
                    </div>
                    <div className="bg-white p-5 border border-brand-200 rounded-lg shadow-premium">
                      <span className="text-[9px] font-bold text-brand-400 uppercase tracking-wider">Por Canal NFC</span>
                      <p className="text-2xl font-black text-brand-950 mt-1">
                        {scans.filter(s => s.referrer === 'NFC Scan').length}
                      </p>
                    </div>
                    <div className="bg-white p-5 border border-brand-200 rounded-lg shadow-premium">
                      <span className="text-[9px] font-bold text-brand-400 uppercase tracking-wider">Por Canal QR</span>
                      <p className="text-2xl font-black text-brand-950 mt-1">
                        {scans.filter(s => s.referrer === 'QR Code').length}
                      </p>
                    </div>
                  </div>

                  {/* Custom Minimalist Daily Bar Chart */}
                  <div className="bg-white border border-brand-200 rounded-lg p-6 shadow-premium space-y-6">
                    <div className="space-y-1">
                      <h3 className="text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                        <BarChart2 className="h-4.5 w-4.5 text-brand-950" /> Actividad Semanal
                      </h3>
                      <p className="text-[10px] text-brand-400">Total de escaneos y visitas a tu placa por día.</p>
                    </div>

                    {/* Chart visual */}
                    <div className="h-44 flex items-end justify-between gap-3 pt-6 border-b border-brand-200">
                      {chartData.map((d, index) => {
                        const pct = (d.count / maxScanCount) * 100;
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                            <span className="text-[10px] font-bold text-brand-950 opacity-0 group-hover:opacity-100 transition-opacity">
                              {d.count}
                            </span>
                            <div
                              style={{ height: `${pct}%` }}
                              className="w-full bg-brand-200 group-hover:bg-brand-950 rounded-t-[2px] min-h-[3px] transition-all duration-200"
                            ></div>
                            <span className="text-[8px] text-brand-400 font-bold uppercase truncate max-w-full text-center mt-2 leading-none">
                              {d.name}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Devices detail breakdown list */}
                  <div className="bg-white border border-brand-200 rounded-lg p-6 shadow-premium space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-widest text-brand-950">Desglose de Teléfonos</h3>
                    
                    <div className="space-y-3">
                      {Object.entries(deviceCounts).map(([device, count]) => {
                        const pct = ((count / totalScans) * 100).toFixed(0);
                        return (
                          <div key={device} className="space-y-1.5 text-xs text-brand-650">
                            <div className="flex justify-between font-bold text-brand-900 text-[11px] uppercase tracking-wide">
                              <span>{device}</span>
                              <span>{count} ({pct}%)</span>
                            </div>
                            <div className="w-full bg-brand-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${pct}%` }}
                                className="bg-brand-950 h-full rounded-full"
                              ></div>
                            </div>
                          </div>
                        );
                      })}
                      {totalScans === 0 && (
                        <p className="text-xs text-brand-400 italic text-center py-4">Esperando datos de visitas...</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<div className="max-w-7xl mx-auto px-4 py-20 text-center text-xs text-brand-400 uppercase tracking-widest">Cargando Panel...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
