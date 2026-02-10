import path from 'node:path';
import vitePluginReact from '@vitejs/plugin-react';
import vitePluginVue from '@vitejs/plugin-vue';
import type { UserConfig } from 'vite';
import { defineConfig } from 'vite';
import postcssScopedDonut from './devapp/postcss-scoped-donut';

const coreSrc = '../core/src';
const reSrc = '../rules-engine/src';
const rqbSrc = '../react-querybuilder/src';
const vqbSrc = '../vue-querybuilder/src';

export interface CommonViteOptions {
  port?: number;
  scopedDonut?: boolean;
  /** 'react' = default (Vite React plugin). 'vue' = Vite Vue plugin. */
  framework?: 'react' | 'vue';
  /** When set, enables lib build (e.g. for vue-querybuilder). */
  lib?: {
    entry: string;
    name: string;
    fileName: string;
    formats: ('es' | 'cjs')[];
    external?: string[];
    globals?: Record<string, string>;
  };
}

export const getCommonViteConfig = ({
  port = 3100,
  scopedDonut = true,
  framework = 'react',
  lib: libOpts,
}: CommonViteOptions = {}): UserConfig => {
  const plugins =
    framework === 'vue' ? [vitePluginVue()] : [vitePluginReact()];
  return defineConfig({
    define: { __RQB_DEVTOOLS__: true },
    plugins,
    resolve: {
      alias: {
        'react-querybuilder': path.resolve(rqbSrc),
        '@react-querybuilder/core': path.resolve(coreSrc),
        '@react-querybuilder/rules-engine': path.resolve(reSrc),
        '@rqb-devapp': path.resolve('../../utils/devapp'),
        '@rqb-parsecel': path.resolve(`${coreSrc}/utils/parseCEL`),
        '@rqb-parsejsonata': path.resolve(`${coreSrc}/utils/parseJSONata`),
        '@rqb-parsejsonlogic': path.resolve(`${coreSrc}/utils/parseJsonLogic`),
        '@rqb-parsemongodb': path.resolve(`${coreSrc}/utils/parseMongoDB`),
        '@rqb-parsespel': path.resolve(`${coreSrc}/utils/parseSpEL`),
        '@rqb-parsesql': path.resolve(`${coreSrc}/utils/parseSQL`),
        '@rqb-utils': path.resolve(`${coreSrc}/utils`),
        'vue-querybuilder': path.resolve(vqbSrc),
      },
    },
    css: {
      postcss: { plugins: scopedDonut ? [postcssScopedDonut] : [] },
    },
    server: { port },
    ...(libOpts && {
      build: {
        lib: {
          entry: path.resolve(libOpts.entry),
          name: libOpts.name,
          fileName: libOpts.fileName,
          formats: libOpts.formats,
        },
        rollupOptions: {
          external: libOpts.external ?? [],
          output: { globals: libOpts.globals ?? {} },
        },
        cssCodeSplit: true,
      },
    }),
  });
};
