import React from 'react';

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
  const rootRef = React.useRef<HTMLElement | null>(null);
  const hostRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    rootRef.current = document.getElementById('vault-page') as HTMLElement | null;
  }, []);

  // ukur tinggi carousel dan set var 1/3
  React.useEffect(() => {
    if (!hostRef.current || !rootRef.current) return;
    const el = hostRef.current;
    const root = rootRef.current;
    const ro = new ResizeObserver(() => {
      const h = el.getBoundingClientRect().height;
      root.style.setProperty('--vault-overlap', `${Math.round(h / 3)}px`);
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const len = items.length;
  if (len === 0) return null;

  const goTo = (i: number) => {
    const nextIndex = ((i % len) + len) % len;
    if (nextIndex === activeIndex) return;
    setPrevIndex(activeIndex);
    setActiveIndex(nextIndex);
    setIsFading(false);
    requestAnimationFrame(() => setIsFading(true));
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

  const active = items[activeIndex];

  return (
    <section
      ref={hostRef}
      className="relative flex w-full max-w-[1400px] justify-center"
      aria-roledescription="carousel"
      aria-label="Game showcase"
    >
      <div className="w-full h-[50dvh] max-h-[40rem] flex">
        {/* LEFT: Description panel */}
        <div className="absolute z-10 left-0 bottom-0 w-full flex justify-between px-10 items-end">
          <div className="w-full h-full flex flex-col gap-6 justify-center">
            <div className="flex flex-col gap-4 max-w-[50rem]">
              <h2 className="font-semibold text-3xl leading-tight">{active.gameName}</h2>
              <p className="line-clamp-8/10 text-foreground/90">{active.gameDescription}</p>
            </div>
            <div className="flex">
              <div className="flex flex-col gap-3">
                <button className="px-4 py-2 rounded-lg border border-foreground/15 bg-foreground/10 hover:bg-foreground/15 transition">
                  View Game
                </button>
              </div>
            </div>
          </div>
          {/* Dots */}
          <div className="flex items-center gap-2">
            {items.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                aria-label={`Ke slide ${i + 1}`}
                aria-current={i === activeIndex}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: i === activeIndex ? 24 : 12,
                  backgroundColor:
                    i === activeIndex ? 'var(--accent-foreground)' : 'var(--muted-foreground)',
                }}
              />
            ))}
          </div>
        </div>

        {/* RIGHT: Banner area */}
        <div className="left-0 top-0 z-0">
          {/* Layer lama */}
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
            className="absolute inset-0 w-full h-full object-cover transition-opacity"
            style={{ opacity: isFading ? 1 : 0, transitionDuration: `${fadeMs}ms` }}
          />

          {/* background */}
          <div
            aria-hidden
            className="w-full h-2/3 bottom-0 absolute bg-gradient-to-t from-background via-background/70"
          />
        </div>
      </div>
    </section>
  );
}
