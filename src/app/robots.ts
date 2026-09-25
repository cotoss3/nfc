import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/master-control',
          '/master-control/*',
          '/dashboard',
          '/dashboard/*',
          '/admin',
          '/admin/*',
          '/api/*',
          '/cart',
          '/checkout',
          '/r/*',
        ],
      },
    ],
    sitemap: 'https://startap.com.pa/sitemap.xml',
    host: 'https://startap.com.pa',
  };
}
