import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://chambasimple.com',
  trailingSlash: 'never',
  // Inline CSS: no render-blocking request. Each page's CSS is a few KB.
  build: { format: 'file', inlineStylesheets: 'always' },
  i18n: { locales: ['es', 'en'], defaultLocale: 'es', routing: { prefixDefaultLocale: false } },
  integrations: [sitemap({ i18n: { defaultLocale: 'es', locales: { es: 'es', en: 'en' } } })],
  vite: { plugins: [tailwindcss()] },
});
