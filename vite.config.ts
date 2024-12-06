import { defineConfig } from 'vite';
import path from 'path';
import electron from 'vite-plugin-electron/simple';
import react from '@vitejs/plugin-react';
import wasm from 'vite-plugin-wasm';
import { nodeResolve } from '@rollup/plugin-node-resolve';

export default defineConfig({
  plugins: [
    wasm(),
    nodeResolve({
      preferBuiltins: false,
      browser: true
    }),
    react({
      jsxRuntime: 'automatic',
      babel: {
        plugins: [
          '@babel/plugin-transform-react-jsx',
        ],
      },
    }),
    electron({
      main: {
        entry: 'electron/main.ts',
      },
      preload: {
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      renderer: process.env.NODE_ENV === 'test'
        ? undefined
        : {},
    }),
  ],
  resolve: {
    alias: {
      buffer: 'buffer/',
      stream: 'stream-browserify',
      crypto: 'crypto-browserify',
      process: 'process/browser',
      util: 'util/',
      '@dfinity/agent': path.resolve(__dirname, 'node_modules/@dfinity/agent/lib/esm/index.js'),
    },
  },
  define: {
    'global': 'globalThis',
    'process.env': process.env,
    'process.version': '"v16.0.0"',
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'esnext',
      supported: {
        bigint: true
      },
    },
    include: [
      'buffer',
      'process',
      '@dfinity/agent',
      '@dfinity/principal',
      '@dfinity/candid',
    ],
  },
  build: {
    target: 'esnext',
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