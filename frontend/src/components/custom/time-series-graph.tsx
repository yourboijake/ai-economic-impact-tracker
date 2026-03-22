import { useState } from "react";
import {
  LineChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Line,
} from "recharts";
import { RechartsDevtools } from "@recharts/devtools";
import { Button } from "@/components/ui/button";
import type { TimeSeriesData } from "@/types/timeseries";

const SERIES_COLORS = [
  "#2563eb",
  "#dc2626",
  "#16a34a",
  "#d97706",
  "#7c3aed",
  "#db2777",
];

export function TimeSeriesGraph({ data }: { data: TimeSeriesData }) {
  const { metadata, observations } = data;
  const seriesKeys = Object.keys(metadata.series);

  const [hiddenSeries, setHiddenSeries] = useState<Set<string>>(new Set());

  const toggleSeries = (key: string) => {
    setHiddenSeries((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const parsedObservations = observations.map((obs) => ({
    ...obs,
    date: new Date(obs.date as string),
  }));

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">{metadata.title}</h2>
      <p className="text-md mb-4">{metadata.description}</p>
      <div className="flex flex-wrap gap-3 mb-3">
        {seriesKeys.map((key, i) => {
          const color = SERIES_COLORS[i % SERIES_COLORS.length];
          const hidden = hiddenSeries.has(key);
          return (
            <Button
              key={key}
              variant="outline"
              size="sm"
              onClick={() => toggleSeries(key)}
              className="gap-1.5 transition-opacity"
              style={{
                borderColor: color,
                opacity: hidden ? 0.4 : 1,
              }}
            >
              <span
                className="inline-block w-4 h-0.5"
                style={{ backgroundColor: color }}
              />
              {metadata.series[key].title}
            </Button>
          );
        })}
      </div>
      <LineChart
        style={{ width: "100%", height: 400 }}
        data={parsedObservations}
        margin={{ top: 20, right: 60, left: 20, bottom: 60 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          angle={60}
          textAnchor="start"
          tickFormatter={(d: Date) =>
            `${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`
          }
        />
        <YAxis />
        <Tooltip
          labelFormatter={(d: Date) =>
            `${d.getUTCMonth() + 1}/${d.getUTCDate()}/${d.getUTCFullYear()}`
          }
        />
        {seriesKeys.map((key, i) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            name={metadata.series[key].title}
            stroke={SERIES_COLORS[i % SERIES_COLORS.length]}
            dot={false}
            connectNulls={false}
            hide={hiddenSeries.has(key)}
          />
        ))}
      </LineChart>
      <RechartsDevtools />
      <div className="mt-4 space-y-1">
        {seriesKeys.map((key) => (
          <p key={key} className="text-sm">
            <span className="font-medium">
              {metadata.series[key].title} Source:
            </span>{" "}
            <a href={metadata.series[key].source_url} className="underline">
              {metadata.series[key].source}
            </a>
          </p>
        ))}
      </div>
      <div className="mt-4 space-y-1">
        {seriesKeys
          .filter((key) => metadata.series[key].notes)
          .map((key) => (
            <p key={key} className="text-sm">
              <span className="font-medium">
                {metadata.series[key].title} Notes:
              </span>{" "}
              {metadata.series[key].notes}
            </p>
          ))}
      </div>
    </div>
  );
}
