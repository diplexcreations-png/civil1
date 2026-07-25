import { test, expect } from '@playwright/test';

const BASE = 'https://www.civilmath.com';

const PAGES = [
  '/', '/bbs', '/structural', '/concrete', '/geotechnical', '/surveying', '/utilities',
  '/bbs/footing', '/bbs/beam', '/bbs/column', '/bbs/slab', '/bbs/staircase',
  '/bbs/retaining-wall', '/bbs/foundation-mesh',
  '/concrete/volume', '/concrete/rebar', '/concrete/brick',
  '/structural/beam', '/structural/column', '/structural/slab', '/structural/steel-weight',
  '/surveying/hi', '/surveying/traverse',
  '/geotechnical/bearing-capacity', '/geotechnical/retaining-wall',
  '/utilities/unit-converter',
  '/about', '/contact', '/privacy', '/dashboard',
];

test.describe('Smoke tests', () => {
  for (const page of PAGES) {
    test(`${page} loads successfully`, async ({ page: p }) => {
      const response = await p.goto(`${BASE}${page}`);
      expect(response?.status()).toBe(200);
      await expect(p.locator('body')).not.toBeEmpty();
    });
  }

  test('404 page', async ({ page: p }) => {
    const response = await p.goto(`${BASE}/nonexistent`);
      expect(response?.status()).toBe(200);
      await expect(p.locator('body')).toContainText('404');
  });

  test('sitemap.xml', async ({ page: p }) => {
    const response = await p.goto(`${BASE}/sitemap.xml`);
    expect(response?.status()).toBe(200);
    const text = await p.locator('body').innerText();
    expect(text).toContain('civilmath.com');
  });

  test('robots.txt', async ({ page: p }) => {
    const response = await p.goto(`${BASE}/robots.txt`);
    expect(response?.status()).toBe(200);
    const text = await p.locator('body').innerText();
    expect(text).toContain('Sitemap');
  });
});
