'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useCart } from '@/context/CartContext';

function getDeviceType(): string {
  if (typeof window === 'undefined') return 'Desconocido';
  const ua = navigator.userAgent;
  if (/iPhone/i.test(ua)) return 'iPhone (Safari)';
  if (/iPad/i.test(ua)) return 'iPad (Safari)';
  if (/Android/i.test(ua)) return 'Android Mobile (Chrome)';
  if (/Macintosh/i.test(ua)) return 'MacBook Pro (Safari)';
  if (/Windows/i.test(ua)) return 'Windows PC (Chrome)';
  if (/Linux/i.test(ua)) return 'Linux PC';
  return 'Navegador Web';
}

function getOrSetSessionId(): string {
  if (typeof window === 'undefined') return '';
  let id = sessionStorage.getItem('startap_session_id');
  if (!id) {
    const randomPart = Math.floor(1000 + Math.random() * 9000);
    id = `VIS-${randomPart}`;
    sessionStorage.setItem('startap_session_id', id);
  }
  return id;
}

export default function RealTimeTracker() {
  const pathname = usePathname();
  const { cart, getCartTotal, getItemCount } = useCart();
  const pageStartTimeRef = useRef<string>(new Date().toISOString());
  const prevPathnameRef = useRef<string>(pathname || '/');

  useEffect(() => {
    if (pathname !== prevPathnameRef.current) {
      pageStartTimeRef.current = new Date().toISOString();
      prevPathnameRef.current = pathname || '/';
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Do not track admin panel pages as customer traffic
    if (pathname && pathname.startsWith('/master-control')) return;

    const sessionId = getOrSetSessionId();
    const device = getDeviceType();
    let referrer = 'Enlace Directo / WhatsApp';
    if (document.referrer) {
      try {
        const host = new URL(document.referrer).hostname;
        if (host.includes('google')) referrer = 'Google Search (SEO Organico)';
        else if (host.includes('instagram')) referrer = 'Instagram Ads (@startap.pa)';
        else if (host.includes('facebook')) referrer = 'Facebook Ads';
        else referrer = host;
      } catch (e) {
        referrer = 'Enlace Directo / Navegador';
      }
    }

    const cartCount = getItemCount ? getItemCount() : 0;
    const cartTotal = getCartTotal ? getCartTotal() : 0;
    
    let cartSummary = 'Carrito vacío';
    if (cartCount > 0 && cart && cart.length > 0) {
      const firstItem = cart[0];
      cartSummary = `${cartCount}x ${firstItem.product_name} ($${cartTotal.toFixed(2)})`;
    }

    const payload = {
      session_id: sessionId,
      current_page: pathname || '/',
      referrer,
      device,
      has_cart: cartCount > 0,
      cart_count: cartCount,
      cart_total: cartTotal,
      cart_summary: cartSummary,
      page_start_time: pageStartTimeRef.current,
    };

    const sendPing = () => {
      fetch('/api/tracking/ping', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(err => console.debug('Tracking ping error:', err));
    };

    sendPing();
    const interval = setInterval(sendPing, 45000);

    return () => clearInterval(interval);
  }, [pathname, cart, getCartTotal, getItemCount]);

  return null;
}
