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
  const [currentOrderId, setCurrentOrderId] = useState<string>('');
  const [useFallback, setUseFallback] = useState(false);

  useEffect(() => {
    const btnyappy = btnRef.current;
    if (!btnyappy) return;

    const handleSuccess = (e: any) => {
      console.log('[Yappy] eventSuccess:', e.detail);
      setLoading(false);
      trackGA('purchase', { transaction_id: currentOrderId });
      if (onSuccess && currentOrderId) {
        onSuccess(currentOrderId);
      }
    };

    const handleError = (e: any) => {
      console.error('[Yappy] eventError:', e.detail);
      setLoading(false);
      if (onError) onError(e.detail);
    };

    const handleClick = async () => {
      setLoading(true);
      try {
        console.log('[Yappy] Initiating payment on backend...');
        const result = await onInitiatePayment();
        
        if (result && result.success && result.token && result.transactionId && result.documentName) {
          if (result.orderId) setCurrentOrderId(result.orderId);
          const params = {
            transactionId: result.transactionId,
            documentName: result.documentName,
            token: result.token,
          };
          
          if ((btnyappy as any).eventPayment) {
            (btnyappy as any).eventPayment(params);
          } else {
            console.error('[Yappy] eventPayment missing on web component');
            if (onError) onError('No se pudo abrir el modal de Yappy');
          }
        } else {
          console.error('[Yappy] Payment initiation failed:', result.error);
          setLoading(false);
          if (onError) onError(result.error || 'No se pudo iniciar el pago con Yappy');
        }
      } catch (err) {
        console.error('[Yappy] Click exception:', err);
        setLoading(false);
        if (onError) onError(err);
      }
    };

    btnyappy.addEventListener('eventSuccess', handleSuccess);
    btnyappy.addEventListener('eventError', handleError);
    btnyappy.addEventListener('eventClick', handleClick);

    // Timeout check: if the web component shadow DOM fails to render within 1.5s, enable fallback UI
    const timer = setTimeout(() => {
      if (!btnyappy.shadowRoot && btnyappy.children.length === 0) {
        setUseFallback(true);
      }
    }, 1500);

    return () => {
      clearTimeout(timer);
      btnyappy.removeEventListener('eventSuccess', handleSuccess);
      btnyappy.removeEventListener('eventError', handleError);
      btnyappy.removeEventListener('eventClick', handleClick);
    };
  }, [onInitiatePayment, onSuccess, onError, currentOrderId]);

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
