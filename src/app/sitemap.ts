import { MetadataRoute } from 'next';
import { PRODUCTS } from '@/config/products';
import { INDUSTRIAS } from '@/lib/industrias';
import { POSTS, AUTORES } from '@/lib/blog';

const BASE_URL = 'https://startap.com.pa';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${BASE_URL}/`, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${BASE_URL}/catalogo`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${BASE_URL}/app`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${BASE_URL}/corporativo`, lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${BASE_URL}/resenas-google`, lastModified: now, changeFrequency: 'weekly', priority: 0.95 },
    { url: `${BASE_URL}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${BASE_URL}/envios`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${BASE_URL}/terminos`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${BASE_URL}/privacidad`, lastModified: now, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const industriaRoutes: MetadataRoute.Sitemap = INDUSTRIAS.map((i) => ({
    url: `${BASE_URL}/resenas-google/${i.slug}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.95,
  }));

  const productRoutes: MetadataRoute.Sitemap = PRODUCTS.map((p) => ({
    url: `${BASE_URL}/catalogo/${p.id}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: 0.95,
  }));

  const blogRoutes: MetadataRoute.Sitemap = POSTS.map((p) => ({
    url: `${BASE_URL}/blog/${p.slug}`,
    lastModified: new Date(p.actualizado),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  const autorRoutes: MetadataRoute.Sitemap = Object.keys(AUTORES).map((slug) => ({
    url: `${BASE_URL}/autor/${slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }));

  return [...staticRoutes, ...industriaRoutes, ...blogRoutes, ...autorRoutes, ...productRoutes];
}
