'use client';

import { Car, formatPrice, formatMileage } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

interface CarCardProps {
  car: Car;
}

export default function CarCard({ car }: CarCardProps) {
  const [imageError, setImageError] = useState(false);

  const mainImage = car.images?.[0] || '';
  const placeholderImage = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect fill="%23e2e8f0" width="400" height="300"/%3E%3Ctext fill="%2394a3b8" font-family="sans-serif" font-size="20" x="50%25" y="50%25" text-anchor="middle" dy=".3em"%3EIngen bild%3C/text%3E%3C/svg%3E';

  return (
    <Link href={`/bilar/${car.id}`}>
      <div className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
        <div className="relative h-48 sm:h-56 overflow-hidden bg-gray-100">
          {mainImage && !imageError ? (
            <img
              src={mainImage}
              alt={car.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={() => setImageError(true)}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
              <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {car.images && car.images.length > 1 && (
            <div className="absolute bottom-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
              +{car.images.length - 1} bilder
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-lg text-gray-900 truncate group-hover:text-primary-600 transition">
            {car.title}
          </h3>

          <div className="mt-2 flex flex-wrap gap-2 text-sm text-gray-600">
            {car.year && (
              <span className="inline-flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                {car.year}
              </span>
            )}
            {car.mileage && (
              <span className="inline-flex items-center">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                {formatMileage(car.mileage)}
              </span>
            )}
          </div>

          <div className="mt-2 flex flex-wrap gap-2 text-xs">
            {car.fuel_type && (
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {car.fuel_type}
              </span>
            )}
            {car.transmission && (
              <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded">
                {car.transmission}
              </span>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <span className="text-xl font-bold text-primary-600">
              {formatPrice(car.price)}
            </span>
            <span className="text-sm text-gray-500">{car.location}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}
