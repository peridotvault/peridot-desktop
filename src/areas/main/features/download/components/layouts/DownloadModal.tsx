import { AnimatePresence, motion } from 'framer-motion';
import { DownloadItem } from '../../interfaces/Item';
import { useState } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  leftClassName?: string; // ex: "left-20"
  title?: string;
};

export default function DownloadModal({
  open,
  onClose,
  leftClassName = 'left-24',
  title = 'Download Modal',
}: Props) {
  const [queue] = useState<DownloadItem[]>([]);

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 bg-black/50 z-40"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Panel (slide from left) */}
          <motion.div
            className={[
              'fixed top-12 bottom-0 w-2xl bg-background border-x border-foreground/10 shadow-2xl',
              'flex flex-col z-40',
              leftClassName,
            ].join(' ')}
            role="dialog"
            aria-label={title}
            initial={{ x: '-100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '-100%', opacity: 0 }}
            transition={{ type: 'spring', stiffness: 480, damping: 42, mass: 0.8 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col p-5 h-full">
              <h1 className="text-xl font-semibold">Downloads</h1>

              {queue.length === 0 && (
                <p className="text-sm text-zinc-400">Tidak ada download berjalan.</p>
              )}

              {queue.map((item) => (
                <div
                  key={item.gameId}
                  className="border border-zinc-800 rounded-xl p-3 flex flex-col gap-2"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{item.title}</div>
                      <div className="text-xs text-zinc-400">
                        {item.status.toUpperCase()} • {Math.round((item.progress || 0) * 100)}%
                      </div>
                    </div>
                    {/* Optional: tombol cancel/pause */}
                  </div>

                  <div className="w-full bg-zinc-900 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-zinc-100 transition-all"
                      style={{ width: `${(item.progress || 0) * 100}%` }}
                    />
                  </div>

                  <div className="text-[10px] text-zinc-500">
                    {(item.downloadedBytes / 1024 / 1024).toFixed(1)} MB /{' '}
                    {(item.totalBytes / 1024 / 1024).toFixed(1)} MB
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
