'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { FB_PIXEL_ID } from '@/lib/fbpixel';

/**
 * Carga el píxel de Meta y dispara PageView en cada cambio de ruta.
 *
 * En el App Router la navegación no recarga la página, así que el PageView
 * automático del snippet solo cuenta la primera visita. Por eso el useEffect.
 */
export default function MetaPixel() {
  const pathname = usePathname();

  useEffect(() => {
    if (!FB_PIXEL_ID || typeof window === 'undefined' || !window.fbq) return;
    window.fbq('track', 'PageView');
  }, [pathname]);

  if (!FB_PIXEL_ID) return null;

  return (
    <>
      <Script id="meta-pixel" strategy="lazyOnload">
        {`
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${FB_PIXEL_ID}');
fbq('track', 'PageView');
        `}
      </Script>
      <noscript>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          alt=""
          src={`https://www.facebook.com/tr?id=${FB_PIXEL_ID}&ev=PageView&noscript=1`}
        />
      </noscript>
    </>
  );
}
