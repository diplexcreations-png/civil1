const SITE_URL = 'https://civilmath.com';

const CATEGORIES = [
  { key: 'bbs', path: 'bbs' },
  { key: 'structural', path: 'structural' },
  { key: 'concrete', path: 'concrete' },
  { key: 'geotech', path: 'geotechnical' },
  { key: 'survey', path: 'surveying' },
  { key: 'utility', path: 'utilities' },
];

const BBS_STRUCTURES = [
  'footing', 'combined-footing', 'strip-footing', 'raft-foundation',
  'beam', 'plinth-beam', 'tie-beam', 'lintel-beam',
  'column', 'pedestal', 'slab', 'staircase',
  'retaining-wall', 'foundation-mesh',
];

const CALCULATORS = [
  { category: 'concrete', slug: 'volume' },
  { category: 'concrete', slug: 'rebar' },
  { category: 'concrete', slug: 'brick' },
  { category: 'structural', slug: 'beam' },
  { category: 'structural', slug: 'column' },
  { category: 'structural', slug: 'slab' },
  { category: 'structural', slug: 'steel-weight' },
  { category: 'survey', slug: 'hi' },
  { category: 'survey', slug: 'traverse' },
  { category: 'geotech', slug: 'bearing-capacity' },
  { category: 'geotech', slug: 'retaining-wall' },
  { category: 'utility', slug: 'unit-converter' },
];

function getPath(categoryKey) {
  const cat = CATEGORIES.find(c => c.key === categoryKey);
  return cat ? cat.path : categoryKey;
}

function generateEntries() {
  const entries = [];
  const today = new Date().toISOString().split('T')[0];

  entries.push({ url: '/', changefreq: 'weekly', priority: 1.0 });

  CATEGORIES.forEach(c => {
    entries.push({ url: `/${c.path}`, changefreq: 'weekly', priority: 0.9 });
  });

  BBS_STRUCTURES.forEach(id => {
    entries.push({ url: `/bbs/${id}`, changefreq: 'weekly', priority: 0.8 });
  });

  CALCULATORS.forEach(calc => {
    const path = getPath(calc.category);
    entries.push({ url: `/${path}/${calc.slug}`, changefreq: 'monthly', priority: 0.7, lastmod: today });
  });

  entries.push({ url: '/about', changefreq: 'monthly', priority: 0.4 });
  entries.push({ url: '/contact', changefreq: 'monthly', priority: 0.4 });
  entries.push({ url: '/privacy', changefreq: 'monthly', priority: 0.3 });
  entries.push({ url: '/dashboard', changefreq: 'monthly', priority: 0.3 });

  return entries;
}

function generateXML() {
  const entries = generateEntries();
  const today = new Date().toISOString().split('T')[0];
  const urls = entries.map(e => {
    const lastmod = e.lastmod || today;
    return `  <url>
    <loc>${SITE_URL}${e.url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${e.changefreq}</changefreq>
    <priority>${e.priority.toFixed(1)}</priority>
  </url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}

export default function handler(req, res) {
  res.setHeader('Content-Type', 'application/xml');
  res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
  res.status(200).send(generateXML());
}
