export type HeroSlide = {
  id: string;
  heading: string;
  eyebrow?: string;
  description?: string;

  image: {
    url: string;
    altText?: string;
    width?: number;
    height?: number;
  };

  mobileImage?: {
    url: string;
    altText?: string;
    width?: number;
    height?: number;
  };

  buttonLabel?: string;
  buttonUrl?: string;
  position: number;
};

export const localHeroSlides: HeroSlide[] = [
  {
    id: 'local-women-fashion',
    eyebrow: 'New collection',
    heading: 'Modern style for every day',
    description:
      'Discover thoughtfully selected pieces designed for effortless everyday style.',
    image: {
      url: '/images/heroes/woman-fashion.png',
      altText: 'Woman wearing modern fashion',
      width: 1600,
      height: 700,
    },
    mobileImage: {
      url: '/images/heroes/woman-fashion-mobile.png',
      altText: 'Woman wearing modern fashion',
      width: 800,
      height: 1000,
    },
    buttonLabel: 'Shop women',
    buttonUrl: '/collections/women',
    position: 1,
  },
  {
    id: 'local-bags',
    eyebrow: 'Essential accessories',
    heading: 'Carry your style anywhere',
    description:
      'Explore versatile bags designed for work, travel, and everyday life.',
    image: {
      url: '/images/heroes/bag_banner.png',
      altText: 'Modern bag collection',
      width: 1600,
      height: 700,
    },
    mobileImage: {
      url: '/images/heroes/bag_banner.png',
      altText: 'Modern bag collection',
      width: 800,
      height: 1000,
    },
    buttonLabel: 'Shop bags',
    buttonUrl: '/collections/bags',
    position: 2,
  },
  // {
  //   id: 'local-jewelry',
  //   eyebrow: 'Timeless details',
  //   heading: 'Jewelry made to stand out',
  //   description:
  //     'Complete your look with elegant pieces for every occasion.',
  //   image: {
  //     url: '/images/heroes/hero.png',
  //     altText: 'Elegant jewelry collection',
  //     width: 1600,
  //     height: 700,
  //   },
  //   mobileImage: {
  //     url: '/images/heroes/hero.png',
  //     altText: 'Elegant jewelry collection',
  //     width: 800,
  //     height: 1000,
  //   },
  //   buttonLabel: 'Shop jewelry',
  //   buttonUrl: '/collections/jewelry',
  //   position: 3,
  // },
];