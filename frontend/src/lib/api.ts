const API_URL = process.env.API_URL || 'http://localhost:8000';

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

export async function getCars(filters?: CarFilters): Promise<CarsResponse> {
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
