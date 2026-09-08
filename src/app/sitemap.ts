import { MetadataRoute } from 'next';
import { dbLocal } from '@/lib/db';

const BASE_URL = 'https://startap.com.pa';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/shop`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/funciones`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/app`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/corporativo`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
  ];

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    productRoutes = dbLocal.getProducts().map((p) => ({
      url: `${BASE_URL}/shop/${p.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));
  } catch {
    productRoutes = [];
  }

  return [...staticRoutes, ...productRoutes];
}
