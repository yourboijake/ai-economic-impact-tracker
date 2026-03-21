import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
} from "recharts";
import { RechartsDevtools } from "@recharts/devtools";
import type { SeriesWithObservations } from "@/types/api";

export function TimeSeriesGraph({ data }: { data: SeriesWithObservations }) {
  const { series, observations } = data;

  // Transform observations into a format suitable for Recharts
  const chartData = observations.map((obs) => ({
    date: obs.date,
    value: obs.value,
  }));

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">{series.title}</h2>
      <p className="text-md">{series.description}</p>
      <LineChart
        style={{ width: "100%", height: 400 }}
        data={chartData}
        margin={{ top: 20, right: 60, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickFormatter={(value) => value.slice(0, 10)}
          angle={60}
          textAnchor="start"
        />
        <YAxis />
        <Tooltip labelFormatter={(value) => value.slice(0, 10)} />
        <Line type="monotone" dataKey="value" dot={false} />
      </LineChart>
      <RechartsDevtools />
      <p className="text-sm mt-4">Source: {series.source}</p>
      <p className="text-sm mt-2">Notes: {series.notes}</p>
    </div>
  );
}
