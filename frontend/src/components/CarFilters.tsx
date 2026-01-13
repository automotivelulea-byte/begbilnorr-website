'use client';

import { FiltersResponse } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useState } from 'react';

interface CarFiltersProps {
  filters: FiltersResponse;
}

export default function CarFilters({ filters }: CarFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);

  const currentBrand = searchParams.get('brand') || '';
  const currentFuelType = searchParams.get('fuel_type') || '';
  const currentTransmission = searchParams.get('transmission') || '';
  const currentMinPrice = searchParams.get('min_price') || '';
  const currentMaxPrice = searchParams.get('max_price') || '';
  const currentSortBy = searchParams.get('sort_by') || 'price_asc';

  const updateFilters = useCallback((key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    router.push(`/bilar?${params.toString()}`);
  }, [router, searchParams]);

  const clearFilters = () => {
    router.push('/bilar');
  };

  const hasActiveFilters = currentBrand || currentFuelType || currentTransmission || currentMinPrice || currentMaxPrice;

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6">
      <div className="flex items-center justify-between md:hidden mb-4">
        <span className="font-semibold text-gray-700">Filter</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-primary-600 hover:text-primary-700"
        >
          {isOpen ? 'Dölj' : 'Visa'} filter
        </button>
      </div>

      <div className={`${isOpen ? 'block' : 'hidden'} md:block`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
          {/* Brand */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Märke</label>
            <select
              value={currentBrand}
              onChange={(e) => updateFilters('brand', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Alla märken</option>
              {filters.brands.map((brand) => (
                <option key={brand} value={brand}>{brand}</option>
              ))}
            </select>
          </div>

          {/* Fuel Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Bränsle</label>
            <select
              value={currentFuelType}
              onChange={(e) => updateFilters('fuel_type', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Alla bränsletyper</option>
              {filters.fuel_types.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Transmission */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Växellåda</label>
            <select
              value={currentTransmission}
              onChange={(e) => updateFilters('transmission', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Alla växellådor</option>
              {filters.transmissions.map((trans) => (
                <option key={trans} value={trans}>{trans}</option>
              ))}
            </select>
          </div>

          {/* Min Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min pris</label>
            <input
              type="number"
              value={currentMinPrice}
              onChange={(e) => updateFilters('min_price', e.target.value)}
              placeholder="0 kr"
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Max Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max pris</label>
            <input
              type="number"
              value={currentMaxPrice}
              onChange={(e) => updateFilters('max_price', e.target.value)}
              placeholder={`${filters.price_range.max} kr`}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          </div>

          {/* Sort */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sortera</label>
            <select
              value={currentSortBy}
              onChange={(e) => updateFilters('sort_by', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="price_asc">Pris: Lägst först</option>
              <option value="price_desc">Pris: Högst först</option>
              <option value="year_desc">Årsmodell: Nyast först</option>
              <option value="mileage_asc">Miltal: Lägst först</option>
            </select>
          </div>
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex justify-end">
            <button
              onClick={clearFilters}
              className="text-sm text-red-600 hover:text-red-700 flex items-center"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              Rensa filter
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
