'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { trackGA } from '@/lib/googleanalytics';

interface YappyButtonProps {
  onInitiatePayment: () => Promise<{ 
    success: boolean; 
    transactionId?: string; 
    documentName?: string; 
    token?: string; 
    error?: string; 
    orderId?: string 
  }>;
  onSuccess?: (orderId: string) => void;
  onError?: (error: any) => void;
  theme?: 'blue' | 'darkBlue' | 'orange' | 'dark' | 'sky' | 'light';
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      'btn-yappy': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement> & { theme?: string }, HTMLElement>;
    }
  }
}

export default function YappyButton({ onInitiatePayment, onSuccess, onError, theme = 'blue' }: YappyButtonProps) {
  const btnRef = useRef<HTMLElement>(null);
  const [loading, setLoading] = useState(false);
  const [useFallback, setUseFallback] = useState(false);
  
  const currentOrderIdRef = useRef<string>('');
  const onInitiatePaymentRef = useRef(onInitiatePayment);
  onInitiatePaymentRef.current = onInitiatePayment;
  const onSuccessRef = useRef(onSuccess);
  onSuccessRef.current = onSuccess;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    const btnyappy = btnRef.current;
    if (!btnyappy) return;

    const handleSuccess = (e: any) => {
      console.log('[Yappy] eventSuccess:', e.detail);
      setLoading(false);
      const orderId = currentOrderIdRef.current;
      if (orderId) trackGA('purchase', { transaction_id: orderId });
      if (onSuccessRef.current && orderId) {
        onSuccessRef.current(orderId);
      }
    };

    const handleError = (e: any) => {
      console.error('[Yappy] eventError:', e.detail);
      setLoading(false);
      if (onErrorRef.current) onErrorRef.current(e.detail);
    };

    const handleClick = async () => {
      setLoading(true);
      try {
        console.log('[Yappy] Iniciando pago en backend...');
        const result = await onInitiatePaymentRef.current();
        
        if (result && result.success && result.token && result.transactionId && result.documentName) {
          if (result.orderId) currentOrderIdRef.current = result.orderId;
          const params = {
            transactionId: result.transactionId,
            documentName: result.documentName,
            token: result.token,
          };
          
          if ((btnyappy as any).eventPayment) {
            (btnyappy as any).eventPayment(params);
          } else {
            console.error('[Yappy] eventPayment no existe en web component');
            if (onErrorRef.current) onErrorRef.current('No se pudo abrir el modal de Yappy');
          }
        } else {
          console.error('[Yappy] Falló la iniciación de pago:', result?.error);
          setLoading(false);
          try {
            (btnyappy as any).isButtonLoading = false;
            btnyappy.classList.remove('disable-btn');
          } catch (e) {}
          if (onErrorRef.current) onErrorRef.current(result?.error || 'No se pudo iniciar el pago con Yappy');
        }
      } catch (err) {
        console.error('[Yappy] Error en handleClick:', err);
        setLoading(false);
        try {
          (btnyappy as any).isButtonLoading = false;
          btnyappy.classList.remove('disable-btn');
        } catch (e) {}
        if (onErrorRef.current) onErrorRef.current(err);
      }
    };

    btnyappy.addEventListener('eventSuccess', handleSuccess);
    btnyappy.addEventListener('eventError', handleError);
    btnyappy.addEventListener('eventClick', handleClick);

    // Timeout check: si el custom element no renderiza shadowRoot en 2s, activar fallback visual
    const timer = setTimeout(() => {
      if (!btnyappy.shadowRoot && btnyappy.children.length === 0) {
        setUseFallback(true);
      }
    }, 2000);

    return () => {
      clearTimeout(timer);
      btnyappy.removeEventListener('eventSuccess', handleSuccess);
      btnyappy.removeEventListener('eventError', handleError);
      btnyappy.removeEventListener('eventClick', handleClick);
    };
  }, [theme]);

  const triggerPaymentManual = () => {
    const btnyappy = btnRef.current;
    if (btnyappy) {
      btnyappy.dispatchEvent(new Event('eventClick'));
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-2">
      {/* Target Web Component Element */}
      <div className={`w-full flex justify-center ${useFallback ? 'hidden' : 'block'}`}>
        {/* @ts-ignore */}
        <btn-yappy 
          ref={btnRef} 
          theme={theme} 
          style={{ width: '100%', minHeight: '48px', display: 'block' }}
        ></btn-yappy>
      </div>

      {/* Fallback button if Web Component is delayed or unrendered */}
      {useFallback && (
        <button
          type="button"
          onClick={triggerPaymentManual}
          disabled={loading}
          className="w-full bg-[#005CE6] hover:bg-[#0048B3] text-white font-bold py-3.5 px-6 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-base active:scale-[0.99] disabled:opacity-50"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <span className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full inline-block" />
              <span>Conectando con Yappy...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              <span>Pagar con</span>
              <Image 
                src="/logos/yappy-logo.png" 
                alt="Yappy" 
                width={75} 
                height={20} 
                className="h-5 w-auto object-contain brightness-0 invert" 
              />
            </div>
          )}
        </button>
      )}
    </div>
  );
}
