import { defineConfig } from 'vite';
import path from 'path';
import electron from 'vite-plugin-electron/simple';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import tailwindcss from '@tailwindcss/vite'


export default defineConfig({
  plugins: [
    tailwindcss(),
    wasm(),
    nodeResolve({
      preferBuiltins: false,
      browser: true,
    }),
    react({
      jsxRuntime: 'automatic',
      babel: {
        plugins: ['@babel/plugin-transform-react-jsx'],
      },
    }),
    electron({
      main: {
        entry: 'electron/main.ts',
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      renderer: process.env.NODE_ENV === 'test' ? undefined : {},
    }),
  ],
  resolve: {
    alias: {
      buffer: 'buffer/',
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      process: 'process/browser',
      util: 'util/',
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@features': path.resolve(__dirname, 'src/features'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@lib': path.resolve(__dirname, 'src/lib'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@dfinity/agent': path.resolve(__dirname, 'node_modules/@dfinity/agent/lib/esm/index.js'),
    },
  },
  define: {
    global: 'globalThis',
    'process.env': process.env,
    // 'process.version': '"v16.0.0"',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
      supported: {
        bigint: true,
      },
    },
    include: ['buffer', 'process', '@dfinity/agent', '@dfinity/principal', '@dfinity/candid'],
  },
  base: './',
  build: {
    target: 'esnext',
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      external: ['electron-store'],
      output: {
        format: 'esm',
      },
    },
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
});
