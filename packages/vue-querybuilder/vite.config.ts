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
