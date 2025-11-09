import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { app } from 'electron';
import fs from 'node:fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_ROOT = path.join(__dirname, '..');

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];

// Try multiple path strategies for Windows
export const RENDERER_DIST = (() => {
  if (!app.isPackaged) {
    // Development
    return path.join(APP_ROOT, 'dist');
  }
  
  // Production - try different strategies
  const strategies = [
    path.join(process.resourcesPath, 'dist'),           // Strategy 1: resources/dist
    path.join(process.resourcesPath, 'app.asar', 'dist'), // Strategy 2: inside asar
    path.join(app.getAppPath(), 'dist'),                // Strategy 3: app path
    path.join(path.dirname(app.getPath('exe')), 'resources', 'dist'), // Strategy 4: relative to exe
  ];
  
  for (const strategy of strategies) {
    console.log(`Trying strategy: ${strategy}`);
    if (fs.existsSync(path.join(strategy, 'index.html'))) {
      console.log(`✓ Found index.html at: ${strategy}`);
      return strategy;
    }
  }
  
  console.error('❌ Could not find dist folder in any strategy!');
  return strategies[0]; // fallback
})();

export const VITE_PUBLIC = VITE_DEV_SERVER_URL 
  ? path.join(APP_ROOT, 'public') 
  : RENDERER_DIST;

export const MAIN_DIST = path.join(APP_ROOT, 'dist-electron');

process.env.APP_ROOT = APP_ROOT;
process.env.VITE_PUBLIC = VITE_PUBLIC;

console.log('=== CONSTANTS LOADED ===');
console.log('RENDERER_DIST:', RENDERER_DIST);
console.log('=======================');
