import { CALCULATORS_LIST } from '../data/calculatorsData';
import { STRUCTURES } from '../UniversalBBSCalculator/types';
import { CATEGORY_PATH_MAP, CATEGORY_META, getCalculatorSlug } from './seo';
import { CalculatorCategory } from '../types';

const SITE_URL = 'https://civilmath.com';

interface SitemapEntry {
  url: string;
  changefreq: string;
  priority: number;
  lastmod?: string;
}

export function generateSitemapEntries(): SitemapEntry[] {
  const entries: SitemapEntry[] = [];

  entries.push({ url: '/', changefreq: 'weekly', priority: 1.0 });

  Object.keys(CATEGORY_META).forEach(key => {
    const path = CATEGORY_PATH_MAP[key as CalculatorCategory];
    entries.push({ url: `/${path}`, changefreq: 'weekly', priority: 0.9 });
  });

  STRUCTURES.forEach(s => {
    entries.push({ url: `/bbs/${s.id}`, changefreq: 'weekly', priority: 0.8 });
  });

  CALCULATORS_LIST.filter(c => c.category !== 'bbs').forEach(calc => {
    const path = CATEGORY_PATH_MAP[calc.category];
    entries.push({ url: `/${path}/${getCalculatorSlug(calc)}`, changefreq: 'monthly', priority: 0.7 });
  });

  entries.push({ url: '/about', changefreq: 'monthly', priority: 0.4 });
  entries.push({ url: '/contact', changefreq: 'monthly', priority: 0.4 });
  entries.push({ url: '/privacy', changefreq: 'monthly', priority: 0.3 });
  entries.push({ url: '/dashboard', changefreq: 'monthly', priority: 0.3 });

  return entries;
}

export function generateSitemapXML(): string {
  const entries = generateSitemapEntries();
  const urls = entries.map(entry => {
    const lastmod = entry.lastmod || new Date().toISOString().split('T')[0];
    return `  <url>
    <loc>${SITE_URL}${entry.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export function generateRobotsTxt(): string {
  return `User-agent: *
Allow: /
Disallow: /dashboard

Sitemap: ${SITE_URL}/sitemap.xml
`;
}
