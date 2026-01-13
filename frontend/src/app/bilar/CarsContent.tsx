'use client';

import { getCars, getFilters, Car, FiltersResponse, CarFilters as CarFiltersType } from '@/lib/api';
import CarCard from '@/components/CarCard';
import CarFilters from '@/components/CarFilters';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function CarsContent() {
  const searchParams = useSearchParams();
  const [cars, setCars] = useState<Car[]>([]);
  const [total, setTotal] = useState(0);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [filtersData, setFiltersData] = useState<FiltersResponse>({
    brands: [],
    fuel_types: [],
    transmissions: [],
    body_types: [],
    years: [],
    price_range: { min: 0, max: 0 },
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const filters: CarFiltersType = {
      brand: searchParams.get('brand') || undefined,
      min_price: searchParams.get('min_price') ? parseInt(searchParams.get('min_price')!) : undefined,
      max_price: searchParams.get('max_price') ? parseInt(searchParams.get('max_price')!) : undefined,
      fuel_type: searchParams.get('fuel_type') || undefined,
      transmission: searchParams.get('transmission') || undefined,
      sort_by: searchParams.get('sort_by') || 'price_asc',
    };

    setLoading(true);
    Promise.all([getCars(filters), getFilters()])
      .then(([carsData, filtersResult]) => {
        setCars(carsData.cars);
        setTotal(carsData.total);
        setLastSync(carsData.last_sync);
        setFiltersData(filtersResult);
      })
      .catch(() => {
        setCars([]);
        setTotal(0);
      })
      .finally(() => setLoading(false));
  }, [searchParams]);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Alla bilar</h1>
          <p className="text-gray-600 mt-2">
            {total} bilar tillgängliga
            {lastSync && (
              <span className="text-sm text-gray-500 ml-2">
                (Uppdaterad: {new Date(lastSync).toLocaleDateString('sv-SE')})
              </span>
            )}
          </p>
        </div>

        <CarFilters filters={filtersData} />

        {loading ? (
          <div className="text-center py-16">
            <p className="text-gray-600">Laddar bilar...</p>
          </div>
        ) : cars.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {cars.map((car) => (
              <CarCard key={car.id} car={car} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-white rounded-xl shadow-sm">
            <svg
              className="w-16 h-16 text-gray-400 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Inga bilar hittades
            </h3>
            <p className="text-gray-600 mb-4">
              Försök ändra dina filterval eller kontakta oss för hjälp.
            </p>
            <a
              href="/bilar"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 font-semibold"
            >
              Rensa filter
              <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
