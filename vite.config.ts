import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  base: command === 'serve' ? '' : '/Survey/',
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'react': path.resolve(__dirname, './node_modules/react'),
      'react-dom': path.resolve(__dirname, './node_modules/react-dom'),
      'react-router-dom': path.resolve(__dirname, './node_modules/react-router-dom'),
    },
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'react-router-dom'],
    exclude: []
  },
  build: {
    commonjsOptions: {
      include: [/node_modules/],
      transformMixedEsModules: true
    }
  }
}));
