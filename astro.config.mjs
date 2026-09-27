// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://prototiplab.ru',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory', inlineStylesheets: 'auto' },
  integrations: [
    sitemap({ filter: (page) => !page.includes('/404') }),
  ],
  image: { responsiveStyles: false },
  vite: {
    build: { chunkSizeWarningLimit: 700 },
  },
});
