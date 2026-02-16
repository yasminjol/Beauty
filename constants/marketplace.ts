import type MaterialIcons from '@expo/vector-icons/MaterialIcons';

export type MarketplaceCategory = {
  id: string;
  label: string;
  icon: keyof typeof MaterialIcons.glyphMap;
  description: string;
};

export type MarketplaceProvider = {
  id: string;
  businessName: string;
  providerName: string;
  location: string;
  serviceArea: string;
  distanceMiles: number;
  rating: number;
  reviewCount: number;
  categories: string[];
  availabilitySummary: string;
  posts: string[];
};

export type ServiceAddOn = {
  id: string;
  name: string;
  price: number;
};

export type MarketplaceService = {
  id: string;
  name: string;
  description: string;
  category: string;
  providerId: string;
  startingPrice: number;
  durationMinutes: number;
  rating: number;
  reviewCount: number;
  depositAmount: number;
  addOns: ServiceAddOn[];
  timeSlots: string[];
  nextAvailability: 'Today' | 'This Week';
};

export const SEARCH_CATEGORIES: MarketplaceCategory[] = [
  {
    id: 'hair-services',
    label: 'Hair Services',
    icon: 'content-cut',
    description: 'Braids, locs, cuts and styling',
  },
  {
    id: 'nail-services',
    label: 'Nail Services',
    icon: 'brush',
    description: 'Manicures, Gel-X and pedicures',
  },
  {
    id: 'makeup-beauty',
    label: 'Makeup & Beauty',
    icon: 'face-retouching-natural',
    description: 'Lashes, brows and glam makeup',
  },
  {
    id: 'spa-wellness',
    label: 'Spa & Wellness',
    icon: 'spa',
    description: 'Facials, massage and recovery',
  },
];

export const MARKETPLACE_PROVIDERS: MarketplaceProvider[] = [
  {
    id: 'provider-glow-house',
    businessName: 'Glow House Studio',
    providerName: 'Yasmine N.',
    location: 'Oakland, CA',
    serviceArea: 'Oakland + Berkeley',
    distanceMiles: 3.2,
    rating: 4.9,
    reviewCount: 182,
    categories: ['Hair Services', 'Makeup & Beauty'],
    availabilitySummary: 'Today 2:30 PM, 5:00 PM',
    posts: ['Knotless transformation', 'Feed-in detail work', 'Style finish reel'],
  },
  {
    id: 'provider-nailed-by-tori',
    businessName: 'Nailed by Tori',
    providerName: 'Tori M.',
    location: 'Brooklyn, NY',
    serviceArea: 'Brooklyn + Manhattan',
    distanceMiles: 1.9,
    rating: 4.8,
    reviewCount: 129,
    categories: ['Nail Services'],
    availabilitySummary: 'Today 1:00 PM, Thu 10:00 AM',
    posts: ['Gel-X reveal', 'Chrome set', 'Natural overlay'],
  },
  {
    id: 'provider-blink-atelier',
    businessName: 'Blink Atelier',
    providerName: 'Chloe R.',
    location: 'Atlanta, GA',
    serviceArea: 'Midtown + Buckhead',
    distanceMiles: 5.4,
    rating: 4.7,
    reviewCount: 98,
    categories: ['Makeup & Beauty'],
    availabilitySummary: 'Fri 11:00 AM, Sat 9:00 AM',
    posts: ['Hybrid lashes set', 'Lash lift process', 'Aftercare tips'],
  },
  {
    id: 'provider-crown-coils',
    businessName: 'Crown & Coils',
    providerName: 'Naya P.',
    location: 'Dallas, TX',
    serviceArea: 'Central Dallas',
    distanceMiles: 7.1,
    rating: 4.6,
    reviewCount: 87,
    categories: ['Hair Services'],
    availabilitySummary: 'Thu 3:00 PM, Fri 12:30 PM',
    posts: ['Starter loc session', 'Retwist maintenance', 'Loc style updo'],
  },
  {
    id: 'provider-bella-skin',
    businessName: 'Bella Skin Bar',
    providerName: 'Mia L.',
    location: 'Miami, FL',
    serviceArea: 'Brickell + Coral Way',
    distanceMiles: 2.7,
    rating: 4.9,
    reviewCount: 143,
    categories: ['Spa & Wellness', 'Makeup & Beauty'],
    availabilitySummary: 'Today 4:30 PM, Fri 2:00 PM',
    posts: ['Hydrating facial', 'Dermaplane prep', 'Glow treatment'],
  },
];

export const MARKETPLACE_SERVICES: MarketplaceService[] = [
  {
    id: 'service-boho-knotless',
    name: 'Boho Knotless Braids',
    description:
      'Lightweight knotless braid install with soft boho curls and finishing mousse for a natural look.',
    category: 'Hair Services',
    providerId: 'provider-glow-house',
    startingPrice: 210,
    durationMinutes: 240,
    rating: 4.9,
    reviewCount: 116,
    depositAmount: 90,
    addOns: [
      { id: 'addon-hair-wash', name: 'Hair Wash', price: 20 },
      { id: 'addon-boho-hair', name: 'Boho Hair', price: 35 },
      { id: 'addon-curls', name: 'Curls Finish', price: 25 },
    ],
    timeSlots: ['9:00 AM', '11:30 AM', '2:30 PM', '5:00 PM'],
    nextAvailability: 'Today',
  },
  {
    id: 'service-feed-in-braids',
    name: 'Feed-in Braids',
    description:
      'Scalp-safe feed-in braid style with custom parting and edge finish. Includes light scalp oiling.',
    category: 'Hair Services',
    providerId: 'provider-crown-coils',
    startingPrice: 165,
    durationMinutes: 180,
    rating: 4.7,
    reviewCount: 73,
    depositAmount: 70,
    addOns: [
      { id: 'addon-smoothing-treatment', name: 'Scalp Smoothing Treatment', price: 18 },
      { id: 'addon-bead-finish', name: 'Bead Finish', price: 12 },
    ],
    timeSlots: ['10:00 AM', '1:00 PM', '3:30 PM'],
    nextAvailability: 'This Week',
  },
  {
    id: 'service-loc-retwist',
    name: 'Loc Retwist',
    description:
      'Maintenance retwist with scalp cleanse, neat sectioning and moisture seal for healthy loc upkeep.',
    category: 'Hair Services',
    providerId: 'provider-crown-coils',
    startingPrice: 140,
    durationMinutes: 150,
    rating: 4.6,
    reviewCount: 61,
    depositAmount: 50,
    addOns: [
      { id: 'addon-loc-style', name: 'Loc Styling', price: 20 },
      { id: 'addon-loc-repair', name: 'Minor Loc Repair', price: 35 },
    ],
    timeSlots: ['9:00 AM', '12:00 PM', '4:00 PM'],
    nextAvailability: 'This Week',
  },
  {
    id: 'service-luxury-gelx',
    name: 'Luxury Gel-X Set',
    description:
      'Custom-shaped Gel-X extension set with prep, sculpt and high-gloss seal. Designed for long wear.',
    category: 'Nail Services',
    providerId: 'provider-nailed-by-tori',
    startingPrice: 95,
    durationMinutes: 120,
    rating: 4.8,
    reviewCount: 96,
    depositAmount: 40,
    addOns: [
      { id: 'addon-chrome', name: 'Chrome Finish', price: 15 },
      { id: 'addon-nail-art', name: 'Custom Nail Art', price: 25 },
    ],
    timeSlots: ['10:00 AM', '12:30 PM', '2:30 PM', '5:30 PM'],
    nextAvailability: 'Today',
  },
  {
    id: 'service-spa-pedicure',
    name: 'Spa Pedicure',
    description:
      'Spa pedicure with exfoliation, soak, cuticle care and polish. Includes mini massage and hydration.',
    category: 'Nail Services',
    providerId: 'provider-nailed-by-tori',
    startingPrice: 70,
    durationMinutes: 75,
    rating: 4.6,
    reviewCount: 58,
    depositAmount: 25,
    addOns: [
      { id: 'addon-gel-polish', name: 'Gel Polish Upgrade', price: 12 },
      { id: 'addon-extended-massage', name: 'Extended Foot Massage', price: 18 },
    ],
    timeSlots: ['9:30 AM', '12:00 PM', '3:30 PM'],
    nextAvailability: 'This Week',
  },
  {
    id: 'service-hybrid-lashes',
    name: 'Hybrid Lash Fill',
    description:
      'Balanced hybrid refill that blends volume and classic fans while preserving natural lash health.',
    category: 'Makeup & Beauty',
    providerId: 'provider-blink-atelier',
    startingPrice: 78,
    durationMinutes: 75,
    rating: 4.7,
    reviewCount: 89,
    depositAmount: 30,
    addOns: [
      { id: 'addon-lash-bath', name: 'Lash Bath', price: 10 },
      { id: 'addon-bottom-lashes', name: 'Bottom Lash Add-on', price: 15 },
    ],
    timeSlots: ['11:00 AM', '1:00 PM', '4:00 PM'],
    nextAvailability: 'This Week',
  },
  {
    id: 'service-soft-glam',
    name: 'Soft Glam Makeup',
    description:
      'Photo-ready soft glam makeup with skin prep, contour and setting for all-day wear.',
    category: 'Makeup & Beauty',
    providerId: 'provider-glow-house',
    startingPrice: 120,
    durationMinutes: 90,
    rating: 4.8,
    reviewCount: 64,
    depositAmount: 45,
    addOns: [
      { id: 'addon-lashes', name: 'Strip Lashes', price: 15 },
      { id: 'addon-travel', name: 'Travel Service', price: 35 },
    ],
    timeSlots: ['9:30 AM', '12:00 PM', '3:00 PM', '6:00 PM'],
    nextAvailability: 'Today',
  },
  {
    id: 'service-hydrating-facial',
    name: 'Hydrating Facial',
    description:
      'Hydration-focused facial treatment with deep cleanse, mask and barrier repair serum.',
    category: 'Spa & Wellness',
    providerId: 'provider-bella-skin',
    startingPrice: 110,
    durationMinutes: 60,
    rating: 4.9,
    reviewCount: 101,
    depositAmount: 40,
    addOns: [
      { id: 'addon-led', name: 'LED Light Therapy', price: 20 },
      { id: 'addon-dermaplane', name: 'Dermaplane Upgrade', price: 25 },
    ],
    timeSlots: ['10:00 AM', '1:00 PM', '4:30 PM'],
    nextAvailability: 'Today',
  },
  {
    id: 'service-relaxation-massage',
    name: 'Relaxation Massage',
    description:
      'Full-body relaxation massage for tension relief with custom pressure and aromatherapy options.',
    category: 'Spa & Wellness',
    providerId: 'provider-bella-skin',
    startingPrice: 135,
    durationMinutes: 90,
    rating: 4.8,
    reviewCount: 76,
    depositAmount: 50,
    addOns: [
      { id: 'addon-hot-stones', name: 'Hot Stones', price: 22 },
      { id: 'addon-aroma-upgrade', name: 'Aromatherapy Upgrade', price: 14 },
    ],
    timeSlots: ['11:00 AM', '2:00 PM', '6:00 PM'],
    nextAvailability: 'This Week',
  },
];

const normalize = (value: string) => value.trim().toLowerCase();

export function getProviderById(providerId?: string | null) {
  if (!providerId) return undefined;
  return MARKETPLACE_PROVIDERS.find((provider) => provider.id === providerId);
}

export function getServiceById(serviceId?: string | null) {
  if (!serviceId) return undefined;
  return MARKETPLACE_SERVICES.find((service) => service.id === serviceId);
}

export function getServicesForProvider(providerId: string) {
  return MARKETPLACE_SERVICES.filter((service) => service.providerId === providerId);
}

export function getServicesForCategory(categoryLabel: string) {
  return MARKETPLACE_SERVICES.filter((service) => service.category === categoryLabel);
}

export function getProvidersForCategory(categoryLabel: string) {
  return MARKETPLACE_PROVIDERS.filter((provider) => provider.categories.includes(categoryLabel));
}

export function getCategoryById(categoryId?: string | null) {
  if (!categoryId) return undefined;
  return SEARCH_CATEGORIES.find((category) => category.id === categoryId);
}

export function searchServices(query: string) {
  const q = normalize(query);
  if (!q) return MARKETPLACE_SERVICES;

  return MARKETPLACE_SERVICES.filter((service) => {
    const provider = getProviderById(service.providerId);
    return [
      service.name,
      service.category,
      service.description,
      provider?.businessName,
      provider?.providerName,
    ]
      .filter(Boolean)
      .some((value) => normalize(String(value)).includes(q));
  });
}

export function searchProviders(query: string) {
  const q = normalize(query);
  if (!q) return MARKETPLACE_PROVIDERS;

  return MARKETPLACE_PROVIDERS.filter((provider) => {
    const serviceNames = getServicesForProvider(provider.id).map((service) => service.name).join(' ');

    return [
      provider.businessName,
      provider.providerName,
      provider.location,
      provider.categories.join(' '),
      serviceNames,
    ]
      .filter(Boolean)
      .some((value) => normalize(String(value)).includes(q));
  });
}

export function searchMarketplace(query: string) {
  return {
    services: searchServices(query),
    providers: searchProviders(query),
  };
}
