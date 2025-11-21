// @ts-ignore
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronLeft, faChevronRight } from '@fortawesome/free-solid-svg-icons';
import { TypographyH2 } from '@shared/components/ui/typography-h2';

type Props = {
  className?: string; // optional: untuk -mt overlap dari parent
};

export const VaultTopGames: React.FC<Props> = ({ className = '' }) => {
  const scrollerRef = React.useRef<HTMLDivElement | null>(null);
  const [canLeft, setCanLeft] = React.useState(false);
  const [canRight, setCanRight] = React.useState(true);

  // hitung lebar 1 kartu + gap
  const getStep = React.useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return 300;
    const flex = el.querySelector('.pv-topgames-row') as HTMLElement | null;
    if (!flex || !flex.firstElementChild) return Math.max(300, Math.floor(el.clientWidth * 0.9));
    const firstItem = flex.firstElementChild as HTMLElement;
    const rect = firstItem.getBoundingClientRect();
    const styles = getComputedStyle(flex);
    const gap = parseFloat(styles.columnGap || styles.gap || '0');
    return Math.ceil(rect.width + gap);
  }, []);

  // scroll halus
  const scrollStep = (dir: 'left' | 'right') => {
    const el = scrollerRef.current;
    if (!el) return;
    const step = getStep();
    el.scrollBy({ left: dir === 'left' ? -step : step, behavior: 'smooth' });
  };

  // update enable/disable tombol
  const updateArrows = React.useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    const maxLeft = scrollWidth - clientWidth - 1;
    setCanLeft(scrollLeft > 0);
    setCanRight(scrollLeft < maxLeft);
  }, []);

  React.useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    updateArrows();

    const onScroll = () => updateArrows();
    el.addEventListener('scroll', onScroll, { passive: true });

    const ro = new ResizeObserver(updateArrows);
    ro.observe(el);
    const innerFlex = el.querySelector('.pv-topgames-row') as HTMLElement | null;
    if (innerFlex) ro.observe(innerFlex);

    return () => {
      el.removeEventListener('scroll', onScroll);
      ro.disconnect();
    };
  }, [updateArrows]);

  return (
    // ✅ sama seperti section-section lain: w-full + px-10 + center
    <section className={['flex justify-center w-full px-10', className].join(' ')}>
      {/* ✅ kontainer konsisten: max-w + w-full + gap */}
      <div className="w-full max-w-[1400px] flex flex-col gap-6">
        {/* header row: judul & tombol */}
        <div className="w-full flex items-center justify-between">
          <TypographyH2 text="Top Games This Month" />
          <div className="flex items-center gap-4">
            <button
              className="aspect-square w-10 rounded-md bg-accent disabled:opacity-30 duration-300 disabled:cursor-not-allowed"
              onClick={() => scrollStep('left')}
              disabled={!canLeft}
              aria-disabled={!canLeft}
              aria-label="Scroll left"
            >
              <FontAwesomeIcon icon={faChevronLeft} />
            </button>
            <button
              className="aspect-square w-10 rounded-md bg-accent disabled:opacity-30 duration-300 disabled:cursor-not-allowed"
              onClick={() => scrollStep('right')}
              disabled={!canRight}
              aria-disabled={!canRight}
              aria-label="Scroll right"
            >
              <FontAwesomeIcon icon={faChevronRight} />
            </button>
          </div>
        </div>

        {/* contents */}
        <div className="relative">
          <div
            ref={scrollerRef}
            className="overflow-x-auto overflow-y-hidden scrollbar-hide scroll-smooth"
          >
            <div className="pv-topgames-row flex gap-2 w-max">
              {Array.from({ length: 10 }).map((_, idx) => (
                <div key={idx} className="w-72 h-80 relative flex justify-end">
                  <span className="text-[12rem] font-bold absolute left-2 bottom-16">
                    {idx + 1}
                  </span>
                  <div className="h-80 w-60 bg-muted rounded-lg">
                    <img src="" alt="" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* edge fades — pointer-events none biar gak nutupin klik */}
          <div className="pointer-events-none h-full w-16 bg-linear-to-r from-background absolute left-0 top-0 z-10"></div>
          <div className="pointer-events-none h-full w-16 bg-linear-to-l from-background absolute right-0 top-0 z-10"></div>
        </div>
      </div>
    </section>
  );
};
