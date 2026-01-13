import { Suspense } from 'react';
import CarsContent from './CarsContent';

function CarsLoading() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Alla bilar</h1>
          <p className="text-gray-600 mt-2">Laddar...</p>
        </div>
        <div className="text-center py-16">
          <p className="text-gray-600">Laddar bilar...</p>
        </div>
      </div>
    </div>
  );
}

export default function CarsPage() {
  return (
    <Suspense fallback={<CarsLoading />}>
      <CarsContent />
    </Suspense>
  );
}
