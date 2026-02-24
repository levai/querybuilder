import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { getCommonViteConfig } from '../../utils/vite.common';

const dir = path.dirname(fileURLToPath(import.meta.url));

const base = getCommonViteConfig({
  framework: 'vue',
  port: 3111,
});

export default defineConfig({
  ...base,
  resolve: {
    ...base.resolve,
    alias: {
      ...(base.resolve?.alias as Record<string, string>),
      '@vue-querybuilder/element-plus': path.resolve(dir, 'src'),
    },
  },
});
