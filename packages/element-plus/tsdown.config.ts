import { writeFile } from 'node:fs/promises';
import { defineConfig } from 'tsdown';
import Vue from 'unplugin-vue/rolldown';
import { commonBuildOptions } from '../../utils/tsdown.common';

const pkgName = 'vue-querybuilder_element-plus';
const entryPoint = 'src/index.ts';

export default defineConfig(options => {
  const vuePlugin = Vue({ isProduction: process.env.NODE_ENV === 'production' });

  const commonOptions = {
    entry: { [pkgName]: entryPoint },
    ...commonBuildOptions,
    ...options,
    platform: 'neutral',
    external: ['vue', 'element-plus', 'vue-querybuilder', '@react-querybuilder/core', ...(commonBuildOptions.external || [])],
    plugins: [...(commonBuildOptions.plugins || []), vuePlugin],
    dts: { vue: true },
  };

  return [
    {
      ...commonOptions,
      format: 'esm',
      clean: true,
      outExtensions: () => ({ js: '.js' }),
    },
    {
      ...commonOptions,
      entry: { [`${pkgName}.cjs.development`]: entryPoint },
      format: 'cjs',
      outDir: './dist/',
    },
    {
      ...commonOptions,
      minify: true,
      define: { NODE_ENV: 'production' },
      entry: { [`${pkgName}.cjs.production`]: entryPoint },
      format: 'cjs',
      outDir: './dist/',
      onSuccess: async () => {
        await writeFile(
          `dist/${pkgName}.cjs`,
          `'use strict';
if (process.env.NODE_ENV === 'production') {
  module.exports = require('./${pkgName}.cjs.production.cjs');
} else {
  module.exports = require('./${pkgName}.cjs.development.cjs');
}
`
        );
        await writeFile(
          `dist/${pkgName}.cjs.d.ts`,
          `export * from './${pkgName}.cjs.development.d.cts';\n`
        );
      },
    },
  ];
});
