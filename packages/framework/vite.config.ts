import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'RolleyFramework',
    },
    minify: false,
    rollupOptions: {
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
        '@firebase/firestore',
        'firebase/app',
        'firebase/analytics',
        'firebase/app-check',
        'firebase/auth',
        'firebase/firestore',
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
        banner: `
        /**
         *  Copyright ${new Date().getFullYear()} Matt Rollinson
         *  @license MIT
        **/
        `,
        exports: 'named',
        globals: {
          vue: 'Vue',
          firebase: 'firebase',
          'firebase/analytics': 'firebase',
          'firebase/app': 'firebase',
          'firebase/app-check': 'firebase',
          'firebase/auth': 'firebase',
          'firebase/firestore': 'firebase',
          '@firebase/firestore': 'firebase',
          'firebase/functions': 'firebase',
          'firebase/messaging': 'firebase',
          'firebase/performance': 'firebase',
          'firebase/remote-config': 'firebase',
          'firebase/storage': 'firebase',
          zod: 'zod',
          'geofire-common': 'geofire-common',
        },
      },
    },
  },
});
