import React from 'react';
import { PriceCoin } from '../../lib/constants/const-price';

type GameItem = {
  gameId: string;
  gameBannerImage: string;
  gameName: string;
  gameDescription: string;
  gamePrice: number;
};

type Props = {
  items: GameItem[];
  intervalMs?: number;
  fadeMs?: number; // durasi fade (ms)
};

export function VaultCarousel({ items, intervalMs = 10000, fadeMs = 500 }: Props) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [prevIndex, setPrevIndex] = React.useState<number | null>(null);
  const [isFading, setIsFading] = React.useState(false);
  const rotateRef = React.useRef<ReturnType<typeof setInterval> | null>(null);
  const cleanupFadeRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const len = items.length;
  if (len === 0) return null;

  const goTo = (i: number) => {
    const nextIndex = ((i % len) + len) % len;
    if (nextIndex === activeIndex) return;
    // siapkan crossfade: simpan layer lama, mulai fade-in layer baru
    setPrevIndex(activeIndex);
    setActiveIndex(nextIndex);
    setIsFading(false); // mulai dari opacity-0
    // next tick -> ubah ke opacity-100 supaya transition jalan
    requestAnimationFrame(() => setIsFading(true));
    // bersihkan layer lama setelah fade selesai
    if (cleanupFadeRef.current) clearTimeout(cleanupFadeRef.current);
    cleanupFadeRef.current = setTimeout(() => {
      setPrevIndex(null);
      setIsFading(false);
    }, fadeMs);
  };

  const next = () => goTo(activeIndex + 1);

  // Auto-rotate
  React.useEffect(() => {
    if (len <= 1) return;
    if (rotateRef.current) clearInterval(rotateRef.current);
    rotateRef.current = setInterval(next, intervalMs);
    return () => {
      if (rotateRef.current) clearInterval(rotateRef.current);
      rotateRef.current = null;
    };
  }, [activeIndex, intervalMs, len]);

  React.useEffect(() => {
    return () => {
      if (cleanupFadeRef.current) clearTimeout(cleanupFadeRef.current);
    };
  }, []);

  // Indeks untuk dua thumbnail kanan
  const next1 = (activeIndex + 1) % len;
  const next2 = (activeIndex + 2) % len;

  const active = items[activeIndex];

  return (
    <section
      className="flex justify-center relative px-12"
      aria-roledescription="carousel"
      aria-label="Game showcase"
    >
      <div className="w-full aspect-[16/7] max-w-[1400px] flex justify-end pt-6 z-20 gap-6">
        {/* Main banner dengan crossfade */}
        <div className="relative aspect-video w-full rounded-xl overflow-hidden shadow-flat-sm border border-white/10">
          {/* Layer lama (tetap terlihat di bawah saat transisi) */}
          <img
            key={prevIndex ?? -1}
            src={(prevIndex !== null ? items[prevIndex] : active).gameBannerImage}
            alt={(prevIndex !== null ? items[prevIndex] : active).gameName}
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Layer baru (fade-in) */}
          <img
            key={activeIndex}
            src={active.gameBannerImage}
            alt={active.gameName}
            className={[
              'absolute inset-0 w-full h-full object-cover',
              'transition-opacity',
              `duration-[${fadeMs}ms]`,
              isFading ? 'opacity-100' : 'opacity-0',
            ].join(' ')}
          />
          {/* Optional: efek hover zoom pada layer paling atas */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="w-full h-full transition-transform duration-500 will-change-transform hover:scale-105" />
          </div>
        </div>

        {/* Right column */}
        <div className="w-full max-w-[350px] flex flex-col gap-6">
          {/* Detail card (jika ingin difade juga, bisa pakai pendekatan yang sama) */}
          <div className="col-span-2 row-span-4 h-full w-full shadow-flat-sm border border-white/10 rounded-xl backdrop-blur-md p-8 flex flex-col gap-6 justify-between">
            <div className="flex flex-col gap-4">
              <span className="font-bold text-2xl">{active.gameName}</span>
              <span className="line-clamp-6">{active.gameDescription}</span>
            </div>
            <div className="flex flex-col gap-3">
              <PriceCoin price={active.gamePrice} textSize="lg" />
              <button className="px-4 py-2 shadow-arise-sm hover:shadow-flat-sm rounded-md">
                View Game
              </button>
            </div>
          </div>

          {/* Thumbnails (klik untuk pindah) */}
          <div className="flex gap-6">
            <button
              type="button"
              className="col-span-1 bg-white/5 rounded-lg overflow-hidden aspect-video outline-none opacity-50 hover:scale-105 duration-300 ring-0 focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => goTo(next1)}
              aria-label={`Lihat ${items[next1].gameName}`}
            >
              <img
                src={items[next1].gameBannerImage}
                alt={items[next1].gameName}
                className="w-full h-full object-cover"
              />
            </button>

            <button
              type="button"
              className="col-span-1 bg-white/5 rounded-lg overflow-hidden aspect-video outline-none opacity-50 hover:scale-105 duration-300 ring-0 focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => goTo(next2)}
              aria-label={`Lihat ${items[next2].gameName}`}
            >
              <img
                src={items[next2].gameBannerImage}
                alt={items[next2].gameName}
                className="w-full h-full object-cover"
              />
            </button>
          </div>

          {/* Dots indicator (klik untuk pindah) */}
          <div className="flex items-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={[
                  'h-1.5 rounded-full transition-all',
                  i === activeIndex ? 'w-6 bg-white/90' : 'w-3 bg-white/30 hover:bg-white/50',
                ].join(' ')}
                aria-label={`Ke slide ${i + 1}`}
                aria-current={i === activeIndex}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
