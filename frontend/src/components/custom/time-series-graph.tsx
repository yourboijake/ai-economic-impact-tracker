import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Line,
} from "recharts";
import { RechartsDevtools } from "@recharts/devtools";
import type { SeriesObservationsAPIResponse } from "@/types/api";

export function TimeSeriesGraph({
  data,
}: {
  data: SeriesObservationsAPIResponse;
}) {
  const { series, observations } = data;

  // Transform observations into a format suitable for Recharts
  const chartData = observations.map((obs) => ({
    date: obs.date, // Assuming obs.date is in a format that can be parsed by Recharts
    value: obs.value,
  }));

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">{series.title}</h2>
      <LineChart
        width={800}
        height={400}
        data={chartData}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="value" dot={false} />
      </LineChart>
      <RechartsDevtools />
    </div>
  );
}
