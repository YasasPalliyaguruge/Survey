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
  type ChartData,
  type ChartOptions,
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

type ChartProps =
  | {
      type: 'line';
      data: ChartData<'line'>;
      options?: ChartOptions<'line'>;
    }
  | {
      type: 'bar';
      data: ChartData<'bar'>;
      options?: ChartOptions<'bar'>;
    }
  | {
      type: 'pie';
      data: ChartData<'pie'>;
      options?: ChartOptions<'pie'>;
    };

export function Chart(props: ChartProps) {
  return (
    <div className="w-full h-full">
      {props.type === 'line' ? (
        <Line data={props.data} options={props.options} />
      ) : props.type === 'bar' ? (
        <Bar data={props.data} options={props.options} />
      ) : (
        <Pie data={props.data} options={props.options} />
      )}
    </div>
  );
}