const API_URL = process.env.API_URL || 'http://localhost:8000';
const USE_STATIC = process.env.USE_STATIC === 'true' || typeof window !== 'undefined';

export interface Car {
  id: string;
  blocket_url: string;
  title: string;
  price: number;
  currency: string;
  year: string;
  mileage: string;
  fuel_type: string;
  transmission: string;
  body_type: string;
  color: string;
  brand: string;
  model: string;
  engine_power: string;
  location: string;
  images: string[];
  description: string;
  fetched_at: string;
  regno?: string;
}

export interface CarsResponse {
  total: number;
  count: number;
  offset: number;
  last_sync: string;
  cars: Car[];
}

export interface FiltersResponse {
  brands: string[];
  fuel_types: string[];
  transmissions: string[];
  body_types: string[];
  years: number[];
  price_range: {
    min: number;
    max: number;
  };
}

export interface CarFilters {
  brand?: string;
  min_price?: number;
  max_price?: number;
  min_year?: number;
  max_year?: number;
  fuel_type?: string;
  transmission?: string;
  sort_by?: string;
  limit?: number;
  offset?: number;
}

// Static data for GitHub Pages deployment
let staticData: { cars: Car[], last_sync: string } | null = null;

async function loadStaticData(): Promise<{ cars: Car[], last_sync: string }> {
  if (staticData) return staticData;

  try {
    const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
    const res = await fetch(`${basePath}/cars.json`);
    if (res.ok) {
      staticData = await res.json();
      return staticData!;
    }
  } catch (e) {
    console.log('Static data not available, using API');
  }

  return { cars: [], last_sync: '' };
}

export async function getCars(filters?: CarFilters): Promise<CarsResponse> {
  // Try static data first (for GitHub Pages)
  const data = await loadStaticData();
  if (data.cars.length > 0) {
    let cars = [...data.cars];

    // Apply filters
    if (filters?.brand) {
      cars = cars.filter(c => c.brand?.toLowerCase().includes(filters.brand!.toLowerCase()));
    }
    if (filters?.min_price) {
      cars = cars.filter(c => c.price >= filters.min_price!);
    }
    if (filters?.max_price) {
      cars = cars.filter(c => c.price <= filters.max_price!);
    }
    if (filters?.fuel_type) {
      cars = cars.filter(c => c.fuel_type?.toLowerCase().includes(filters.fuel_type!.toLowerCase()));
    }
    if (filters?.transmission) {
      cars = cars.filter(c => c.transmission?.toLowerCase().includes(filters.transmission!.toLowerCase()));
    }

    // Sort
    if (filters?.sort_by === 'price_asc') {
      cars.sort((a, b) => a.price - b.price);
    } else if (filters?.sort_by === 'price_desc') {
      cars.sort((a, b) => b.price - a.price);
    } else if (filters?.sort_by === 'year_desc') {
      cars.sort((a, b) => parseInt(b.year) - parseInt(a.year));
    }

    // Limit
    if (filters?.limit) {
      cars = cars.slice(filters.offset || 0, (filters.offset || 0) + filters.limit);
    }

    return {
      total: data.cars.length,
      count: cars.length,
      offset: filters?.offset || 0,
      last_sync: data.last_sync,
      cars
    };
  }

  // Fallback to API
  const params = new URLSearchParams();
  if (filters) {
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, String(value));
      }
    });
  }

  const url = `${API_URL}/api/cars${params.toString() ? `?${params}` : ''}`;
  const res = await fetch(url, {
    next: { revalidate: 300 },
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Failed to fetch cars');
  }

  return res.json();
}

export async function getCar(id: string): Promise<Car> {
  // Try static data first
  const data = await loadStaticData();
  if (data.cars.length > 0) {
    const car = data.cars.find(c => c.id === id);
    if (car) return car;
  }

  // Fallback to API
  const res = await fetch(`${API_URL}/api/cars/${id}`, {
    next: { revalidate: 300 },
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Failed to fetch car');
  }

  return res.json();
}

export async function getFilters(): Promise<FiltersResponse> {
  // Try static data first
  const data = await loadStaticData();
  if (data.cars.length > 0) {
    const cars = data.cars;
    const brands = [...new Set(cars.map(c => c.brand).filter(Boolean))].sort();
    const fuel_types = [...new Set(cars.map(c => c.fuel_type).filter(Boolean))].sort();
    const transmissions = [...new Set(cars.map(c => c.transmission).filter(Boolean))].sort();
    const body_types = [...new Set(cars.map(c => c.body_type).filter(Boolean))].sort();
    const years = [...new Set(cars.map(c => parseInt(c.year)).filter(y => !isNaN(y)))].sort();
    const prices = cars.map(c => c.price).filter(p => p > 0);

    return {
      brands,
      fuel_types,
      transmissions,
      body_types,
      years,
      price_range: {
        min: Math.min(...prices),
        max: Math.max(...prices)
      }
    };
  }

  // Fallback to API
  const res = await fetch(`${API_URL}/api/filters`, {
    next: { revalidate: 300 },
    cache: 'no-store'
  });

  if (!res.ok) {
    throw new Error('Failed to fetch filters');
  }

  return res.json();
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('sv-SE', {
    style: 'currency',
    currency: 'SEK',
    maximumFractionDigits: 0,
  }).format(price);
}

export function formatMileage(mileage: string): string {
  const num = parseInt(mileage.replace(/\D/g, ''));
  if (isNaN(num)) return mileage;
  return new Intl.NumberFormat('sv-SE').format(num) + ' mil';
}
