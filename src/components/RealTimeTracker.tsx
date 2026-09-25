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

function isSearchBot(): boolean {
  if (typeof window === 'undefined' || typeof navigator === 'undefined') return true;
  const ua = navigator.userAgent || '';
  return /Googlebot|Google-InspectionTool|Storebot-Google|AdsBot-Google|Mediapartners-Google|bingbot|Slurp|DuckDuckBot|Baiduspider|YandexBot|Sogou|Exabot|facebot|ia_archiver|Lighthouse|HeadlessChrome/i.test(ua);
}

function getOrSetSessionId(): string {
  if (typeof window === 'undefined') return '';
  try {
    let id = sessionStorage.getItem('startap_session_id');
    if (!id) {
      const timestamp = Date.now().toString(36).toUpperCase();
      const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
      id = `VIS-${timestamp}-${randomPart}`;
      sessionStorage.setItem('startap_session_id', id);
    }
    return id;
  } catch {
    return `VIS-${Date.now().toString(36).toUpperCase()}`;
  }
}

export default function RealTimeTracker() {
  const pathname = usePathname();
  const { cart } = useCart();
  const pageStartTimeRef = useRef<string>(new Date().toISOString());
  const prevPathnameRef = useRef<string>(pathname || '/');

  const cartCount = cart.reduce((count, item) => count + item.quantity, 0);
  const cartTotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
  const firstItemName = cart[0]?.product_name || '';

  useEffect(() => {
    if (pathname !== prevPathnameRef.current) {
      pageStartTimeRef.current = new Date().toISOString();
      prevPathnameRef.current = pathname || '/';
    }
  }, [pathname]);

  useEffect(() => {
    if (typeof window === 'undefined' || isSearchBot()) return;

    // Do not track admin or client dashboard panel pages as public store traffic
    if (pathname && (pathname.startsWith('/master-control') || pathname.startsWith('/dashboard'))) {
      return;
    }

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

    let cartSummary = 'Carrito vacío';
    if (cartCount > 0 && firstItemName) {
      cartSummary = `${cartCount}x ${firstItemName} ($${cartTotal.toFixed(2)})`;
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
        keepalive: true,
      }).catch((err) => console.debug('Tracking ping error:', err));
    };

    // Defer initial ping slightly so it does not compete with LCP/INP during route transitions
    const initialTimer = setTimeout(sendPing, 800);
    const interval = setInterval(sendPing, 45000);

    return () => {
      clearTimeout(initialTimer);
      clearInterval(interval);
    };
  }, [pathname, cartCount, cartTotal, firstItemName]);

  return null;
}

