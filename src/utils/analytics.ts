declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;

let initialized = false;

export function isAnalyticsEnabled(): boolean {
  return Boolean(MEASUREMENT_ID && MEASUREMENT_ID.startsWith('G-'));
}

export function initAnalytics(): void {
  if (!isAnalyticsEnabled() || initialized || typeof window === 'undefined') return;

  initialized = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag('js', new Date());
  window.gtag('config', MEASUREMENT_ID, { send_page_view: false });

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

export function trackPageView(pageName: string): void {
  if (!isAnalyticsEnabled() || !window.gtag) return;

  window.gtag('event', 'page_view', {
    page_title: pageName,
    page_location: `${window.location.origin}${window.location.pathname}#${pageName}`,
    page_path: `/${pageName}`,
  });
}

export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  if (!isAnalyticsEnabled() || !window.gtag) return;
  window.gtag('event', eventName, params);
}
