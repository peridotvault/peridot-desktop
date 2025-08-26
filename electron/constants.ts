import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_ROOT = path.join(__dirname, '..'); // back to project root

export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL'];
export const MAIN_DIST = path.join(APP_ROOT, 'dist-electron');
export const RENDERER_DIST = path.join(APP_ROOT, 'dist');
export const VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(APP_ROOT, 'public') : RENDERER_DIST;

process.env.APP_ROOT = APP_ROOT;
process.env.VITE_PUBLIC = VITE_PUBLIC;
