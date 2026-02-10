import { defineConfig } from 'vitest/config';
import vue from '@vitejs/plugin-vue';
import path from 'node:path';

export default defineConfig({
  plugins: [vue()],
  test: {
    environment: 'jsdom',
    globals: true,
    include: ['src/**/*.test.ts', 'src/**/*.test.vue', 'src/**/*.spec.ts'],
  },
  resolve: {
    alias: {
      '@react-querybuilder/core': path.resolve(__dirname, '../core/src'),
    },
  },
});
