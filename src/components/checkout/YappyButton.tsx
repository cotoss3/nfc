'use client';

import React, { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { trackGA } from '@/lib/googleanalytics';

interface YappyButtonProps {
  onInitiatePayment: () => Promise<{ success: boolean; transactionId?: string; documentName?: string; token?: string; error?: string; orderId?: string }>;
  onSuccess?: (orderId: string) => void;
  onError?: (error: any) => void;
  theme?: 'blue' | 'darkBlue' | 'orange' | 'dark' | 'sky' | 'light';
}

export default function YappyButton({ onInitiatePayment, onSuccess, onError, theme = 'blue' }: YappyButtonProps) {
  const btnRef = useRef<HTMLElement>(null);
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string>('');

  useEffect(() => {
    const btnyappy = btnRef.current;
    if (!btnyappy || !scriptLoaded) return;

    const handleSuccess = (e: any) => {
      console.log('[Yappy] eventSuccess:', e.detail);
      trackGA('purchase_yappy', { transaction_id: currentOrderId });
      if (onSuccess && currentOrderId) {
        onSuccess(currentOrderId);
      }
    };

    const handleError = (e: any) => {
      console.error('[Yappy] eventError:', e.detail);
      if (onError) {
        onError(e.detail);
      }
    };

    const handleClick = async () => {
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
          // Call the web component's method to proceed
          (btnyappy as any).eventPayment(params);
        } else {
          console.error('[Yappy] Payment initiation failed:', result.error);
          if (onError) onError(result.error || 'No se pudo iniciar Yappy');
        }
      } catch (err) {
        console.error('[Yappy] Click exception:', err);
        if (onError) onError(err);
      }
    };

    btnyappy.addEventListener('eventSuccess', handleSuccess);
    btnyappy.addEventListener('eventError', handleError);
    btnyappy.addEventListener('eventClick', handleClick);

    return () => {
      btnyappy.removeEventListener('eventSuccess', handleSuccess);
      btnyappy.removeEventListener('eventError', handleError);
      btnyappy.removeEventListener('eventClick', handleClick);
    };
  }, [scriptLoaded, onInitiatePayment, onSuccess, onError, currentOrderId]);

  return (
    <div className="w-full flex justify-center py-2 min-h-[50px]">
      <Script 
        src="https://bt-cdn.yappy.cloud/v1/cdn/web-component-btn-yappy.js" 
        strategy="lazyOnload" 
        onLoad={() => setScriptLoaded(true)}
      />
      {/* @ts-ignore */}
      <btn-yappy ref={btnRef} theme={theme}></btn-yappy>
    </div>
  );
}
