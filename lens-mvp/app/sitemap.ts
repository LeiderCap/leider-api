import type { MetadataRoute } from 'next';
import {
  PUBLIC_SITEMAP_ORIGIN,
  PUBLIC_SITEMAP_PATHS,
} from '@/lib/public-sitemap-catalog';

/** Pure catalog consumer: no database, credentials, network or record discovery. */
export default function sitemap(): MetadataRoute.Sitemap {
  return PUBLIC_SITEMAP_PATHS.map((path) => ({
    url: new URL(path, PUBLIC_SITEMAP_ORIGIN).toString(),
  }));
}
