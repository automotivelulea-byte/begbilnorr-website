import { getCars, getFilters, CarFilters as CarFiltersType } from '@/lib/api';
import CarCard from '@/components/CarCard';
import CarFilters from '@/components/CarFilters';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

interface PageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CarsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const filters: CarFiltersType = {
    brand: params.brand as string,
    min_price: params.min_price ? parseInt(params.min_price as string) : undefined,
    max_price: params.max_price ? parseInt(params.max_price as string) : undefined,
    min_year: params.min_year ? parseInt(params.min_year as string) : undefined,
    max_year: params.max_year ? parseInt(params.max_year as string) : undefined,
    fuel_type: params.fuel_type as string,
    transmission: params.transmission as string,
    sort_by: (params.sort_by as string) || 'price_asc',
  };

  let carsData;
  let filtersData;

  try {
    [carsData, filtersData] = await Promise.all([
      getCars(filters),
      getFilters(),
    ]);
  } catch {
    carsData = { cars: [], total: 0, last_sync: null };
    filtersData = {
      brands: [],
      fuel_types: [],
      transmissions: [],
      body_types: [],
      years: [],
      price_range: { min: 0, max: 0 },
    };
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Alla bilar</h1>
          <p className="text-gray-600 mt-2">
            {carsData.total} bilar tillgängliga
            {carsData.last_sync && (
              <span className="text-sm text-gray-500 ml-2">
                (Uppdaterad: {new Date(carsData.last_sync).toLocaleDateString('sv-SE')})
              </span>
            )}
          </p>
        </div>

        <Suspense fallback={<FiltersSkeleton />}>
          <CarFilters filters={filtersData} />
        </Suspense>

        {carsData.cars.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {carsData.cars.map((car) => (
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

function FiltersSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6 animate-pulse">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i}>
            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  );
}
