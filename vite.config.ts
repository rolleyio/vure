import { defineConfig } from 'vite';
import path from 'path';
import Vue from '@vitejs/plugin-vue';
import typescript from '@rollup/plugin-typescript';

const resolvePath = (str: string) => path.resolve(__dirname, str);

export default defineConfig({
  build: {
    lib: {
      entry: resolvePath('./src/index.ts'),
      name: 'Vure',
      fileName: (format) => `vure.${format}.js`,
    },
    rollupOptions: {
      plugins: [
        typescript({
          target: 'es2020',
          rootDir: resolvePath('./src'),
          declaration: true,
          declarationDir: resolvePath('./dist'),
          exclude: resolvePath('./node_modules/**'),
          allowSyntheticDefaultImports: true,
        }),
      ],
      external: [
        'vue',
        '@vue',
        '@vue/compiler-core',
        '@vue/compiler-dom',
        '@vue/reactivity',
        '@vue/runtime-core',
        '@vue/runtime-dom',
        '@vue/shared',
        'firebase',
        'firebase/app',
        'firebase/analytics',
        'firebase/app-check',
        'firebase/auth',
        'firebase/firestore',
        'firebase/firestore/lite',
        'firebase/functions',
        'firebase/messaging',
        'firebase/performance',
        'firebase/remote-config',
        'firebase/storage',
        'geofire-common',
        'source-map',
        'zod',
      ],
      output: {
        exports: 'named',
        // preserveModules: true,
        globals: {
          vue: 'Vue',
          'firebase/analytics': 'firebase',
          'firebase/app': 'firebase',
          'firebase/app-check': 'firebase',
          'firebase/auth': 'firebase',
          'firebase/firestore': 'firebase',
          'firebase/firestore/lite': 'firebase',
          'firebase/functions': 'firebase',
          'firebase/messaging': 'firebase',
          'firebase/performance': 'firebase',
          'firebase/remote-config': 'firebase',
          'firebase/storage': 'firebase',
        },
      },
    },
  },
  plugins: [Vue()],
});
