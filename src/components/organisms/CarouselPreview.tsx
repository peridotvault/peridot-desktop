import React, {
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * Steam-like media carousel (screenshots/videos) with thumbnails.
 * - TailwindCSS for styling
 * - TypeScript + React
 * - Keyboard (←/→/Space), mouse drag, touch swipe
 * - Autoplay with progress bar; pauses on hover or when tab hidden
 */

export type Subaccount = [] | [Uint8Array]; // kept for parity with your codebase style (not used here)

export type MediaItem =
  | { kind: "image"; src: string; alt?: string; storageKey?: string }
  | {
      kind: "video";
      src: string;
      poster?: string;
      alt?: string;
      storageKey?: string;
    };

export interface CarouselPreviewProps {
  items: MediaItem[];
  initialIndex?: number;
  autoPlay?: boolean;
  showThumbnails?: boolean;
  className?: string;
  htmlElement?: ReactNode;
  onIndexChange?: (i: number) => void;
}

const Chevron = ({ dir = "left" }: { dir?: "left" | "right" }) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
    {dir === "left" ? (
      <path
        fill="currentColor"
        d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"
      />
    ) : (
      <path
        fill="currentColor"
        d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L12.17 12z"
      />
    )}
  </svg>
);

export default function CarouselPreview({
  items,
  initialIndex = 0,
  autoPlay = true,
  showThumbnails = true,
  className,
  htmlElement,
  onIndexChange,
}: CarouselPreviewProps) {
  const [index, setIndex] = useState(() =>
    Math.min(Math.max(0, initialIndex), Math.max(0, items.length - 1))
  );
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const wrap = useRef<HTMLDivElement | null>(null);
  const track = useRef<HTMLDivElement | null>(null);
  const dragStart = useRef<{ x: number; at: number } | null>(null);
  const dragDX = useRef(0);

  const canNavigate = items.length > 1;

  // Keep external listener informed
  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  // Pause autoplay when tab is hidden
  useEffect(() => {
    function onVisibility() {
      if (document.hidden) setIsPlaying(false);
    }
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const goTo = useCallback(
    (i: number) => {
      if (!canNavigate) return;
      const n = items.length;
      const next = ((i % n) + n) % n; // safe modulo
      setIndex(next);
    },
    [items.length, canNavigate]
  );

  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);

  // Keyboard controls when focused
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!canNavigate) return;
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goPrev();
    } else if (e.key === "ArrowRight") {
      e.preventDefault();
      goNext();
    } else if (e.code === "Space") {
      e.preventDefault();
      setIsPlaying((s) => !s);
    }
  };

  // Drag / swipe
  const onPointerDown = (e: React.PointerEvent) => {
    if (!wrap.current) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    dragStart.current = { x: e.clientX, at: Date.now() };
    dragDX.current = 0;
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragStart.current || !track.current || !wrap.current) return;
    const dx = e.clientX - dragStart.current.x;
    dragDX.current = dx;
    const width = wrap.current.clientWidth || 1;
    const pct = (dx / width) * 100;
    track.current.style.transform = `translateX(calc(${
      -index * 100
    }% + ${pct}%))`;
  };
  const onPointerUp = (e: React.PointerEvent) => {
    if (!wrap.current || !track.current) return;
    const dx = dragDX.current;
    dragStart.current = null;
    dragDX.current = 0;
    track.current.style.transform = `translateX(${-index * 100}%)`;

    const width = wrap.current.clientWidth || 1;
    const threshold = Math.min(0.25 * width, 160); // px
    if (dx > threshold) goPrev();
    else if (dx < -threshold) goNext();
  };

  const renderedSlides = useMemo(
    () =>
      items.map((it, i) => (
        <div
          key={i}
          className="relative shrink-0 grow-0 basis-full h-full select-none"
          aria-hidden={i !== index}
        >
          {it.kind === "image" ? (
            <img
              src={it.src}
              alt={it.alt ?? "screenshot"}
              className="h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <video
              className="h-full w-full object-cover"
              src={it.src}
              poster={it.poster}
              muted
              loop
              playsInline
              autoPlay={i === index}
              controls={i === index}
            />
          )}
        </div>
      )),
    [items, index]
  );

  return (
    <div className={["relative w-full", "", className ?? ""].join(" ")}>
      {/* Media viewport */}
      <div
        ref={wrap}
        className="relative aspect-video overflow-hidden rounded-2xl shadow-arise-sm"
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        role="region"
        aria-label="App media carousel"
      >
        {/* Track */}
        <div
          ref={track}
          className="flex h-full w-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${-index * 100}%)` }}
        >
          {renderedSlides}
        </div>

        {/* Overlay counters & controls */}
        <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-md px-2 py-1 text-xs text-white shadow-flat-sm bg-background_primary">
          {items.length ? `${index + 1} / ${items.length}` : "0 / 0"}
        </div>

        {/* Play/Pause autoplay */}
        <button
          type="button"
          onClick={() => setIsPlaying((s) => !s)}
          aria-label={isPlaying ? "Pause autoplay" : "Play autoplay"}
          className="absolute right-3 top-3 z-10 rounded-md px-2 py-1 text-xs text-white hover:bg-black/70"
        >
          {isPlaying ? "Pause" : "Play"}
        </button>

        {/* Prev/Next */}
        {canNavigate && (
          <>
            <button
              type="button"
              onClick={goPrev}
              aria-label="Previous"
              className="group absolute left-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            >
              <Chevron dir="left" />
            </button>
            <button
              type="button"
              onClick={goNext}
              aria-label="Next"
              className="group absolute right-2 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
            >
              <Chevron dir="right" />
            </button>
          </>
        )}

        {/* Progress bar (autoplay) */}
        {/* {autoPlay && canNavigate && (
          <div className="absolute bottom-0 left-0 right-0 z-10 h-1 overflow-hidden rounded-b-2xl bg-black/40">
            <div
              className="h-full bg-white/80"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        )} */}
      </div>

      {/* Thumbnails */}
      {(showThumbnails || htmlElement) && (
        <div className="flex gap-4 overflow-x-auto py-6">
          {htmlElement && htmlElement}
          {items.map((it, i) => (
            <button
              key={`thumb-${i}`}
              type="button"
              onClick={() => goTo(i)}
              className={[
                "relative h-20 aspect-video shrink-0 overflow-hidden rounded-md duration-300 ",
                i === index ? "border" : "opacity-60",
              ].join(" ")}
              aria-label={`Go to media ${i + 1}`}
            >
              {it.kind === "image" ? (
                <img
                  src={it.src}
                  alt={it.alt ?? `thumb ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  <img
                    src={it.poster || it.src}
                    alt={it.alt ?? `thumb ${i + 1}`}
                    className="h-full w-full object-cover opacity-90"
                  />
                  <span className="pointer-events-none absolute inset-0 grid place-items-center text-white/90">
                    {/* play glyph */}
                    <svg viewBox="0 0 24 24" className="h-6 w-6 drop-shadow">
                      <path fill="currentColor" d="M8 5v14l11-7z" />
                    </svg>
                  </span>
                </>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/*
USAGE EXAMPLE
-------------

<SteamLikeCarousel
  items={[
    { kind: "image", src: "/shots/1.jpg", alt: "Screenshot 1" },
    { kind: "video", src: "/trailers/trailer1.mp4", poster: "/trailers/poster.jpg" },
    { kind: "image", src: "/shots/2.jpg", alt: "Screenshot 2" },
  ]}
  initialIndex={0}
  autoPlay
  interval={5000}
  showThumbnails
  onIndexChange={(i) => console.log("active slide:", i)}
/>
*/
