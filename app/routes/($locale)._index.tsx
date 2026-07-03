import {Link} from 'react-router';
import type {Route} from './+types/_index';
import type {MouseEvent, PointerEvent} from 'react';
import {useEffect, useMemo, useRef, useState} from 'react';

import {HeroSlider} from '~/components/HeroSlider';
import {getHeroSlides} from '~/lib/hero-slides.server';

export async function loader({context}: Route.LoaderArgs) {
  const {storefront} = context;

  const [heroSlides, collectionData] = await Promise.all([
    getHeroSlides(storefront),

    storefront.query(COLLECTIONS_QUERY, {
      variables: {
        first: 8,
      },
    }),


  ]);

  
  return {
    heroSlides,
    allproducts: collectionData.allCollections.nodes,
    collections: collectionData.productCollections.nodes,
  };
}

export default function Homepage({loaderData}: Route.ComponentProps) {
  const {heroSlides, allproducts, collections} = loaderData;
  const tabs = useMemo(
    () => [
      {
        handle: 'all',
        title: 'All',
        products: allproducts,
      },
      ...collections.map((collection: any) => ({
        handle: collection.handle,
        title: collection.title,
        products: collection.products?.nodes ?? [],
      })),
    ],
    [allproducts, collections],
  );
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  const [dragOffset, setDragOffset] = useState(0);
  const swipeStartRef = useRef<{id: number; x: number; y: number} | null>(
    null,
  );
  const tabButtonRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const didSwipeRef = useRef(false);
  const activeTab = tabs[activeTabIndex] ?? tabs[0];

  useEffect(() => {
    tabButtonRefs.current[activeTabIndex]?.scrollIntoView({
      behavior: 'smooth',
      block: 'nearest',
      inline: 'center',
    });
  }, [activeTabIndex]);

  const selectTab = (nextIndex: number) => {
    const boundedIndex = Math.min(Math.max(nextIndex, 0), tabs.length - 1);
    setActiveTabIndex(boundedIndex);
    setDragOffset(0);
  };

  const handleSwipeStart = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) {
      return;
    }

    if ((event.target as Element).closest('[data-tab-swipe-exclude]')) {
      return;
    }

    swipeStartRef.current = {
      id: event.pointerId,
      x: event.clientX,
      y: event.clientY,
    };
    didSwipeRef.current = false;
    setDragOffset(0);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleSwipeMove = (event: PointerEvent<HTMLDivElement>) => {
    const swipeStart = swipeStartRef.current;

    if (!swipeStart || swipeStart.id !== event.pointerId) return;

    const deltaX = event.clientX - swipeStart.x;
    const deltaY = event.clientY - swipeStart.y;

    if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 8) {
      didSwipeRef.current = true;
      setDragOffset(deltaX);
    }
  };

  const handleSwipeEnd = (event: PointerEvent<HTMLDivElement>) => {
    const swipeStart = swipeStartRef.current;

    if (!swipeStart || swipeStart.id !== event.pointerId) return;

    const deltaX = event.clientX - swipeStart.x;
    const deltaY = event.clientY - swipeStart.y;
    const shouldChangeTab =
      Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY);

    swipeStartRef.current = null;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (shouldChangeTab) {
      selectTab(activeTabIndex + (deltaX < 0 ? 1 : -1));
    } else {
      setDragOffset(0);
    }
  };

  const handleSwipeCancel = (event: PointerEvent<HTMLDivElement>) => {
    if (
      swipeStartRef.current?.id === event.pointerId &&
      event.currentTarget.hasPointerCapture(event.pointerId)
    ) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    swipeStartRef.current = null;
    setDragOffset(0);
  };

  const handlePanelClickCapture = (event: MouseEvent<HTMLDivElement>) => {
    if (!didSwipeRef.current) return;

    event.preventDefault();
    event.stopPropagation();
    didSwipeRef.current = false;
  };

  return (
    <>
      <div className="flex h-[calc(100dvh-var(--footer-nav-height)-72px)] flex-col overflow-hidden">
        <section className="px-2">
          <div
            role="tablist"
            aria-label="Product collections"
            className="flex gap-2 max-w-full overflow-x-auto px-2 scrollbar-none"
          >
            <button
              type="button"
              role="tab"
              ref={(node) => {
                tabButtonRefs.current[0] = node;
              }}
              aria-selected={activeTabIndex === 0}
              onClick={() => selectTab(0)}
              className={`group flex shrink-0 flex-col items-center justify-center break-inside-avoid border-0 bg-transparent p-1 py-2 ${
                activeTabIndex === 0
                  ? 'text-[var(--color-primary)]'
                  : 'text-gray-500'
              }`}
            >
              <h2 className="px-2 font-medium text-xs">All</h2>
            </button>

            {collections.map((collection: any, index: number) => {
              const tabIndex = index + 1;

              return (
                <button
                  type="button"
                  role="tab"
                  ref={(node) => {
                    tabButtonRefs.current[tabIndex] = node;
                  }}
                  aria-selected={activeTabIndex === tabIndex}
                  key={collection.id}
                  onClick={() => selectTab(tabIndex)}
                  className={`group flex shrink-0 flex-col items-center justify-center break-inside-avoid border-0 bg-transparent p-1 ${
                    activeTabIndex === tabIndex
                      ? 'text-[var(--color-primary)]'
                      : 'text-gray-500'
                  }`}
                >
                  <h2 className="px-2 font-medium text-xs">
                    {collection.title}
                  </h2>
                </button>
              );
            })}
          </div>
        </section>

        <div
          role="tabpanel"
          aria-label={activeTab.title}
          className="content all min-h-0 grow overflow-hidden touch-pan-y"
          onPointerDownCapture={handleSwipeStart}
          onPointerMove={handleSwipeMove}
          onPointerUp={handleSwipeEnd}
          onPointerCancel={handleSwipeCancel}
          onClickCapture={handlePanelClickCapture}
          onDragStart={(e) => e.preventDefault()}
        >
          <div
            className="flex h-full"
            style={{
              transform: `translate3d(calc(${-activeTabIndex * 100}% + ${dragOffset}px), 0, 0)`,
              transition: dragOffset
                ? 'none'
                : 'transform 320ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}
          >
            {tabs.map((tab, tabIndex) => (
              <div
                key={tab.handle}
                className="h-full w-full flex-none touch-pan-y overflow-y-auto"
              >
                <HeroSlider slides={heroSlides} />

                <section className="!p-2 bg-gray-100">

                  <div className="columns-2 gap-1">
                    {tab.products.map((product: any, index: number) => {
                      const image = product.media?.nodes[0]?.image;
                      const price = product.priceRange.minVariantPrice;
                      const imageAspectClass =
                        index % 5 === 0 || index % 5 === 3
                          ? 'aspect-[3/4]'
                          : 'aspect-square';

                      return (
                        <Link
                          key={product.id}
                          to={`/products/${product.handle}`}
                          className="group mb-2 block touch-pan-y break-inside-avoid bg-white p-1 py-2"
                        >
                          <div className="overflow-hidden rounded-xl bg-gray-100">
                            {image ? (
                              <img
                                src={image.url}
                                alt={image.altText ?? product.title}
                                width={image.width ?? 800}
                                height={image.height ?? 800}
                                draggable={false}
                                className={`${imageAspectClass} w-full object-cover transition duration-300 group-hover:scale-105`}
                              />
                            ) : (
                              <div className={imageAspectClass} />
                            )}
                          </div>

                          <h2 className="mt-2 px-2 font-medium text-xs">
                            {product.title}
                          </h2>

                          <p className="mt-1 px-2 text-sm font-bold text-[var(--color-primary)]">
                            {new Intl.NumberFormat('en-PH', {
                              style: 'currency',
                              currency: 'USD',
                            }).format(Number(price.amount))}
                          </p>
                        </Link>
                      );
                    })}
                  </div>

                  {tab.products.length === 0 && (
                    <p className="px-1 py-6 text-sm text-gray-500">
                      No products found in this collection.
                    </p>
                  )}
                </section>
              </div>
            ))}
          </div>
        </div>

      </div>
    </>
  );
}

const COLLECTIONS_QUERY = `#graphql
  query Collections {
    allCollections: products(first: 20) {
      nodes {
        id
        handle
        title
        description
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
        media(first: 1) {
          nodes {
            ... on MediaImage {
              id
              image {
                url
                altText
                width
                height
              }
            }
          }
        }
          

      }
    }

    productCollections: collections(first: 20) {
      nodes {
        id
        handle
        title
        description
        image {
          url
          altText
          width
          height
        }
        products(first: 20) {
          nodes {
            id
            handle
            title
            description
            priceRange {
              minVariantPrice {
                amount
                currencyCode
              }
            }
            media(first: 1) {
              nodes {
                ... on MediaImage {
                  id
                  image {
                    url
                    altText
                    width
                    height
                  }
                }
              }
            }
          }
        }
      }
    }
  }
` as const;
