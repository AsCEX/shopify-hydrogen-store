import { useCallback, useEffect, useRef, useState } from 'react';
import type { MouseEvent, PointerEvent } from 'react';
import type { HeroSlide } from '~/data/hero-slides';

type HeroSliderProps = {
  slides: HeroSlide[];
  autoplayDelay?: number;
};

export function HeroSlider({ slides, autoplayDelay = 6000 }: HeroSliderProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  const pointerStartRef = useRef<{
    id: number;
    x: number;
    y: number;
  } | null>(null);
  const didSwipeRef = useRef(false);

  useEffect(() => {
    if (slides.length <= 1 || isDragging) {
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) => {
        return (currentIndex + 1) % slides.length;
      });
    }, autoplayDelay);

    return () => {
      window.clearInterval(interval);
    };
  }, [slides.length, autoplayDelay, isDragging]);

  const goToPrevious = useCallback(() => {
    setDragOffset(0);
    setActiveIndex((currentIndex) => {
      return currentIndex === 0 ? slides.length - 1 : currentIndex - 1;
    });
  }, [slides.length]);

  const goToNext = useCallback(() => {
    setDragOffset(0);
    setActiveIndex((currentIndex) => {
      return (currentIndex + 1) % slides.length;
    });
  }, [slides.length]);

  const goToSlide = (index: number) => {
    setDragOffset(0);
    setActiveIndex(index);
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (slides.length <= 1 || event.button !== 0) {
      return;
    }

    pointerStartRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    didSwipeRef.current = false;
    setIsDragging(true);
    setDragOffset(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const pointerStart = pointerStartRef.current;

    if (!pointerStart || pointerStart.id !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;

    if (Math.abs(deltaX) < 8 && Math.abs(deltaY) < 8) {
      return;
    }

    if (Math.abs(deltaY) > Math.abs(deltaX) * 1.2) {
      setDragOffset(0);
      return;
    }

    const viewportWidth = viewportRef.current?.clientWidth ?? window.innerWidth;
    const maxOffset = viewportWidth * 0.3;
    const boundedOffset = Math.max(-maxOffset, Math.min(maxOffset, deltaX));

    didSwipeRef.current = true;
    setDragOffset(boundedOffset);
  };

  const handlePointerEnd = (event: PointerEvent<HTMLDivElement>) => {
    const pointerStart = pointerStartRef.current;

    if (!pointerStart || pointerStart.id !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - pointerStart.x;
    const deltaY = event.clientY - pointerStart.y;
    const viewportWidth = viewportRef.current?.clientWidth ?? window.innerWidth;
    const swipeThreshold = Math.min(90, viewportWidth * 0.15);
    const isHorizontalSwipe =
      Math.abs(deltaX) > swipeThreshold &&
      Math.abs(deltaX) > Math.abs(deltaY) * 1.25;

    pointerStartRef.current = null;
    setIsDragging(false);
    setDragOffset(0);

    if (!isHorizontalSwipe) {
      return;
    }

    if (deltaX > 0) {
      goToPrevious();
    } else {
      goToNext();
    }
  };

  const handlePointerCancel = () => {
    pointerStartRef.current = null;
    setIsDragging(false);
    setDragOffset(0);
  };

  const handleClickCapture = (event: MouseEvent<HTMLElement>) => {
    if (!didSwipeRef.current) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    didSwipeRef.current = false;
  };

  if (slides.length === 0) {
    return null;
  }

  return (
    <section
      className="relative overflow-hidden p-2"
      aria-label="Featured promotions"
      onClickCapture={handleClickCapture}
    >
      <div
        ref={viewportRef}
        data-tab-swipe-exclude
        className="relative min-h-[120px] touch-pan-y overflow-hidden lg:min-h-[650px] rounded"
        onPointerCancel={handlePointerCancel}
        onPointerDown={handlePointerDown}
        onPointerLeave={handlePointerEnd}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onDragStart={(e) => e.preventDefault()}
      >
        <div
          className={`flex rounded-lg min-h-[120px] lg:min-h-[650px] ${isDragging
              ? ''
              : 'transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]'
            }`}
          style={{
            transform: `translate3d(calc(${-activeIndex * 100}% + ${dragOffset}px), 0, 0)`,
          }}
        >
          {slides.map((slide, index) => {
            const isActive = index === activeIndex;

            return (
              <article
                key={slide.id}
                className="relative min-h-[120px] w-full flex-none overflow-hidden lg:min-h-[650px]"
                aria-hidden={!isActive}
              >
                <picture>
                  {slide.mobileImage && (
                    <source
                      media="(max-width: 767px)"
                      srcSet={slide.mobileImage.url}
                    />
                  )}

                  <img
                    src={slide.image.url}
                    alt={slide.image.altText ?? slide.heading}
                    width={slide.image.width}
                    height={slide.image.height}
                    draggable={false}
                    className={`absolute inset-0 h-full w-full select-none object-cover`}
                  />
                </picture>

                <div className="absolute inset-0 bg-black/40 hidden" />

                <div className="relative mx-auto flex min-h-[120px] max-w-7xl items-center px-6 lg:min-h-[650px]">
                  <div
                    className={`max-w-2xl text-white `}
                  >
                    <h1 className="text-4xl hidden font-semibold leading-tight sm:text-5xl lg:text-7xl">
                      {slide.heading}
                    </h1>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {slides.length > 1 && (
        <>
          <button
            type="button"
            onClick={goToPrevious}
            className="absolute hidden left-4 top-1/2 z-10 -translate-y-1/2 bg-black/40 px-4 py-3 text-white transition hover:bg-black/60"
            aria-label="Previous slide"
          >
            ←
          </button>

          <button
            type="button"
            onClick={goToNext}
            className="absolute hidden right-4 top-1/2 z-10 -translate-y-1/2 bg-black/40 px-4 py-3 text-white transition hover:bg-black/60"
            aria-label="Next slide"
          >
            →
          </button>

          <div className="absolute bottom-4 left-1/2 z-1 flex -translate-x-1/2 gap-1">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                type="button"
                onClick={() => goToSlide(index)}
                className={`h-2 rounded-full transition-all ${index === activeIndex
                    ? 'w-4 bg-[#178E79]'
                    : 'w-2 bg-[#178E79]/50 hover:bg-[#178E79]/75'
                  }`}
                aria-label={`Show slide ${index + 1}`}
                aria-current={index === activeIndex}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}
