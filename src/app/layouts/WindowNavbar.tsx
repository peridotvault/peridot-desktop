import { useEffect, useState } from 'react';
import { getCurrentWindow } from '@tauri-apps/api/window';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faArrowLeft,
  faArrowRight,
  faArrowsRotate,
  faUpRightAndDownLeftFromCenter,
  faWindowMinimize,
  faXmark,
} from '@fortawesome/free-solid-svg-icons';
import { NotificationComponent } from '@shared/components/Notification';
import { ImagePeridotLogo } from '@shared/constants/images';

type OsType = 'mac' | 'windows' | 'linux' | 'other';

const appWindow = getCurrentWindow();

function detectOS(): OsType {
  if (typeof navigator === 'undefined') return 'other';

  const { userAgent, platform } = navigator;

  const macPlatforms = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'];
  if (macPlatforms.includes(platform)) return 'mac';
  if (/Win/.test(platform)) return 'windows';
  if (/Linux/.test(platform) || /X11/.test(platform)) return 'linux';

  if (/Mac OS X/.test(userAgent)) return 'mac';
  if (/Windows/.test(userAgent)) return 'windows';
  if (/Linux/.test(userAgent)) return 'linux';

  return 'other';
}

export const WindowNavbar = () => {
  const [os, setOs] = useState<OsType>('other');

  useEffect(() => {
    setOs(detectOS());
  }, []);

  const isMac = os === 'mac';

  const handleMinimize = () => appWindow.minimize();
  const handleMaximize = () => appWindow.toggleMaximize();
  const handleClose = () => appWindow.close();

  const colorActScheme = {
    close: '#FF605C',
    minimize: '#FFBD44',
    maximize: '#00CA4E',
  };

  return (
    <div className="fixed top-0 left-0 h-12 w-full z-100 bg-card text-white select-none">
      {/* Main ROW: Left (drag + traffic) + Right (chain / window controls) */}
      <div className="flex h-full px-3">
        {/* LEFT = DRAG REGION + traffic lights */}
        <div data-tauri-drag-region className="flex-1 flex items-center">
          {isMac ? (
            <div className="flex items-center gap-2 group text-background">
              <button
                onClick={handleClose}
                style={{ '--act-close': colorActScheme.close } as any}
                className="w-3.5 h-3.5 aspect-square shrink-0 rounded-full bg-muted-foreground group-hover:bg-(--act-close) hover:scale-110 duration-500 flex items-center justify-center"
              >
                <FontAwesomeIcon
                  icon={faXmark}
                  className="text-[6px] leading-none opacity-0 group-hover:opacity-100 duration-500 translate-y-[0.25px]"
                />
              </button>
              <button
                onClick={handleMinimize}
                style={{ '--act-minimize': colorActScheme.minimize } as any}
                className="w-3.5 h-3.5 aspect-square shrink-0 rounded-full bg-muted-foreground group-hover:bg-(--act-minimize) hover:scale-110 duration-300 flex items-center justify-center"
              >
                <FontAwesomeIcon
                  icon={faWindowMinimize}
                  className="text-[6px] leading-none opacity-0 group-hover:opacity-100 duration-300 translate-y-[0.25px]"
                />
              </button>
              <button
                onClick={handleMaximize}
                style={{ '--act-maximize': colorActScheme.maximize } as any}
                className="w-3.5 h-3.5 aspect-square shrink-0 rounded-full bg-muted-foreground group-hover:bg-(--act-maximize) hover:scale-110 duration-100 flex items-center justify-center"
              >
                <FontAwesomeIcon
                  icon={faUpRightAndDownLeftFromCenter}
                  className="text-[6px] leading-none opacity-0 group-hover:opacity-100 duration-100 translate-y-[0.25px]"
                />
              </button>
            </div>
          ) : (
            <div
              data-tauri-drag-region
              className="flex items-center justify-center h-full py-3 w-10"
            >
              <img
                src={ImagePeridotLogo}
                data-tauri-drag-region
                alt=""
                draggable={false}
                className="h-full aspect-square object-contain"
              />
            </div>
          )}
        </div>

        {/* RIGHT: chain switcher +/− window controls */}
        {isMac ? (
          <div className="flex items-center">
            <NotificationComponent />
          </div>
        ) : (
          <div className="flex items-center gap-6">
            <NotificationComponent />

            <div className="flex items-center gap-2 text-sm">
              <button
                onClick={handleMinimize}
                className="flex aspect-square rounded overflow-hidden items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer h-7 duration-200"
              >
                <FontAwesomeIcon icon={faWindowMinimize} />
              </button>
              <button
                onClick={handleMaximize}
                className="flex aspect-square rounded overflow-hidden items-center justify-center text-muted-foreground hover:text-foreground cursor-pointer h-7 duration-200"
              >
                <FontAwesomeIcon icon={faUpRightAndDownLeftFromCenter} />
              </button>
              <button
                onClick={handleClose}
                className="flex aspect-square rounded overflow-hidden items-center justify-center text-muted-foreground hover:bg-chart-5 hover:text-foreground cursor-pointer h-7 duration-200"
              >
                <FontAwesomeIcon icon={faXmark} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* CENTER: arrows + address bar + refresh, overlay di TENGAH FULL BAR */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="flex items-center gap-3 pointer-events-auto w-full max-w-[500px] px-4">
          {/* arrows */}
          <div className="flex gap-2 shrink-0">
            <button className="text-muted-foreground hover:text-foreground duration-200">
              <FontAwesomeIcon icon={faArrowLeft} />
            </button>
            <button className="text-muted-foreground hover:text-foreground duration-200">
              <FontAwesomeIcon icon={faArrowRight} />
            </button>
          </div>

          {/* address bar */}
          <input
            type="text"
            readOnly
            value="https://app.peridotvault.com/"
            className="flex-1 min-w-0 border border-white/20 bg-muted rounded py-1 text-sm text-center outline-none cursor-pointer"
          />

          {/* refresh */}
          <div className="shrink-0">
            <button className="text-muted-foreground hover:text-foreground duration-200">
              <FontAwesomeIcon icon={faArrowsRotate} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
