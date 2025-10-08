import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MediaItem } from '../../interfaces/app/GameInterface';

export interface CarouselPreviewProps {
  items: MediaItem[];
  initialIndex?: number;
  autoPlay?: boolean;
  showThumbnails?: boolean;
  className?: string;
  htmlElement?: ReactNode;
  onIndexChange?: (i: number) => void;
}

const Chevron = ({ dir = 'left' }: { dir?: 'left' | 'right' }) => (
  <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
    {dir === 'left' ? (
      <path fill="currentColor" d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
    ) : (
      <path fill="currentColor" d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L12.17 12z" />
    )}
  </svg>
);

// sanitize: trim semua string untuk hindari " ...mp4  " (spasi di ujung)
function sanitize(items: MediaItem[]): MediaItem[] {
  return (items ?? [])
    .map((it) =>
      it.kind === 'image'
        ? { ...it, src: it.src.trim(), alt: it.alt?.trim(), storageKey: it.storageKey?.trim() }
        : {
            ...it,
            src: it.src.trim(),
            poster: it.poster?.trim(),
            alt: it.alt?.trim(),
            storageKey: it.storageKey?.trim(),
          },
    )
    .filter((it) => it.src.length > 0);
}

export default function CarouselPreview({
  items,
  initialIndex = 0,
  autoPlay = true,
  showThumbnails = true,
  className,
  htmlElement,
  onIndexChange,
}: CarouselPreviewProps) {
  const normalized = useMemo(() => sanitize(items), [items]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);

  const wrap = useRef<HTMLDivElement | null>(null);
  const track = useRef<HTMLDivElement | null>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const dragStart = useRef<{ x: number; at: number } | null>(null);
  const dragDX = useRef(0);

  const canNavigate = normalized.length > 1;

  // clamp index saat items berubah & set initialIndex
  useEffect(() => {
    const clamped = Math.min(Math.max(0, initialIndex), Math.max(0, normalized.length - 1));
    setIndex((prev) => Math.min(prev, clamped));
  }, [normalized.length, initialIndex]);

  // inform parent
  useEffect(() => {
    onIndexChange?.(index);
  }, [index, onIndexChange]);

  // pause autoplay saat tab hidden
  useEffect(() => {
    const onVis = () => {
      if (document.hidden) setIsPlaying(false);
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, []);

  // kontrol play/pause untuk video aktif
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === index && isPlaying) {
        v.play().catch(() => {
          /* autoplay might be blocked; ignore */
        });
      } else {
        v.pause();
        try {
          v.currentTime = 0;
        } catch {}
      }
    });
  }, [index, isPlaying, normalized.length]);

  const goTo = useCallback(
    (i: number) => {
      const n = normalized.length;
      if (!n) return;
      const next = ((i % n) + n) % n;
      setIndex(next);
    },
    [normalized.length],
  );

  const goPrev = useCallback(() => goTo(index - 1), [goTo, index]);
  const goNext = useCallback(() => goTo(index + 1), [goTo, index]);

  // keyboard
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!canNavigate) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      goPrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      goNext();
    } else if (e.code === 'Space') {
      e.preventDefault();
      setIsPlaying((s) => !s);
    }
  };

  // drag / swipe
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
    track.current.style.transform = `translateX(calc(${-index * 100}% + ${pct}%))`;
  };
  const onPointerUp = () => {
    if (!wrap.current || !track.current) return;
    const dx = dragDX.current;
    dragStart.current = null;
    dragDX.current = 0;
    track.current.style.transform = `translateX(${-index * 100}%)`;

    const width = wrap.current.clientWidth || 1;
    const threshold = Math.min(0.25 * width, 160);
    if (dx > threshold) goPrev();
    else if (dx < -threshold) goNext();
  };

  // slides
  const renderedSlides = useMemo(
    () =>
      normalized.map((it, i) => (
        <div
          key={`${it.kind}-${i}`}
          className="relative shrink-0 grow-0 basis-full h-full select-none"
          aria-hidden={i !== index}
        >
          {it.kind === 'image' ? (
            <img
              src={it.src}
              alt={it.alt ?? 'screenshot'}
              className="h-full w-full object-cover"
              draggable={false}
            />
          ) : (
            <video
              key={it.src} // force re-init saat src berubah
              ref={(el) => (videoRefs.current[i] = el)}
              className="h-full w-full object-cover"
              muted
              playsInline
              preload={i === index ? 'auto' : 'metadata'}
              loop
              controls={i === index}
              crossOrigin="anonymous" // aktifkan hanya jika server kasih CORS
              onLoadedMetadata={() => console.log('loadedmetadata', it.src)}
              onCanPlay={() => console.log('canplay', it.src)}
              onStalled={() => console.warn('stalled', it.src)}
              onError={(e) => {
                const err = (e.currentTarget as HTMLVideoElement).error;
                console.warn('Video failed to load:', it.src, err);
              }}
            >
              <source src={it.src} type="video/mp4" />
            </video>
          )}
        </div>
      )),
    [normalized, index],
  );

  return (
    <div className={['relative w-full', className ?? ''].join(' ')}>
      {/* Viewport */}
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
        <div
          ref={track}
          className="flex h-full w-full transition-transform duration-300 ease-out"
          style={{ transform: `translateX(${-index * 100}%)` }}
        >
          {renderedSlides}
        </div>

        {/* Counter */}
        <div className="pointer-events-none absolute left-3 top-3 z-10 rounded-md px-2 py-1 text-xs text-white shadow-flat-sm bg-background_primary">
          {normalized.length ? `${index + 1} / ${normalized.length}` : '0 / 0'}
        </div>

        {/* Play/Pause autoplay */}
        <button
          type="button"
          onClick={() => setIsPlaying((s) => !s)}
          aria-label={isPlaying ? 'Pause autoplay' : 'Play autoplay'}
          className="absolute right-3 top-3 z-10 rounded-md px-2 py-1 text-xs text-white hover:bg-black/70"
        >
          {isPlaying ? 'Pause' : 'Play'}
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
      </div>

      {/* Thumbnails & upload slot */}
      {(showThumbnails || htmlElement) && (
        <div className="flex gap-4 overflow-x-auto py-6">
          {htmlElement && htmlElement}
          {normalized.map((it, i) => (
            <button
              key={`thumb-${i}`}
              type="button"
              onClick={() => goTo(i)}
              className={[
                'relative h-20 aspect-video shrink-0 overflow-hidden rounded-md duration-300',
                i === index ? 'border' : 'opacity-60',
              ].join(' ')}
              aria-label={`Go to media ${i + 1}`}
              title={it.alt ?? `Media ${i + 1}`}
            >
              {it.kind === 'image' ? (
                <img
                  src={it.src}
                  alt={it.alt ?? `thumb ${i + 1}`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <>
                  {/* poster boleh kosong; tetap tampilkan overlay play */}
                  {it.poster ? (
                    <img
                      src={it.poster}
                      alt={it.alt ?? `thumb ${i + 1}`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="h-full w-full bg-black/40" />
                  )}
                  <span className="pointer-events-none absolute inset-0 grid place-items-center text-white/90">
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
