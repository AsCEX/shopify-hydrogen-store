import type {Storefront} from '@shopify/hydrogen';
import {
  localHeroSlides,
  type HeroSlide,
} from '~/data/hero-slides';

type ShopifyImage = {
  url: string;
  altText?: string | null;
  width?: number | null;
  height?: number | null;
};

type ShopifyMetaobjectField = {
  key: string;
  value?: string | null;
  reference?: {
    image?: ShopifyImage | null;
  } | null;
};

type ShopifyHeroMetaobject = {
  id: string;
  handle: string;
  fields: ShopifyMetaobjectField[];
};

type HeroSlidesQueryResponse = {
  metaobjects: {
    nodes: ShopifyHeroMetaobject[];
  };
};

/**
 * Returns Shopify-managed hero slides when available.
 *
 * Falls back to local slides when:
 * - the store is not connected;
 * - metaobject access is unavailable;
 * - the query fails;
 * - no active Shopify slides exist.
 */
export async function getHeroSlides(
  storefront: Storefront,
): Promise<HeroSlide[]> {
  try {
    const response =
      await storefront.query<HeroSlidesQueryResponse>(
        HERO_SLIDES_QUERY,
        {
          variables: {
            type: 'hero_slide',
            first: 20,
          },
        },
      );

    const shopifySlides = response.metaobjects.nodes
      .map(normalizeHeroMetaobject)
      .filter(
        (slide): slide is HeroSlide => slide !== null,
      )
      .sort((a, b) => a.position - b.position);

    return shopifySlides.length > 0
      ? shopifySlides
      : localHeroSlides;
  } catch (error) {
    console.warn(
      'Could not load Shopify hero slides. Using local fallback.',
      error,
    );

    return localHeroSlides;
  }
}

function normalizeHeroMetaobject(
  metaobject: ShopifyHeroMetaobject,
): HeroSlide | null {
  const fields = createFieldMap(metaobject.fields);

  const active = parseBoolean(fields.active?.value, true);
  const heading = fields.heading?.value?.trim();
  const desktopImage = getImage(fields.image);

  if (!active || !heading || !desktopImage) {
    return null;
  }

  const mobileImage = getImage(fields.mobile_image);

  return {
    id: metaobject.id,
    heading,
    eyebrow: optionalString(fields.eyebrow?.value),
    description: optionalString(
      fields.description?.value,
    ),
    image: desktopImage,
    mobileImage,
    buttonLabel: optionalString(
      fields.button_label?.value,
    ),
    buttonUrl: optionalString(
      fields.button_url?.value,
    ),
    position: parsePosition(fields.position?.value),
  };
}

function createFieldMap(
  fields: ShopifyMetaobjectField[],
): Record<string, ShopifyMetaobjectField> {
  return Object.fromEntries(
    fields.map((field) => [field.key, field]),
  );
}

function getImage(
  field?: ShopifyMetaobjectField,
): HeroSlide['image'] | undefined {
  const image = field?.reference?.image;

  if (!image?.url) {
    return undefined;
  }

  return {
    url: image.url,
    altText: image.altText ?? undefined,
    width: image.width ?? undefined,
    height: image.height ?? undefined,
  };
}

function optionalString(
  value?: string | null,
): string | undefined {
  const normalized = value?.trim();

  return normalized || undefined;
}

function parsePosition(value?: string | null): number {
  const position = Number.parseInt(value ?? '', 10);

  return Number.isFinite(position)
    ? position
    : Number.MAX_SAFE_INTEGER;
}

function parseBoolean(
  value: string | null | undefined,
  fallback: boolean,
): boolean {
  if (value === undefined || value === null) {
    return fallback;
  }

  return value === 'true';
}

const HERO_SLIDES_QUERY = `#graphql
  query HeroSlides(
    $type: String!
    $first: Int!
  ) {
    metaobjects(
      type: $type
      first: $first
    ) {
      nodes {
        id
        handle

        fields {
          key
          value

          reference {
            ... on MediaImage {
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
` as const;