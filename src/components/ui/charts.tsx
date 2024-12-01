'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
  ChartOptions,
} from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

type ChartType = 'line' | 'bar' | 'pie';

interface ChartProps {
  data: ChartData<ChartType>;
  options?: ChartOptions<ChartType>;
  type: ChartType;
}

export function Chart({ data, options, type }: ChartProps) {
  const ChartComponent = {
    line: Line,
    bar: Bar,
    pie: Pie,
  }[type] as any;

  return (
    <div className="w-full h-full">
      <ChartComponent data={data} options={options} />
    </div>
  );
}
