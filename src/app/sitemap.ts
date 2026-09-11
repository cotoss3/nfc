import { MetadataRoute } from 'next';
import { dbLocal } from '@/lib/db';
import { INDUSTRIAS } from '@/lib/industrias';

const BASE_URL = 'https://startap.com.pa';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/catalogo`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/app`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/corporativo`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/resenas-google`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
  ];

  const industriaRoutes: MetadataRoute.Sitemap = INDUSTRIAS.map((i) => ({
    url: `${BASE_URL}/resenas-google/${i.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  let productRoutes: MetadataRoute.Sitemap = [];
  try {
    productRoutes = dbLocal.getProducts().map((p) => ({
      url: `${BASE_URL}/catalogo/${p.id}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));
  } catch {
    productRoutes = [];
  }

  return [...staticRoutes, ...industriaRoutes, ...productRoutes];
}
