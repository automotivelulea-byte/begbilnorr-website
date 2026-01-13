import carsData from '../../../../public/cars.json';
import CarDetail from './CarDetail';

export function generateStaticParams() {
  return carsData.cars.map((car: { id: string }) => ({
    id: car.id,
  }));
}

export default function Page() {
  return <CarDetail />;
}
