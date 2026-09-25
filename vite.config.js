import { defineConfig } from 'vite';

export default defineConfig({
  // Relative asset URLs → the build works from any static host or sub-folder.
  base: './',
  build: {
    target: 'es2020',
    assetsInlineLimit: 4096,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/three')) return 'three';
          if (id.includes('node_modules/cannon-es')) return 'cannon';
        },
      },
    },
  },
});
