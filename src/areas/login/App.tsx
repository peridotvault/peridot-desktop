import { getCurrentWindow } from '@tauri-apps/api/window';

const appWindow = getCurrentWindow();

export const App = () => {
  return (
    <div data-tauri-drag-region className="w-full h-screen flex items-center justify-center">
      <p data-tauri-drag-region>App</p>
    </div>
  );
};
