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
};

export function CarouselVault({ items, intervalMs = 10000 }: Props) {
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isHover, setIsHover] = React.useState(false);
  const timerRef = React.useRef<NodeJS.Timeout | null>(null);

  const len = items.length;

  // helper next/prev
  const goTo = (i: number) => setActiveIndex(((i % len) + len) % len);
  const next = () => goTo(activeIndex + 1);

  // start/stop interval with cleanup
  React.useEffect(() => {
    if (len <= 1) return; // nothing to rotate
    if (isHover) return; // pause on hover

    timerRef.current && clearInterval(timerRef.current);
    timerRef.current = setInterval(next, intervalMs);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = null;
    };
    // re-run when activeIndex changes to keep interval cadence fresh after manual switch
  }, [activeIndex, isHover, intervalMs, len]);

  // Precompute next thumbs (the 1st and 2nd next items)
  const next1 = (activeIndex + 1) % len;
  const next2 = (activeIndex + 2) % len;

  if (len === 0) return null;

  const active = items[activeIndex];

  return (
    <section
      className="flex justify-center relative px-12"
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      aria-roledescription="carousel"
      aria-label="Game showcase"
    >
      <div className="w-full aspect-[16/7] max-w-[1400px] flex justify-end pt-12 z-20 gap-6">
        {/* Main banner */}
        <div className="aspect-video w-full rounded-xl overflow-hidden shadow-flat-sm border border-white/10">
          <img
            src={active.gameBannerImage}
            alt={active.gameName}
            className="bg-background_disabled object-cover w-full h-full transition-transform duration-500 will-change-transform hover:scale-105"
          />
        </div>

        {/* Right column */}
        <div className="w-full max-w-[350px] flex flex-col gap-6">
          {/* Detail card */}
          <div className="col-span-2 row-span-4 h-full w-full shadow-flat-sm border border-white/10 rounded-xl backdrop-blur-md p-8 flex flex-col gap-6 justify-between">
            {/* top */}
            <div className="flex flex-col gap-4">
              <span className="font-bold text-2xl">{active.gameName}</span>
              <span className="line-clamp-6">{active.gameDescription}</span>
            </div>
            {/* bottom */}
            <div className="flex flex-col gap-2">
              {/* ganti komponen PriceCoin milikmu di sini */}
              <PriceCoin price={active.gamePrice} textSize="lg" />
              <button className="px-4 py-2 bg-accent_secondary rounded-md">Buy Now</button>
            </div>
          </div>

          {/* Thumbnails (preview + hover-to-switch) */}
          <div className="flex gap-6">
            <button
              type="button"
              className="col-span-1 bg-white/5 rounded-lg overflow-hidden aspect-video outline-none ring-0 focus-visible:ring-2 focus-visible:ring-ring"
              onMouseEnter={() => goTo(next1)}
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
              className="col-span-1 bg-white/5 rounded-lg overflow-hidden aspect-video opacity-50 hover:opacity-100 transition-opacity outline-none ring-0 focus-visible:ring-2 focus-visible:ring-ring"
              onMouseEnter={() => goTo(next2)}
              aria-label={`Lihat ${items[next2].gameName}`}
            >
              <img
                src={items[next2].gameBannerImage}
                alt={items[next2].gameName}
                className="w-full h-full object-cover"
              />
            </button>
          </div>

          {/* Dots indicator */}
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
