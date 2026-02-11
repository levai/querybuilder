import { mkdir } from 'node:fs/promises';
import { writeFile } from 'node:fs/promises';
import { defineConfig } from 'tsdown';
import Vue from 'unplugin-vue/rolldown';
import {
  commonBuildOptions,
} from '../../utils/tsdown.common';

const writeNode10pkg = async (entryPointNames: string[]) => {
  // Write the {util}/package.json's for node10 resolution
  await Promise.all(
    entryPointNames.map(async util => {
      await mkdir(`fwd/${util}`, { recursive: true });
      await Bun.write(
        `fwd/${util}/package.json`,
        JSON.stringify({ main: `../../dist/fwd/${util}.cjs`, types: `../../dist/fwd/${util}.d.ts` }, null, 2)
      );
    })
  );
};

export default defineConfig(async options => {
  const pkgName = 'vue-querybuilder';
  const entryPoint = 'src/index.ts';

  const vuePlugin = Vue({ isProduction: process.env.NODE_ENV === 'production' });

  const commonOptions = {
    entry: { [pkgName]: entryPoint },
    ...commonBuildOptions,
    ...options,
    platform: 'neutral',
    external: ['vue', '@react-querybuilder/core', ...(commonBuildOptions.external || [])],
    plugins: [...(commonBuildOptions.plugins || []), vuePlugin],
    dts: {
      vue: true, // 启用 Vue 类型定义生成（禁用 oxc，因为与 vue 选项不兼容）
    },
  } satisfies typeof options;

  const productionOptions = {
    minify: true,
    define: { NODE_ENV: 'production' },
  };

  const utilEntryPoints = {
    formatQuery: 'src/fwd/formatQuery.ts',
    parseCEL: 'src/fwd/parseCEL.ts',
    parseJSONata: 'src/fwd/parseJSONata.ts',
    parseJsonLogic: 'src/fwd/parseJsonLogic.ts',
    parseMongoDB: 'src/fwd/parseMongoDB.ts',
    parseSpEL: 'src/fwd/parseSpEL.ts',
    parseSQL: 'src/fwd/parseSQL.ts',
    transformQuery: 'src/fwd/transformQuery.ts',
  } as const;

  return [
    // ESM, standard bundler dev
    {
      ...commonOptions,
      format: 'esm',
      clean: true,
      outExtensions: () => ({ js: '.js' }),
    },
    // CJS development
    {
      ...commonOptions,
      entry: { [`${pkgName}.cjs.development`]: entryPoint },
      format: 'cjs',
      outDir: './dist/',
    },
    // CJS production
    {
      ...commonOptions,
      ...productionOptions,
      entry: { [`${pkgName}.cjs.production`]: entryPoint },
      format: 'cjs',
      outDir: './dist/',
      onSuccess: async () => {
        // 创建 CJS index 文件（适配 Vue 版本的输出路径）
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
          `export * from './${pkgName}.cjs.development.d.cts';`
        );
      },
    },
    // fwd 文件的 ES 模块构建
    {
      ...commonOptions,
      entry: Object.fromEntries(
        Object.entries(utilEntryPoints).map(([key, value]) => [`fwd/${key}`, value])
      ),
      format: 'esm',
      outDir: './dist',
    },
    // fwd 文件的 CommonJS 构建
    {
      ...commonOptions,
      entry: Object.fromEntries(
        Object.entries(utilEntryPoints).map(([key, value]) => [`fwd/${key}`, value])
      ),
      format: 'cjs',
      outDir: './dist',
      onSuccess: () => writeNode10pkg(Object.keys(utilEntryPoints)),
    },
  ];
});
