import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import { getCommonViteConfig } from '../../utils/vite.common';

const dir = path.dirname(fileURLToPath(import.meta.url));
const base = getCommonViteConfig({
  port: 3110,
  framework: 'vue',
  lib: {
    entry: path.resolve(dir, 'src/index.ts'),
    name: 'VueQueryBuilder',
    fileName: 'vue-querybuilder',
    formats: ['es', 'cjs'],
    external: ['vue', '@react-querybuilder/core'],
    globals: { vue: 'Vue', '@react-querybuilder/core': 'ReactQueryBuilderCore' },
  },
});

export default defineConfig({
  ...base,
  server: {
    ...base.server,
    host: '127.0.0.1', // 避免 getaddrinfo ENOTFOUND localhost（部分环境无法解析 localhost）
  },
  build: {
    ...base.build,
    rollupOptions: {
      ...base.build?.rollupOptions,
      output: {
        ...(base.build?.rollupOptions as { output?: Record<string, unknown> } | undefined)?.output,
        inlineDynamicImports: true,
      },
    },
  },
});
